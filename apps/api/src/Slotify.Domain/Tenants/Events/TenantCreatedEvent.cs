using Slotify.Domain.Common;

namespace Slotify.Domain.Tenants.Events;

public sealed record TenantCreatedEvent(
    Guid TenantId,
    string Name,
    string OwnerEmail
) : IDomainEvent
{
    public Guid EventId { get; } = Guid.NewGuid();
    public DateTime OccurredAt { get; } = DateTime.UtcNow;
}
