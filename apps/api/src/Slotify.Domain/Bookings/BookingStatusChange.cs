namespace Slotify.Domain.Bookings;

public sealed record BookingStatusChange(
    BookingStatus Status,
    Guid ChangedByUserId,
    string Reason,
    DateTime ChangedAt
);
