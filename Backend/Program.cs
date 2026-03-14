using Backend.Data;
using Backend.Hubs;
using Backend.Services;
using Microsoft.EntityFrameworkCore;
using DotNetEnv;

Env.Load();

var builder = WebApplication.CreateBuilder(args);
builder.Configuration.AddEnvironmentVariables();

var taurusConnectionString = builder.Configuration.GetConnectionString("TaurusDB") 
    ?? builder.Configuration["TaurusDB"] 
    ?? builder.Configuration["ConnectionStrings__TaurusDB"];

if (string.IsNullOrEmpty(taurusConnectionString))
{
    Console.WriteLine("CRITICAL: TaurusDB Connection String is missing!");
}

var serverVersion = new MySqlServerVersion(new Version(8, 0, 22)); 

builder.Services.AddDbContextFactory<AppDbContext>(options =>
    options.UseMySql(
        taurusConnectionString,
        serverVersion,
        mySqlOptions => mySqlOptions
            .EnableRetryOnFailure(maxRetryCount: 3)
            .CommandTimeout(30)
    ));


builder.Services.AddScoped(sp => 
    sp.GetRequiredService<IDbContextFactory<AppDbContext>>().CreateDbContext());


builder.Services.AddScoped<ITheftHistoryRepository, TheftHistoryRepository>();

builder.Services.AddHttpClient<TheftService>();
builder.Services.AddSingleton<TheftService>(); 


builder.Services.AddHttpClient<GridGuardOrchestrator>();
builder.Services.AddHostedService<GridGuardOrchestrator>();


builder.Services.AddSignalR(options =>
{
    options.EnableDetailedErrors = builder.Environment.IsDevelopment();
});


builder.Services.AddCors(options =>
{
    options.AddPolicy("NextJsDashboard", policy =>
    {
        policy
            .SetIsOriginAllowed(origin => 
            {
                var uri = new Uri(origin);
                return uri.Host.Contains("localhost") || uri.Host.Contains("vercel.app");
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
