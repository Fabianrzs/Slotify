using MediatR;
using Slotify.Application.Auth.Commands.Login;

namespace Slotify.Application.Auth.Commands.RefreshToken;

public sealed record RefreshTokenCommand(
    string RefreshToken,
    string Email
) : IRequest<LoginResult>;
