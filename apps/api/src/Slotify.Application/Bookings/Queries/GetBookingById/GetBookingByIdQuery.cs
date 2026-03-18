using MediatR;
using Slotify.Application.Bookings.DTOs;

namespace Slotify.Application.Bookings.Queries.GetBookingById;

public sealed record GetBookingByIdQuery(Guid BookingId) : IRequest<BookingDetailDto>;
