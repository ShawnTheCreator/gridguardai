using System.Net.Http.Json;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using Backend.Data;
using Backend.Hubs;
using Backend.Models;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using OBS;
using OBS.Model;

namespace Backend.Services;

/// <summary>
/// TheftService — the "Story of a Signal" orchestrator.
///
/// Full pipeline (called on every MQTT alert):
///   1. Serialize the waveform → upload to Huawei OBS ("gridguard-evidence" bucket).
///   2. Write an initial TheftEvent record to TaurusDB (Hot Data — instant dashboard update).
///   3. Call ModelArts Real-Time Inference endpoint with the OBS URL.
///   4. Parse the AI verdict and update the TaurusDB record (Warm Data — AI stamp).
///   5. Broadcast the final result to the Next.js dashboard via SignalR (UI turns Red/Green).
/// </summary>
public class TheftService
{
    private readonly ILogger<TheftService> _logger;
    private readonly IConfiguration _configuration;
    private readonly IDbContextFactory<AppDbContext> _dbFactory;
    private readonly HttpClient _httpClient;
    private readonly IHubContext<GridGuardHub> _hubContext;
    private readonly IRegionalRouter _regionalRouter;

    private static readonly JsonSerializerOptions _jsonOpts = new()
    {
        PropertyNameCaseInsensitive = true,
        DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull
    };

    public TheftService(
        ILogger<TheftService> logger,
        IConfiguration configuration,
        IDbContextFactory<AppDbContext> dbFactory,
        HttpClient httpClient,
        IHubContext<GridGuardHub> hubContext,
        IRegionalRouter regionalRouter)
    {
        _logger = logger;
        _configuration = configuration;
        _dbFactory = dbFactory;
        _httpClient = httpClient;
        _hubContext = hubContext;
        _regionalRouter = regionalRouter;
    }

    public async Task<TheftEvent> ProcessAlertAsync(TelemetryPayload telemetry, CancellationToken ct = default)
    {
        _logger.LogInformation("[TheftService] Processing alert for pole {PoleId}", telemetry.pole_id);

        var waveformJson = BuildWaveformJson(telemetry);
        var waveformStream = new MemoryStream(Encoding.UTF8.GetBytes(waveformJson));
        var fileName = $"waveform_{telemetry.pole_id}_{DateTimeOffset.UtcNow.ToUnixTimeSeconds()}.json";

        var waveformUrl = await UploadWaveformToOBSAsync(waveformStream, fileName, ct, telemetry.pole_id);
        _logger.LogInformation("[TheftService] Waveform uploaded → {Url}", waveformUrl);

        var theftEvent = new TheftEvent
        {
            Id = Guid.NewGuid(),
            PoleId = telemetry.pole_id,
            Timestamp = DateTimeOffset.FromUnixTimeMilliseconds(telemetry.timestamp).UtcDateTime,
            DeltaAmps = telemetry.differential,
            IsTheftVerified = false,
            ConfidenceScore = 0f,
            WaveformUrl = waveformUrl,
            AiLabel = "pending",
            Status = "Pending"
        };

        await using var db = await _dbFactory.CreateDbContextAsync(ct);
        db.TheftEvents.Add(theftEvent);
        await db.SaveChangesAsync(ct);

        var verdict = await CallModelArtsAsync(waveformUrl, telemetry, ct);
        _logger.LogInformation("[TheftService] ModelArts verdict → label={Label} confidence={Confidence:F2}", verdict.Label, verdict.Confidence);

        theftEvent.IsTheftVerified = verdict.Label == "theft";
        theftEvent.ConfidenceScore = verdict.Confidence;
        theftEvent.AiLabel = verdict.Label;
        theftEvent.Status = theftEvent.IsTheftVerified ? "Red" : "Green";

        var existing = await db.TheftEvents.FindAsync([theftEvent.Id], ct);
        if (existing is not null)
        {
            existing.IsTheftVerified = theftEvent.IsTheftVerified;
            existing.ConfidenceScore = theftEvent.ConfidenceScore;
            existing.AiLabel = theftEvent.AiLabel;
            existing.Status = theftEvent.Status;
            await db.SaveChangesAsync(ct);
        }

        if (theftEvent.IsTheftVerified)
        {
            var incident = new Incident
            {
                Id = $"INC-{DateTime.UtcNow:yyyyMMdd-HHmmss}-{Guid.NewGuid().ToString()[..4].ToUpper()}",
                Time = DateTime.UtcNow.ToString("HH:mm"),
                Location = $"Pole {telemetry.pole_id}",
                Type = "AI Detection",
                Status = "active",
                Confidence = (int)Math.Round(verdict.Confidence * 100),
                CreatedAt = DateTime.UtcNow
            };
            db.Incidents.Add(incident);
            await db.SaveChangesAsync(ct);
        }

        var payload = new GridGuardAlertPayload
        {
            pole_id = theftEvent.PoleId,
            status = theftEvent.Status,
            confidence_score = theftEvent.ConfidenceScore,
            waveform_url = theftEvent.WaveformUrl,
            timestamp = theftEvent.Timestamp.ToString("O")
        };

        await GridGuardHub.BroadcastTheftAlertAsync(_hubContext, payload);
        return theftEvent;
    }

