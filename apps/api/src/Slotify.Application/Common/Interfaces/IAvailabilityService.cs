namespace Slotify.Application.Common.Interfaces;

public interface IAvailabilityService
{
    Task<IReadOnlyList<AvailableSlot>> GetAvailableSlotsAsync(
        Guid tenantId,
        Guid branchId,
        Guid serviceId,
        DateOnly date,
        CancellationToken cancellationToken = default);

    Task<IReadOnlyList<DateOnly>> GetAvailableDatesAsync(
        Guid tenantId,
        Guid branchId,
        Guid serviceId,
        int year,
        int month,
        CancellationToken cancellationToken = default);
}

public sealed record AvailableSlot(
    DateTime StartAt,
    DateTime EndAt,
    int CurrentBookings,
    int MaxCapacity
)
{
    public bool IsAvailable => CurrentBookings < MaxCapacity;
    public int RemainingSpots => MaxCapacity - CurrentBookings;
}
