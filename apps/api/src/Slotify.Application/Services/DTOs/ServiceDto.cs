using Slotify.Domain.Services;

namespace Slotify.Application.Services.DTOs;

public sealed record ServiceDto(
    Guid Id,
    Guid TenantId,
    Guid? CategoryId,
    string? CategoryName,
    string Name,
    string? Description,
    int DurationMinutes,
    decimal Price,
    string Currency,
    int MaxCapacity,
    bool IsActive,
    DateTime CreatedAt
)
{
    public static ServiceDto FromService(Service service, string? categoryName = null) => new(
        service.Id,
        service.TenantId,
        service.CategoryId,
        categoryName,
        service.Name,
        service.Description,
        service.DurationMinutes,
        service.Price.Amount,
        service.Price.Currency,
        service.MaxCapacity,
        service.IsActive,
        service.CreatedAt);
}

public sealed record CategoryDto(
    Guid Id,
    Guid TenantId,
    string Name,
    string? Description,
    int SortOrder
);
