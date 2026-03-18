using MediatR;
using Slotify.Application.Staff.DTOs;

namespace Slotify.Application.Staff.Queries.GetStaff;

public sealed record GetStaffQuery : IRequest<IReadOnlyList<StaffDto>>;
