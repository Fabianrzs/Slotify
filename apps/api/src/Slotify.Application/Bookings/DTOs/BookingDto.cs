using Slotify.Domain.Bookings;

namespace Slotify.Application.Bookings.DTOs;

public sealed record BookingDto(
    Guid Id,
    Guid TenantId,
    Guid BranchId,
    Guid ServiceId,
    string ServiceName,
    Guid ClientId,
    DateTime StartAt,
    DateTime EndAt,
    BookingStatus Status,
    decimal TotalPrice,
    string Currency,
    string? Notes,
    DateTime CreatedAt
)
{
    public static BookingDto FromBooking(Booking booking, string serviceName)
        => new(
            booking.Id,
            booking.TenantId,
            booking.BranchId,
            booking.ServiceId,
            serviceName,
            booking.ClientId,
            booking.TimeSlot.StartAt,
            booking.TimeSlot.EndAt,
            booking.Status,
            booking.TotalPrice,
            booking.Currency,
            booking.Notes,
            booking.CreatedAt);
}

public sealed record BookingDetailDto(
    BookingDto Booking,
    IReadOnlyList<StatusChangeDto> StatusHistory
);

public sealed record StatusChangeDto(
    BookingStatus Status,
    Guid ChangedByUserId,
    string Reason,
    DateTime ChangedAt
);
