using MediatR;
using Slotify.Application.Common.Behaviors;
using Slotify.Application.Staff.DTOs;

namespace Slotify.Application.Staff.Commands.InviteStaff;

public sealed record InviteStaffCommand(
    string Email,
    string FullName,
    string Role,  // "Admin" | "Staff"
    string? Phone = null
) : IRequest<InviteStaffResult>, IRequiresPlanLimit
{
    public PlanLimitCheck LimitCheck => PlanLimitCheck.Staff;
}
