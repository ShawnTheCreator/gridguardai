using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Backend.Data;
using Backend.Models;
using Backend.Services;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using System.IdentityModel.Tokens.Jwt;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;

namespace Backend.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly JwtService _jwtService;
    private readonly IConfiguration _configuration;

    public AuthController(AppDbContext context, JwtService jwtService, IConfiguration configuration)
    {
        _context = context;
        _jwtService = jwtService;
        _configuration = configuration;
    }

    public class LoginRequest
    {
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        try
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == request.Email);

            if (user == null || !BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
            {
                return Unauthorized(new { error = "Invalid credentials" });
            }

            var token = _jwtService.GenerateToken(user);

            return Ok(new
            {
                token,
                user = new
                {
                    id = user.Id,
                    email = user.Email,
                    name = user.Name,
                    role = user.Role
                }
            });
        }
        catch (Exception ex)
        {
            Console.WriteLine($"LOGIN CRASH: {ex.Message}");
            if (ex.InnerException != null) Console.WriteLine($"INNER: {ex.InnerException.Message}");
            return StatusCode(500, new { error = "Internal Login Error", detail = ex.Message, inner = ex.InnerException?.Message });
        }
    }

    

    public class OAuthExchangeRequest
    {
        public string Code { get; set; } = string.Empty;
        public string RedirectUri { get; set; } = string.Empty;
        public string CodeVerifier { get; set; } = string.Empty;
    }

    [HttpPost("oauth/google/exchange")]
    [AllowAnonymous]
    public async Task<IActionResult> GoogleExchange([FromBody] OAuthExchangeRequest req, [FromServices] IHttpClientFactory httpClientFactory)
    {
        var clientId = _configuration["Authentication:Google:ClientId"];
        var clientSecret = _configuration["Authentication:Google:ClientSecret"];
        if (string.IsNullOrEmpty(clientId) || string.IsNullOrEmpty(clientSecret))
            return BadRequest(new { error = "provider_not_configured" });

        var http = httpClientFactory.CreateClient();
        var body = new Dictionary<string, string>
        {
            ["grant_type"] = "authorization_code",
            ["code"] = req.Code,
            ["client_id"] = clientId!,
            ["client_secret"] = clientSecret!,
            ["redirect_uri"] = req.RedirectUri,
            ["code_verifier"] = req.CodeVerifier
        };
        var resp = await http.PostAsync("https://oauth2.googleapis.com/token", new FormUrlEncodedContent(body));
        if (!resp.IsSuccessStatusCode) return Unauthorized(new { error = "token_exchange_failed" });
        var json = await resp.Content.ReadAsStringAsync();
        using var doc = JsonDocument.Parse(json);
        if (!doc.RootElement.TryGetProperty("id_token", out var idTokEl)) return Unauthorized(new { error = "no_id_token" });
        var idToken = idTokEl.GetString() ?? "";
        var handler = new JwtSecurityTokenHandler();
        var jwt = handler.ReadJwtToken(idToken);
        var email = jwt.Claims.FirstOrDefault(c => c.Type == "email")?.Value ?? "";
        if (string.IsNullOrEmpty(email)) return Unauthorized(new { error = "no_email" });
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
        if (user == null) return Unauthorized(new { error = "unauthorized" });
        var token = _jwtService.GenerateToken(user);
        return Ok(new { token, user = new { id = user.Id, email = user.Email, name = user.Name, role = user.Role } });
    }

    [HttpPost("oauth/huawei/exchange")]
    [AllowAnonymous]
    public async Task<IActionResult> HuaweiExchange([FromBody] OAuthExchangeRequest req, [FromServices] IHttpClientFactory httpClientFactory)
    {
        var clientId = _configuration["Authentication:Huawei:ClientId"];
        var clientSecret = _configuration["Authentication:Huawei:ClientSecret"];
        var tokenEndpoint = _configuration["Authentication:Huawei:TokenEndpoint"];
        if (string.IsNullOrEmpty(clientId) || string.IsNullOrEmpty(clientSecret) || string.IsNullOrEmpty(tokenEndpoint))
            return BadRequest(new { error = "provider_not_configured" });

        var http = httpClientFactory.CreateClient();
        var body = new Dictionary<string, string>
        {
            ["grant_type"] = "authorization_code",
            ["code"] = req.Code,
            ["client_id"] = clientId!,
            ["client_secret"] = clientSecret!,
            ["redirect_uri"] = req.RedirectUri,
            ["code_verifier"] = req.CodeVerifier
        };
        var resp = await http.PostAsync(tokenEndpoint!, new FormUrlEncodedContent(body));
        if (!resp.IsSuccessStatusCode) return Unauthorized(new { error = "token_exchange_failed" });
        var json = await resp.Content.ReadAsStringAsync();
        using var doc = JsonDocument.Parse(json);
        var idToken = doc.RootElement.TryGetProperty("id_token", out var idTokEl) ? idTokEl.GetString() ?? "" : "";
        string email = "";
        if (!string.IsNullOrEmpty(idToken))
        {
            var handler = new JwtSecurityTokenHandler();
            var jwt = handler.ReadJwtToken(idToken);
            email = jwt.Claims.FirstOrDefault(c => c.Type == "email")?.Value ?? "";
        }
        if (string.IsNullOrEmpty(email))
        {
            var userInfoEndpoint = _configuration["Authentication:Huawei:UserInformationEndpoint"];
            if (string.IsNullOrEmpty(userInfoEndpoint)) return Unauthorized(new { error = "no_email" });
            var accessToken = doc.RootElement.TryGetProperty("access_token", out var accEl) ? accEl.GetString() ?? "" : "";
            if (string.IsNullOrEmpty(accessToken)) return Unauthorized(new { error = "no_access_token" });
            var reqMsg = new HttpRequestMessage(HttpMethod.Get, userInfoEndpoint);
            reqMsg.Headers.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);
            var uiResp = await http.SendAsync(reqMsg);
            if (!uiResp.IsSuccessStatusCode) return Unauthorized(new { error = "userinfo_failed" });
            var uiJson = await uiResp.Content.ReadAsStringAsync();
            using var uiDoc = JsonDocument.Parse(uiJson);
            email = uiDoc.RootElement.TryGetProperty("email", out var eEl) ? eEl.GetString() ?? "" : "";
            if (string.IsNullOrEmpty(email)) return Unauthorized(new { error = "no_email" });
        }
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
        if (user == null) return Unauthorized(new { error = "unauthorized" });
        var token = _jwtService.GenerateToken(user);
        return Ok(new { token, user = new { id = user.Id, email = user.Email, name = user.Name, role = user.Role } });
    }

    [Authorize]
    [HttpGet("me")]
    public async Task<IActionResult> GetCurrentUser()
    {
        var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId))
            return Unauthorized(new { error = "Not authenticated" });

        var user = await _context.Users.FindAsync(Guid.Parse(userId));
        if (user == null)
            return NotFound(new { error = "User not found" });

        return Ok(new
        {
            id = user.Id,
            email = user.Email,
            name = user.Name,
            role = user.Role,
            createdAt = user.CreatedAt
        });
    }

    [HttpPost("logout")]
    public IActionResult Logout()
    {
        // JWT is stateless — client just discards the token
        return Ok(new { message = "Logged out successfully" });
    }
}
