using Slotify.Application.Common.Interfaces;

namespace Slotify.Infrastructure.MultiTenancy;

public sealed class TenantContext : ITenantContext
{
    private Guid? _tenantId;
    private string? _tenantSlug;

    public Guid TenantId => _tenantId ?? throw new InvalidOperationException("Tenant has not been resolved.");
    public string TenantSlug => _tenantSlug ?? throw new InvalidOperationException("Tenant has not been resolved.");
    public bool IsResolved => _tenantId.HasValue;

    public void Set(Guid tenantId, string tenantSlug)
    {
        _tenantId = tenantId;
        _tenantSlug = tenantSlug;
    }
}
