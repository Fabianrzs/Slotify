using Microsoft.EntityFrameworkCore;
using Slotify.Domain.Notifications;
using Slotify.Domain.Tenants;

namespace Slotify.Infrastructure.Persistence;

public static class DbSeeder
{
    public static async Task SeedAsync(ApplicationDbContext context)
    {
        await SeedPlansAsync(context);
        await SeedNotificationTemplatesAsync(context);
        await context.SaveChangesAsync();
    }

    private static async Task SeedPlansAsync(ApplicationDbContext context)
    {
        if (await context.Plans.AnyAsync()) return;

        context.Plans.AddRange(
            Plan.Create("Free", "Ideal para comenzar", 0, "COP", PlanLimits.Free),
            Plan.Create("Starter", "Para negocios en crecimiento", 99_000, "COP", new PlanLimits
            {
                MaxBranches = 2, MaxServices = 20, MaxBookingsPerMonth = 200, MaxStaffMembers = 5,
                AllowCustomNotificationTemplates = true, AllowAnalytics = true,
                AllowOverage = true, OverageBookingPrice = 200,
            }),
            Plan.Create("Pro", "Para negocios establecidos", 299_000, "COP", new PlanLimits
            {
                MaxBranches = 5,
                AllowCustomNotificationTemplates = true, AllowAnalytics = true,
                AllowApiAccess = true, AllowPromotions = true,
                AllowOverage = true, OverageBookingPrice = 150, OverageBranchPrice = 50_000,
            }),
            Plan.Create("Enterprise", "Sin límites", 799_000, "COP", PlanLimits.Enterprise));
    }

    private static async Task SeedNotificationTemplatesAsync(ApplicationDbContext context)
    {
        if (await context.NotificationTemplates.AnyAsync()) return;

        context.NotificationTemplates.AddRange(
            NotificationTemplate.CreateDefault(
                NotificationType.BookingConfirmed,
                NotificationChannel.Email,
                "Tu reserva está confirmada — {{ServiceName}}",
                "Hola {{ClientName}},\n\nTu reserva de {{ServiceName}} en {{TenantName}} ha sido confirmada.\n\nFecha: {{StartAt}}\nSede: {{BranchName}}\n\n¡Nos vemos pronto!"),

            NotificationTemplate.CreateDefault(
                NotificationType.BookingCancelled,
                NotificationChannel.Email,
                "Tu reserva fue cancelada — {{ServiceName}}",
                "Hola {{ClientName}},\n\nTu reserva de {{ServiceName}} en {{TenantName}} ha sido cancelada.\n\nMotivo: {{CancellationReason}}\n\nPuedes hacer una nueva reserva cuando quieras."),

            NotificationTemplate.CreateDefault(
                NotificationType.BookingReminder24h,
                NotificationChannel.Email,
                "Recordatorio: tu reserva es mañana — {{ServiceName}}",
                "Hola {{ClientName}},\n\nTe recordamos que mañana tienes una reserva de {{ServiceName}} en {{TenantName}}.\n\nFecha: {{StartAt}}\nSede: {{BranchName}}"),

            NotificationTemplate.CreateDefault(
                NotificationType.BookingReminder1h,
                NotificationChannel.Email,
                "Tu reserva es en 1 hora — {{ServiceName}}",
                "Hola {{ClientName}},\n\nEn 1 hora tienes tu reserva de {{ServiceName}} en {{TenantName}}.\n\nFecha: {{StartAt}}\nSede: {{BranchName}}"),

            NotificationTemplate.CreateDefault(
                NotificationType.NewBookingReceived,
                NotificationChannel.Email,
                "Nueva reserva recibida — {{ServiceName}}",
                "Tienes una nueva reserva.\n\nCliente: {{ClientName}}\nServicio: {{ServiceName}}\nFecha: {{StartAt}}"),

            NotificationTemplate.CreateDefault(
                NotificationType.TenantWelcome,
                NotificationChannel.Email,
                "Bienvenido a Slotify, {{TenantName}}",
                "Hola {{OwnerName}},\n\nTu cuenta en Slotify está lista. Comienza configurando tu negocio en el panel."),

            NotificationTemplate.CreateDefault(
                NotificationType.ClientWelcome,
                NotificationChannel.Email,
                "Bienvenido a {{TenantName}}",
                "Hola {{ClientName}},\n\nYa puedes hacer reservas en {{TenantName}} desde Slotify."));
    }
}
