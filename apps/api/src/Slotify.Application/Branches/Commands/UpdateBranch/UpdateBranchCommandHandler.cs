using MediatR;
using Microsoft.EntityFrameworkCore;
using Slotify.Application.Branches.DTOs;
using Slotify.Application.Common.Exceptions;
using Slotify.Application.Common.Interfaces;
using Slotify.Domain.Branches;

namespace Slotify.Application.Branches.Commands.UpdateBranch;

public sealed class UpdateBranchCommandHandler(
    IApplicationDbContext context,
    ITenantContext tenantContext)
    : IRequestHandler<UpdateBranchCommand, BranchDto>
{
    public async Task<BranchDto> Handle(UpdateBranchCommand request, CancellationToken cancellationToken)
    {
        var branch = await context.Branches
            .FirstOrDefaultAsync(b => b.Id == request.BranchId && b.TenantId == tenantContext.TenantId, cancellationToken)
            ?? throw new NotFoundException(nameof(Branch), request.BranchId);

        // Update via reflection-safe internal state manipulation
        // Since Branch properties are private setters, we use domain methods
        var updated = Branch.Create(tenantContext.TenantId, request.Name, request.Timezone, request.Address, request.Phone);

        // Re-apply schedule from existing branch
        updated.SetSchedule(branch.WeeklySchedule);

        // Use EF to update the entry directly (detach old, track new values)
        context.Branches.Entry(branch).CurrentValues.SetValues(new
        {
            request.Name,
            request.Address,
            request.Phone,
            request.Timezone,
            IsActive = request.IsActive
        });

        await context.SaveChangesAsync(cancellationToken);
        return BranchDto.FromBranch(branch);
    }
}
