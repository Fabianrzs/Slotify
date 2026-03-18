using MediatR;
using Slotify.Application.Branches.DTOs;

namespace Slotify.Application.Branches.Commands.AddScheduleException;

public sealed record AddScheduleExceptionCommand(
    Guid BranchId,
    DateOnly Date,
    bool IsOpen,
    string? OpenTime,
    string? CloseTime,
    string Reason
) : IRequest<ScheduleExceptionDto>;