    public async Task<string> UploadWaveformToOBSAsync(Stream data, string fileName, CancellationToken ct = default, string? poleId = null)
    {
        var regionalConfig = _regionalRouter.GetConfig(poleId ?? string.Empty);
        var accessKey = regionalConfig.AccessKey;
        var secretKey = regionalConfig.SecretKey;
        var endpoint = regionalConfig.ObsEndpoint;
        var bucketName = regionalConfig.ObsBucket;

        if (accessKey == "AK_PROD") 
        {
            var obsSection = _configuration.GetSection("HuaweiCloud:OBS");
            accessKey = obsSection["AccessKey"] ?? accessKey;
            secretKey = obsSection["SecretKey"] ?? secretKey;
        }

        try
        {
            var obsConfig = new ObsConfig { Endpoint = endpoint };
            var obsClient = new ObsClient(accessKey, secretKey, obsConfig);
            if (data.CanSeek) data.Seek(0, SeekOrigin.Begin);

            var putRequest = new PutObjectRequest
            {
                BucketName = bucketName,
                ObjectKey = fileName,
                InputStream = data,
                ContentType = "application/json"
            };

            var putResponse = obsClient.PutObject(putRequest);
            if ((int)putResponse.StatusCode is >= 200 and < 300)
            {
                var host = endpoint.StartsWith("http", StringComparison.OrdinalIgnoreCase) ? endpoint : $"https://{endpoint}";
                return $"{host}/{bucketName}/{Uri.EscapeDataString(fileName)}";
            }
            return string.Empty;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "[OBS] Error uploading {FileName}", fileName);
            return string.Empty;
        }
    }

    private async Task<ModelArtsVerdict> CallModelArtsAsync(string waveformUrl, TelemetryPayload telemetry, CancellationToken ct)
    {
        var regionalConfig = _regionalRouter.GetConfig(telemetry.pole_id);
        var inferenceUrl = regionalConfig.ModelArtsEndpoint;
        var apiToken = regionalConfig.ModelArtsToken;

        if (apiToken == "TOKEN_ZA")
        {
            var modelArtsSection = _configuration.GetSection("HuaweiCloud:ModelArts");
            inferenceUrl = modelArtsSection["InferenceEndpoint"] ?? inferenceUrl;
            apiToken = modelArtsSection["ApiToken"] ?? apiToken;
        }

        var requestBody = new
        {
            waveform_url = waveformUrl,
            pole_id = telemetry.pole_id,
            supply_current = telemetry.supply_current,
            meter_sum = telemetry.meter_sum,
            voltage = telemetry.voltage,
            differential = telemetry.differential,
            anomaly_score = telemetry.anomaly_score
        };

        try
        {
            using var request = new HttpRequestMessage(HttpMethod.Post, inferenceUrl);
            request.Headers.Add("X-Auth-Token", apiToken);
            request.Content = new StringContent(JsonSerializer.Serialize(requestBody, _jsonOpts), Encoding.UTF8, "application/json");

            var response = await _httpClient.SendAsync(request, ct);
            response.EnsureSuccessStatusCode();

            var responseJson = await response.Content.ReadAsStringAsync(ct);
            return JsonSerializer.Deserialize<ModelArtsVerdict>(responseJson, _jsonOpts) ?? new ModelArtsVerdict { Label = "error", Confidence = 0f };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "[ModelArts] AI call failed for {PoleId}", telemetry.pole_id);
            return new ModelArtsVerdict { Label = "unknown", Confidence = 0f };
        }
    }

    private static string BuildWaveformJson(TelemetryPayload telemetry)
    {
        var waveform = new
        {
            schema_version = "1.0",
            pole_id = telemetry.pole_id,
            captured_at = DateTimeOffset.FromUnixTimeMilliseconds(telemetry.timestamp).ToString("O"),
            readings = new
            {
                supply_current_amps = telemetry.supply_current,
                meter_sum_amps = telemetry.meter_sum,
                voltage_v = telemetry.voltage,
                differential_amps = telemetry.differential,
                anomaly_score = telemetry.anomaly_score,
                potential_theft_flag = telemetry.potential_theft
            }
        };
        return JsonSerializer.Serialize(waveform, _jsonOpts);
    }
}

public class ModelArtsVerdict
{
    [JsonPropertyName("label")]
    public string Label { get; set; } = string.Empty;

    [JsonPropertyName("confidence")]
    public float Confidence { get; set; }
}
