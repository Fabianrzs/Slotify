using Slotify.Domain.Common;

namespace Slotify.Domain.Users.Events;

public sealed record UserRegisteredEvent(
    Guid UserId,
    string Email
) : IDomainEvent
{
    public Guid EventId { get; } = Guid.NewGuid();
    public DateTime OccurredAt { get; } = DateTime.UtcNow;
}
