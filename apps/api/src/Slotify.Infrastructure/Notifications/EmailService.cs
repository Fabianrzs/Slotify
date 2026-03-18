using System.Net;
using System.Net.Mail;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Slotify.Application.Common.Interfaces;
using Slotify.Domain.Notifications;
using Slotify.Infrastructure.Persistence;

namespace Slotify.Infrastructure.Notifications;

/// <summary>
/// Sends emails via SMTP. In production, replace with SES or SendGrid.
/// Template variables are replaced using {{VariableName}} syntax.
/// </summary>
public sealed class EmailService(
    ApplicationDbContext context,
    IConfiguration configuration,
    ILogger<EmailService> logger)
    : IEmailService
{
    public async Task SendAsync(EmailMessage message, CancellationToken cancellationToken = default)
    {
        var smtpSection = configuration.GetSection("Smtp");
        var host = smtpSection["Host"] ?? "localhost";
        var port = int.Parse(smtpSection["Port"] ?? "25");
        var from = smtpSection["From"] ?? "noreply@slotify.com";

        using var client = new SmtpClient(host, port);
        var mailMessage = new MailMessage(from, message.To, message.Subject, message.HtmlBody)
        {
            IsBodyHtml = true
        };

        try
        {
            await client.SendMailAsync(mailMessage, cancellationToken);
            logger.LogInformation("Email sent to {Recipient}: {Subject}", message.To, message.Subject);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Failed to send email to {Recipient}: {Subject}", message.To, message.Subject);
            throw;
        }
    }

    public async Task SendFromTemplateAsync(
        string templateType,
        string recipient,
        Dictionary<string, string> variables,
        CancellationToken cancellationToken = default)
    {
        if (!Enum.TryParse<NotificationType>(templateType, out var notificationType))
        {
            logger.LogWarning("Unknown notification template type: {Type}", templateType);
            return;
        }

        // Look for tenant-specific template first, then fall back to default
        Guid? tenantId = null;
        if (variables.TryGetValue("TenantId", out var tenantIdStr))
            Guid.TryParse(tenantIdStr, out var tid) ;

        var template = await context.NotificationTemplates
            .Where(t =>
                t.Type == notificationType &&
                t.Channel == NotificationChannel.Email &&
                (t.TenantId == tenantId || t.IsDefault))
            .OrderBy(t => t.IsDefault) // tenant-specific first (IsDefault=false)
            .FirstOrDefaultAsync(cancellationToken);

        if (template is null)
        {
            logger.LogWarning("No email template found for type: {Type}", templateType);
            return;
        }

        var subject = ReplaceVariables(template.Subject, variables);
        var body = ReplaceVariables(template.Body, variables);

        await SendAsync(new EmailMessage(recipient, subject, body.Replace("\n", "<br/>")), cancellationToken);
    }

    private static string ReplaceVariables(string text, Dictionary<string, string> variables)
    {
        foreach (var (key, value) in variables)
            text = text.Replace($"{{{{{key}}}}}", value);
        return text;
    }
}
