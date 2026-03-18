using MediatR;
using Microsoft.EntityFrameworkCore;
using Slotify.Application.Branches.DTOs;
using Slotify.Application.Common.Exceptions;
using Slotify.Application.Common.Interfaces;
using Slotify.Domain.Branches;

namespace Slotify.Application.Branches.Commands.AddScheduleException;

public sealed class AddScheduleExceptionCommandHandler(
    IApplicationDbContext context,
    ITenantContext tenantContext)
    : IRequestHandler<AddScheduleExceptionCommand, ScheduleExceptionDto>
{
    public async Task<ScheduleExceptionDto> Handle(
        AddScheduleExceptionCommand request, CancellationToken cancellationToken)
    {
        var branch = await context.Branches
            .FirstOrDefaultAsync(b => b.Id == request.BranchId && b.TenantId == tenantContext.TenantId, cancellationToken)
            ?? throw new NotFoundException(nameof(Branch), request.BranchId);

        var exception = request.IsOpen
            ? BranchScheduleException.CreateSpecialHours(
                branch.Id,
                request.Date,
                TimeOnly.Parse(request.OpenTime!),
                TimeOnly.Parse(request.CloseTime!),
                request.Reason)
            : BranchScheduleException.CreateClosure(branch.Id, request.Date, request.Reason);

        context.BranchScheduleExceptions.Add(exception);
        await context.SaveChangesAsync(cancellationToken);

        return new ScheduleExceptionDto(
            exception.Id,
            exception.Date.ToString("yyyy-MM-dd"),
            exception.IsOpen,
            exception.IsOpen ? exception.OpenTime.ToString("HH:mm") : null,
            exception.IsOpen ? exception.CloseTime.ToString("HH:mm") : null,
            exception.Reason);
    }
}
