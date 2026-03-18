using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Slotify.Domain.Tenants;

namespace Slotify.Infrastructure.Persistence.Configurations;

public sealed class TenantConfiguration : IEntityTypeConfiguration<Tenant>
{
    public void Configure(EntityTypeBuilder<Tenant> builder)
    {
        builder.ToTable("Tenants");
        builder.HasKey(t => t.Id);
        builder.Property(t => t.Name).IsRequired().HasMaxLength(200);
        builder.Property(t => t.OwnerEmail).IsRequired().HasMaxLength(320);

        builder.OwnsOne(t => t.Slug, slug =>
        {
            slug.Property(s => s.Value).HasColumnName("Slug").IsRequired().HasMaxLength(50);
            slug.HasIndex(s => s.Value).IsUnique();
        });

        builder.OwnsOne(t => t.Settings, settings =>
        {
            settings.Property(s => s.Timezone).HasMaxLength(50).HasDefaultValue("America/Bogota");
            settings.Property(s => s.Currency).HasMaxLength(3).HasDefaultValue("COP");
            settings.Property(s => s.MinAdvanceBookingHours).HasDefaultValue(1);
            settings.Property(s => s.MaxAdvanceBookingDays).HasDefaultValue(30);
            settings.Property(s => s.CancellationWindowHours).HasDefaultValue(2);
            settings.Property(s => s.LogoUrl).HasMaxLength(500);
            settings.Property(s => s.PrimaryColor).HasMaxLength(7);
        });

        builder.Property(t => t.Plan).HasConversion<string>().HasMaxLength(20);
        builder.Property(t => t.CreatedAt).HasDefaultValueSql("GETUTCDATE()");
    }
}
