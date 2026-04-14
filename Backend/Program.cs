using Backend.Data;
using Backend.Hubs;
using Backend.Services;
using Microsoft.EntityFrameworkCore;
using DotNetEnv;
using System.Collections.Frozen;

Env.Load();

var builder = WebApplication.CreateBuilder(args);
builder.Configuration.AddEnvironmentVariables();

var taurusConnectionString = builder.Configuration.GetConnectionString("TaurusDB") 
    ?? builder.Configuration["TaurusDB"] 
    ?? builder.Configuration["ConnectionStrings__TaurusDB"];

Console.WriteLine($"[STARTUP] Using Connection String: {(string.IsNullOrEmpty(taurusConnectionString) ? "NULL" : "EXISTS (Masked Password)")}");

if (string.IsNullOrEmpty(taurusConnectionString))
{
    Console.WriteLine("CRITICAL: TaurusDB Connection String is missing!");
}

var serverVersion = new MySqlServerVersion(new Version(8, 0, 22)); 

builder.Services.AddDbContextFactory<AppDbContext>(options =>
{
    if (!string.IsNullOrEmpty(taurusConnectionString))
    {
        options.UseMySql(
            taurusConnectionString,
            serverVersion,
            mySqlOptions => mySqlOptions
                .EnableRetryOnFailure(maxRetryCount: 3)
                .CommandTimeout(30)
        );
    }
});


builder.Services.AddScoped(sp => 
    sp.GetRequiredService<IDbContextFactory<AppDbContext>>().CreateDbContext());


builder.Services.AddScoped<ITheftHistoryRepository, TheftHistoryRepository>();

builder.Services.AddHttpClient<TheftService>();
builder.Services.AddSingleton<IRegionalRouter, RegionalInfrastructureRouter>();
builder.Services.AddSingleton<TheftService>(); 


builder.Services.AddHttpClient<GridGuardOrchestrator>();
builder.Services.AddHostedService<GridGuardOrchestrator>();


builder.Services.AddSignalR(options =>
{
    options.EnableDetailedErrors = builder.Environment.IsDevelopment();
});


builder.Services.AddCors(options =>
{
    var allowedHosts = new[] { "localhost", "vercel.app" }.ToFrozenSet();

    options.AddPolicy("NextJsDashboard", policy =>
    {
        policy
            .SetIsOriginAllowed(origin => 
            {
                var host = new Uri(origin).Host;
                return allowedHosts.Any(h => host.EndsWith(h, StringComparison.OrdinalIgnoreCase));
            })
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();           
    });
});


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


builder.Services.AddControllers()
    .AddJsonOptions(o =>
        o.JsonSerializerOptions.PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase);
builder.Services.AddOpenApi();
builder.Services.AddAuthorization(); // Required for [Authorize] attributes


var app = builder.Build();


try
{
    var dbFactory = app.Services.GetRequiredService<IDbContextFactory<AppDbContext>>();
    await using var dbForMigration = await dbFactory.CreateDbContextAsync();
    await dbForMigration.Database.EnsureCreatedAsync();
}
catch (Exception ex)
{
    Console.WriteLine($"DB SEEDING FAILED: {ex.Message}");
}

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();
app.UseCors("NextJsDashboard");
app.UseAuthentication();
app.UseAuthorization();


app.MapHub<GridGuardHub>("/hubs/gridguard");

app.MapControllers();

app.Run();
