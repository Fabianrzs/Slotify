using MediatR;

namespace Slotify.Application.Branches.Commands.SetBranchSchedule;

public sealed record SetBranchScheduleCommand(
    Guid BranchId,
    IReadOnlyList<ScheduleEntryDto> Schedule
) : IRequest;

public sealed record ScheduleEntryDto(
    DayOfWeek DayOfWeek,
    bool IsOpen,
    string? OpenTime,   // "HH:mm" format
    string? CloseTime   // "HH:mm" format
);
