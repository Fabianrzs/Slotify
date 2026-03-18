using Microsoft.EntityFrameworkCore;
using Slotify.Application.Common.Exceptions;
using Slotify.Application.Common.Interfaces;
using Slotify.Domain.Bookings;
using Slotify.Domain.Tenants;

namespace Slotify.Infrastructure.Persistence;

public sealed class PlanLimitService(ApplicationDbContext context) : IPlanLimitService
{
    public async Task<TenantUsage> GetUsageAsync(Guid tenantId, CancellationToken cancellationToken = default)
    {
        var subscription = await context.TenantSubscriptions
            .Include(s => s.Plan)
            .IgnoreQueryFilters()
            .Where(s => s.TenantId == tenantId && s.Status == SubscriptionStatus.Active)
            .OrderByDescending(s => s.StartAt)
            .FirstOrDefaultAsync(cancellationToken);

        var limits = subscription?.Plan.Limits ?? PlanLimits.Free;

        var now = DateTime.UtcNow;
        var firstDayOfMonth = new DateTime(now.Year, now.Month, 1, 0, 0, 0, DateTimeKind.Utc);

        var activeBranches = await context.Branches.IgnoreQueryFilters()
            .CountAsync(b => b.TenantId == tenantId && b.IsActive, cancellationToken);

        var activeServices = await context.Services.IgnoreQueryFilters()
            .CountAsync(s => s.TenantId == tenantId && s.IsActive, cancellationToken);

        var bookingsThisMonth = await context.Bookings.IgnoreQueryFilters()
            .CountAsync(b =>
                b.TenantId == tenantId &&
                b.Status != BookingStatus.Cancelled &&
                b.CreatedAt >= firstDayOfMonth,
                cancellationToken);

        var activeStaff = await context.TenantUsers.IgnoreQueryFilters()
            .CountAsync(tu =>
                tu.TenantId == tenantId &&
                tu.IsActive &&
                (tu.Role == TenantRole.Staff || tu.Role == TenantRole.Admin),
                cancellationToken);

        var totalClients = await context.TenantUsers.IgnoreQueryFilters()
            .CountAsync(tu => tu.TenantId == tenantId && tu.Role == TenantRole.Client, cancellationToken);

        return new TenantUsage(tenantId, activeBranches, activeServices, bookingsThisMonth, activeStaff, totalClients, limits);
    }

    public async Task EnsureCanAddBranchAsync(Guid tenantId, CancellationToken cancellationToken = default)
    {
        var usage = await GetUsageAsync(tenantId, cancellationToken);
        if (!usage.CanAddBranch)
            throw new PlanLimitExceededException(
                $"Your current plan allows a maximum of {usage.PlanLimits.MaxBranches} branch(es). Upgrade to add more.");
    }

    public async Task EnsureCanAddServiceAsync(Guid tenantId, CancellationToken cancellationToken = default)
    {
        var usage = await GetUsageAsync(tenantId, cancellationToken);
        if (!usage.CanAddService)
            throw new PlanLimitExceededException(
                $"Your current plan allows a maximum of {usage.PlanLimits.MaxServices} service(s). Upgrade to add more.");
    }

    public async Task EnsureCanAddBookingAsync(Guid tenantId, CancellationToken cancellationToken = default)
    {
        var usage = await GetUsageAsync(tenantId, cancellationToken);
        if (!usage.CanAddBooking)
            throw new PlanLimitExceededException(
                $"Your plan allows {usage.PlanLimits.MaxBookingsPerMonth} bookings per month. You've reached the limit for this month.");
    }

    public async Task EnsureCanAddStaffAsync(Guid tenantId, CancellationToken cancellationToken = default)
    {
        var usage = await GetUsageAsync(tenantId, cancellationToken);
        if (!usage.CanAddStaff)
            throw new PlanLimitExceededException(
                $"Your current plan allows a maximum of {usage.PlanLimits.MaxStaffMembers} staff member(s). Upgrade to add more.");
    }

    public async Task EnsureFeatureAsync(Guid tenantId, PlanFeature feature, CancellationToken cancellationToken = default)
    {
        var usage = await GetUsageAsync(tenantId, cancellationToken);
        var allowed = feature switch
        {
            PlanFeature.Analytics => usage.PlanLimits.AllowAnalytics,
            PlanFeature.CustomNotificationTemplates => usage.PlanLimits.AllowCustomNotificationTemplates,
            PlanFeature.ApiAccess => usage.PlanLimits.AllowApiAccess,
            PlanFeature.Promotions => usage.PlanLimits.AllowPromotions,
            _ => false
        };

        if (!allowed)
            throw new PlanLimitExceededException($"The '{feature}' feature is not available on your current plan. Upgrade to access it.");
    }
}
