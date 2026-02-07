using Microsoft.AspNetCore.Mvc;
using Backend.Data;
using Backend.Models;
using Microsoft.EntityFrameworkCore;

namespace Backend.Controllers;

[ApiController]
[Route("api/[controller]")] // This makes the URL: http://localhost:5078/api/telemetry
public class TelemetryController : ControllerBase
{
    private readonly AppDbContext _context;

    // Inject the Database Connection we configured in Program.cs
    public TelemetryController(AppDbContext context)
    {
        _context = context;
    }

    // POST: api/telemetry
    // This is what the Raspberry Pi will hit
    [HttpPost]
    public async Task<IActionResult> PostTelemetry([FromBody] Telemetry data)
    {
        // If the sensor didn't send a time, add it now
        if (data.Time == default) data.Time = DateTime.UtcNow;

        _context.Telemetry.Add(data);

        try
        {
            await _context.SaveChangesAsync();
            return Ok(new { status = "Saved", device = data.DeviceId, time = data.Time });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = ex.Message, detail = ex.InnerException?.Message });
        }
    }

    // GET: api/telemetry/recent
    // This is for you to check if data is actually there
    [HttpGet("recent")]
    public async Task<IActionResult> GetRecent()
    {
        var data = await _context.Telemetry
            .OrderByDescending(t => t.Time)
            .Take(5)
            .ToListAsync();

        return Ok(data);
    }
}