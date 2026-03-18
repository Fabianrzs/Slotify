using Slotify.Domain.Common;

namespace Slotify.Domain.Branches;

/// <summary>
/// Overrides the regular weekly schedule for a specific date (holidays, special hours, forced closures).
/// </summary>
public sealed class BranchScheduleException : Entity<Guid>
{
    public Guid BranchId { get; private set; }
    public DateOnly Date { get; private set; }
    public bool IsOpen { get; private set; }
    public TimeOnly OpenTime { get; private set; }
    public TimeOnly CloseTime { get; private set; }
    public string Reason { get; private set; } = string.Empty;

    private BranchScheduleException() { }

    public static BranchScheduleException CreateClosure(Guid branchId, DateOnly date, string reason)
        => new()
        {
            Id = Guid.NewGuid(),
            BranchId = branchId,
            Date = date,
            IsOpen = false,
            Reason = reason
        };

    public static BranchScheduleException CreateSpecialHours(
        Guid branchId, DateOnly date, TimeOnly open, TimeOnly close, string reason)
    {
        if (close <= open) throw new ArgumentException("Close time must be after open time.");

        return new BranchScheduleException
        {
            Id = Guid.NewGuid(),
            BranchId = branchId,
            Date = date,
            IsOpen = true,
            OpenTime = open,
            CloseTime = close,
            Reason = reason
        };
    }
}
