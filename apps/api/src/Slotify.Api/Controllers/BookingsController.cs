using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Slotify.Application.Bookings.Commands.CancelBooking;
using Slotify.Application.Bookings.Commands.CreateBooking;
using Slotify.Application.Bookings.Queries.GetBookings;
using Slotify.Domain.Bookings;

namespace Slotify.Api.Controllers;

[ApiController]
[Route("api/bookings")]
[Authorize]
public sealed class BookingsController(IMediator mediator) : ControllerBase
{
    /// <summary>
    /// Create a new booking. Requires authentication.
    /// </summary>
    [HttpPost]
    [ProducesResponseType(StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<IActionResult> CreateBooking(
        [FromBody] CreateBookingCommand command,
        CancellationToken cancellationToken)
    {
        var booking = await mediator.Send(command, cancellationToken);
        return CreatedAtAction(nameof(GetBookings), new { id = booking.Id }, booking);
    }

    /// <summary>
    /// List bookings for the current tenant (tenant admin/staff) or current client.
    /// </summary>
    [HttpGet]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetBookings(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] Guid? branchId = null,
        [FromQuery] Guid? serviceId = null,
        [FromQuery] BookingStatus? status = null,
        [FromQuery] DateOnly? dateFrom = null,
        [FromQuery] DateOnly? dateTo = null,
        CancellationToken cancellationToken = default)
    {
        var query = new GetBookingsQuery(page, pageSize, branchId, serviceId, status, dateFrom, dateTo);
        var result = await mediator.Send(query, cancellationToken);
        return Ok(result);
    }

    /// <summary>
    /// Cancel a booking.
    /// </summary>
    [HttpPatch("{id:guid}/cancel")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<IActionResult> CancelBooking(
        Guid id,
        [FromBody] CancelBookingRequest request,
        CancellationToken cancellationToken)
    {
        await mediator.Send(new CancelBookingCommand(id, request.Reason), cancellationToken);
        return NoContent();
    }
}

public sealed record CancelBookingRequest(string Reason);
