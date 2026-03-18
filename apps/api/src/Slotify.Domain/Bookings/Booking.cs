using Slotify.Domain.Bookings.Events;
using Slotify.Domain.Common;

namespace Slotify.Domain.Bookings;

public sealed class Booking : AggregateRoot<Guid>, IHasTenantId
{
    public Guid TenantId { get; private set; }
    public Guid BranchId { get; private set; }
    public Guid ServiceId { get; private set; }
    public Guid ClientId { get; private set; }
    public Guid? StaffId { get; private set; }
    public TimeSlot TimeSlot { get; private set; } = null!;
    public BookingStatus Status { get; private set; }
    public string? Notes { get; private set; }
    public decimal TotalPrice { get; private set; }
    public string Currency { get; private set; } = string.Empty;
    public DateTime CreatedAt { get; private set; }
    public IReadOnlyList<BookingStatusChange> StatusHistory => _statusHistory.AsReadOnly();

    private readonly List<BookingStatusChange> _statusHistory = [];

    private Booking() { }

    public static Booking Create(
        Guid tenantId,
        Guid branchId,
        Guid serviceId,
        Guid clientId,
        TimeSlot timeSlot,
        decimal price,
        string currency,
        string? notes = null,
        Guid? staffId = null)
    {
        var booking = new Booking
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            BranchId = branchId,
            ServiceId = serviceId,
            ClientId = clientId,
            StaffId = staffId,
            TimeSlot = timeSlot,
            Status = BookingStatus.Pending,
            Notes = notes,
            TotalPrice = price,
            Currency = currency,
            CreatedAt = DateTime.UtcNow
        };

        booking.AddStatusChange(BookingStatus.Pending, clientId, "Booking created");
        booking.RaiseDomainEvent(new BookingCreatedEvent(booking.Id, tenantId, clientId, serviceId, timeSlot.StartAt));

        return booking;
    }

    public void Confirm(Guid changedByUserId)
    {
        if (Status != BookingStatus.Pending)
            throw new InvalidOperationException($"Cannot confirm a booking with status '{Status}'.");

        Status = BookingStatus.Confirmed;
        AddStatusChange(BookingStatus.Confirmed, changedByUserId, "Booking confirmed");
        RaiseDomainEvent(new BookingConfirmedEvent(Id, TenantId, ClientId));
    }

    public void Cancel(Guid changedByUserId, string reason, DateTime now, int cancellationWindowHours)
    {
        if (Status is BookingStatus.Cancelled or BookingStatus.Completed)
            throw new InvalidOperationException($"Cannot cancel a booking with status '{Status}'.");

        if (TimeSlot.StartAt <= now.AddHours(cancellationWindowHours))
            throw new InvalidOperationException(
                $"Cancellations must be made at least {cancellationWindowHours} hours before the booking.");

        Status = BookingStatus.Cancelled;
        AddStatusChange(BookingStatus.Cancelled, changedByUserId, reason);
        RaiseDomainEvent(new BookingCancelledEvent(Id, TenantId, ClientId, reason));
    }

    public void Complete(Guid changedByUserId)
    {
        if (Status != BookingStatus.Confirmed)
            throw new InvalidOperationException($"Cannot complete a booking with status '{Status}'.");

        Status = BookingStatus.Completed;
        AddStatusChange(BookingStatus.Completed, changedByUserId, "Service completed");
    }

    public void MarkNoShow(Guid changedByUserId)
    {
        if (Status != BookingStatus.Confirmed)
            throw new InvalidOperationException($"Cannot mark no-show a booking with status '{Status}'.");

        Status = BookingStatus.NoShow;
        AddStatusChange(BookingStatus.NoShow, changedByUserId, "Client did not show up");
    }

    private void AddStatusChange(BookingStatus status, Guid changedByUserId, string reason)
        => _statusHistory.Add(new BookingStatusChange(status, changedByUserId, reason, DateTime.UtcNow));
}
