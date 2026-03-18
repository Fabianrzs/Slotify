using Slotify.Domain.Common;

namespace Slotify.Domain.Services;

public sealed class Category : Entity<Guid>, IHasTenantId
{
    public Guid TenantId { get; private set; }
    public string Name { get; private set; } = string.Empty;
    public string? Description { get; private set; }
    public int SortOrder { get; private set; }

    private Category() { }

    public static Category Create(Guid tenantId, string name, string? description = null, int sortOrder = 0)
        => new()
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            Name = name,
            Description = description,
            SortOrder = sortOrder
        };
}
