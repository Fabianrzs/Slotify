using MediatR;
using Microsoft.EntityFrameworkCore;
using Slotify.Application.Common.Exceptions;
using Slotify.Application.Common.Interfaces;

namespace Slotify.Application.Bookings.Commands.CancelBooking;

public sealed class CancelBookingCommandHandler(
    IApplicationDbContext context,
    ITenantContext tenantContext,
    ICurrentUserService currentUser)
    : IRequestHandler<CancelBookingCommand>
{
    public async Task Handle(CancelBookingCommand request, CancellationToken cancellationToken)
    {
        var booking = await context.Bookings
            .FirstOrDefaultAsync(b => b.Id == request.BookingId && b.TenantId == tenantContext.TenantId, cancellationToken)
            ?? throw new NotFoundException(nameof(Domain.Bookings.Booking), request.BookingId);

        // Clients can only cancel their own bookings; staff/admins can cancel any
        if (currentUser.Role == "Client" && booking.ClientId != currentUser.UserId)
            throw new UnauthorizedException("You can only cancel your own bookings.");

        var tenant = await context.Tenants
            .FirstOrDefaultAsync(t => t.Id == tenantContext.TenantId, cancellationToken)
            ?? throw new NotFoundException(nameof(Domain.Tenants.Tenant), tenantContext.TenantId);

        booking.Cancel(
            changedByUserId: currentUser.UserId,
            reason: request.Reason,
            now: DateTime.UtcNow,
            cancellationWindowHours: tenant.Settings.CancellationWindowHours);

        await context.SaveChangesAsync(cancellationToken);
    }
}
