namespace Slotify.Domain.Tenants;

/// <summary>
/// Snapshot of a tenant's current resource usage.
/// Used to validate plan limits before creating resources.
/// </summary>
public sealed record TenantUsage(
    Guid TenantId,
    int ActiveBranches,
    int ActiveServices,
    int BookingsThisMonth,
    int ActiveStaffMembers,
    int TotalClients,
    PlanLimits PlanLimits
)
{
    public bool CanAddBranch => PlanLimits.IsWithinBranchLimit(ActiveBranches);
    public bool CanAddService => PlanLimits.IsWithinServiceLimit(ActiveServices);
    public bool CanAddBooking => PlanLimits.IsWithinMonthlyBookingLimit(BookingsThisMonth);
    public bool CanAddStaff => PlanLimits.IsWithinStaffLimit(ActiveStaffMembers);
    public bool CanAddClient => PlanLimits.IsWithinClientLimit(TotalClients);
}
