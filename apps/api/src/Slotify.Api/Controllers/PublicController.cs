using MediatR;
using Microsoft.AspNetCore.Mvc;
using Slotify.Application.Public.Queries.GetPublicProfile;

namespace Slotify.Api.Controllers;

/// <summary>
/// Public-facing endpoints for the consumer app.
/// No authentication required — tenant is resolved via X-Tenant-Slug header.
/// </summary>
[ApiController]
[Route("api/public")]
public sealed class PublicController(IMediator mediator) : ControllerBase
{
    /// <summary>
    /// Get the public profile of a business: name, branding, branches, and active services.
    /// Used by the consumer app to render the business profile page.
    /// </summary>
    /// <summary>
    /// Optional query params: lat, lng — when provided, branches are sorted by Haversine distance
    /// and each branch includes a distanceKm field.
    /// </summary>
    [HttpGet("profile")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetProfile(
        [FromQuery] double? lat,
        [FromQuery] double? lng,
        CancellationToken cancellationToken)
    {
        var profile = await mediator.Send(new GetPublicProfileQuery(lat, lng), cancellationToken);
        return Ok(profile);
    }
}
