using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Slotify.Domain.Branches;

namespace Slotify.Infrastructure.Persistence.Configurations;

public sealed class BranchConfiguration : IEntityTypeConfiguration<Branch>
{
    public void Configure(EntityTypeBuilder<Branch> builder)
    {
        builder.ToTable("Branches");
        builder.HasKey(b => b.Id);

        builder.Property(b => b.Name).HasMaxLength(200).IsRequired();
        builder.Property(b => b.Timezone).HasMaxLength(100).IsRequired();
        builder.Property(b => b.Address).HasMaxLength(500);
        builder.Property(b => b.Phone).HasMaxLength(20);

        // WeeklySchedule uses a private backing field (_weeklySchedule).
        // EF Core detects this via naming convention and uses it for reads/writes.
        builder.OwnsMany(b => b.WeeklySchedule, schedule =>
        {
            schedule.ToTable("BranchSchedules");
            schedule.WithOwner().HasForeignKey("BranchId");
            schedule.HasKey("BranchId", "DayOfWeek");

            schedule.Property(s => s.DayOfWeek)
                .HasConversion<string>()
                .HasMaxLength(20)
                .IsRequired();

            schedule.Property(s => s.OpenTime).HasColumnType("time");
            schedule.Property(s => s.CloseTime).HasColumnType("time");
            schedule.Property(s => s.IsOpen).IsRequired();
        });
    }
}
