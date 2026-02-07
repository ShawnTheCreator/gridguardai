using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace Backend.Models;

[Table("telemetry")] // Links to your SQL table
public class Telemetry
{
    [Key] // This is required for Entity Framework
    [Column("time")]
    public DateTime Time { get; set; }

    [Column("device_id")]
    public string DeviceId { get; set; } = string.Empty;

    [Column("current")]
    public double Current { get; set; }
}
