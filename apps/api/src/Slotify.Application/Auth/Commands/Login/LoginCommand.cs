using MediatR;

namespace Slotify.Application.Auth.Commands.Login;

public sealed record LoginCommand(
    string Email,
    string Password
) : IRequest<LoginResult>;

public sealed record LoginResult(
    string AccessToken,
    string IdToken,
    string RefreshToken,
    int ExpiresIn,
    UserInfo User
);

public sealed record UserInfo(
    Guid Id,
    string Email,
    string FullName,
    string? AvatarUrl
);
