using Backend.Data;
using Backend.Hubs;
using Backend.Services;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// ════════════════════════════════════════════════════════════════════════════
// 1. TaurusDB (MySQL-compatible) via Pomelo Entity Framework Core
//    TaurusDB is Huawei Cloud's managed MySQL-compatible relational database.
//    We use it for "Hot Data" — structured theft event metadata that the
//    dashboard's "Recent Events" list reads instantly.
// ════════════════════════════════════════════════════════════════════════════
var taurusConnectionString = builder.Configuration.GetConnectionString("TaurusDB");

builder.Services.AddDbContextFactory<AppDbContext>(options =>
    options.UseMySql(
        taurusConnectionString,
        ServerVersion.AutoDetect(taurusConnectionString),
        mySqlOptions => mySqlOptions
            .EnableRetryOnFailure(maxRetryCount: 3)
            .CommandTimeout(30)
    ));

// Also register the non-factory version for legacy repositories that use DI directly
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseMySql(
        taurusConnectionString,
        ServerVersion.AutoDetect(taurusConnectionString)
    ));

// ════════════════════════════════════════════════════════════════════════════
// 2. Repositories & existing DI
// ════════════════════════════════════════════════════════════════════════════
builder.Services.AddScoped<ITheftHistoryRepository, TheftHistoryRepository>();

// ════════════════════════════════════════════════════════════════════════════
// 3. Cloud Integration Services
//    TheftService runs the full pipeline:
//    OBS upload → TaurusDB write → ModelArts inference → SignalR broadcast
// ════════════════════════════════════════════════════════════════════════════
builder.Services.AddHttpClient<TheftService>();
builder.Services.AddSingleton<TheftService>();   // Singleton so Hub can be injected cleanly

// ════════════════════════════════════════════════════════════════════════════
// 4. Background MQTT Orchestrator
//    Subscribes to "grid/pole/telemetry" and dispatches to Python AI + TheftService
// ════════════════════════════════════════════════════════════════════════════
builder.Services.AddHttpClient<GridGuardOrchestrator>();
builder.Services.AddHostedService<GridGuardOrchestrator>();

// ════════════════════════════════════════════════════════════════════════════
// 5. SignalR — real-time push to the Next.js dashboard
//    The frontend connects to /hubs/gridguard and listens for "TheftAlert" events.
//    When a theft is confirmed, the house turns Red on the 3D map.
// ════════════════════════════════════════════════════════════════════════════
builder.Services.AddSignalR(options =>
{
    options.EnableDetailedErrors = builder.Environment.IsDevelopment();
});

// ════════════════════════════════════════════════════════════════════════════
// 6. CORS — allow the Next.js dev server to connect to SignalR
// ════════════════════════════════════════════════════════════════════════════
builder.Services.AddCors(options =>
{
    options.AddPolicy("NextJsDashboard", policy =>
    {
        policy
            .WithOrigins(
                "http://localhost:3000",   // Next.js dev server
                "https://gridguard.ai"     // production domain
            )
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();           // Required for SignalR WebSockets
    });
});

// ════════════════════════════════════════════════════════════════════════════
// 7. Standard ASP.NET Core services
// ════════════════════════════════════════════════════════════════════════════
builder.Services.AddControllers();
builder.Services.AddOpenApi();

// ════════════════════════════════════════════════════════════════════════════
// Build the app
// ════════════════════════════════════════════════════════════════════════════
var app = builder.Build();

// Auto-migrate TaurusDB on startup (creates theft_events table if missing)
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    await db.Database.MigrateAsync();
}

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();
app.UseCors("NextJsDashboard");
app.UseAuthorization();

// ── Route the SignalR Hub ──────────────────────────────────────────────────
// Next.js frontend connects with:
//   const connection = new HubConnectionBuilder()
//     .withUrl("http://localhost:5000/hubs/gridguard")
//     .build();
app.MapHub<GridGuardHub>("/hubs/gridguard");

app.MapControllers();

app.Run();
