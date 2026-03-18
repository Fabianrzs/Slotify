using MediatR;
using Slotify.Application.Common.Interfaces;

namespace Slotify.Application.Common.Behaviors;

/// <summary>
/// Marker interface for commands that require plan limit validation before execution.
/// </summary>
public interface IRequiresPlanLimit
{
    PlanLimitCheck LimitCheck { get; }
}

public enum PlanLimitCheck
{
    Booking,
    Branch,
    Service,
    Staff
}

/// <summary>
/// Pipeline behavior that enforces plan limits for annotated commands.
/// </summary>
public sealed class PlanLimitBehavior<TRequest, TResponse>(
    IPlanLimitService planLimitService,
    ITenantContext tenantContext)
    : IPipelineBehavior<TRequest, TResponse>
    where TRequest : notnull
{
    public async Task<TResponse> Handle(
        TRequest request,
        RequestHandlerDelegate<TResponse> next,
        CancellationToken cancellationToken)
    {
        if (request is IRequiresPlanLimit limitedRequest && tenantContext.IsResolved)
        {
            var tenantId = tenantContext.TenantId;

            await (limitedRequest.LimitCheck switch
            {
                PlanLimitCheck.Booking => planLimitService.EnsureCanAddBookingAsync(tenantId, cancellationToken),
                PlanLimitCheck.Branch => planLimitService.EnsureCanAddBranchAsync(tenantId, cancellationToken),
                PlanLimitCheck.Service => planLimitService.EnsureCanAddServiceAsync(tenantId, cancellationToken),
                PlanLimitCheck.Staff => planLimitService.EnsureCanAddStaffAsync(tenantId, cancellationToken),
                _ => Task.CompletedTask
            });
        }

        return await next();
    }
}
