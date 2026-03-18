using MediatR;
using Microsoft.EntityFrameworkCore;
using Slotify.Application.Bookings.DTOs;
using Slotify.Application.Common.Interfaces;
using Slotify.Application.Common.Models;

namespace Slotify.Application.Bookings.Queries.GetBookings;

public sealed class GetBookingsQueryHandler(
    IApplicationDbContext context,
    ITenantContext tenantContext)
    : IRequestHandler<GetBookingsQuery, PaginatedList<BookingDto>>
{
    public async Task<PaginatedList<BookingDto>> Handle(GetBookingsQuery request, CancellationToken cancellationToken)
    {
        var query = context.Bookings
            .Where(b => b.TenantId == tenantContext.TenantId)
            .AsQueryable();

        if (request.BranchId.HasValue)
            query = query.Where(b => b.BranchId == request.BranchId.Value);

        if (request.ServiceId.HasValue)
            query = query.Where(b => b.ServiceId == request.ServiceId.Value);

        if (request.Status.HasValue)
            query = query.Where(b => b.Status == request.Status.Value);

        if (request.DateFrom.HasValue)
            query = query.Where(b => DateOnly.FromDateTime(b.TimeSlot.StartAt) >= request.DateFrom.Value);

        if (request.DateTo.HasValue)
            query = query.Where(b => DateOnly.FromDateTime(b.TimeSlot.StartAt) <= request.DateTo.Value);

        var total = await query.CountAsync(cancellationToken);

        var bookings = await query
            .OrderByDescending(b => b.TimeSlot.StartAt)
            .Skip((request.Page - 1) * request.PageSize)
            .Take(request.PageSize)
            .ToListAsync(cancellationToken);

        var serviceIds = bookings.Select(b => b.ServiceId).Distinct().ToList();
        var serviceNames = await context.Services
            .Where(s => serviceIds.Contains(s.Id))
            .ToDictionaryAsync(s => s.Id, s => s.Name, cancellationToken);

        var items = bookings
            .Select(b => BookingDto.FromBooking(b, serviceNames.GetValueOrDefault(b.ServiceId, string.Empty)))
            .ToList();

        return new PaginatedList<BookingDto>(items, total, request.Page, request.PageSize);
    }
}
