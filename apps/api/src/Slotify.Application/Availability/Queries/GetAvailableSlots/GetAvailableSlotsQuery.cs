using MediatR;
using Slotify.Application.Common.Interfaces;

namespace Slotify.Application.Availability.Queries.GetAvailableSlots;

public sealed record GetAvailableSlotsQuery(
    Guid BranchId,
    Guid ServiceId,
    DateOnly Date
) : IRequest<IReadOnlyList<AvailableSlot>>;
