using MediatR;
using Microsoft.EntityFrameworkCore;
using Slotify.Application.Common.Interfaces;
using Slotify.Application.Staff.DTOs;
using Slotify.Domain.Tenants;

namespace Slotify.Application.Staff.Queries.GetStaff;

public sealed class GetStaffQueryHandler(
    IApplicationDbContext context,
    ITenantContext tenantContext)
    : IRequestHandler<GetStaffQuery, IReadOnlyList<StaffDto>>
{
    public async Task<IReadOnlyList<StaffDto>> Handle(
        GetStaffQuery request, CancellationToken cancellationToken)
    {
        var tenantUsers = await context.TenantUsers
            .Where(tu =>
                tu.TenantId == tenantContext.TenantId &&
                tu.Role != TenantRole.Client &&
                tu.IsActive)
            .ToListAsync(cancellationToken);

        var userIds = tenantUsers.Select(tu => tu.UserId).ToList();
        var users = await context.Users
            .Where(u => userIds.Contains(u.Id))
            .ToDictionaryAsync(u => u.Id, cancellationToken);

        return tenantUsers
            .OrderBy(tu => users.TryGetValue(tu.UserId, out var u) ? u.FullName : string.Empty)
            .Select(tu =>
            {
                users.TryGetValue(tu.UserId, out var user);
                return new StaffDto(
                    tu.UserId,
                    tu.Id,
                    user?.FullName ?? string.Empty,
                    user?.Email ?? string.Empty,
                    user?.AvatarUrl,
                    tu.Role.ToString(),
                    tu.IsActive,
                    tu.JoinedAt);
            })
            .ToList();
    }
}
