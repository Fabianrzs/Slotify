using Slotify.Domain.Common;

namespace Slotify.Domain.Tenants;

public sealed class TenantSubscription : Entity<Guid>
{
    public Guid TenantId { get; private set; }
    public Guid PlanId { get; private set; }
    public Plan Plan { get; private set; } = null!;
    public SubscriptionStatus Status { get; private set; }
    public DateTime StartAt { get; private set; }
    public DateTime? EndAt { get; private set; }
    public DateTime? CancelledAt { get; private set; }

    /// <summary>
    /// Whether this tenant has opted in to overage billing.
    /// Can be toggled independently of the plan's AllowOverage flag.
    /// </summary>
    public bool OverageBillingEnabled { get; private set; }

    private TenantSubscription() { }

    public static TenantSubscription Create(Guid tenantId, Guid planId)
        => new()
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            PlanId = planId,
            Status = SubscriptionStatus.Active,
            StartAt = DateTime.UtcNow,
            OverageBillingEnabled = false
        };

    public void EnableOverageBilling() => OverageBillingEnabled = true;
    public void DisableOverageBilling() => OverageBillingEnabled = false;

    public void Cancel()
    {
        Status = SubscriptionStatus.Cancelled;
        CancelledAt = DateTime.UtcNow;
    }
}

public enum SubscriptionStatus { Active, Cancelled, Expired, PastDue }
