using MediatR;
using Slotify.Application.Common.Interfaces;
using Slotify.Application.Services.DTOs;
using Slotify.Domain.Services;

namespace Slotify.Application.Services.Commands.CreateService;

public sealed class CreateServiceCommandHandler(
    IApplicationDbContext context,
    ITenantContext tenantContext)
    : IRequestHandler<CreateServiceCommand, ServiceDto>
{
    public async Task<ServiceDto> Handle(CreateServiceCommand request, CancellationToken cancellationToken)
    {
        var service = Service.Create(
            tenantContext.TenantId,
            request.Name,
            request.DurationMinutes,
            request.Price,
            request.Currency,
            request.MaxCapacity,
            request.Description,
            request.CategoryId);

        context.Services.Add(service);
        await context.SaveChangesAsync(cancellationToken);

        return ServiceDto.FromService(service);
    }
}
