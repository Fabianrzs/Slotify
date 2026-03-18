using MediatR;
using Microsoft.EntityFrameworkCore;
using Slotify.Application.Common.Exceptions;
using Slotify.Application.Common.Interfaces;
using Slotify.Domain.Tenants;

namespace Slotify.Application.Staff.Commands.UpdateStaffRole;

public sealed class UpdateStaffRoleCommandHandler(
    IApplicationDbContext context,
    ITenantContext tenantContext)
    : IRequestHandler<UpdateStaffRoleCommand>
{
    public async Task Handle(UpdateStaffRoleCommand request, CancellationToken cancellationToken)
    {
        var tenantUser = await context.TenantUsers
            .FirstOrDefaultAsync(tu => tu.Id == request.TenantUserId && tu.TenantId == tenantContext.TenantId, cancellationToken)
            ?? throw new NotFoundException(nameof(TenantUser), request.TenantUserId);

        if (tenantUser.Role == TenantRole.Owner)
            throw new InvalidOperationException("Cannot change the role of the tenant owner.");

        var newRole = Enum.Parse<TenantRole>(request.Role);
        tenantUser.ChangeRole(newRole);
        await context.SaveChangesAsync(cancellationToken);
    }
}
