using Slotify.Domain.Common;

namespace Slotify.Domain.Bookings.Events;

public sealed record BookingCancelledEvent(
    Guid BookingId,
    Guid TenantId,
    Guid ClientId,
    string Reason
) : IDomainEvent
{
    public Guid EventId { get; } = Guid.NewGuid();
    public DateTime OccurredAt { get; } = DateTime.UtcNow;
}
