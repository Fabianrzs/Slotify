using MediatR;
using Slotify.Application.Services.DTOs;

namespace Slotify.Application.Services.Commands.UpdateService;

public sealed record UpdateServiceCommand(
    Guid ServiceId,
    string Name,
    int DurationMinutes,
    decimal Price,
    string Currency,
    int MaxCapacity,
    string? Description,
    Guid? CategoryId
) : IRequest<ServiceDto>;
