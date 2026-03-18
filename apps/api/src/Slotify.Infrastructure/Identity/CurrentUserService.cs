using System.Security.Claims;
using Microsoft.AspNetCore.Http;
using Slotify.Application.Common.Interfaces;

namespace Slotify.Infrastructure.Identity;

/// <summary>
/// Reads user identity from the Cognito JWT claims injected by the JWT bearer middleware.
/// Cognito claim names: "sub" = user ID, "email" = email, "cognito:groups" = roles.
/// </summary>
public sealed class CurrentUserService(IHttpContextAccessor httpContextAccessor) : ICurrentUserService
{
    private ClaimsPrincipal? User => httpContextAccessor.HttpContext?.User;

    public Guid UserId
    {
        get
        {
            // Our local DB User.Id is stored in a custom claim set during login
            var localId = User?.FindFirstValue("slotify:user_id");
            if (Guid.TryParse(localId, out var id)) return id;

            // Fallback: Cognito sub (used before local profile is loaded)
            var sub = User?.FindFirstValue(ClaimTypes.NameIdentifier)
                      ?? User?.FindFirstValue("sub");
            return Guid.TryParse(sub, out var subId) ? subId : Guid.Empty;
        }
    }

    public string? Email => User?.FindFirstValue("email")
                           ?? User?.FindFirstValue(ClaimTypes.Email);

    /// <summary>
    /// Returns the first Cognito group the user belongs to.
    /// Groups: TenantOwner, TenantAdmin, Staff, Client, PlatformAdmin
    /// </summary>
    public string Role => User?.FindFirstValue("cognito:groups")
                         ?? User?.FindFirstValue(ClaimTypes.Role)
                         ?? "Anonymous";

    public bool IsAuthenticated => User?.Identity?.IsAuthenticated ?? false;
}
