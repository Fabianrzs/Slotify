using Slotify.Domain.Common;
using Slotify.Domain.Tenants.Events;

namespace Slotify.Domain.Tenants;

public sealed class Tenant : AggregateRoot<Guid>
{
    public string Name { get; private set; } = string.Empty;
    public TenantSlug Slug { get; private set; } = null!;
    public string OwnerEmail { get; private set; } = string.Empty;
    public bool IsActive { get; private set; }
    public TenantPlan Plan { get; private set; }
    public DateTime CreatedAt { get; private set; }
    public TenantSettings Settings { get; private set; } = null!;

    private Tenant() { }

    public static Tenant Create(string name, string slug, string ownerEmail)
    {
        var tenant = new Tenant
        {
            Id = Guid.NewGuid(),
            Name = name,
            Slug = TenantSlug.Create(slug),
            OwnerEmail = ownerEmail,
            IsActive = true,
            Plan = TenantPlan.Free,
            CreatedAt = DateTime.UtcNow,
            Settings = TenantSettings.CreateDefault()
        };

        tenant.RaiseDomainEvent(new TenantCreatedEvent(tenant.Id, name, ownerEmail));
        return tenant;
    }

    public void Activate() => IsActive = true;
    public void Deactivate() => IsActive = false;

    public void UpdateSettings(TenantSettings settings) => Settings = settings;

    public void ChangePlan(TenantPlan plan) => Plan = plan;
}

public enum TenantPlan { Free, Starter, Pro, Enterprise }
