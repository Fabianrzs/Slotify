using Slotify.Domain.Common;

namespace Slotify.Domain.Tenants;

public sealed class TenantSettings : ValueObject
{
    public string Timezone { get; init; } = "America/Bogota";
    public string Currency { get; init; } = "COP";
    public int MinAdvanceBookingHours { get; init; } = 1;
    public int MaxAdvanceBookingDays { get; init; } = 30;
    public int CancellationWindowHours { get; init; } = 2;
    public string? LogoUrl { get; init; }
    public string? PrimaryColor { get; init; }

    private TenantSettings() { }

    public static TenantSettings CreateDefault() => new();

    public TenantSettings With(
        string? timezone = null,
        string? currency = null,
        int? minAdvanceBookingHours = null,
        int? maxAdvanceBookingDays = null,
        int? cancellationWindowHours = null,
        string? logoUrl = null,
        string? primaryColor = null) => new()
    {
        Timezone = timezone ?? Timezone,
        Currency = currency ?? Currency,
        MinAdvanceBookingHours = minAdvanceBookingHours ?? MinAdvanceBookingHours,
        MaxAdvanceBookingDays = maxAdvanceBookingDays ?? MaxAdvanceBookingDays,
        CancellationWindowHours = cancellationWindowHours ?? CancellationWindowHours,
        LogoUrl = logoUrl ?? LogoUrl,
        PrimaryColor = primaryColor ?? PrimaryColor
    };

    protected override IEnumerable<object?> GetEqualityComponents()
    {
        yield return Timezone;
        yield return Currency;
        yield return MinAdvanceBookingHours;
        yield return MaxAdvanceBookingDays;
        yield return CancellationWindowHours;
    }
}
