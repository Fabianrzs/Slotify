using MediatR;
using Microsoft.EntityFrameworkCore;
using Slotify.Application.Common.Exceptions;
using Slotify.Application.Common.Interfaces;
using Slotify.Domain.Services;

namespace Slotify.Application.Services.Commands.ToggleService;

public sealed class ToggleServiceCommandHandler(
    IApplicationDbContext context,
    ITenantContext tenantContext)
    : IRequestHandler<ToggleServiceCommand>
{
    public async Task Handle(ToggleServiceCommand request, CancellationToken cancellationToken)
    {
        var service = await context.Services
            .FirstOrDefaultAsync(s => s.Id == request.ServiceId && s.TenantId == tenantContext.TenantId, cancellationToken)
            ?? throw new NotFoundException(nameof(Service), request.ServiceId);

        if (request.IsActive) service.Activate();
        else service.Deactivate();

        await context.SaveChangesAsync(cancellationToken);
    }
}
