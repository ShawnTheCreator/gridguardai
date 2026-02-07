using Microsoft.EntityFrameworkCore;
using Backend.Models;

namespace Backend.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }


    // This represents your table
    public DbSet<Telemetry> Telemetry { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // Tell C# that 'Time' and 'DeviceId' together make a unique row
        modelBuilder.Entity<Telemetry>()
            .HasKey(t => new { t.Time, t.DeviceId });
    }
}