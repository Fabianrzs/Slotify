using Slotify.Application.Common.Interfaces;

namespace Slotify.Infrastructure.Identity;

/// <summary>
/// Adapts the concrete CognitoAuthService to the ICognitoAuthService interface
/// used by the Application layer (which has no dependency on AWS SDK).
/// </summary>
public sealed class CognitoAuthServiceAdapter(CognitoAuthService cognitoService) : ICognitoAuthService
{
    public async Task<AuthTokenResult> LoginAsync(string email, string password, CancellationToken ct = default)
    {
        var result = await cognitoService.LoginAsync(email, password, ct);
        return new AuthTokenResult(result.AccessToken, result.IdToken, result.RefreshToken, result.ExpiresIn);
    }

    public async Task<AuthTokenResult> RefreshTokenAsync(string refreshToken, string username, CancellationToken ct = default)
    {
        var result = await cognitoService.RefreshTokenAsync(refreshToken, username, ct);
        return new AuthTokenResult(result.AccessToken, result.IdToken, result.RefreshToken, result.ExpiresIn);
    }

    public Task<string> RegisterAsync(string email, string password, string fullName, string? phone = null, CancellationToken ct = default)
        => cognitoService.RegisterAsync(email, password, fullName, phone, ct);

    public Task InitiateForgotPasswordAsync(string email, CancellationToken ct = default)
        => cognitoService.InitiateForgotPasswordAsync(email, ct);

    public Task ConfirmForgotPasswordAsync(string email, string code, string newPassword, CancellationToken ct = default)
        => cognitoService.ConfirmForgotPasswordAsync(email, code, newPassword, ct);

    public Task AddUserToGroupAsync(string email, string groupName, CancellationToken ct = default)
        => cognitoService.AddUserToGroupAsync(email, groupName, ct);

    public Task SignOutAsync(string accessToken, CancellationToken ct = default)
        => cognitoService.SignOutAsync(accessToken, ct);
}
