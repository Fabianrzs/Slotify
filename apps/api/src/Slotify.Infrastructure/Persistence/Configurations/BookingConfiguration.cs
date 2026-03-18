using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Slotify.Domain.Bookings;

namespace Slotify.Infrastructure.Persistence.Configurations;

public sealed class BookingConfiguration : IEntityTypeConfiguration<Booking>
{
    public void Configure(EntityTypeBuilder<Booking> builder)
    {
        builder.ToTable("Bookings");
        builder.HasKey(b => b.Id);

        builder.OwnsOne(b => b.TimeSlot, ts =>
        {
            ts.Property(t => t.StartAt).HasColumnName("StartAt").IsRequired();
            ts.Property(t => t.EndAt).HasColumnName("EndAt").IsRequired();
        });

        builder.OwnsMany(b => b.StatusHistory, sh =>
        {
            sh.ToTable("BookingStatusHistory");
            sh.Property(s => s.Status).HasConversion<string>().HasMaxLength(20);
            sh.Property(s => s.Reason).HasMaxLength(300);
        });

        builder.Property(b => b.Status).HasConversion<string>().HasMaxLength(20);
        builder.Property(b => b.Notes).HasMaxLength(500);
        builder.Property(b => b.Currency).HasMaxLength(3);
        builder.Property(b => b.TotalPrice).HasPrecision(18, 2);

        // Indexes for common query patterns
        builder.HasIndex(b => new { b.TenantId, b.Status });
        builder.HasIndex(b => new { b.TenantId, b.BranchId });
        builder.HasIndex(b => new { b.TenantId, b.ClientId });
        builder.HasIndex(b => b.TenantId);

        // Row version for optimistic concurrency
        builder.Property<byte[]>("RowVersion").IsRowVersion();
    }
}
