using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
using Slotify.Domain.Bookings;
using Slotify.Domain.Branches;
using Slotify.Domain.Services;
using Slotify.Infrastructure.Persistence;
using Slotify.Infrastructure.Tests.Helpers;

namespace Slotify.Infrastructure.Tests.Availability;

public sealed class AvailabilityServiceTests
{
    // ─── Fixed test data ──────────────────────────────────────────────────────

    private static readonly Guid TenantId = Guid.NewGuid();

    // Pick a Monday at least 1 year in the future so all generated slots pass the "not in the past" filter.
    private static readonly DateOnly TestMonday = GetNextWeekday(
        DateOnly.FromDateTime(DateTime.UtcNow.AddDays(400)),
        DayOfWeek.Monday);

    private static readonly DateOnly TestSunday = TestMonday.AddDays(6);

    private static DateOnly GetNextWeekday(DateOnly from, DayOfWeek target)
    {
        int diff = ((int)target - (int)from.DayOfWeek + 7) % 7;
        return from.AddDays(diff == 0 ? 7 : diff);
    }

    // ─── Helpers ─────────────────────────────────────────────────────────────

    private static ApplicationDbContext CreateContext()
    {
        var opts = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString()) // isolated DB per test
            .Options;

        return new ApplicationDbContext(opts, new StubTenantContext());
    }

    private static AvailabilityService CreateService(ApplicationDbContext ctx)
        => new(ctx, new MemoryCache(new MemoryCacheOptions()));

    /// <summary>Creates a branch open Mon-Fri 09:00-18:00, closed Sat-Sun.</summary>
    private static Branch CreateWeekdayBranch()
    {
        var branch = Branch.Create(TenantId, "Test Branch", "America/Bogota");
        branch.SetSchedule([
            BranchSchedule.Open(DayOfWeek.Monday,    new TimeOnly(9, 0), new TimeOnly(18, 0)),
            BranchSchedule.Open(DayOfWeek.Tuesday,   new TimeOnly(9, 0), new TimeOnly(18, 0)),
            BranchSchedule.Open(DayOfWeek.Wednesday, new TimeOnly(9, 0), new TimeOnly(18, 0)),
            BranchSchedule.Open(DayOfWeek.Thursday,  new TimeOnly(9, 0), new TimeOnly(18, 0)),
            BranchSchedule.Open(DayOfWeek.Friday,    new TimeOnly(9, 0), new TimeOnly(18, 0)),
            BranchSchedule.Closed(DayOfWeek.Saturday),
            BranchSchedule.Closed(DayOfWeek.Sunday),
        ]);
        return branch;
    }

    // ─── Tests ───────────────────────────────────────────────────────────────

    [Fact]
    public async Task GetAvailableSlots_OpenDay_Returns_CorrectSlotCount()
    {
        // Arrange: branch open Mon 09:00-18:00, 60-min service → 9 slots
        await using var ctx = CreateContext();
        var svc = CreateService(ctx);

        var branch = CreateWeekdayBranch();
        var service = Service.Create(TenantId, "Haircut", 60, 50_000, "COP", 1);

        ctx.Branches.Add(branch);
        ctx.Services.Add(service);
        await ctx.SaveChangesAsync();

        // Act
        var slots = await svc.GetAvailableSlotsAsync(TenantId, branch.Id, service.Id, TestMonday);

        // Assert: 09:00, 10:00, ..., 17:00 → 9 slots
        Assert.Equal(9, slots.Count);
        Assert.All(slots, s => Assert.True(s.IsAvailable));
        Assert.Equal(TestMonday.ToDateTime(new TimeOnly(9, 0), DateTimeKind.Utc), slots[0].StartAt);
        Assert.Equal(TestMonday.ToDateTime(new TimeOnly(17, 0), DateTimeKind.Utc), slots[8].StartAt);
    }

    [Fact]
    public async Task GetAvailableSlots_ClosedDay_Returns_Empty()
    {
        // Arrange: branch closed on Sunday
        await using var ctx = CreateContext();
        var svc = CreateService(ctx);

        var branch = CreateWeekdayBranch();
        var service = Service.Create(TenantId, "Massage", 60, 80_000, "COP", 1);

        ctx.Branches.Add(branch);
        ctx.Services.Add(service);
        await ctx.SaveChangesAsync();

        // Act
        var slots = await svc.GetAvailableSlotsAsync(TenantId, branch.Id, service.Id, TestSunday);

        // Assert
        Assert.Empty(slots);
    }

    [Fact]
    public async Task GetAvailableSlots_SlotFull_Shows_NotAvailable()
    {
        // Arrange: service with maxCapacity=2, fill one slot with 2 bookings
        await using var ctx = CreateContext();
        var svc = CreateService(ctx);

        var branch = CreateWeekdayBranch();
        var service = Service.Create(TenantId, "Group Class", 60, 30_000, "COP", maxCapacity: 2);

        ctx.Branches.Add(branch);
        ctx.Services.Add(service);

        // Two bookings at 09:00 → fills capacity for that slot
        // Each booking gets its own TimeSlot instance — EF Core owned entities must not share object references
        var slotStart = TestMonday.ToDateTime(new TimeOnly(9, 0), DateTimeKind.Utc);
        var clientId = Guid.NewGuid();

        ctx.Bookings.Add(Booking.Create(TenantId, branch.Id, service.Id, clientId, TimeSlot.Create(slotStart, 60), 30_000, "COP"));
        ctx.Bookings.Add(Booking.Create(TenantId, branch.Id, service.Id, Guid.NewGuid(), TimeSlot.Create(slotStart, 60), 30_000, "COP"));

        await ctx.SaveChangesAsync();

        // Act
        var slots = await svc.GetAvailableSlotsAsync(TenantId, branch.Id, service.Id, TestMonday);

        // Assert: 9 slots total, first is full
        Assert.Equal(9, slots.Count);
        var nineAm = slots.Single(s => s.StartAt == slotStart);
        Assert.False(nineAm.IsAvailable);
        Assert.Equal(2, nineAm.CurrentBookings);
        Assert.Equal(0, nineAm.RemainingSpots);

        // Others are still available
        Assert.True(slots.Where(s => s.StartAt != slotStart).All(s => s.IsAvailable));
    }

    [Fact]
    public async Task GetAvailableSlots_CancelledBookings_DoNotCountToCapacity()
    {
        // Arrange: maxCapacity=1, one booking exists but is Cancelled → slot is still available
        await using var ctx = CreateContext();
        var svc = CreateService(ctx);

        var branch = CreateWeekdayBranch();
        var service = Service.Create(TenantId, "Consultation", 60, 100_000, "COP", maxCapacity: 1);

        ctx.Branches.Add(branch);
        ctx.Services.Add(service);

        var slotStart = TestMonday.ToDateTime(new TimeOnly(9, 0), DateTimeKind.Utc);
        var booking = Booking.Create(TenantId, branch.Id, service.Id, Guid.NewGuid(),
            TimeSlot.Create(slotStart, 60), 100_000, "COP");

        // Cancel it (bypass validation by providing enough advance time)
        // Note: Cancel checks timeSlot.StartAt > now + window, TestMonday is 400+ days away
        booking.Cancel(Guid.NewGuid(), "Client cancelled", DateTime.UtcNow, cancellationWindowHours: 24);

        ctx.Bookings.Add(booking);
        await ctx.SaveChangesAsync();

        // Act
        var slots = await svc.GetAvailableSlotsAsync(TenantId, branch.Id, service.Id, TestMonday);

        // Assert: cancelled booking doesn't count
        var nineAm = slots.Single(s => s.StartAt == slotStart);
        Assert.True(nineAm.IsAvailable);
        Assert.Equal(0, nineAm.CurrentBookings);
    }

    [Fact]
    public async Task GetAvailableSlots_ScheduleException_Closure_Returns_Empty()
    {
        // Arrange: branch open Mon normally, but exception marks that specific Monday as closed
        await using var ctx = CreateContext();
        var svc = CreateService(ctx);

        var branch = CreateWeekdayBranch();
        var service = Service.Create(TenantId, "Pedicure", 60, 40_000, "COP", 1);

        ctx.Branches.Add(branch);
        ctx.Services.Add(service);
        ctx.BranchScheduleExceptions.Add(
            BranchScheduleException.CreateClosure(branch.Id, TestMonday, "National holiday"));

        await ctx.SaveChangesAsync();

        // Act
        var slots = await svc.GetAvailableSlotsAsync(TenantId, branch.Id, service.Id, TestMonday);

        // Assert
        Assert.Empty(slots);
    }

    [Fact]
    public async Task GetAvailableSlots_ScheduleException_SpecialHours_Returns_FewerSlots()
    {
        // Arrange: branch open Mon 09:00-18:00 normally, but exception sets 09:00-11:00
        // → only 2 slots (60 min each): 09:00 and 10:00
        await using var ctx = CreateContext();
        var svc = CreateService(ctx);

        var branch = CreateWeekdayBranch();
        var service = Service.Create(TenantId, "Short Service", 60, 20_000, "COP", 1);

        ctx.Branches.Add(branch);
        ctx.Services.Add(service);
        ctx.BranchScheduleExceptions.Add(
            BranchScheduleException.CreateSpecialHours(
                branch.Id, TestMonday,
                new TimeOnly(9, 0), new TimeOnly(11, 0),
                "Reduced hours"));

        await ctx.SaveChangesAsync();

        // Act
        var slots = await svc.GetAvailableSlotsAsync(TenantId, branch.Id, service.Id, TestMonday);

        // Assert: only 09:00 and 10:00
        Assert.Equal(2, slots.Count);
    }

    [Fact]
    public async Task GetAvailableSlots_BlockedSlot_Excludes_OverlappingSlots()
    {
        // Arrange: block 10:00-12:00 → slots 10:00 and 11:00 are excluded, others remain
        await using var ctx = CreateContext();
        var svc = CreateService(ctx);

        var branch = CreateWeekdayBranch();
        var service = Service.Create(TenantId, "Express Cut", 60, 25_000, "COP", 1);

        ctx.Branches.Add(branch);
        ctx.Services.Add(service);

        var blockStart = TestMonday.ToDateTime(new TimeOnly(10, 0), DateTimeKind.Utc);
        var blockEnd   = TestMonday.ToDateTime(new TimeOnly(12, 0), DateTimeKind.Utc);
        ctx.BlockedSlots.Add(BlockedSlot.Create(TenantId, branch.Id, blockStart, blockEnd, "Staff training"));

        await ctx.SaveChangesAsync();

        // Act
        var slots = await svc.GetAvailableSlotsAsync(TenantId, branch.Id, service.Id, TestMonday);

        // Assert: 9 total - 2 blocked = 7 slots
        Assert.Equal(7, slots.Count);
        Assert.DoesNotContain(slots, s => s.StartAt == blockStart);
        Assert.DoesNotContain(slots, s => s.StartAt == blockStart.AddHours(1));
    }

    [Fact]
    public async Task GetAvailableSlots_DurationEdgeCase_LastSlotFitsExactly()
    {
        // Arrange: 90-min service, branch open 09:00-11:30 → exactly 1 slot (09:00-10:30)
        // 10:30 + 90min = 12:00 > 11:30, so only 1 slot
        await using var ctx = CreateContext();
        var svc = CreateService(ctx);

        var branch = Branch.Create(TenantId, "Edge Branch", "America/Bogota");
        branch.SetSchedule([
            BranchSchedule.Open(DayOfWeek.Monday, new TimeOnly(9, 0), new TimeOnly(11, 30)),
            BranchSchedule.Closed(DayOfWeek.Tuesday),
            BranchSchedule.Closed(DayOfWeek.Wednesday),
            BranchSchedule.Closed(DayOfWeek.Thursday),
            BranchSchedule.Closed(DayOfWeek.Friday),
            BranchSchedule.Closed(DayOfWeek.Saturday),
            BranchSchedule.Closed(DayOfWeek.Sunday),
        ]);

        var service = Service.Create(TenantId, "Long Session", 90, 120_000, "COP", 1);

        ctx.Branches.Add(branch);
        ctx.Services.Add(service);
        await ctx.SaveChangesAsync();

        // Act
        var slots = await svc.GetAvailableSlotsAsync(TenantId, branch.Id, service.Id, TestMonday);

        // Assert: exactly 1 slot (09:00-10:30); 10:30+90min=12:00 > 11:30
        Assert.Single(slots);
        Assert.Equal(TestMonday.ToDateTime(new TimeOnly(9, 0), DateTimeKind.Utc), slots[0].StartAt);
    }

    [Fact]
    public async Task GetAvailableSlots_InactiveBranch_Returns_Empty()
    {
        // Arrange: branch is deactivated
        await using var ctx = CreateContext();
        var svc = CreateService(ctx);

        var branch = CreateWeekdayBranch();
        branch.Deactivate();

        var service = Service.Create(TenantId, "Service", 60, 50_000, "COP", 1);

        ctx.Branches.Add(branch);
        ctx.Services.Add(service);
        await ctx.SaveChangesAsync();

        // Act
        var slots = await svc.GetAvailableSlotsAsync(TenantId, branch.Id, service.Id, TestMonday);

        // Assert
        Assert.Empty(slots);
    }

    [Fact]
    public async Task GetAvailableDates_ReturnsOnlyDaysWithAvailability()
    {
        // Arrange: branch open Mon-Fri, 60-min service, no bookings
        await using var ctx = CreateContext();
        var svc = CreateService(ctx);

        var branch = CreateWeekdayBranch();
        var service = Service.Create(TenantId, "Any", 60, 10_000, "COP", 1);

        ctx.Branches.Add(branch);
        ctx.Services.Add(service);
        await ctx.SaveChangesAsync();

        // Use a month in the future (same year as TestMonday)
        int year  = TestMonday.Year;
        int month = TestMonday.Month;

        // Act
        var dates = await svc.GetAvailableDatesAsync(TenantId, branch.Id, service.Id, year, month);

        // Assert: only weekdays returned, no weekends
        Assert.NotEmpty(dates);
        Assert.All(dates, d =>
            Assert.NotEqual(DayOfWeek.Saturday, d.DayOfWeek));
        Assert.All(dates, d =>
            Assert.NotEqual(DayOfWeek.Sunday, d.DayOfWeek));
    }
}
