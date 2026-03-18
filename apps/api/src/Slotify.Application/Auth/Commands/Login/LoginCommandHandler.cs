using MediatR;
using Microsoft.EntityFrameworkCore;
using Slotify.Application.Common.Exceptions;
using Slotify.Application.Common.Interfaces;

namespace Slotify.Application.Auth.Commands.Login;

public sealed class LoginCommandHandler(
    IApplicationDbContext context,
    ICognitoAuthService cognitoAuth)
    : IRequestHandler<LoginCommand, LoginResult>
{
    public async Task<LoginResult> Handle(LoginCommand request, CancellationToken cancellationToken)
    {
        // 1. Authenticate with Cognito (validates credentials)
        AuthTokenResult tokens;
        try
        {
            tokens = await cognitoAuth.LoginAsync(request.Email, request.Password, cancellationToken);
        }
        catch (Exception ex) when (ex.Message.Contains("NotAuthorized") || ex.Message.Contains("UserNotFound"))
        {
            // Return same message regardless to prevent user enumeration
            throw new UnauthorizedException("Invalid email or password.");
        }

        // 2. Load local user profile
        var user = await context.Users
            .FirstOrDefaultAsync(u => u.Email == request.Email.ToLowerInvariant(), cancellationToken)
            ?? throw new UnauthorizedException("Invalid email or password.");

        if (!user.IsActive)
            throw new UnauthorizedException("Your account has been deactivated. Please contact support.");

        return new LoginResult(
            tokens.AccessToken,
            tokens.IdToken,
            tokens.RefreshToken,
            tokens.ExpiresIn,
            new UserInfo(user.Id, user.Email, user.FullName, user.AvatarUrl));
    }
}
