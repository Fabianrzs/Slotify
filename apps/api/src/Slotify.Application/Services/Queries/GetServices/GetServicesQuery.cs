using MediatR;
using Slotify.Application.Services.DTOs;

namespace Slotify.Application.Services.Queries.GetServices;

public sealed record GetServicesQuery(
    bool? ActiveOnly = null,
    Guid? CategoryId = null
) : IRequest<IReadOnlyList<ServiceDto>>;
