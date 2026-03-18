using Microsoft.EntityFrameworkCore;
using Slotify.Domain.Bookings;
using Slotify.Domain.Branches;
using Slotify.Domain.Services;
using Slotify.Domain.Tenants;
using Slotify.Domain.Users;

namespace Slotify.Application.Common.Interfaces;

public interface IApplicationDbContext
{
    DbSet<Tenant> Tenants { get; }
    DbSet<User> Users { get; }
    DbSet<TenantUser> TenantUsers { get; }
    DbSet<Branch> Branches { get; }
    DbSet<BranchScheduleException> BranchScheduleExceptions { get; }
    DbSet<Service> Services { get; }
    DbSet<Category> Categories { get; }
    DbSet<Booking> Bookings { get; }
    DbSet<BlockedSlot> BlockedSlots { get; }
    DbSet<Plan> Plans { get; }
    DbSet<TenantSubscription> TenantSubscriptions { get; }

    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}
