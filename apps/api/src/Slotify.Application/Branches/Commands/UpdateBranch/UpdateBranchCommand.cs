using MediatR;
using Slotify.Application.Branches.DTOs;

namespace Slotify.Application.Branches.Commands.UpdateBranch;

public sealed record UpdateBranchCommand(
    Guid BranchId,
    string Name,
    string? Address,
    string? Phone,
    string Timezone,
    bool IsActive
) : IRequest<BranchDto>;
