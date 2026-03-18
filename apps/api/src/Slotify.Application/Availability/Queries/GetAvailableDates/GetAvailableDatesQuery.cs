using MediatR;

namespace Slotify.Application.Availability.Queries.GetAvailableDates;

public sealed record GetAvailableDatesQuery(
    Guid BranchId,
    Guid ServiceId,
    int Year,
    int Month
) : IRequest<IReadOnlyList<DateOnly>>;
