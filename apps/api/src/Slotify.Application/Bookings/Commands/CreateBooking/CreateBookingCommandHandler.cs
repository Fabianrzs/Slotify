using MediatR;
using Microsoft.EntityFrameworkCore;
using Slotify.Application.Bookings.DTOs;
using Slotify.Application.Common.Exceptions;
using Slotify.Application.Common.Interfaces;
using Slotify.Domain.Bookings;
using Slotify.Domain.Tenants;

namespace Slotify.Application.Bookings.Commands.CreateBooking;

public sealed class CreateBookingCommandHandler(
    IApplicationDbContext context,
    ITenantContext tenantContext,
    ICurrentUserService currentUser,
    IAvailabilityService availabilityService)
    : IRequestHandler<CreateBookingCommand, BookingDto>
{
    public async Task<BookingDto> Handle(CreateBookingCommand request, CancellationToken cancellationToken)
    {
        var tenantId = tenantContext.TenantId;

        // 1. Load tenant settings to get duration and cancellation window
        var tenant = await context.Tenants
            .FirstOrDefaultAsync(t => t.Id == tenantId, cancellationToken)
            ?? throw new NotFoundException(nameof(Domain.Tenants.Tenant), tenantId);

        // 2. Load service to get duration and price
        var service = await context.Services
            .FirstOrDefaultAsync(s => s.Id == request.ServiceId && s.TenantId == tenantId && s.IsActive, cancellationToken)
            ?? throw new NotFoundException(nameof(Domain.Services.Service), request.ServiceId);

        // 3. Validate advance booking window
        var now = DateTime.UtcNow;
        var minBookingTime = now.AddHours(tenant.Settings.MinAdvanceBookingHours);
        var maxBookingTime = now.AddDays(tenant.Settings.MaxAdvanceBookingDays);

        if (request.StartAt < minBookingTime)
            throw new ConflictException($"Bookings must be made at least {tenant.Settings.MinAdvanceBookingHours} hour(s) in advance.");

        if (request.StartAt > maxBookingTime)
            throw new ConflictException($"Bookings cannot be made more than {tenant.Settings.MaxAdvanceBookingDays} days in advance.");

        // 4. Verify availability (with optimistic lock via rowversion in DB)
        var date = DateOnly.FromDateTime(request.StartAt);
        var slots = await availabilityService.GetAvailableSlotsAsync(
            tenantId, request.BranchId, request.ServiceId, date, cancellationToken);

        var slot = slots.FirstOrDefault(s => s.StartAt == request.StartAt)
            ?? throw new ConflictException("The requested time slot is not available.");

        if (!slot.IsAvailable)
            throw new ConflictException("This time slot is fully booked.");

        // 5. Resolve client (current user must be a registered client)
        var client = await context.TenantUsers
            .FirstOrDefaultAsync(tu => tu.UserId == currentUser.UserId && tu.TenantId == tenantId, cancellationToken);

        Guid clientId;
        if (client is null)
        {
            // Auto-register user as client in this tenant
            clientId = await RegisterClientAsync(tenantId, currentUser.UserId, cancellationToken);
        }
        else
        {
            clientId = currentUser.UserId;
        }

        // 6. Create booking
        var timeSlot = TimeSlot.Create(request.StartAt, service.DurationMinutes);
        var booking = Booking.Create(
            tenantId: tenantId,
            branchId: request.BranchId,
            serviceId: request.ServiceId,
            clientId: clientId,
            timeSlot: timeSlot,
            price: service.Price.Amount,
            currency: service.Price.Currency,
            notes: request.Notes);

        // 7. Auto-confirm if service is free
        if (service.Price.IsZero)
            booking.Confirm(currentUser.UserId);

        context.Bookings.Add(booking);
        await context.SaveChangesAsync(cancellationToken);

        return BookingDto.FromBooking(booking, service.Name);
    }

    private async Task<Guid> RegisterClientAsync(Guid tenantId, Guid userId, CancellationToken cancellationToken)
    {
        var tenantUser = TenantUser.CreateClient(tenantId, userId);
        context.TenantUsers.Add(tenantUser);
        await context.SaveChangesAsync(cancellationToken);
        return userId;
    }
}
