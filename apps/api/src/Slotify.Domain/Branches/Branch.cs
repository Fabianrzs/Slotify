using Slotify.Domain.Common;

namespace Slotify.Domain.Branches;

public sealed class Branch : Entity<Guid>, IHasTenantId
{
    public Guid TenantId { get; private set; }
    public string Name { get; private set; } = string.Empty;
    public string? Address { get; private set; }
    public string? Phone { get; private set; }
    public string Timezone { get; private set; } = "America/Bogota";
    public bool IsActive { get; private set; }
    public DateTime CreatedAt { get; private set; }
    public IReadOnlyList<BranchSchedule> WeeklySchedule => _weeklySchedule.AsReadOnly();

    private readonly List<BranchSchedule> _weeklySchedule = [];

    private Branch() { }

    public static Branch Create(Guid tenantId, string name, string timezone, string? address = null, string? phone = null)
        => new()
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            Name = name,
            Address = address,
            Phone = phone,
            Timezone = timezone,
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

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
