using Slotify.Domain.Common;

namespace Slotify.Domain.Bookings.Events;

public sealed record BookingConfirmedEvent(
    Guid BookingId,
    Guid TenantId,
    Guid ClientId
) : IDomainEvent
{
    public Guid EventId { get; } = Guid.NewGuid();
    public DateTime OccurredAt { get; } = DateTime.UtcNow;
}
