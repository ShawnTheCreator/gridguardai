using Microsoft.EntityFrameworkCore;
using Backend.Models;

namespace Backend.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<Telemetry> Telemetry { get; set; }
    public DbSet<TheftHistoryEvent> TheftHistoryEvents { get; set; }
    public DbSet<User> Users { get; set; }
    public DbSet<Asset> Assets { get; set; }
    public DbSet<Incident> Incidents { get; set; }
    public DbSet<Notification> Notifications { get; set; }
    public DbSet<SystemConfig> SystemConfigs { get; set; }
    public DbSet<AuditLog> AuditLogs { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // Telemetry uses composite key
        modelBuilder.Entity<Telemetry>()
            .HasKey(t => new { t.Time, t.DeviceId });

        // Map DbSet names correctly to lowercase tables in init.sql
        modelBuilder.Entity<User>().ToTable("users");

        // SystemConfig uses Key as primary key (configured via [Key] attribute)
    }
}