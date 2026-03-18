using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
using Slotify.Infrastructure.Persistence;

namespace Slotify.Infrastructure.MultiTenancy;

/// <summary>
/// Resolves tenant from subdomain (tenant.slotify.com) or X-Tenant-Slug header.
/// Must run after authentication middleware.
/// </summary>
public sealed class TenantResolutionMiddleware(
    RequestDelegate next,
    IMemoryCache cache)
{
    // Routes that don't require a tenant context
    private static readonly HashSet<string> PublicPaths =
    [
        "/api/auth/login",
        "/api/auth/register",
        "/api/onboarding/register-tenant",
        "/api/onboarding/check-slug",
        "/health",
        "/swagger"
    ];

    public async Task InvokeAsync(HttpContext httpContext, ApplicationDbContext dbContext, TenantContext tenantContext)
    {
        var path = httpContext.Request.Path.Value ?? string.Empty;
        if (PublicPaths.Any(p => path.StartsWith(p, StringComparison.OrdinalIgnoreCase)))
        {
            await next(httpContext);
            return;
        }

        var slug = ResolveTenantSlug(httpContext);

        if (slug is null)
        {
            await next(httpContext);
            return;
        }

        var cacheKey = $"tenant:slug:{slug}";
        if (!cache.TryGetValue(cacheKey, out (Guid Id, string Slug) cached))
        {
            var tenant = await dbContext.Tenants
                .IgnoreQueryFilters()
                .Where(t => t.Slug.Value == slug && t.IsActive)
                .Select(t => new { t.Id, Slug = t.Slug.Value })
                .FirstOrDefaultAsync(httpContext.RequestAborted);

            if (tenant is null)
            {
                httpContext.Response.StatusCode = StatusCodes.Status404NotFound;
                await httpContext.Response.WriteAsJsonAsync(new { error = "Tenant not found." });
                return;
            }

            cached = (tenant.Id, tenant.Slug);
            cache.Set(cacheKey, cached, TimeSpan.FromMinutes(5));
        }

        tenantContext.Set(cached.Id, cached.Slug);
        await next(httpContext);
    }

    private static string? ResolveTenantSlug(HttpContext context)
    {
        // Priority 1: X-Tenant-Slug header (for API clients, mobile)
        if (context.Request.Headers.TryGetValue("X-Tenant-Slug", out var headerSlug))
            return headerSlug.ToString().ToLowerInvariant();

        // Priority 2: Subdomain (tenant.slotify.com)
        var host = context.Request.Host.Host;
        var parts = host.Split('.');
        if (parts.Length >= 3)
            return parts[0].ToLowerInvariant();

        return null;
    }
}
