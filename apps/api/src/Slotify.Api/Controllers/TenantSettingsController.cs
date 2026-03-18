using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Slotify.Application.Common.Interfaces;
using Slotify.Application.TenantSettings.Commands;

namespace Slotify.Api.Controllers;

[ApiController]
[Route("api/tenant/settings")]
[Authorize(Policy = "TenantAdmin")]
public sealed class TenantSettingsController(
    IMediator mediator,
    IApplicationDbContext context,
    ITenantContext tenantContext) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> Get(CancellationToken cancellationToken)
    {
        var tenant = await context.Tenants
            .FirstOrDefaultAsync(t => t.Id == tenantContext.TenantId, cancellationToken);

        if (tenant is null) return NotFound();

        return Ok(new
        {
            tenant.Name,
            Slug = tenant.Slug.Value,
            Settings = TenantSettingsDto.FromSettings(tenant.Settings)
        });
    }

    [HttpPut]
    public async Task<IActionResult> Update(
        [FromBody] UpdateTenantSettingsCommand command,
        CancellationToken cancellationToken)
    {
        var result = await mediator.Send(command, cancellationToken);
        return Ok(result);
    }
}
