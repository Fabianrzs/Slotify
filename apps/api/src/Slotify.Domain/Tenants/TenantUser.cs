using Slotify.Domain.Common;

namespace Slotify.Domain.Tenants;

public sealed class TenantUser : Entity<Guid>, IHasTenantId
{
    public Guid TenantId { get; private set; }
    public Guid UserId { get; private set; }
    public TenantRole Role { get; private set; }
    public bool IsActive { get; private set; }
    public string? Notes { get; private set; }
    public DateTime JoinedAt { get; private set; }

    private TenantUser() { }

    public static TenantUser Create(Guid tenantId, Guid userId, TenantRole role)
        => new()
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            UserId = userId,
            Role = role,
            IsActive = true,
            JoinedAt = DateTime.UtcNow
        };

    public static TenantUser CreateOwner(Guid tenantId, Guid userId)
        => Create(tenantId, userId, TenantRole.Owner);

    public static TenantUser CreateClient(Guid tenantId, Guid userId)
        => Create(tenantId, userId, TenantRole.Client);

    public void ChangeRole(TenantRole role) => Role = role;
    public void Deactivate() => IsActive = false;
    public void Activate() => IsActive = true;
    public void SetNotes(string? notes) => Notes = notes;
}

public enum TenantRole { Owner, Admin, Staff, Client }
