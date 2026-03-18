using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Slotify.Domain.Tenants;

namespace Slotify.Infrastructure.Persistence.Configurations;

public sealed class PlanConfiguration : IEntityTypeConfiguration<Plan>
{
    public void Configure(EntityTypeBuilder<Plan> builder)
    {
        builder.ToTable("Plans");
        builder.HasKey(p => p.Id);
        builder.Property(p => p.Name).IsRequired().HasMaxLength(100);
        builder.Property(p => p.Description).HasMaxLength(500);

        builder.OwnsOne(p => p.Price, money =>
        {
            money.Property(m => m.Amount).HasColumnName("Price").HasPrecision(18, 2);
            money.Property(m => m.Currency).HasColumnName("Currency").HasMaxLength(3);
        });

        builder.OwnsOne(p => p.Limits, limits =>
        {
            limits.Property(l => l.OverageBookingPrice).HasPrecision(18, 2);
            limits.Property(l => l.OverageBranchPrice).HasPrecision(18, 2);
            limits.Property(l => l.OverageServicePrice).HasPrecision(18, 2);
        });
    }
}

public sealed class TenantSubscriptionConfiguration : IEntityTypeConfiguration<TenantSubscription>
{
    public void Configure(EntityTypeBuilder<TenantSubscription> builder)
    {
        builder.ToTable("TenantSubscriptions");
        builder.HasKey(s => s.Id);
        builder.Property(s => s.Status).HasConversion<string>().HasMaxLength(20);
        builder.HasOne(s => s.Plan).WithMany().HasForeignKey(s => s.PlanId);
        builder.HasIndex(s => new { s.TenantId, s.Status });
    }
}

public sealed class OverageChargeConfiguration : IEntityTypeConfiguration<OverageCharge>
{
    public void Configure(EntityTypeBuilder<OverageCharge> builder)
    {
        builder.ToTable("OverageCharges");
        builder.HasKey(o => o.Id);
        builder.Property(o => o.Type).HasConversion<string>().HasMaxLength(20);
        builder.Property(o => o.UnitPrice).HasPrecision(18, 2);
        builder.HasIndex(o => new { o.TenantId, o.Billed });
    }
}
