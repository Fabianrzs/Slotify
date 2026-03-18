namespace Slotify.Application.Common.Interfaces;

public interface ICognitoAuthService
{
    Task<AuthTokenResult> LoginAsync(string email, string password, CancellationToken ct = default);
    Task<AuthTokenResult> RefreshTokenAsync(string refreshToken, string username, CancellationToken ct = default);
    Task<string> RegisterAsync(string email, string password, string fullName, string? phone = null, CancellationToken ct = default);
    Task InitiateForgotPasswordAsync(string email, CancellationToken ct = default);
    Task ConfirmForgotPasswordAsync(string email, string code, string newPassword, CancellationToken ct = default);
    Task AddUserToGroupAsync(string email, string groupName, CancellationToken ct = default);
    Task SignOutAsync(string accessToken, CancellationToken ct = default);
}

public sealed record AuthTokenResult(
    string AccessToken,
    string IdToken,
    string RefreshToken,
    int ExpiresIn
);
