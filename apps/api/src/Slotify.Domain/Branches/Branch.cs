using Slotify.Domain.Common;

namespace Slotify.Domain.Branches;

public sealed class Branch : Entity<Guid>, IHasTenantId
{
    public Guid TenantId { get; private set; }
    public string Name { get; private set; } = string.Empty;
    public string? Address { get; private set; }
    public string? Phone { get; private set; }
    public string Timezone { get; private set; } = "America/Bogota";
    public double? Latitude { get; private set; }
    public double? Longitude { get; private set; }
    public bool IsActive { get; private set; }
    public DateTime CreatedAt { get; private set; }
    public IReadOnlyList<BranchSchedule> WeeklySchedule => _weeklySchedule.AsReadOnly();

    private readonly List<BranchSchedule> _weeklySchedule = [];

    private Branch() { }

    public static Branch Create(
        Guid tenantId,
        string name,
        string timezone,
        string? address = null,
        string? phone = null,
        double? latitude = null,
        double? longitude = null)
        => new()
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            Name = name,
            Address = address,
            Phone = phone,
            Timezone = timezone,
            Latitude = latitude,
            Longitude = longitude,
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

    public void SetCoordinates(double latitude, double longitude)
    {
        Latitude = latitude;
        Longitude = longitude;
    }

    public void SetSchedule(IEnumerable<BranchSchedule> schedule)
    {
        _weeklySchedule.Clear();
        _weeklySchedule.AddRange(schedule);
    }

    public BranchSchedule? GetScheduleForDay(DayOfWeek day)
        => _weeklySchedule.FirstOrDefault(s => s.DayOfWeek == day);

    public void Activate() => IsActive = true;
    public void Deactivate() => IsActive = false;
}
