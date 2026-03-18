using MediatR;
using Microsoft.EntityFrameworkCore;
using Slotify.Application.Branches.DTOs;
using Slotify.Application.Common.Interfaces;

namespace Slotify.Application.Branches.Queries.GetBranches;

public sealed class GetBranchesQueryHandler(
    IApplicationDbContext context,
    ITenantContext tenantContext)
    : IRequestHandler<GetBranchesQuery, IReadOnlyList<BranchDto>>
{
    public async Task<IReadOnlyList<BranchDto>> Handle(
        GetBranchesQuery request, CancellationToken cancellationToken)
    {
        var query = context.Branches
            .Where(b => b.TenantId == tenantContext.TenantId);

        if (request.ActiveOnly == true)
            query = query.Where(b => b.IsActive);

        var branches = await query
            .OrderBy(b => b.Name)
            .ToListAsync(cancellationToken);

        return branches.Select(BranchDto.FromBranch).ToList();
    }
}
