using MediatR;
using Slotify.Application.Common.Interfaces;

namespace Slotify.Application.Availability.Queries.GetAvailableSlots;

public sealed class GetAvailableSlotsQueryHandler(
    IAvailabilityService availabilityService,
    ITenantContext tenantContext)
    : IRequestHandler<GetAvailableSlotsQuery, IReadOnlyList<AvailableSlot>>
{
    public Task<IReadOnlyList<AvailableSlot>> Handle(
        GetAvailableSlotsQuery request,
        CancellationToken cancellationToken)
        => availabilityService.GetAvailableSlotsAsync(
            tenantContext.TenantId,
            request.BranchId,
            request.ServiceId,
            request.Date,
            cancellationToken);
}
