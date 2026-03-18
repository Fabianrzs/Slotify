using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Slotify.Application.Auth.Commands.ForgotPassword;
using Slotify.Application.Auth.Commands.Login;
using Slotify.Application.Auth.Commands.RefreshToken;
using Slotify.Application.Auth.Commands.Register;
using Slotify.Application.Common.Interfaces;

namespace Slotify.Api.Controllers;

[ApiController]
[Route("api/auth")]
public sealed class AuthController(IMediator mediator, ICognitoAuthService cognitoAuth) : ControllerBase
{
    /// <summary>Register a new end-user (client) account.</summary>
    [HttpPost("register")]
    [ProducesResponseType(StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<IActionResult> Register(
        [FromBody] RegisterUserCommand command,
        CancellationToken cancellationToken)
    {
        var result = await mediator.Send(command, cancellationToken);
        return Created(string.Empty, result);
    }

    /// <summary>Authenticate with email and password. Returns Cognito tokens.</summary>
    [HttpPost("login")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> Login(
        [FromBody] LoginCommand command,
        CancellationToken cancellationToken)
    {
        var result = await mediator.Send(command, cancellationToken);
        return Ok(result);
    }

    /// <summary>Obtain a new access token using a Cognito refresh token.</summary>
    [HttpPost("refresh")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> Refresh(
        [FromBody] RefreshTokenCommand command,
        CancellationToken cancellationToken)
    {
        var result = await mediator.Send(command, cancellationToken);
        return Ok(result);
    }

    /// <summary>Sign out and invalidate all Cognito tokens for the session.</summary>
    [HttpPost("logout")]
    [Authorize]
    public async Task<IActionResult> Logout(CancellationToken cancellationToken)
    {
        var accessToken = Request.Headers.Authorization.ToString().Replace("Bearer ", "");
        await cognitoAuth.SignOutAsync(accessToken, cancellationToken);
        return NoContent();
    }

    /// <summary>Initiate the forgot-password flow. Cognito sends a verification code.</summary>
    [HttpPost("forgot-password")]
    public async Task<IActionResult> ForgotPassword(
        [FromBody] ForgotPasswordRequest request,
        CancellationToken cancellationToken)
    {
        await mediator.Send(new ForgotPasswordCommand(request.Email), cancellationToken);
        return Ok(new { message = "If an account with that email exists, a code has been sent." });
    }

    /// <summary>Confirm password reset with the code received via email.</summary>
    [HttpPost("reset-password")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> ResetPassword(
        [FromBody] ResetPasswordRequest request,
        CancellationToken cancellationToken)
    {
        await mediator.Send(
            new ConfirmForgotPasswordCommand(request.Email, request.Code, request.NewPassword),
            cancellationToken);
        return NoContent();
    }
}

public sealed record ForgotPasswordRequest(string Email);
public sealed record ResetPasswordRequest(string Email, string Code, string NewPassword);
