using Slotify.Domain.Common;
using Slotify.Domain.Users.Events;

namespace Slotify.Domain.Users;

public sealed class User : AggregateRoot<Guid>
{
    public string Email { get; private set; } = string.Empty;
    public string FullName { get; private set; } = string.Empty;
    public string? PasswordHash { get; private set; }
    public string? Phone { get; private set; }
    public string? AvatarUrl { get; private set; }
    public bool IsActive { get; private set; }
    public bool IsEmailVerified { get; private set; }
    public string? ExternalProvider { get; private set; }
    public string? ExternalProviderId { get; private set; }
    public DateTime CreatedAt { get; private set; }

    private User() { }

    public static User Create(string email, string fullName, string passwordHash)
    {
        var user = new User
        {
            Id = Guid.NewGuid(),
            Email = email.ToLowerInvariant().Trim(),
            FullName = fullName,
            PasswordHash = passwordHash,
            IsActive = true,
            IsEmailVerified = false,
            CreatedAt = DateTime.UtcNow
        };

        user.RaiseDomainEvent(new UserRegisteredEvent(user.Id, user.Email));
        return user;
    }

    public static User CreateFromExternalProvider(string email, string fullName, string provider, string providerId)
    {
        var user = new User
        {
            Id = Guid.NewGuid(),
            Email = email.ToLowerInvariant().Trim(),
            FullName = fullName,
            IsActive = true,
            IsEmailVerified = true,
            ExternalProvider = provider,
            ExternalProviderId = providerId,
            CreatedAt = DateTime.UtcNow
        };

        user.RaiseDomainEvent(new UserRegisteredEvent(user.Id, user.Email));
        return user;
    }

    public void VerifyEmail() => IsEmailVerified = true;
    public void UpdateProfile(string fullName, string? phone, string? avatarUrl)
    {
        FullName = fullName;
        Phone = phone;
        AvatarUrl = avatarUrl;
    }
    public void UpdatePasswordHash(string hash) => PasswordHash = hash;
    public void Deactivate() => IsActive = false;
}
