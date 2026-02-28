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

// Single factory registration — safe for both scoped controllers and singleton TheftService/GridGuardOrchestrator
builder.Services.AddDbContextFactory<AppDbContext>(options =>
    options.UseMySql(
        taurusConnectionString,
        ServerVersion.AutoDetect(taurusConnectionString),
        mySqlOptions => mySqlOptions
            .EnableRetryOnFailure(maxRetryCount: 3)
            .CommandTimeout(30)
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
// 7. Authentication & JWT (Phase 1)
// ════════════════════════════════════════════════════════════════════════════
builder.Services.AddSingleton<JwtService>();
builder.Services.AddAuthentication(Microsoft.AspNetCore.Authentication.JwtBearer.JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new Microsoft.IdentityModel.Tokens.TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = false,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            IssuerSigningKey = new Microsoft.IdentityModel.Tokens.SymmetricSecurityKey(
                System.Text.Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Secret"] ?? "Temporary_Development_Key_32_Chars_Length!"))
        };
    });

// ════════════════════════════════════════════════════════════════════════════
// 8. Standard ASP.NET Core services
// ════════════════════════════════════════════════════════════════════════════
builder.Services.AddControllers()
    .AddJsonOptions(o =>
        o.JsonSerializerOptions.PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase);
builder.Services.AddOpenApi();
builder.Services.AddAuthorization(); // Required for [Authorize] attributes

// ════════════════════════════════════════════════════════════════════════════
// Build the app
// ════════════════════════════════════════════════════════════════════════════
var app = builder.Build();

// Auto-create TaurusDB schema on startup (EnsureCreated — no migrations needed)
var dbFactory = app.Services.GetRequiredService<IDbContextFactory<AppDbContext>>();
await using var dbForMigration = await dbFactory.CreateDbContextAsync();
await dbForMigration.Database.EnsureCreatedAsync();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();
app.UseCors("NextJsDashboard");
app.UseAuthentication();
app.UseAuthorization();

// ── Route the SignalR Hub ──────────────────────────────────────────────────
// Next.js frontend connects with:
//   const connection = new HubConnectionBuilder()
//     .withUrl("http://localhost:5000/hubs/gridguard")
//     .build();
app.MapHub<GridGuardHub>("/hubs/gridguard");

app.MapControllers();

app.Run();
