using Slotify.Domain.Common;

namespace Slotify.Domain.Services;

public sealed class Service : Entity<Guid>, IHasTenantId
{
    public Guid TenantId { get; private set; }
    public Guid? CategoryId { get; private set; }
    public string Name { get; private set; } = string.Empty;
    public string? Description { get; private set; }
    public int DurationMinutes { get; private set; }
    public Money Price { get; private set; } = null!;
    public int MaxCapacity { get; private set; }
    public bool IsActive { get; private set; }
    public DateTime CreatedAt { get; private set; }

    private Service() { }

    public static Service Create(
        Guid tenantId,
        string name,
        int durationMinutes,
        decimal price,
        string currency,
        int maxCapacity,
        string? description = null,
        Guid? categoryId = null)
    {
        if (durationMinutes <= 0) throw new ArgumentException("Duration must be positive.");
        if (maxCapacity <= 0) throw new ArgumentException("Capacity must be positive.");

        return new Service
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            Name = name,
            Description = description,
            DurationMinutes = durationMinutes,
            Price = Money.Create(price, currency),
            MaxCapacity = maxCapacity,
            IsActive = true,
            CategoryId = categoryId,
            CreatedAt = DateTime.UtcNow
        };
    }

    public void Activate() => IsActive = true;
    public void Deactivate() => IsActive = false;
    public void UpdatePrice(decimal amount, string currency) => Price = Money.Create(amount, currency);
}
