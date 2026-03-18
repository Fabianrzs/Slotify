using MediatR;
using Slotify.Application.Branches.DTOs;

namespace Slotify.Application.Branches.Queries.GetBranches;

public sealed record GetBranchesQuery(bool? ActiveOnly = null) : IRequest<IReadOnlyList<BranchDto>>;
