using Microsoft.EntityFrameworkCore;
using Backend.Models;

namespace Backend.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    // Raw telemetry readings
    public DbSet<Telemetry> Telemetry { get; set; }

    // Theft history audit trail (legacy - keep for backwards compat)
    public DbSet<TheftHistoryEvent> TheftHistoryEvents { get; set; }

    // ── NEW: TaurusDB structured event log ──
    // Stores metadata for every confirmed (or suspected) theft event.
    // Raw waveform bytes are stored in OBS; only the URL lives here.
    public DbSet<TheftEvent> TheftEvents { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // Composite key for raw telemetry table
        modelBuilder.Entity<Telemetry>()
            .HasKey(t => new { t.Time, t.DeviceId });

        // TheftHistoryEvent uses EventId (configured via [Key] attribute)
        // TheftEvent uses Id (configured via [Key] attribute)
    }
}
