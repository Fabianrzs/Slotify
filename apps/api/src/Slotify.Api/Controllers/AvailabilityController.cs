using MediatR;
using Microsoft.AspNetCore.Mvc;
using Slotify.Application.Availability.Queries.GetAvailableDates;
using Slotify.Application.Availability.Queries.GetAvailableSlots;

namespace Slotify.Api.Controllers;

[ApiController]
[Route("api/availability")]
public sealed class AvailabilityController(IMediator mediator) : ControllerBase
{
    /// <summary>
    /// Get available time slots for a service on a specific date.
    /// </summary>
    [HttpGet]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetSlots(
        [FromQuery] Guid branchId,
        [FromQuery] Guid serviceId,
        [FromQuery] DateOnly date,
        CancellationToken cancellationToken)
    {
        var slots = await mediator.Send(
            new GetAvailableSlotsQuery(branchId, serviceId, date),
            cancellationToken);

        return Ok(slots);
    }

    /// <summary>
    /// Get dates in a month that have at least one available slot.
    /// Useful for rendering a calendar with bookable days highlighted.
    /// </summary>
    [HttpGet("month")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAvailableDates(
        [FromQuery] Guid branchId,
        [FromQuery] Guid serviceId,
        [FromQuery] int year,
        [FromQuery] int month,
        CancellationToken cancellationToken)
    {
        var dates = await mediator.Send(
            new GetAvailableDatesQuery(branchId, serviceId, year, month),
            cancellationToken);

        return Ok(dates);
    }
}
