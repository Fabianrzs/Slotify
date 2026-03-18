using MediatR;
using Slotify.Application.Bookings.DTOs;
using Slotify.Application.Common.Models;
using Slotify.Domain.Bookings;

namespace Slotify.Application.Bookings.Queries.GetBookings;

public sealed record GetBookingsQuery(
    int Page = 1,
    int PageSize = 20,
    Guid? BranchId = null,
    Guid? ServiceId = null,
    BookingStatus? Status = null,
    DateOnly? DateFrom = null,
    DateOnly? DateTo = null,
    string? ClientSearch = null
) : IRequest<PaginatedList<BookingDto>>;
