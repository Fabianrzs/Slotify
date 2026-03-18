using MediatR;

namespace Slotify.Application.Auth.Commands.ForgotPassword;

public sealed record ForgotPasswordCommand(string Email) : IRequest;

public sealed record ConfirmForgotPasswordCommand(
    string Email,
    string ConfirmationCode,
    string NewPassword
) : IRequest;
