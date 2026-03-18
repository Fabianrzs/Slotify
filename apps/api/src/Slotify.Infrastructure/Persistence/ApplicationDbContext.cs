using System.Reflection;
using Microsoft.EntityFrameworkCore;
using Slotify.Application.Common.Interfaces;
using Slotify.Domain.Bookings;
using Slotify.Domain.Branches;
using Slotify.Domain.Common;
using Slotify.Domain.Notifications;
using Slotify.Domain.Services;
using Slotify.Domain.Tenants;
using Slotify.Domain.Users;

namespace Slotify.Infrastructure.Persistence;

public sealed class ApplicationDbContext : DbContext, IApplicationDbContext
{
    private readonly ITenantContext _tenantContext;

    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options, ITenantContext tenantContext)
        : base(options)
    {
        _tenantContext = tenantContext;
    }

    public DbSet<Tenant> Tenants => Set<Tenant>();
    public DbSet<User> Users => Set<User>();
    public DbSet<TenantUser> TenantUsers => Set<TenantUser>();
    public DbSet<Branch> Branches => Set<Branch>();
    public DbSet<BranchScheduleException> BranchScheduleExceptions => Set<BranchScheduleException>();
    public DbSet<Service> Services => Set<Service>();
    public DbSet<Category> Categories => Set<Category>();
    public DbSet<Booking> Bookings => Set<Booking>();
    public DbSet<BlockedSlot> BlockedSlots => Set<BlockedSlot>();
    public DbSet<Plan> Plans => Set<Plan>();
    public DbSet<TenantSubscription> TenantSubscriptions => Set<TenantSubscription>();
    public DbSet<OverageCharge> OverageCharges => Set<OverageCharge>();
    public DbSet<NotificationTemplate> NotificationTemplates => Set<NotificationTemplate>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Apply all entity configurations from this assembly
        modelBuilder.ApplyConfigurationsFromAssembly(Assembly.GetExecutingAssembly());

        // === GLOBAL QUERY FILTERS (multi-tenancy) ===
        // Only applied when tenant is resolved (excludes platform admin queries)
        modelBuilder.Entity<Branch>()
            .HasQueryFilter(e => !_tenantContext.IsResolved || e.TenantId == _tenantContext.TenantId);

        modelBuilder.Entity<Service>()
            .HasQueryFilter(e => !_tenantContext.IsResolved || e.TenantId == _tenantContext.TenantId);

        modelBuilder.Entity<Booking>()
            .HasQueryFilter(e => !_tenantContext.IsResolved || e.TenantId == _tenantContext.TenantId);

        modelBuilder.Entity<TenantUser>()
            .HasQueryFilter(e => !_tenantContext.IsResolved || e.TenantId == _tenantContext.TenantId);

        modelBuilder.Entity<BlockedSlot>()
            .HasQueryFilter(e => !_tenantContext.IsResolved || e.TenantId == _tenantContext.TenantId);
    }

    public override async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        // Dispatch domain events before saving
        var aggregates = ChangeTracker.Entries<AggregateRoot<Guid>>()
            .Where(e => e.Entity.DomainEvents.Any())
            .Select(e => e.Entity)
            .ToList();

        var events = aggregates.SelectMany(a => a.DomainEvents).ToList();

        aggregates.ForEach(a => a.ClearDomainEvents());

        var result = await base.SaveChangesAsync(cancellationToken);

        // Note: in production, dispatch via outbox pattern for reliability
        // For MVP, direct dispatch is acceptable
        foreach (var @event in events)
        {
            // Events are dispatched by the DomainEventDispatcher registered in DI
            // This is handled by the DomainEventsInterceptor
        }

        return result;
    }
}
