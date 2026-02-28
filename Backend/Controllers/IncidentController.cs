using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Backend.Data;
using Backend.Models;

namespace Backend.Controllers;

[Authorize]
[ApiController]
[Route("api/incidents")]
public class IncidentController : ControllerBase
{
    private readonly AppDbContext _context;

    public IncidentController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] string? status = null)
    {
        var query = _context.Incidents.AsQueryable();

        if (!string.IsNullOrEmpty(status) && status != "all")
        {
            query = query.Where(i => i.Status == status);
        }

        var incidents = await query.OrderByDescending(i => i.CreatedAt).ToListAsync();
        return Ok(incidents);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(string id)
    {
        var incident = await _context.Incidents.FindAsync(id);
        if (incident == null) return NotFound(new { error = "Incident not found" });
        return Ok(incident);
    }

    [HttpPut("{id}/dispatch")]
    public async Task<IActionResult> Dispatch(string id)
    {
        var incident = await _context.Incidents.FindAsync(id);
        if (incident == null) return NotFound(new { error = "Incident not found" });

        incident.Status = "dispatched";
        await _context.SaveChangesAsync();

        return Ok(incident);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateIncidentRequest request)
    {
        var incident = new Incident
        {
            Id = $"INC-{DateTime.UtcNow:yyyyMMdd-HHmmss}-{Guid.NewGuid().ToString()[..4].ToUpper()}",
            Time = DateTime.UtcNow.ToString("HH:mm"),
            Location = request.Location,
            Type = request.Type,
            Status = "active",
            Confidence = request.Confidence,
            CreatedAt = DateTime.UtcNow
        };

        _context.Incidents.Add(incident);
        await _context.SaveChangesAsync();
        return Created($"/api/incidents/{incident.Id}", incident);
    }
}

public class CreateIncidentRequest
{
    public string Location { get; set; } = string.Empty;
    public string Type { get; set; } = "theft";
    public int Confidence { get; set; } = 0;
}
