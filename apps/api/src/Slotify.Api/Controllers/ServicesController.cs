using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Slotify.Application.Services.Commands.CreateService;
using Slotify.Application.Services.Commands.ToggleService;
using Slotify.Application.Services.Commands.UpdateService;
using Slotify.Application.Services.Queries.GetServices;

namespace Slotify.Api.Controllers;

[ApiController]
[Route("api/services")]
[Authorize(Policy = "TenantAdmin")]
public sealed class ServicesController(IMediator mediator) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetAll(
        [FromQuery] bool? activeOnly,
        [FromQuery] Guid? categoryId,
        CancellationToken cancellationToken)
        => Ok(await mediator.Send(new GetServicesQuery(activeOnly, categoryId), cancellationToken));

    [HttpPost]
    [ProducesResponseType(StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status402PaymentRequired)]
    public async Task<IActionResult> Create(
        [FromBody] CreateServiceCommand command,
        CancellationToken cancellationToken)
    {
        var service = await mediator.Send(command, cancellationToken);
        return Created(string.Empty, service);
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(
        Guid id,
        [FromBody] UpdateServiceRequest request,
        CancellationToken cancellationToken)
    {
        var service = await mediator.Send(
            new UpdateServiceCommand(id, request.Name, request.DurationMinutes, request.Price,
                request.Currency, request.MaxCapacity, request.Description, request.CategoryId),
            cancellationToken);
        return Ok(service);
    }

    [HttpPatch("{id:guid}/toggle")]
    public async Task<IActionResult> Toggle(
        Guid id,
        [FromBody] ToggleRequest request,
        CancellationToken cancellationToken)
    {
        await mediator.Send(new ToggleServiceCommand(id, request.IsActive), cancellationToken);
        return NoContent();
    }
}

public sealed record UpdateServiceRequest(
    string Name,
    int DurationMinutes,
    decimal Price,
    string Currency,
    int MaxCapacity,
    string? Description,
    Guid? CategoryId);

public sealed record ToggleRequest(bool IsActive);
