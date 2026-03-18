using Amazon;
using Amazon.CognitoIdentityProvider;
using FluentValidation;
using Hangfire;
using Hangfire.SqlServer;
using MediatR;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using Serilog;
using Slotify.Application.Common.Behaviors;
using Slotify.Application.Common.Interfaces;
using Slotify.Infrastructure.Identity;
using Slotify.Infrastructure.MultiTenancy;
using Slotify.Infrastructure.Notifications;
using Slotify.Infrastructure.Persistence;

// ─── Serilog bootstrap ───────────────────────────────────────────────────────
Log.Logger = new LoggerConfiguration()
    .WriteTo.Console()
    .CreateBootstrapLogger();

try
{
    var builder = WebApplication.CreateBuilder(args);

    builder.Host.UseSerilog((ctx, lc) => lc.ReadFrom.Configuration(ctx.Configuration));

    // ─── Application Layer ───────────────────────────────────────────────────
    builder.Services.AddMediatR(cfg =>
    {
        cfg.RegisterServicesFromAssembly(typeof(Slotify.Application.AssemblyMarker).Assembly);
        cfg.AddBehavior(typeof(IPipelineBehavior<,>), typeof(LoggingBehavior<,>));
        cfg.AddBehavior(typeof(IPipelineBehavior<,>), typeof(ValidationBehavior<,>));
        cfg.AddBehavior(typeof(IPipelineBehavior<,>), typeof(PlanLimitBehavior<,>));
    });

    builder.Services.AddValidatorsFromAssembly(typeof(Slotify.Application.AssemblyMarker).Assembly);

    // ─── Infrastructure: Database ────────────────────────────────────────────
    var connStr = builder.Configuration.GetConnectionString("DefaultConnection")!;

    builder.Services.AddDbContext<ApplicationDbContext>(options =>
        options.UseSqlServer(connStr, sql =>
        {
            sql.EnableRetryOnFailure(3);
            sql.CommandTimeout(30);
        }));

    builder.Services.AddScoped<IApplicationDbContext>(sp => sp.GetRequiredService<ApplicationDbContext>());
    builder.Services.AddScoped<IAvailabilityService, AvailabilityService>();
    builder.Services.AddScoped<IPlanLimitService, OveragePlanLimitService>();
    builder.Services.AddScoped<ICurrentUserService, CurrentUserService>();
    builder.Services.AddScoped<IEmailService, EmailService>();
    builder.Services.AddScoped<TenantContext>();
    builder.Services.AddScoped<ITenantContext>(sp => sp.GetRequiredService<TenantContext>());
    builder.Services.AddMemoryCache();
    builder.Services.AddHttpContextAccessor();

    // ─── Infrastructure: Cognito ─────────────────────────────────────────────
    var cognitoOptions = builder.Configuration.GetSection(CognitoOptions.Section).Get<CognitoOptions>()!;
    builder.Services.Configure<CognitoOptions>(builder.Configuration.GetSection(CognitoOptions.Section));

    builder.Services.AddSingleton<IAmazonCognitoIdentityProvider>(_ =>
        new AmazonCognitoIdentityProviderClient(RegionEndpoint.GetBySystemName(cognitoOptions.Region)));

    builder.Services.AddScoped<CognitoAuthService>();
    builder.Services.AddScoped<ICognitoAuthService, CognitoAuthServiceAdapter>();

    // ─── Authentication: Cognito JWT ─────────────────────────────────────────
    // Cognito issues RS256 JWTs — validate against the public JWKS endpoint.
    // No secrets needed on the API side.
    builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
        .AddJwtBearer(opts =>
        {
            opts.Authority = cognitoOptions.Issuer;
            opts.MetadataAddress = $"{cognitoOptions.Issuer}/.well-known/openid-configuration";

            opts.TokenValidationParameters = new TokenValidationParameters
            {
                ValidateIssuer = true,
                ValidIssuer = cognitoOptions.Issuer,
                ValidateAudience = true,
                ValidAudience = cognitoOptions.ClientId,
                ValidateLifetime = true,
                // Cognito uses RS256 — keys fetched automatically from JWKS
                ValidateIssuerSigningKey = true,
                ClockSkew = TimeSpan.FromMinutes(1),
                // Map Cognito "cognito:groups" claim to roles for policy-based auth
                RoleClaimType = "cognito:groups"
            };

            opts.Events = new JwtBearerEvents
            {
                OnAuthenticationFailed = ctx =>
                {
                    Log.Warning("JWT authentication failed: {Error}", ctx.Exception.Message);
                    return Task.CompletedTask;
                }
            };
        });

    builder.Services.AddAuthorizationBuilder()
        .AddPolicy("TenantAdmin", p => p.RequireRole("TenantOwner", "TenantAdmin"))
        .AddPolicy("TenantStaff", p => p.RequireRole("TenantOwner", "TenantAdmin", "Staff"))
        .AddPolicy("Client", p => p.RequireRole("Client"))
        .AddPolicy("PlatformAdmin", p => p.RequireRole("PlatformAdmin"));

    // ─── Hangfire (background jobs) ──────────────────────────────────────────
    builder.Services.AddHangfire(cfg => cfg
        .SetDataCompatibilityLevel(CompatibilityLevel.Version_180)
        .UseSimpleAssemblyNameTypeSerializer()
        .UseRecommendedSerializerSettings()
        .UseSqlServerStorage(connStr, new SqlServerStorageOptions
        {
            CommandBatchMaxTimeout = TimeSpan.FromMinutes(5),
            SlidingInvisibilityTimeout = TimeSpan.FromMinutes(5),
            QueuePollInterval = TimeSpan.Zero,
            UseRecommendedIsolationLevel = true,
            DisableGlobalLocks = true
        }));

    builder.Services.AddHangfireServer();

    // ─── API ─────────────────────────────────────────────────────────────────
    builder.Services.AddControllers();
    builder.Services.AddEndpointsApiExplorer();
    builder.Services.AddSwaggerGen(c =>
    {
        c.SwaggerDoc("v1", new OpenApiInfo { Title = "Slotify API", Version = "v1" });
        c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
        {
            Description = "Cognito JWT. Paste your access_token from /api/auth/login",
            Type = SecuritySchemeType.Http,
            Scheme = "bearer",
            BearerFormat = "JWT"
        });
        c.AddSecurityRequirement(new OpenApiSecurityRequirement
        {
            {
                new OpenApiSecurityScheme { Reference = new OpenApiReference { Type = ReferenceType.SecurityScheme, Id = "Bearer" } },
                []
            }
        });
    });

    builder.Services.AddCors(opts =>
        opts.AddDefaultPolicy(p => p
            .WithOrigins(builder.Configuration.GetSection("AllowedOrigins").Get<string[]>() ?? [])
            .AllowAnyHeader()
            .AllowAnyMethod()));

    builder.Services.AddHealthChecks()
        .AddSqlServer(connStr, name: "sqlserver");

    // ─── Build app ───────────────────────────────────────────────────────────
    var app = builder.Build();

    // Auto-migrate and seed on startup (dev only — use CI pipeline in prod)
    if (app.Environment.IsDevelopment())
    {
        using var scope = app.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        await db.Database.MigrateAsync();
        await DbSeeder.SeedAsync(db);
    }

    // ─── Middleware pipeline ──────────────────────────────────────────────────
    app.UseMiddleware<Slotify.Api.Middleware.ExceptionHandlingMiddleware>();
    app.UseSerilogRequestLogging();

    if (app.Environment.IsDevelopment())
    {
        app.UseSwagger();
        app.UseSwaggerUI();
        app.UseHangfireDashboard("/hangfire");
    }

    app.UseHttpsRedirection();
    app.UseCors();
    app.UseAuthentication();
    app.UseMiddleware<TenantResolutionMiddleware>();
    app.UseAuthorization();
    app.MapControllers();
    app.MapHealthChecks("/health");

    await app.RunAsync();
}
catch (Exception ex)
{
    Log.Fatal(ex, "Application startup failed");
    throw;
}
finally
{
    Log.CloseAndFlush();
}
