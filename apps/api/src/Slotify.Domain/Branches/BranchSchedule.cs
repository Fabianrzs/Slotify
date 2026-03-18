using Slotify.Domain.Common;

namespace Slotify.Domain.Branches;

public sealed class BranchSchedule : ValueObject
{
    public DayOfWeek DayOfWeek { get; }
    public TimeOnly OpenTime { get; }
    public TimeOnly CloseTime { get; }
    public bool IsOpen { get; }

    private BranchSchedule(DayOfWeek dayOfWeek, TimeOnly openTime, TimeOnly closeTime, bool isOpen)
    {
        DayOfWeek = dayOfWeek;
        OpenTime = openTime;
        CloseTime = closeTime;
        IsOpen = isOpen;
    }

    public static BranchSchedule Open(DayOfWeek day, TimeOnly open, TimeOnly close)
    {
        if (close <= open) throw new ArgumentException("Close time must be after open time.");
        return new BranchSchedule(day, open, close, true);
    }

    public static BranchSchedule Closed(DayOfWeek day)
        => new(day, TimeOnly.MinValue, TimeOnly.MinValue, false);

    public int TotalMinutes => IsOpen ? (int)(CloseTime - OpenTime).TotalMinutes : 0;

    protected override IEnumerable<object?> GetEqualityComponents()
    {
        yield return DayOfWeek;
        yield return OpenTime;
        yield return CloseTime;
        yield return IsOpen;
    }
}
