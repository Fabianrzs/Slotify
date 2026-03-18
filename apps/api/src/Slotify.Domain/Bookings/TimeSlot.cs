using Slotify.Domain.Common;

namespace Slotify.Domain.Bookings;

public sealed class TimeSlot : ValueObject
{
    public DateTime StartAt { get; private set; }
    public DateTime EndAt { get; private set; }
    public int DurationMinutes => (int)(EndAt - StartAt).TotalMinutes;

    // Parameterless constructor required for EF Core materialization (owned entity)
    private TimeSlot() { }

    private TimeSlot(DateTime startAt, DateTime endAt)
    {
        StartAt = startAt;
        EndAt = endAt;
    }

    public static TimeSlot Create(DateTime startAt, int durationMinutes)
    {
        if (durationMinutes <= 0)
            throw new ArgumentException("Duration must be positive.", nameof(durationMinutes));
        if (startAt <= DateTime.UtcNow)
            throw new ArgumentException("Start time must be in the future.", nameof(startAt));

        return new TimeSlot(startAt, startAt.AddMinutes(durationMinutes));
    }

    public bool OverlapsWith(TimeSlot other)
        => StartAt < other.EndAt && EndAt > other.StartAt;

    protected override IEnumerable<object?> GetEqualityComponents()
    {
        yield return StartAt;
        yield return EndAt;
    }

    public override string ToString() => $"{StartAt:yyyy-MM-dd HH:mm} – {EndAt:HH:mm}";
}
