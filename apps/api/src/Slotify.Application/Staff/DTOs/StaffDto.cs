namespace Slotify.Application.Staff.DTOs;

public sealed record StaffDto(
    Guid UserId,
    Guid TenantUserId,
    string FullName,
    string Email,
    string? AvatarUrl,
    string Role,
    bool IsActive,
    DateTime JoinedAt
);

public sealed record InviteStaffResult(
    string Email,
    string Role,
    string Message
);
