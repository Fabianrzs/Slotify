namespace Slotify.Domain.Tenants;

/// <summary>
/// Records a single overage unit consumed beyond the plan limit.
/// Accumulated charges are billed at end of billing cycle.
/// </summary>
public sealed class OverageCharge
{
    public Guid Id { get; init; }
    public Guid TenantId { get; init; }
    public OverageType Type { get; init; }
    public decimal UnitPrice { get; init; }
    public bool Billed { get; private set; }
    public DateTime OccurredAt { get; init; }
    public DateTime? BilledAt { get; private set; }

    public void MarkBilled()
    {
        Billed = true;
        BilledAt = DateTime.UtcNow;
    }
}

public enum OverageType { Booking, Branch, Service }
