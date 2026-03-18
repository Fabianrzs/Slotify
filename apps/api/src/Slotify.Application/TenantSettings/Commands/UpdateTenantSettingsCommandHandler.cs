using MediatR;
using Microsoft.EntityFrameworkCore;
using Slotify.Application.Common.Exceptions;
using Slotify.Application.Common.Interfaces;
using Slotify.Domain.Tenants;

namespace Slotify.Application.TenantSettings.Commands;

public sealed class UpdateTenantSettingsCommandHandler(
    IApplicationDbContext context,
    ITenantContext tenantContext)
    : IRequestHandler<UpdateTenantSettingsCommand, TenantSettingsDto>
{
    public async Task<TenantSettingsDto> Handle(
        UpdateTenantSettingsCommand request, CancellationToken cancellationToken)
    {
        var tenant = await context.Tenants
            .FirstOrDefaultAsync(t => t.Id == tenantContext.TenantId, cancellationToken)
            ?? throw new NotFoundException(nameof(Tenant), tenantContext.TenantId);

        tenant.UpdateSettings(tenant.Settings.With(
            timezone: request.Timezone,
            currency: request.Currency,
            minAdvanceBookingHours: request.MinAdvanceBookingHours,
            maxAdvanceBookingDays: request.MaxAdvanceBookingDays,
            cancellationWindowHours: request.CancellationWindowHours,
            logoUrl: request.LogoUrl,
            primaryColor: request.PrimaryColor));

        await context.SaveChangesAsync(cancellationToken);
        return TenantSettingsDto.FromSettings(tenant.Settings);
    }
}
