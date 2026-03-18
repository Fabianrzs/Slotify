using System.Security.Cryptography;
using System.Text;
using Amazon.CognitoIdentityProvider;
using Amazon.CognitoIdentityProvider.Model;
using Microsoft.Extensions.Options;

namespace Slotify.Infrastructure.Identity;

/// <summary>
/// Wraps AWS Cognito Identity Provider SDK for auth operations.
/// Cognito owns all credentials — we never store passwords.
/// </summary>
public sealed class CognitoAuthService(
    IAmazonCognitoIdentityProvider cognitoClient,
    IOptions<CognitoOptions> options)
{
    private readonly CognitoOptions _options = options.Value;

    public async Task<CognitoTokenResult> LoginAsync(
        string email, string password, CancellationToken cancellationToken = default)
    {
        var request = new InitiateAuthRequest
        {
            AuthFlow = AuthFlowType.USER_PASSWORD_AUTH,
            ClientId = _options.ClientId,
            AuthParameters = new Dictionary<string, string>
            {
                ["USERNAME"] = email,
                ["PASSWORD"] = password
            }
        };

        if (_options.ClientSecret is not null)
            request.AuthParameters["SECRET_HASH"] = ComputeSecretHash(email);

        var response = await cognitoClient.InitiateAuthAsync(request, cancellationToken);

        return new CognitoTokenResult(
            response.AuthenticationResult.AccessToken,
            response.AuthenticationResult.IdToken,
            response.AuthenticationResult.RefreshToken,
            response.AuthenticationResult.ExpiresIn);
    }

    public async Task<CognitoTokenResult> RefreshTokenAsync(
        string refreshToken, string username, CancellationToken cancellationToken = default)
    {
        var request = new InitiateAuthRequest
        {
            AuthFlow = AuthFlowType.REFRESH_TOKEN_AUTH,
            ClientId = _options.ClientId,
            AuthParameters = new Dictionary<string, string>
            {
                ["REFRESH_TOKEN"] = refreshToken
            }
        };

        if (_options.ClientSecret is not null)
            request.AuthParameters["SECRET_HASH"] = ComputeSecretHash(username);

        var response = await cognitoClient.InitiateAuthAsync(request, cancellationToken);

        return new CognitoTokenResult(
            response.AuthenticationResult.AccessToken,
            response.AuthenticationResult.IdToken,
            response.AuthenticationResult.RefreshToken ?? refreshToken,
            response.AuthenticationResult.ExpiresIn);
    }

    public async Task<string> RegisterAsync(
        string email, string password, string fullName, string? phone = null,
        CancellationToken cancellationToken = default)
    {
        var attributes = new List<AttributeType>
        {
            new() { Name = "email", Value = email },
            new() { Name = "name", Value = fullName },
            new() { Name = "email_verified", Value = "true" }
        };

        if (phone is not null)
            attributes.Add(new() { Name = "phone_number", Value = phone });

        var request = new SignUpRequest
        {
            ClientId = _options.ClientId,
            Username = email,
            Password = password,
            UserAttributes = attributes
        };

        if (_options.ClientSecret is not null)
            request.SecretHash = ComputeSecretHash(email);

        var response = await cognitoClient.SignUpAsync(request, cancellationToken);

        // Auto-confirm via admin (skips email verification in dev)
        await cognitoClient.AdminConfirmSignUpAsync(new AdminConfirmSignUpRequest
        {
            UserPoolId = _options.UserPoolId,
            Username = email
        }, cancellationToken);

        return response.UserSub; // Cognito sub = external user ID
    }

    public async Task InitiateForgotPasswordAsync(string email, CancellationToken cancellationToken = default)
    {
        var request = new ForgotPasswordRequest
        {
            ClientId = _options.ClientId,
            Username = email
        };

        if (_options.ClientSecret is not null)
            request.SecretHash = ComputeSecretHash(email);

        await cognitoClient.ForgotPasswordAsync(request, cancellationToken);
    }

    public async Task ConfirmForgotPasswordAsync(
        string email, string confirmationCode, string newPassword,
        CancellationToken cancellationToken = default)
    {
        var request = new ConfirmForgotPasswordRequest
        {
            ClientId = _options.ClientId,
            Username = email,
            ConfirmationCode = confirmationCode,
            Password = newPassword
        };

        if (_options.ClientSecret is not null)
            request.SecretHash = ComputeSecretHash(email);

        await cognitoClient.ConfirmForgotPasswordAsync(request, cancellationToken);
    }

    public async Task SetUserAttributesAsync(
        string accessToken, Dictionary<string, string> attributes,
        CancellationToken cancellationToken = default)
    {
        await cognitoClient.UpdateUserAttributesAsync(new UpdateUserAttributesRequest
        {
            AccessToken = accessToken,
            UserAttributes = attributes.Select(kv => new AttributeType { Name = kv.Key, Value = kv.Value }).ToList()
        }, cancellationToken);
    }

    public async Task AddUserToGroupAsync(
        string email, string groupName, CancellationToken cancellationToken = default)
    {
        await cognitoClient.AdminAddUserToGroupAsync(new AdminAddUserToGroupRequest
        {
            UserPoolId = _options.UserPoolId,
            Username = email,
            GroupName = groupName  // e.g. "TenantOwner", "Staff", "Client", "PlatformAdmin"
        }, cancellationToken);
    }

    public async Task SignOutAsync(string accessToken, CancellationToken cancellationToken = default)
    {
        await cognitoClient.GlobalSignOutAsync(new GlobalSignOutRequest
        {
            AccessToken = accessToken
        }, cancellationToken);
    }

    private string ComputeSecretHash(string username)
    {
        var message = username + _options.ClientId;
        var key = Encoding.UTF8.GetBytes(_options.ClientSecret!);
        using var hmac = new HMACSHA256(key);
        var hash = hmac.ComputeHash(Encoding.UTF8.GetBytes(message));
        return Convert.ToBase64String(hash);
    }
}

public sealed record CognitoTokenResult(
    string AccessToken,
    string IdToken,
    string RefreshToken,
    int ExpiresIn
);
