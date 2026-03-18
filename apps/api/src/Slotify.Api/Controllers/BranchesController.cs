using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Slotify.Application.Branches.Commands.AddScheduleException;
using Slotify.Application.Branches.Commands.CreateBranch;
using Slotify.Application.Branches.Commands.SetBranchSchedule;
using Slotify.Application.Branches.Commands.UpdateBranch;
using Slotify.Application.Branches.Queries.GetBranches;

namespace Slotify.Api.Controllers;

[ApiController]
[Route("api/branches")]
[Authorize(Policy = "TenantAdmin")]
public sealed class BranchesController(IMediator mediator) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetAll(
        [FromQuery] bool? activeOnly, CancellationToken cancellationToken)
        => Ok(await mediator.Send(new GetBranchesQuery(activeOnly), cancellationToken));

    [HttpPost]
    [ProducesResponseType(StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status402PaymentRequired)]
    public async Task<IActionResult> Create(
        [FromBody] CreateBranchCommand command,
        CancellationToken cancellationToken)
    {
        var branch = await mediator.Send(command, cancellationToken);
        return CreatedAtAction(nameof(GetAll), new { id = branch.Id }, branch);
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(
        Guid id,
        [FromBody] UpdateBranchRequest request,
        CancellationToken cancellationToken)
    {
        var branch = await mediator.Send(
            new UpdateBranchCommand(id, request.Name, request.Address, request.Phone, request.Timezone, request.IsActive),
            cancellationToken);
        return Ok(branch);
    }

    [HttpPut("{id:guid}/schedule")]
    public async Task<IActionResult> SetSchedule(
        Guid id,
        [FromBody] IReadOnlyList<ScheduleEntryDto> schedule,
        CancellationToken cancellationToken)
    {
        await mediator.Send(new SetBranchScheduleCommand(id, schedule), cancellationToken);
        return NoContent();
    }

    [HttpPost("{id:guid}/exceptions")]
    [ProducesResponseType(StatusCodes.Status201Created)]
    public async Task<IActionResult> AddException(
        Guid id,
        [FromBody] AddScheduleExceptionCommand command,
        CancellationToken cancellationToken)
    {
        var ex = await mediator.Send(command with { BranchId = id }, cancellationToken);
        return Created(string.Empty, ex);
    }
}

public sealed record UpdateBranchRequest(
    string Name,
    string? Address,
    string? Phone,
    string Timezone,
    bool IsActive);
