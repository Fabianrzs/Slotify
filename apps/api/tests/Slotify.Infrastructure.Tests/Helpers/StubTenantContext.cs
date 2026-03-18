using Slotify.Application.Common.Interfaces;

namespace Slotify.Infrastructure.Tests.Helpers;

/// <summary>
/// Stub ITenantContext for unit tests.
/// IsResolved = false disables EF global query filters so all entities are visible.
/// </summary>
internal sealed class StubTenantContext : ITenantContext
{
    public Guid TenantId { get; init; } = Guid.NewGuid();
    public string TenantSlug { get; init; } = "test-tenant";
    public bool IsResolved => false; // disables global query filters
}
