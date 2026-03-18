using Slotify.Domain.Common;
using Slotify.Domain.Services;

namespace Slotify.Domain.Tenants;

/// <summary>
/// Defines the feature limits for a subscription plan.
/// A null value means unlimited.
/// </summary>
public sealed class Plan : Entity<Guid>
{
    public string Name { get; private set; } = string.Empty;
    public string Description { get; private set; } = string.Empty;
    public Money Price { get; private set; } = null!;
    public bool IsActive { get; private set; }
    public PlanLimits Limits { get; private set; } = null!;
    public DateTime CreatedAt { get; private set; }

    private Plan() { }

    public static Plan Create(string name, string description, decimal price, string currency, PlanLimits limits)
        => new()
        {
            Id = Guid.NewGuid(),
            Name = name,
            Description = description,
            Price = Services.Money.Create(price, currency),
            Limits = limits,
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

    public void UpdateLimits(PlanLimits limits) => Limits = limits;
    public void Activate() => IsActive = true;
    public void Deactivate() => IsActive = false;
}

public sealed class PlanLimits : ValueObject
{
    /// <summary>Max number of active branches. null = unlimited.</summary>
    public int? MaxBranches { get; init; }

    /// <summary>Max number of active services. null = unlimited.</summary>
    public int? MaxServices { get; init; }

    /// <summary>Max number of bookings per calendar month. null = unlimited.</summary>
    public int? MaxBookingsPerMonth { get; init; }

    /// <summary>Max number of staff members. null = unlimited.</summary>
    public int? MaxStaffMembers { get; init; }

    /// <summary>Max number of active clients in the tenant. null = unlimited.</summary>
    public int? MaxClients { get; init; }

    /// <summary>Whether custom notification templates are allowed.</summary>
    public bool AllowCustomNotificationTemplates { get; init; }

    /// <summary>Whether reports and analytics are available.</summary>
    public bool AllowAnalytics { get; init; }

    /// <summary>Whether API access is allowed (future).</summary>
    public bool AllowApiAccess { get; init; }

    /// <summary>Whether promotions and discount features are available.</summary>
    public bool AllowPromotions { get; init; }

    /// <summary>
    /// Whether the tenant can exceed plan limits by paying an overage fee per unit.
    /// Requires explicit opt-in via tenant settings (X-Allow-Overage header or config).
    /// </summary>
    public bool AllowOverage { get; init; }

    /// <summary>Price per extra booking when overage is active. null = not applicable.</summary>
    public decimal? OverageBookingPrice { get; init; }

    /// <summary>Price per extra branch when overage is active.</summary>
    public decimal? OverageBranchPrice { get; init; }

    /// <summary>Price per extra service when overage is active.</summary>
    public decimal? OverageServicePrice { get; init; }

    public bool IsWithinBranchLimit(int current) => MaxBranches is null || current < MaxBranches;
    public bool IsWithinServiceLimit(int current) => MaxServices is null || current < MaxServices;
    public bool IsWithinMonthlyBookingLimit(int current) => MaxBookingsPerMonth is null || current < MaxBookingsPerMonth;
    public bool IsWithinStaffLimit(int current) => MaxStaffMembers is null || current < MaxStaffMembers;
    public bool IsWithinClientLimit(int current) => MaxClients is null || current < MaxClients;

    protected override IEnumerable<object?> GetEqualityComponents()
    {
        yield return MaxBranches;
        yield return MaxServices;
        yield return MaxBookingsPerMonth;
        yield return MaxStaffMembers;
        yield return MaxClients;
        yield return AllowCustomNotificationTemplates;
        yield return AllowAnalytics;
        yield return AllowApiAccess;
        yield return AllowPromotions;
    }

    public static PlanLimits Free => new()
    {
        MaxBranches = 1,
        MaxServices = 5,
        MaxBookingsPerMonth = 50,
        MaxStaffMembers = 2,
        MaxClients = 100,
        AllowCustomNotificationTemplates = false,
        AllowAnalytics = false,
        AllowApiAccess = false,
        AllowPromotions = false
    };

    public static PlanLimits Starter => new()
    {
        MaxBranches = 2,
        MaxServices = 20,
        MaxBookingsPerMonth = 200,
        MaxStaffMembers = 5,
        MaxClients = null,
        AllowCustomNotificationTemplates = true,
        AllowAnalytics = true,
        AllowApiAccess = false,
        AllowPromotions = false
    };

    public static PlanLimits Pro => new()
    {
        MaxBranches = 5,
        MaxServices = null,
        MaxBookingsPerMonth = null,
        MaxStaffMembers = null,
        MaxClients = null,
        AllowCustomNotificationTemplates = true,
        AllowAnalytics = true,
        AllowApiAccess = true,
        AllowPromotions = true
    };

    public static PlanLimits Enterprise => new()
    {
        MaxBranches = null,
        MaxServices = null,
        MaxBookingsPerMonth = null,
        MaxStaffMembers = null,
        MaxClients = null,
        AllowCustomNotificationTemplates = true,
        AllowAnalytics = true,
        AllowApiAccess = true,
        AllowPromotions = true
    };
}
