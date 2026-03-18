using MediatR;
using Microsoft.EntityFrameworkCore;
using Slotify.Application.Auth.Commands.Login;
using Slotify.Application.Common.Exceptions;
using Slotify.Application.Common.Interfaces;

namespace Slotify.Application.Auth.Commands.RefreshToken;

public sealed class RefreshTokenCommandHandler(
    IApplicationDbContext context,
    ICognitoAuthService cognitoAuth)
    : IRequestHandler<RefreshTokenCommand, LoginResult>
{
    public async Task<LoginResult> Handle(RefreshTokenCommand request, CancellationToken cancellationToken)
    {
        AuthTokenResult tokens;
        try
        {
            tokens = await cognitoAuth.RefreshTokenAsync(request.RefreshToken, request.Email, cancellationToken);
        }
        catch
        {
            throw new UnauthorizedException("Invalid or expired refresh token.");
        }

        var user = await context.Users
            .FirstOrDefaultAsync(u => u.Email == request.Email.ToLowerInvariant(), cancellationToken)
            ?? throw new UnauthorizedException("User not found.");

        return new LoginResult(
            tokens.AccessToken,
            tokens.IdToken,
            tokens.RefreshToken,
            tokens.ExpiresIn,
            new UserInfo(user.Id, user.Email, user.FullName, user.AvatarUrl));
    }
}
