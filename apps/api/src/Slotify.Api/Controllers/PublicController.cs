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
    [HttpGet("profile")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetProfile(CancellationToken cancellationToken)
    {
        var profile = await mediator.Send(new GetPublicProfileQuery(), cancellationToken);
        return Ok(profile);
    }
}
