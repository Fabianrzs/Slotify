using MediatR;
using Slotify.Application.Branches.DTOs;
using Slotify.Application.Common.Interfaces;
using Slotify.Domain.Branches;

namespace Slotify.Application.Branches.Commands.CreateBranch;

public sealed class CreateBranchCommandHandler(
    IApplicationDbContext context,
    ITenantContext tenantContext)
    : IRequestHandler<CreateBranchCommand, BranchDto>
{
    public async Task<BranchDto> Handle(CreateBranchCommand request, CancellationToken cancellationToken)
    {
        var branch = Branch.Create(
            tenantContext.TenantId,
            request.Name,
            request.Timezone,
            request.Address,
            request.Phone,
            request.Latitude,
            request.Longitude);

        context.Branches.Add(branch);
        await context.SaveChangesAsync(cancellationToken);

        return BranchDto.FromBranch(branch);
    }
}
