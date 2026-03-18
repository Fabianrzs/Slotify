using Slotify.Domain.Common;

namespace Slotify.Domain.Payments;

public sealed class Payment : Entity<Guid>, IHasTenantId
{
    public Guid TenantId { get; private set; }
    public Guid BookingId { get; private set; }
    public decimal Amount { get; private set; }
    public string Currency { get; private set; } = string.Empty;
    public PaymentStatus Status { get; private set; }
    public PaymentProvider Provider { get; private set; }
    public string? ProviderPaymentId { get; private set; }
    public string? ProviderPreferenceId { get; private set; }
    public DateTime? PaidAt { get; private set; }
    public DateTime CreatedAt { get; private set; }

    private Payment() { }

    public static Payment Create(Guid tenantId, Guid bookingId, decimal amount, string currency, PaymentProvider provider)
        => new()
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            BookingId = bookingId,
            Amount = amount,
            Currency = currency,
            Status = PaymentStatus.Pending,
            Provider = provider,
            CreatedAt = DateTime.UtcNow
        };

    public void SetProviderIds(string preferenceId, string? paymentId = null)
    {
        ProviderPreferenceId = preferenceId;
        ProviderPaymentId = paymentId;
    }

    public void MarkPaid(string providerPaymentId)
    {
        Status = PaymentStatus.Paid;
        ProviderPaymentId = providerPaymentId;
        PaidAt = DateTime.UtcNow;
    }

    public void MarkFailed() => Status = PaymentStatus.Failed;
    public void MarkRefunded() => Status = PaymentStatus.Refunded;
}

public enum PaymentStatus { Pending, Paid, Failed, Refunded }
public enum PaymentProvider { MercadoPago, Stripe, Manual }
