using MediatR;
using Slotify.Application.Common.Interfaces;

namespace Slotify.Application.Availability.Queries.GetAvailableDates;

public sealed class GetAvailableDatesQueryHandler(
    IAvailabilityService availabilityService,
    ITenantContext tenantContext)
    : IRequestHandler<GetAvailableDatesQuery, IReadOnlyList<DateOnly>>
{
    public Task<IReadOnlyList<DateOnly>> Handle(
        GetAvailableDatesQuery request,
        CancellationToken cancellationToken)
        => availabilityService.GetAvailableDatesAsync(
            tenantContext.TenantId,
            request.BranchId,
            request.ServiceId,
            request.Year,
            request.Month,
            cancellationToken);
}
