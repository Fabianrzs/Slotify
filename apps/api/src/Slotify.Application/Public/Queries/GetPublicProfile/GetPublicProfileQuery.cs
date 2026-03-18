using MediatR;

namespace Slotify.Application.Public.Queries.GetPublicProfile;

/// <summary>
/// Returns the public-facing profile of a tenant: name, branding, active branches, and active services.
/// Resolved via the tenant context (X-Tenant-Slug header).
/// </summary>
public sealed record GetPublicProfileQuery : IRequest<PublicProfileDto>;

public sealed record PublicProfileDto(
    Guid TenantId,
    string Name,
    string Slug,
    string? LogoUrl,
    string? PrimaryColor,
    string Timezone,
    string Currency,
    int MinAdvanceBookingHours,
    int MaxAdvanceBookingDays,
    int CancellationWindowHours,
    IReadOnlyList<PublicBranchDto> Branches,
    IReadOnlyList<PublicServiceDto> Services
);

public sealed record PublicBranchDto(
    Guid Id,
    string Name,
    string? Address,
    string? Phone,
    string Timezone
);

public sealed record PublicServiceDto(
    Guid Id,
    string Name,
    string? Description,
    int DurationMinutes,
    decimal Price,
    string Currency,
    int MaxCapacity
);
