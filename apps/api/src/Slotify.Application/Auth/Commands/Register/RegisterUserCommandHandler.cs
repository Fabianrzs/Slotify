using MediatR;
using Microsoft.EntityFrameworkCore;
using Slotify.Application.Common.Exceptions;
using Slotify.Application.Common.Interfaces;
using Slotify.Domain.Users;

namespace Slotify.Application.Auth.Commands.Register;

public sealed class RegisterUserCommandHandler(
    IApplicationDbContext context,
    ICognitoAuthService cognitoAuth)
    : IRequestHandler<RegisterUserCommand, RegisterUserResult>
{
    public async Task<RegisterUserResult> Handle(
        RegisterUserCommand request, CancellationToken cancellationToken)
    {
        // 1. Check email not already in our DB
        var exists = await context.Users
            .AnyAsync(u => u.Email == request.Email.ToLowerInvariant(), cancellationToken);

        if (exists)
            throw new ConflictException($"An account with email '{request.Email}' already exists.");

        // 2. Register in Cognito — Cognito owns the credential
        var cognitoSub = await cognitoAuth.RegisterAsync(
            request.Email, request.Password, request.FullName, request.Phone, cancellationToken);

        // 3. Add to "Client" group (default role for end users)
        await cognitoAuth.AddUserToGroupAsync(request.Email, "Client", cancellationToken);

        // 4. Create local user record linked by CognitoSub
        var user = User.CreateFromExternalProvider(
            request.Email, request.FullName, "Cognito", cognitoSub);

        if (request.Phone is not null)
            user.UpdateProfile(request.FullName, request.Phone, null);

        context.Users.Add(user);
        await context.SaveChangesAsync(cancellationToken);

        return new RegisterUserResult(user.Id, user.Email, user.FullName);
    }
}
