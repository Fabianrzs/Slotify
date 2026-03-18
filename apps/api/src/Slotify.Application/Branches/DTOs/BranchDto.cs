using Slotify.Domain.Branches;

namespace Slotify.Application.Branches.DTOs;

public sealed record BranchDto(
    Guid Id,
    Guid TenantId,
    string Name,
    string? Address,
    string? Phone,
    string Timezone,
    bool IsActive,
    DateTime CreatedAt,
    IReadOnlyList<ScheduleDto> WeeklySchedule
)
{
    public static BranchDto FromBranch(Branch branch) => new(
        branch.Id,
        branch.TenantId,
        branch.Name,
        branch.Address,
        branch.Phone,
        branch.Timezone,
        branch.IsActive,
        branch.CreatedAt,
        branch.WeeklySchedule.Select(ScheduleDto.FromSchedule).ToList());
}

public sealed record ScheduleDto(
    string DayOfWeek,
    bool IsOpen,
    string? OpenTime,
    string? CloseTime
)
{
    public static ScheduleDto FromSchedule(BranchSchedule s) => new(
        s.DayOfWeek.ToString(),
        s.IsOpen,
        s.IsOpen ? s.OpenTime.ToString("HH:mm") : null,
        s.IsOpen ? s.CloseTime.ToString("HH:mm") : null);
}

public sealed record ScheduleExceptionDto(
    Guid Id,
    string Date,
    bool IsOpen,
    string? OpenTime,
    string? CloseTime,
    string Reason
);
