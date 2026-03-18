using MediatR;

namespace Slotify.Application.Tenants.Commands.RegisterTenant;

public sealed record RegisterTenantCommand(
    string BusinessName,
    string Slug,
    string OwnerEmail,
    string OwnerPassword,
    string OwnerFullName,
    string? OwnerPhone = null,
    string? Timezone = null
) : IRequest<RegisterTenantResult>;

public sealed record RegisterTenantResult(
    Guid TenantId,
    string Slug,
    string OwnerEmail
);
