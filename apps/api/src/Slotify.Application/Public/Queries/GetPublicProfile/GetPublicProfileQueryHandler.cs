using MediatR;
using Microsoft.EntityFrameworkCore;
using Slotify.Application.Common.Exceptions;
using Slotify.Application.Common.Interfaces;

namespace Slotify.Application.Public.Queries.GetPublicProfile;

public sealed class GetPublicProfileQueryHandler(
    IApplicationDbContext context,
    ITenantContext tenantContext)
    : IRequestHandler<GetPublicProfileQuery, PublicProfileDto>
{
    public async Task<PublicProfileDto> Handle(
        GetPublicProfileQuery request,
        CancellationToken cancellationToken)
    {
        var tenant = await context.Tenants
            .Where(t => t.Id == tenantContext.TenantId && t.IsActive)
            .FirstOrDefaultAsync(cancellationToken)
            ?? throw new NotFoundException("Tenant", tenantContext.TenantId);

        var branches = await context.Branches
            .Where(b => b.TenantId == tenantContext.TenantId && b.IsActive)
            .Select(b => new PublicBranchDto(b.Id, b.Name, b.Address, b.Phone, b.Timezone))
            .ToListAsync(cancellationToken);

        var services = await context.Services
            .Where(s => s.TenantId == tenantContext.TenantId && s.IsActive)
            .ToListAsync(cancellationToken);

        var serviceDtos = services.Select(s => new PublicServiceDto(
            s.Id,
            s.Name,
            s.Description,
            s.DurationMinutes,
            s.Price.Amount,
            s.Price.Currency,
            s.MaxCapacity)).ToList();

        return new PublicProfileDto(
            tenant.Id,
            tenant.Name,
            tenant.Slug.Value,
            tenant.Settings.LogoUrl,
            tenant.Settings.PrimaryColor,
            tenant.Settings.Timezone,
            tenant.Settings.Currency,
            tenant.Settings.MinAdvanceBookingHours,
            tenant.Settings.MaxAdvanceBookingDays,
            tenant.Settings.CancellationWindowHours,
            branches,
            serviceDtos);
    }
}
