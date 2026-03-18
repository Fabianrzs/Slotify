using MediatR;

namespace Slotify.Application.Auth.Commands.Register;

public sealed record RegisterUserCommand(
    string Email,
    string Password,
    string FullName,
    string? Phone = null
) : IRequest<RegisterUserResult>;

public sealed record RegisterUserResult(Guid UserId, string Email, string FullName);
