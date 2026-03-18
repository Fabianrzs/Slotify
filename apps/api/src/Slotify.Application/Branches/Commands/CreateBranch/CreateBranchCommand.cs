using MediatR;
using Slotify.Application.Branches.DTOs;
using Slotify.Application.Common.Behaviors;

namespace Slotify.Application.Branches.Commands.CreateBranch;

public sealed record CreateBranchCommand(
    string Name,
    string? Address,
    string? Phone,
    string Timezone,
    double? Latitude = null,
    double? Longitude = null
) : IRequest<BranchDto>, IRequiresPlanLimit
{
    public PlanLimitCheck LimitCheck => PlanLimitCheck.Branch;
}
