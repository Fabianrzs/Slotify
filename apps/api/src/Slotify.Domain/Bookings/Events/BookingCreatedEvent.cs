using Slotify.Domain.Common;

namespace Slotify.Domain.Bookings.Events;

public sealed record BookingCreatedEvent(
    Guid BookingId,
    Guid TenantId,
    Guid ClientId,
    Guid ServiceId,
    DateTime StartAt
) : IDomainEvent
{
    public Guid EventId { get; } = Guid.NewGuid();
    public DateTime OccurredAt { get; } = DateTime.UtcNow;
}
