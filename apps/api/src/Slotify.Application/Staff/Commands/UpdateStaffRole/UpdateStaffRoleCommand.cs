using MediatR;

namespace Slotify.Application.Staff.Commands.UpdateStaffRole;

public sealed record UpdateStaffRoleCommand(Guid TenantUserId, string Role) : IRequest;
