using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Slotify.Application.Staff.Commands.InviteStaff;
using Slotify.Application.Staff.Commands.UpdateStaffRole;
using Slotify.Application.Staff.Queries.GetStaff;

namespace Slotify.Api.Controllers;

[ApiController]
[Route("api/staff")]
[Authorize(Policy = "TenantAdmin")]
public sealed class StaffController(IMediator mediator) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetAll(CancellationToken cancellationToken)
        => Ok(await mediator.Send(new GetStaffQuery(), cancellationToken));

    [HttpPost("invite")]
    [ProducesResponseType(StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status402PaymentRequired)]
    public async Task<IActionResult> Invite(
        [FromBody] InviteStaffCommand command,
        CancellationToken cancellationToken)
    {
        var result = await mediator.Send(command, cancellationToken);
        return Created(string.Empty, result);
    }

    [HttpPatch("{tenantUserId:guid}/role")]
    public async Task<IActionResult> UpdateRole(
        Guid tenantUserId,
        [FromBody] UpdateRoleRequest request,
        CancellationToken cancellationToken)
    {
        await mediator.Send(new UpdateStaffRoleCommand(tenantUserId, request.Role), cancellationToken);
        return NoContent();
    }
}

public sealed record UpdateRoleRequest(string Role);
