using MediatR;

namespace Slotify.Application.Services.Commands.ToggleService;

public sealed record ToggleServiceCommand(Guid ServiceId, bool IsActive) : IRequest;
