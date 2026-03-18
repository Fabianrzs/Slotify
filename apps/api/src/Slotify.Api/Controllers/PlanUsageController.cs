using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Slotify.Application.Common.Interfaces;

namespace Slotify.Api.Controllers;

/// <summary>
/// Exposes the current tenant's plan usage so the frontend can show limits and gates.
/// </summary>
[ApiController]
[Route("api/tenant/plan")]
[Authorize(Policy = "TenantAdmin")]
public sealed class PlanUsageController(IPlanLimitService planLimitService, ITenantContext tenantContext) : ControllerBase
{
    /// <summary>
    /// Returns current usage and plan limits for the authenticated tenant.
    /// Frontend uses this to show usage bars and gate features.
    /// </summary>
    [HttpGet("usage")]
    public async Task<IActionResult> GetUsage(CancellationToken cancellationToken)
    {
        var usage = await planLimitService.GetUsageAsync(tenantContext.TenantId, cancellationToken);

        return Ok(new
        {
            usage.ActiveBranches,
            usage.ActiveServices,
            usage.BookingsThisMonth,
            usage.ActiveStaffMembers,
            usage.TotalClients,
            limits = new
            {
                maxBranches = usage.PlanLimits.MaxBranches,
                maxServices = usage.PlanLimits.MaxServices,
                maxBookingsPerMonth = usage.PlanLimits.MaxBookingsPerMonth,
                maxStaffMembers = usage.PlanLimits.MaxStaffMembers,
                maxClients = usage.PlanLimits.MaxClients,
                allowCustomNotificationTemplates = usage.PlanLimits.AllowCustomNotificationTemplates,
                allowAnalytics = usage.PlanLimits.AllowAnalytics,
                allowApiAccess = usage.PlanLimits.AllowApiAccess,
                allowPromotions = usage.PlanLimits.AllowPromotions
            },
            gates = new
            {
                canAddBranch = usage.CanAddBranch,
                canAddService = usage.CanAddService,
                canAddBooking = usage.CanAddBooking,
                canAddStaff = usage.CanAddStaff,
            }
        });
    }
}
