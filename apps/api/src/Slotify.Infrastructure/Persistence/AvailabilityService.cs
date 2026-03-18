using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
using Slotify.Application.Common.Interfaces;
using Slotify.Domain.Bookings;

namespace Slotify.Infrastructure.Persistence;

/// <summary>
/// Core availability algorithm.
/// Generates time slots based on branch schedule, filters out blocked slots and full bookings.
/// </summary>
public sealed class AvailabilityService(
    ApplicationDbContext context,
    IMemoryCache cache)
    : IAvailabilityService
{
    public async Task<IReadOnlyList<AvailableSlot>> GetAvailableSlotsAsync(
        Guid tenantId,
        Guid branchId,
        Guid serviceId,
        DateOnly date,
        CancellationToken cancellationToken = default)
    {
        var cacheKey = $"availability:{tenantId}:{branchId}:{serviceId}:{date}";

        if (cache.TryGetValue(cacheKey, out IReadOnlyList<AvailableSlot>? cached) && cached is not null)
            return cached;

        var result = await ComputeAvailabilityAsync(tenantId, branchId, serviceId, date, cancellationToken);

        // Cache for 60 seconds — invalidated on booking create/cancel
        cache.Set(cacheKey, result, TimeSpan.FromSeconds(60));

        return result;
    }

    public async Task<IReadOnlyList<DateOnly>> GetAvailableDatesAsync(
        Guid tenantId, Guid branchId, Guid serviceId,
        int year, int month, CancellationToken cancellationToken = default)
    {
        var daysInMonth = DateTime.DaysInMonth(year, month);
        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        var dates = new List<DateOnly>();

        for (var day = 1; day <= daysInMonth; day++)
        {
            var date = new DateOnly(year, month, day);
            if (date < today) continue;

            var slots = await GetAvailableSlotsAsync(tenantId, branchId, serviceId, date, cancellationToken);
            if (slots.Any(s => s.IsAvailable))
                dates.Add(date);
        }

        return dates;
    }

    private async Task<IReadOnlyList<AvailableSlot>> ComputeAvailabilityAsync(
        Guid tenantId, Guid branchId, Guid serviceId, DateOnly date, CancellationToken cancellationToken)
    {
        // 1. Load branch schedule for the requested day
        var branch = await context.Branches
            .IgnoreQueryFilters()
            .Where(b => b.Id == branchId && b.TenantId == tenantId && b.IsActive)
            .FirstOrDefaultAsync(cancellationToken);

        if (branch is null) return [];

        // 2. Check for schedule exceptions (holidays, special closures)
        var exception = await context.BranchScheduleExceptions
            .IgnoreQueryFilters()
            .Where(e => e.BranchId == branchId && e.Date == date)
            .FirstOrDefaultAsync(cancellationToken);

        bool isOpen;
        TimeOnly openTime, closeTime;

        if (exception is not null)
        {
            isOpen = exception.IsOpen;
            openTime = exception.OpenTime;
            closeTime = exception.CloseTime;
        }
        else
        {
            var schedule = branch.GetScheduleForDay(date.DayOfWeek);
            if (schedule is null || !schedule.IsOpen) return [];

            isOpen = true;
            openTime = schedule.OpenTime;
            closeTime = schedule.CloseTime;
        }

        if (!isOpen) return [];

        // 3. Load service to get duration and capacity
        var service = await context.Services
            .IgnoreQueryFilters()
            .Where(s => s.Id == serviceId && s.TenantId == tenantId && s.IsActive)
            .FirstOrDefaultAsync(cancellationToken);

        if (service is null) return [];

        // 4. Generate all possible slots for the day
        var allSlots = GenerateSlots(date, openTime, closeTime, service.DurationMinutes);

        if (allSlots.Count == 0) return [];

        var rangeStart = allSlots.First().StartAt;
        var rangeEnd = allSlots.Last().EndAt;

        // 5. Load existing bookings in this range (active ones only).
        // Materialize first with scalar filters, then apply TimeSlot navigation filter client-side.
        // InMemory EF Core does not reliably evaluate owned entity navigation properties
        // (b.TimeSlot.StartAt) inside Where() or GroupBy() — both are applied in C# after ToListAsync.
        var activeBookings = await context.Bookings
            .IgnoreQueryFilters()
            .Where(b =>
                b.TenantId == tenantId &&
                b.BranchId == branchId &&
                b.ServiceId == serviceId &&
                b.Status != BookingStatus.Cancelled)
            .ToListAsync(cancellationToken);

        var existingBookings = activeBookings
            .Where(b => b.TimeSlot.StartAt >= rangeStart && b.TimeSlot.StartAt < rangeEnd)
            .GroupBy(b => b.TimeSlot.StartAt)
            .ToDictionary(g => g.Key, g => g.Count());

        // 6. Load blocked slots
        var blockedSlots = await context.BlockedSlots
            .IgnoreQueryFilters()
            .Where(bs =>
                bs.TenantId == tenantId &&
                bs.BranchId == branchId &&
                bs.StartAt < rangeEnd &&
                bs.EndAt > rangeStart)
            .ToListAsync(cancellationToken);

        var now = DateTime.UtcNow;

        // 7. Build result: filter past slots, apply bookings count and blocked ranges
        return allSlots
            .Where(slot => slot.StartAt > now)
            .Where(slot => !blockedSlots.Any(bs => bs.StartAt < slot.EndAt && bs.EndAt > slot.StartAt))
            .Select(slot => new AvailableSlot(
                slot.StartAt,
                slot.EndAt,
                existingBookings.GetValueOrDefault(slot.StartAt, 0),
                service.MaxCapacity))
            .ToList();
    }

    private static List<(DateTime StartAt, DateTime EndAt)> GenerateSlots(
        DateOnly date, TimeOnly openTime, TimeOnly closeTime, int durationMinutes)
    {
        var slots = new List<(DateTime, DateTime)>();
        var current = date.ToDateTime(openTime, DateTimeKind.Utc);
        var end = date.ToDateTime(closeTime, DateTimeKind.Utc);

        while (current.AddMinutes(durationMinutes) <= end)
        {
            slots.Add((current, current.AddMinutes(durationMinutes)));
            current = current.AddMinutes(durationMinutes);
        }

        return slots;
    }
}
