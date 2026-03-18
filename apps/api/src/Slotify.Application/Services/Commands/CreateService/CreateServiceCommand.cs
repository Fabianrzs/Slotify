using MediatR;
using Slotify.Application.Common.Behaviors;
using Slotify.Application.Services.DTOs;

namespace Slotify.Application.Services.Commands.CreateService;

public sealed record CreateServiceCommand(
    string Name,
    int DurationMinutes,
    decimal Price,
    string Currency,
    int MaxCapacity,
    string? Description = null,
    Guid? CategoryId = null
) : IRequest<ServiceDto>, IRequiresPlanLimit
{
    public PlanLimitCheck LimitCheck => PlanLimitCheck.Service;
}
