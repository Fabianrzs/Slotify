using MediatR;

namespace Slotify.Application.Bookings.Commands.CancelBooking;

public sealed record CancelBookingCommand(
    Guid BookingId,
    string Reason
) : IRequest;
