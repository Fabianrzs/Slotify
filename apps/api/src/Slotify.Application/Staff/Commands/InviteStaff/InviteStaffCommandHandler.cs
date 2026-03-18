using MediatR;
using Microsoft.EntityFrameworkCore;
using Slotify.Application.Common.Interfaces;
using Slotify.Application.Staff.DTOs;
using Slotify.Domain.Tenants;
using Slotify.Domain.Users;

namespace Slotify.Application.Staff.Commands.InviteStaff;

public sealed class InviteStaffCommandHandler(
    IApplicationDbContext context,
    ITenantContext tenantContext,
    ICognitoAuthService cognitoAuth,
    IEmailService emailService)
    : IRequestHandler<InviteStaffCommand, InviteStaffResult>
{
    public async Task<InviteStaffResult> Handle(InviteStaffCommand request, CancellationToken cancellationToken)
    {
        var tenantRole = Enum.Parse<TenantRole>(request.Role);
        var cognitoGroup = request.Role == "Admin" ? "TenantAdmin" : "Staff";

        // Check if user already exists in our system
        var existingUser = await context.Users
            .FirstOrDefaultAsync(u => u.Email == request.Email.ToLowerInvariant(), cancellationToken);

        Guid userId;

        if (existingUser is null)
        {
            // Generate a temporary password — user will be forced to reset via forgot-password flow
            var tempPassword = $"Slotify#{Guid.NewGuid():N}"[..16] + "!";

            var cognitoSub = await cognitoAuth.RegisterAsync(
                request.Email, tempPassword, request.FullName, request.Phone, cancellationToken);

            var newUser = User.CreateFromExternalProvider(request.Email, request.FullName, "Cognito", cognitoSub);
            context.Users.Add(newUser);
            await context.SaveChangesAsync(cancellationToken);
            userId = newUser.Id;
        }
        else
        {
            userId = existingUser.Id;
        }

        // Check not already a member of this tenant
        var alreadyMember = await context.TenantUsers
            .AnyAsync(tu => tu.TenantId == tenantContext.TenantId && tu.UserId == userId, cancellationToken);

        if (!alreadyMember)
        {
            var tenantUser = TenantUser.Create(tenantContext.TenantId, userId, tenantRole);
            context.TenantUsers.Add(tenantUser);
        }

        // Add to Cognito group
        await cognitoAuth.AddUserToGroupAsync(request.Email, cognitoGroup, cancellationToken);

        // Get tenant name for email
        var tenant = await context.Tenants
            .FirstOrDefaultAsync(t => t.Id == tenantContext.TenantId, cancellationToken);

        await context.SaveChangesAsync(cancellationToken);

        // Send invitation email (fire-and-forget)
        _ = Task.Run(async () =>
        {
            try
            {
                await emailService.SendAsync(new Application.Common.Interfaces.EmailMessage(
                    request.Email,
                    $"Fuiste invitado a {tenant?.Name ?? "Slotify"}",
                    $"Hola {request.FullName},<br/><br/>Has sido invitado como <b>{request.Role}</b> en <b>{tenant?.Name}</b>.<br/><br/>Inicia sesión en <a href='https://{tenantContext.TenantSlug}.slotify.com/login'>tu panel</a>."
                ));
            }
            catch { }
        }, CancellationToken.None);

        return new InviteStaffResult(request.Email, request.Role, "Invitation sent successfully.");
    }
}
