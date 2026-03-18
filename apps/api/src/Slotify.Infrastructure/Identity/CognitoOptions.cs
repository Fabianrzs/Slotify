namespace Slotify.Infrastructure.Identity;

public sealed class CognitoOptions
{
    public const string Section = "Cognito";

    /// <summary>AWS Region where the User Pool is deployed (e.g. "us-east-1").</summary>
    public string Region { get; init; } = string.Empty;

    /// <summary>Cognito User Pool ID (e.g. "us-east-1_XXXXXXX").</summary>
    public string UserPoolId { get; init; } = string.Empty;

    /// <summary>App client ID.</summary>
    public string ClientId { get; init; } = string.Empty;

    /// <summary>App client secret. Required if client is configured with a secret.</summary>
    public string? ClientSecret { get; init; }

    /// <summary>JWKS URL used to validate tokens (auto-built from Region + UserPoolId).</summary>
    public string JwksUri => $"https://cognito-idp.{Region}.amazonaws.com/{UserPoolId}/.well-known/jwks.json";

    /// <summary>Issuer claim expected in Cognito JWTs.</summary>
    public string Issuer => $"https://cognito-idp.{Region}.amazonaws.com/{UserPoolId}";
}
