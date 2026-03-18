using Slotify.Domain.Common;

namespace Slotify.Domain.Bookings;

public sealed class BlockedSlot : Entity<Guid>, IHasTenantId
{
    public Guid TenantId { get; private set; }
    public Guid BranchId { get; private set; }
    public Guid? StaffId { get; private set; }
    public DateTime StartAt { get; private set; }
    public DateTime EndAt { get; private set; }
    public string Reason { get; private set; } = string.Empty;
    public DateTime CreatedAt { get; private set; }

    private BlockedSlot() { }

    public static BlockedSlot Create(
        Guid tenantId, Guid branchId, DateTime startAt, DateTime endAt,
        string reason, Guid? staffId = null)
    {
        if (endAt <= startAt) throw new ArgumentException("End must be after start.");

        return new BlockedSlot
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            BranchId = branchId,
            StaffId = staffId,
            StartAt = startAt,
            EndAt = endAt,
            Reason = reason,
            CreatedAt = DateTime.UtcNow
        };
    }
}
