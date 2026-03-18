using MediatR;
using Microsoft.EntityFrameworkCore;
using Slotify.Application.Common.Exceptions;
using Slotify.Application.Common.Interfaces;
using Slotify.Application.Services.DTOs;
using Slotify.Domain.Services;

namespace Slotify.Application.Services.Commands.UpdateService;

public sealed class UpdateServiceCommandHandler(
    IApplicationDbContext context,
    ITenantContext tenantContext)
    : IRequestHandler<UpdateServiceCommand, ServiceDto>
{
    public async Task<ServiceDto> Handle(UpdateServiceCommand request, CancellationToken cancellationToken)
    {
        var service = await context.Services
            .FirstOrDefaultAsync(s => s.Id == request.ServiceId && s.TenantId == tenantContext.TenantId, cancellationToken)
            ?? throw new NotFoundException(nameof(Service), request.ServiceId);

        context.Services.Entry(service).CurrentValues.SetValues(new
        {
            request.Name,
            request.Description,
            request.DurationMinutes,
            request.MaxCapacity,
            request.CategoryId
        });

        service.UpdatePrice(request.Price, request.Currency);
        await context.SaveChangesAsync(cancellationToken);

        return ServiceDto.FromService(service);
    }
}
