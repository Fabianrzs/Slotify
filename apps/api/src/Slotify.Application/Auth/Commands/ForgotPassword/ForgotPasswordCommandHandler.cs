using MediatR;
using Slotify.Application.Common.Interfaces;

namespace Slotify.Application.Auth.Commands.ForgotPassword;

public sealed class ForgotPasswordCommandHandler(ICognitoAuthService cognitoAuth)
    : IRequestHandler<ForgotPasswordCommand>
{
    public async Task Handle(ForgotPasswordCommand request, CancellationToken cancellationToken)
    {
        // Always respond OK to prevent user enumeration
        try { await cognitoAuth.InitiateForgotPasswordAsync(request.Email, cancellationToken); }
        catch { /* swallow — do not reveal if email exists */ }
    }
}

public sealed class ConfirmForgotPasswordCommandHandler(ICognitoAuthService cognitoAuth)
    : IRequestHandler<ConfirmForgotPasswordCommand>
{
    public async Task Handle(ConfirmForgotPasswordCommand request, CancellationToken cancellationToken)
        => await cognitoAuth.ConfirmForgotPasswordAsync(
            request.Email, request.ConfirmationCode, request.NewPassword, cancellationToken);
}
