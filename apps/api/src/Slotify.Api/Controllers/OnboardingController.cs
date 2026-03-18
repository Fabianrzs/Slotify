using MediatR;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Slotify.Application.Common.Interfaces;
using Slotify.Application.Tenants.Commands.RegisterTenant;

namespace Slotify.Api.Controllers;

[ApiController]
[Route("api/onboarding")]
public sealed class OnboardingController(IMediator mediator, IApplicationDbContext context) : ControllerBase
{
    /// <summary>Register a new business (tenant) on the platform.</summary>
    [HttpPost("register-tenant")]
    [ProducesResponseType(StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<IActionResult> RegisterTenant(
        [FromBody] RegisterTenantCommand command,
        CancellationToken cancellationToken)
    {
        var result = await mediator.Send(command, cancellationToken);
        return Created($"/api/tenants/{result.TenantId}", result);
    }

    /// <summary>Check if a tenant slug is available. Returns 200 if available, 409 if taken.</summary>
    [HttpGet("check-slug")]
    public async Task<IActionResult> CheckSlug(
        [FromQuery] string slug,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(slug))
            return BadRequest(new { error = "Slug is required." });

        var normalizedSlug = slug.ToLowerInvariant().Trim();
        var exists = await context.Tenants
            .AnyAsync(t => t.Slug.Value == normalizedSlug, cancellationToken);

        return exists
            ? Conflict(new { available = false, message = "Slug is already taken." })
            : Ok(new { available = true });
    }
}
