using MediatR;
using Slotify.Application.Bookings.DTOs;
using Slotify.Application.Common.Behaviors;

namespace Slotify.Application.Bookings.Commands.CreateBooking;

public sealed record CreateBookingCommand(
    Guid ServiceId,
    Guid BranchId,
    DateTime StartAt,
    string? Notes
) : IRequest<BookingDto>, IRequiresPlanLimit
{
    // Automatically checked by PlanLimitBehavior before the handler runs
    public PlanLimitCheck LimitCheck => PlanLimitCheck.Booking;
}
