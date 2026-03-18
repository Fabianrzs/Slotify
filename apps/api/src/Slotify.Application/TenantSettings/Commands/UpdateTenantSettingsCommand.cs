using MediatR;
using Slotify.Domain.Tenants;

namespace Slotify.Application.TenantSettings.Commands;

public sealed record UpdateTenantSettingsCommand(
    string? Timezone,
    string? Currency,
    int? MinAdvanceBookingHours,
    int? MaxAdvanceBookingDays,
    int? CancellationWindowHours,
    string? LogoUrl,
    string? PrimaryColor
) : IRequest<TenantSettingsDto>;

public sealed record TenantSettingsDto(
    string Timezone,
    string Currency,
    int MinAdvanceBookingHours,
    int MaxAdvanceBookingDays,
    int CancellationWindowHours,
    string? LogoUrl,
    string? PrimaryColor
)
{
    public static TenantSettingsDto FromSettings(Slotify.Domain.Tenants.TenantSettings s) => new(
        s.Timezone, s.Currency, s.MinAdvanceBookingHours,
        s.MaxAdvanceBookingDays, s.CancellationWindowHours,
        s.LogoUrl, s.PrimaryColor);
}
