using MediatR;
using Microsoft.EntityFrameworkCore;
using Slotify.Application.Common.Exceptions;
using Slotify.Application.Common.Interfaces;
using Slotify.Domain.Tenants;
using Slotify.Domain.Users;

namespace Slotify.Application.Tenants.Commands.RegisterTenant;

public sealed class RegisterTenantCommandHandler(
    IApplicationDbContext context,
    ICognitoAuthService cognitoAuth,
    IEmailService emailService)
    : IRequestHandler<RegisterTenantCommand, RegisterTenantResult>
{
    public async Task<RegisterTenantResult> Handle(
        RegisterTenantCommand request, CancellationToken cancellationToken)
    {
        // 1. Validate slug uniqueness
        var slugTaken = await context.Tenants
            .AnyAsync(t => t.Slug.Value == request.Slug.ToLowerInvariant(), cancellationToken);

        if (slugTaken)
            throw new ConflictException($"The slug '{request.Slug}' is already taken. Please choose another.");

        // 2. Validate email not already registered
        var emailTaken = await context.Users
            .AnyAsync(u => u.Email == request.OwnerEmail.ToLowerInvariant(), cancellationToken);

        if (emailTaken)
            throw new ConflictException($"An account with email '{request.OwnerEmail}' already exists.");

        // 3. Register owner in Cognito
        var cognitoSub = await cognitoAuth.RegisterAsync(
            request.OwnerEmail,
            request.OwnerPassword,
            request.OwnerFullName,
            request.OwnerPhone,
            cancellationToken);

        // 4. Add to "TenantOwner" Cognito group
        await cognitoAuth.AddUserToGroupAsync(request.OwnerEmail, "TenantOwner", cancellationToken);

        // 5. Create local user record
        var owner = User.CreateFromExternalProvider(
            request.OwnerEmail, request.OwnerFullName, "Cognito", cognitoSub);

        context.Users.Add(owner);

        // 6. Create tenant
        var tenant = Tenant.Create(request.BusinessName, request.Slug, request.OwnerEmail);

        if (request.Timezone is not null)
            tenant.UpdateSettings(tenant.Settings.With(timezone: request.Timezone));

        context.Tenants.Add(tenant);

        // 7. Link owner to tenant
        var tenantUser = TenantUser.CreateOwner(tenant.Id, owner.Id);
        context.TenantUsers.Add(tenantUser);

        // 8. Assign Free plan subscription
        var freePlan = await context.Plans
            .FirstOrDefaultAsync(p => p.Name == "Free" && p.IsActive, cancellationToken)
            ?? throw new InvalidOperationException("Free plan not found. Run the seeder first.");

        var subscription = TenantSubscription.Create(tenant.Id, freePlan.Id);
        context.TenantSubscriptions.Add(subscription);

        await context.SaveChangesAsync(cancellationToken);

        // 9. Send welcome emails (fire-and-forget — don't fail the request)
        _ = Task.Run(async () =>
        {
            try
            {
                await emailService.SendFromTemplateAsync(
                    "TenantWelcome",
                    request.OwnerEmail,
                    new Dictionary<string, string>
                    {
                        ["TenantName"] = request.BusinessName,
                        ["OwnerName"] = request.OwnerFullName,
                        ["DashboardUrl"] = $"https://{request.Slug}.slotify.com/dashboard"
                    });
            }
            catch { /* log but don't fail */ }
        }, CancellationToken.None);

        return new RegisterTenantResult(tenant.Id, tenant.Slug.Value, owner.Email);
    }
}
