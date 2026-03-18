using Slotify.Domain.Tenants;

namespace Slotify.Application.Common.Interfaces;

public interface IPlanLimitService
{
    Task<TenantUsage> GetUsageAsync(Guid tenantId, CancellationToken cancellationToken = default);

    Task EnsureCanAddBranchAsync(Guid tenantId, CancellationToken cancellationToken = default);
    Task EnsureCanAddServiceAsync(Guid tenantId, CancellationToken cancellationToken = default);
    Task EnsureCanAddBookingAsync(Guid tenantId, CancellationToken cancellationToken = default);
    Task EnsureCanAddStaffAsync(Guid tenantId, CancellationToken cancellationToken = default);
    Task EnsureFeatureAsync(Guid tenantId, PlanFeature feature, CancellationToken cancellationToken = default);
}

public enum PlanFeature
{
    Analytics,
    CustomNotificationTemplates,
    ApiAccess,
    Promotions
}
