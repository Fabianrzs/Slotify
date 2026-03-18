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

        var rawBranches = await context.Branches
            .Where(b => b.TenantId == tenantContext.TenantId && b.IsActive)
            .ToListAsync(cancellationToken);

        var branches = rawBranches
            .Select(b =>
            {
                var distance = (request.Latitude.HasValue && request.Longitude.HasValue && b.Latitude.HasValue && b.Longitude.HasValue)
                    ? HaversineKm(request.Latitude.Value, request.Longitude.Value, b.Latitude.Value, b.Longitude.Value)
                    : (double?)null;
                return new PublicBranchDto(b.Id, b.Name, b.Address, b.Phone, b.Timezone, b.Latitude, b.Longitude, distance);
            })
            .OrderBy(b => b.DistanceKm ?? double.MaxValue)
            .ThenBy(b => b.Name)
            .ToList();

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

    /// <summary>Haversine great-circle distance in kilometres.</summary>
    private static double HaversineKm(double lat1, double lon1, double lat2, double lon2)
    {
        const double R = 6371.0;
        var dLat = ToRad(lat2 - lat1);
        var dLon = ToRad(lon2 - lon1);
        var a = Math.Sin(dLat / 2) * Math.Sin(dLat / 2)
              + Math.Cos(ToRad(lat1)) * Math.Cos(ToRad(lat2))
              * Math.Sin(dLon / 2) * Math.Sin(dLon / 2);
        return R * 2 * Math.Atan2(Math.Sqrt(a), Math.Sqrt(1 - a));
    }

    private static double ToRad(double deg) => deg * Math.PI / 180.0;
}
