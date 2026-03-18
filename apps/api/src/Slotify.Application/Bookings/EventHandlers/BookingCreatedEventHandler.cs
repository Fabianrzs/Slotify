using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Slotify.Application.Common.Interfaces;
using Slotify.Domain.Bookings.Events;

namespace Slotify.Application.Bookings.EventHandlers;

public sealed class BookingCreatedEventHandler(
    IApplicationDbContext context,
    IEmailService emailService,
    ILogger<BookingCreatedEventHandler> logger)
    : INotificationHandler<BookingCreatedEvent>
{
    public async Task Handle(BookingCreatedEvent notification, CancellationToken cancellationToken)
    {
        logger.LogInformation("Booking {BookingId} created, sending notifications", notification.BookingId);

        var booking = await context.Bookings
            .FirstOrDefaultAsync(b => b.Id == notification.BookingId, cancellationToken);

        if (booking is null)
        {
            logger.LogWarning("Booking {BookingId} not found for notification", notification.BookingId);
            return;
        }

        var service = await context.Services
            .FirstOrDefaultAsync(s => s.Id == booking.ServiceId, cancellationToken);

        var branch = await context.Branches
            .FirstOrDefaultAsync(b => b.Id == booking.BranchId, cancellationToken);

        var client = await context.Users
            .FirstOrDefaultAsync(u => u.Id == notification.ClientId, cancellationToken);

        if (client is null) return;

        var tenant = await context.Tenants
            .FirstOrDefaultAsync(t => t.Id == notification.TenantId, cancellationToken);

        // Send confirmation to client
        await emailService.SendFromTemplateAsync(
            templateType: "BookingConfirmed",
            recipient: client.Email,
            variables: new Dictionary<string, string>
            {
                ["ClientName"] = client.FullName,
                ["ServiceName"] = service?.Name ?? string.Empty,
                ["BranchName"] = branch?.Name ?? string.Empty,
                ["StartAt"] = booking.TimeSlot.StartAt.ToString("dddd, MMMM d 'at' h:mm tt"),
                ["TenantName"] = tenant?.Name ?? string.Empty
            },
            cancellationToken);

        // Notify business
        if (tenant?.OwnerEmail is not null)
        {
            await emailService.SendFromTemplateAsync(
                templateType: "NewBookingReceived",
                recipient: tenant.OwnerEmail,
                variables: new Dictionary<string, string>
                {
                    ["ClientName"] = client.FullName,
                    ["ServiceName"] = service?.Name ?? string.Empty,
                    ["StartAt"] = booking.TimeSlot.StartAt.ToString("dddd, MMMM d 'at' h:mm tt")
                },
                cancellationToken);
        }
    }
}
