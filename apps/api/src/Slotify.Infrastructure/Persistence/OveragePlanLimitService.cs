using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Slotify.Application.Common.Exceptions;
using Slotify.Application.Common.Interfaces;
using Slotify.Domain.Bookings;
using Slotify.Domain.Tenants;

namespace Slotify.Infrastructure.Persistence;

/// <summary>
/// Wraps PlanLimitService to support overage billing when:
/// 1. The plan has AllowOverage = true
/// 2. The tenant has opted in (TenantSettings.AllowOverage = true)
/// 3. The request includes X-Allow-Overage: true header
///
/// When overage is active: instead of throwing, records an OverageCharge and allows the operation.
/// </summary>
public sealed class OveragePlanLimitService(
    ApplicationDbContext context,
    IHttpContextAccessor httpContextAccessor)
    : IPlanLimitService
{
    private bool IsOverageRequested =>
        httpContextAccessor.HttpContext?.Request.Headers
            .TryGetValue("X-Allow-Overage", out var val) == true
        && val.ToString().Equals("true", StringComparison.OrdinalIgnoreCase);

    public async Task<TenantUsage> GetUsageAsync(Guid tenantId, CancellationToken cancellationToken = default)
    {
        var subscription = await GetActiveSubscriptionAsync(tenantId, cancellationToken);
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
                b.CreatedAt >= firstDayOfMonth, cancellationToken);

        var activeStaff = await context.TenantUsers.IgnoreQueryFilters()
            .CountAsync(tu => tu.TenantId == tenantId && tu.IsActive &&
                (tu.Role == TenantRole.Staff || tu.Role == TenantRole.Admin), cancellationToken);

        var totalClients = await context.TenantUsers.IgnoreQueryFilters()
            .CountAsync(tu => tu.TenantId == tenantId && tu.Role == TenantRole.Client, cancellationToken);

        return new TenantUsage(tenantId, activeBranches, activeServices, bookingsThisMonth, activeStaff, totalClients, limits);
    }

    public async Task EnsureCanAddBookingAsync(Guid tenantId, CancellationToken cancellationToken = default)
    {
        var usage = await GetUsageAsync(tenantId, cancellationToken);
        if (usage.CanAddBooking) return;

        var subscription = await GetActiveSubscriptionAsync(tenantId, cancellationToken);
        if (CanUseOverage(subscription, IsOverageRequested) && subscription!.Plan.Limits.OverageBookingPrice.HasValue)
        {
            await RecordOverageChargeAsync(tenantId, OverageType.Booking,
                subscription.Plan.Limits.OverageBookingPrice!.Value, cancellationToken);
            return;
        }

        throw new PlanLimitExceededException(
            $"Your plan allows {usage.PlanLimits.MaxBookingsPerMonth} bookings per month. " +
            "Enable overage billing or upgrade your plan.");
    }

    public async Task EnsureCanAddBranchAsync(Guid tenantId, CancellationToken cancellationToken = default)
    {
        var usage = await GetUsageAsync(tenantId, cancellationToken);
        if (usage.CanAddBranch) return;

        var subscription = await GetActiveSubscriptionAsync(tenantId, cancellationToken);
        if (CanUseOverage(subscription, IsOverageRequested) && subscription!.Plan.Limits.OverageBranchPrice.HasValue)
        {
            await RecordOverageChargeAsync(tenantId, OverageType.Branch,
                subscription.Plan.Limits.OverageBranchPrice!.Value, cancellationToken);
            return;
        }

        throw new PlanLimitExceededException(
            $"Your plan allows {usage.PlanLimits.MaxBranches} branch(es). Upgrade to add more.");
    }

    public async Task EnsureCanAddServiceAsync(Guid tenantId, CancellationToken cancellationToken = default)
    {
        var usage = await GetUsageAsync(tenantId, cancellationToken);
        if (usage.CanAddService) return;

        var subscription = await GetActiveSubscriptionAsync(tenantId, cancellationToken);
        if (CanUseOverage(subscription, IsOverageRequested) && subscription!.Plan.Limits.OverageServicePrice.HasValue)
        {
            await RecordOverageChargeAsync(tenantId, OverageType.Service,
                subscription.Plan.Limits.OverageServicePrice!.Value, cancellationToken);
            return;
        }

        throw new PlanLimitExceededException(
            $"Your plan allows {usage.PlanLimits.MaxServices} service(s). Upgrade to add more.");
    }

    public async Task EnsureCanAddStaffAsync(Guid tenantId, CancellationToken cancellationToken = default)
    {
        var usage = await GetUsageAsync(tenantId, cancellationToken);
        if (usage.CanAddStaff) return;

        throw new PlanLimitExceededException(
            $"Your plan allows {usage.PlanLimits.MaxStaffMembers} staff member(s). Upgrade to add more.");
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
            throw new PlanLimitExceededException(
                $"The '{feature}' feature is not available on your current plan. Upgrade to access it.");
    }

    // ─── Helpers ─────────────────────────────────────────────────────────────

    private static bool CanUseOverage(TenantSubscription? subscription, bool headerRequested)
        => headerRequested
           && subscription is not null
           && subscription.Plan.Limits.AllowOverage
           && subscription.OverageBillingEnabled;

    private async Task<TenantSubscription?> GetActiveSubscriptionAsync(Guid tenantId, CancellationToken cancellationToken)
        => await context.TenantSubscriptions
            .Include(s => s.Plan)
            .IgnoreQueryFilters()
            .Where(s => s.TenantId == tenantId && s.Status == SubscriptionStatus.Active)
            .OrderByDescending(s => s.StartAt)
            .FirstOrDefaultAsync(cancellationToken);

    private async Task RecordOverageChargeAsync(
        Guid tenantId, OverageType type, decimal unitPrice, CancellationToken cancellationToken)
    {
        context.OverageCharges.Add(new OverageCharge
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            Type = type,
            UnitPrice = unitPrice,
            OccurredAt = DateTime.UtcNow
        });

        await context.SaveChangesAsync(cancellationToken);
    }
}
