using MediatR;
using Microsoft.EntityFrameworkCore;
using Slotify.Application.Common.Interfaces;
using Slotify.Application.Services.DTOs;

namespace Slotify.Application.Services.Queries.GetServices;

public sealed class GetServicesQueryHandler(
    IApplicationDbContext context,
    ITenantContext tenantContext)
    : IRequestHandler<GetServicesQuery, IReadOnlyList<ServiceDto>>
{
    public async Task<IReadOnlyList<ServiceDto>> Handle(
        GetServicesQuery request, CancellationToken cancellationToken)
    {
        var query = context.Services
            .Where(s => s.TenantId == tenantContext.TenantId);

        if (request.ActiveOnly == true)
            query = query.Where(s => s.IsActive);

        if (request.CategoryId.HasValue)
            query = query.Where(s => s.CategoryId == request.CategoryId.Value);

        var services = await query.OrderBy(s => s.Name).ToListAsync(cancellationToken);

        var categoryIds = services
            .Where(s => s.CategoryId.HasValue)
            .Select(s => s.CategoryId!.Value)
            .Distinct()
            .ToList();

        var categoryNames = categoryIds.Count == 0
            ? new Dictionary<Guid, string>()
            : await context.Categories
                .Where(c => categoryIds.Contains(c.Id))
                .ToDictionaryAsync(c => c.Id, c => c.Name, cancellationToken);

        return services
            .Select(s => ServiceDto.FromService(
                s,
                s.CategoryId.HasValue ? categoryNames.GetValueOrDefault(s.CategoryId.Value) : null))
            .ToList();
    }
}
