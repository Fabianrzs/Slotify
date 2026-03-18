using MediatR;
using Microsoft.EntityFrameworkCore;
using Slotify.Application.Common.Exceptions;
using Slotify.Application.Common.Interfaces;
using Slotify.Domain.Branches;

namespace Slotify.Application.Branches.Commands.SetBranchSchedule;

public sealed class SetBranchScheduleCommandHandler(
    IApplicationDbContext context,
    ITenantContext tenantContext)
    : IRequestHandler<SetBranchScheduleCommand>
{
    public async Task Handle(SetBranchScheduleCommand request, CancellationToken cancellationToken)
    {
        var branch = await context.Branches
            .FirstOrDefaultAsync(b => b.Id == request.BranchId && b.TenantId == tenantContext.TenantId, cancellationToken)
            ?? throw new NotFoundException(nameof(Branch), request.BranchId);

        var schedules = request.Schedule.Select(entry =>
        {
            if (!entry.IsOpen)
                return BranchSchedule.Closed(entry.DayOfWeek);

            if (!TimeOnly.TryParse(entry.OpenTime, out var open) ||
                !TimeOnly.TryParse(entry.CloseTime, out var close))
                throw new ValidationException($"Invalid time format for {entry.DayOfWeek}.");

            return BranchSchedule.Open(entry.DayOfWeek, open, close);
        }).ToList();

        branch.SetSchedule(schedules);
        await context.SaveChangesAsync(cancellationToken);
    }
}

file sealed class ValidationException(string message) : Exception(message);
