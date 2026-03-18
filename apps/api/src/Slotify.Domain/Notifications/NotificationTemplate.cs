using Slotify.Domain.Common;

namespace Slotify.Domain.Notifications;

public sealed class NotificationTemplate : Entity<Guid>
{
    /// <summary>null = platform default; set = tenant-level override</summary>
    public Guid? TenantId { get; private set; }
    public NotificationType Type { get; private set; }
    public NotificationChannel Channel { get; private set; }
    public string Subject { get; private set; } = string.Empty;
    public string Body { get; private set; } = string.Empty;
    public bool IsDefault { get; private set; }

    private NotificationTemplate() { }

    public static NotificationTemplate CreateDefault(
        NotificationType type, NotificationChannel channel, string subject, string body)
        => new()
        {
            Id = Guid.NewGuid(),
            TenantId = null,
            Type = type,
            Channel = channel,
            Subject = subject,
            Body = body,
            IsDefault = true
        };

    public static NotificationTemplate CreateForTenant(
        Guid tenantId, NotificationType type, NotificationChannel channel, string subject, string body)
        => new()
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            Type = type,
            Channel = channel,
            Subject = subject,
            Body = body,
            IsDefault = false
        };

    public void Update(string subject, string body)
    {
        Subject = subject;
        Body = body;
    }
}

public enum NotificationType
{
    BookingConfirmed,
    BookingCancelled,
    BookingReminder24h,
    BookingReminder1h,
    NewBookingReceived,
    TenantWelcome,
    ClientWelcome,
    PasswordReset
}

public enum NotificationChannel { Email, Sms, Push, WhatsApp }
