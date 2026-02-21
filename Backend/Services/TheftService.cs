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
///
///   1. Serialize the waveform → upload to Huawei OBS ("gridguard-evidence" bucket).
///   2. Write an initial TheftEvent record to TaurusDB (Hot Data — instant dashboard update).
///   3. Call ModelArts Real-Time Inference endpoint with the OBS URL.
///   4. Parse the AI verdict and update the TaurusDB record (Warm Data — AI stamp).
///   5. Broadcast the final result to the Next.js dashboard via SignalR (UI turns Red/Green).
///
/// Why OBS for waveforms?
///   Storing kilobyte-sized electrical waveforms in rows would kill relational DB performance
///   at scale. OBS acts as an "Evidence Locker" — we store only the URL in TaurusDB and
///   keep the database fast regardless of how many poles are monitored.
/// </summary>
public class TheftService
{
    private readonly ILogger<TheftService> _logger;
    private readonly IConfiguration _configuration;
    private readonly IDbContextFactory<AppDbContext> _dbFactory;
    private readonly HttpClient _httpClient;
    private readonly IHubContext<GridGuardHub> _hubContext;

    // ── JSON options (shared, thread-safe) ────────────────────────────────
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
        IHubContext<GridGuardHub> hubContext)
    {
        _logger = logger;
        _configuration = configuration;
        _dbFactory = dbFactory;
        _httpClient = httpClient;
        _hubContext = hubContext;
    }

    // ════════════════════════════════════════════════════════════════════════
    // TASK 1 + 2 + 3 + 4  — Full "Story of a Signal" pipeline
    // ════════════════════════════════════════════════════════════════════════

    /// <summary>
    /// Runs the complete five-step pipeline for one telemetry reading.
    /// Safe to call concurrently — uses a pooled DbContext factory.
    /// </summary>
    public async Task<TheftEvent> ProcessAlertAsync(TelemetryPayload telemetry, CancellationToken ct = default)
    {
        _logger.LogInformation("[TheftService] Processing alert for pole {PoleId}", telemetry.pole_id);

        // ── Step 1: Build and upload waveform to OBS ──────────────────────
        var waveformJson = BuildWaveformJson(telemetry);
        var waveformStream = new MemoryStream(Encoding.UTF8.GetBytes(waveformJson));
        var fileName = $"waveform_{telemetry.pole_id}_{DateTimeOffset.UtcNow.ToUnixTimeSeconds()}.json";

        var waveformUrl = await UploadWaveformToOBSAsync(waveformStream, fileName, ct);
        _logger.LogInformation("[TheftService] Waveform uploaded → {Url}", waveformUrl);

        // ── Step 2: Write initial (unverified) event to TaurusDB ─────────
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
        _logger.LogInformation("[TheftService] Initial event saved to TaurusDB (id={Id})", theftEvent.Id);

        // ── Step 3: Call ModelArts Real-Time Inference endpoint ───────────
        var verdict = await CallModelArtsAsync(waveformUrl, telemetry, ct);
        _logger.LogInformation(
            "[TheftService] ModelArts verdict → label={Label} confidence={Confidence:F2}",
            verdict.Label, verdict.Confidence);

        // ── Step 4: Update TaurusDB record with AI verdict ────────────────
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
        _logger.LogInformation("[TheftService] TaurusDB record updated — status={Status}", theftEvent.Status);

        // ── Step 5: Broadcast to Next.js dashboard via SignalR ───────────
        var payload = new GridGuardAlertPayload
        {
            pole_id = theftEvent.PoleId,
            status = theftEvent.Status,
            confidence_score = theftEvent.ConfidenceScore,
            waveform_url = theftEvent.WaveformUrl,
            timestamp = theftEvent.Timestamp.ToString("O")
        };

        await GridGuardHub.BroadcastTheftAlertAsync(_hubContext, payload);
        _logger.LogInformation("[TheftService] SignalR broadcast sent for pole {PoleId}", theftEvent.PoleId);

        return theftEvent;
    }

    // ════════════════════════════════════════════════════════════════════════
    // TASK 2 — OBS Evidence Locker
    // ════════════════════════════════════════════════════════════════════════

    /// <summary>
    /// Uploads a raw electrical waveform JSON file to the "gridguard-evidence" OBS bucket
    /// and returns the public (or pre-signed) URL for use in the dashboard waveform viewer.
    /// </summary>
    /// <param name="data">Waveform stream (JSON bytes).</param>
    /// <param name="fileName">Object key inside the bucket (e.g. "waveform_pole-001_1740000000.json").</param>
    /// <returns>A URL string the frontend can fetch the file from.</returns>
    public async Task<string> UploadWaveformToOBSAsync(Stream data, string fileName, CancellationToken ct = default)
    {
        var obsSection = _configuration.GetSection("HuaweiCloud:OBS");
        var accessKey = obsSection["AccessKey"]!;
        var secretKey = obsSection["SecretKey"]!;
        var endpoint = obsSection["Endpoint"]!;          // e.g. "https://obs.ap-southeast-3.myhuaweicloud.com"
        var bucketName = obsSection["BucketName"] ?? "gridguard-evidence";

        try
        {
            // Build the OBS client with AK/SK credentials
            var obsConfig = new ObsConfig
            {
                Endpoint = endpoint
            };
            var obsClient = new ObsClient(accessKey, secretKey, obsConfig);

            // Ensure stream is at the start
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
                // ── Option A: return public URL (if bucket has public-read ACL) ──
                var publicUrl = $"{endpoint}/{bucketName}/{Uri.EscapeDataString(fileName)}";

                // ── Option B: generate a temporary pre-signed URL (1 hour TTL) ──
                // Uncomment below to use pre-signed URLs instead of public URLs.
                //
                // var signedRequest = new CreateTemporarySignatureRequest
                // {
                //     BucketName = bucketName,
                //     ObjectKey = fileName,
                //     Method = HttpVerb.GET,
                //     Expires = 3600  // seconds
                // };
                // var signedResponse = obsClient.CreateTemporarySignature(signedRequest);
                // return signedResponse.SignedUrl;

                _logger.LogInformation("[OBS] Upload success: {Url}", publicUrl);
                return publicUrl;
            }

            _logger.LogError("[OBS] Upload failed with status {Status}", putResponse.StatusCode);
            return string.Empty;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "[OBS] Upload threw an exception for file {FileName}", fileName);
            return string.Empty;
        }
    }

    // ════════════════════════════════════════════════════════════════════════
    // TASK 3 — ModelArts AI Bridge
    // ════════════════════════════════════════════════════════════════════════

    /// <summary>
    /// Calls the Huawei ModelArts Real-Time Inference endpoint.
    /// Sends the OBS waveform URL alongside raw telemetry for context.
    /// Parses the JSON response: <c>{ "label": "theft", "confidence": 0.98 }</c>
    /// </summary>
    private async Task<ModelArtsVerdict> CallModelArtsAsync(
        string waveformUrl, TelemetryPayload telemetry, CancellationToken ct)
    {
        var modelArtsSection = _configuration.GetSection("HuaweiCloud:ModelArts");
        var inferenceUrl = modelArtsSection["InferenceEndpoint"]!;
        var apiToken = modelArtsSection["ApiToken"]!;

        // Request body sent to ModelArts — include both the OBS URL and raw numbers
        // so the Python model can either download the waveform or use the fast-path scalars.
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
            request.Content = new StringContent(
                JsonSerializer.Serialize(requestBody, _jsonOpts),
                Encoding.UTF8,
                "application/json");

            var response = await _httpClient.SendAsync(request, ct);
            response.EnsureSuccessStatusCode();

            var responseJson = await response.Content.ReadAsStringAsync(ct);
            _logger.LogDebug("[ModelArts] Raw response: {Json}", responseJson);

            // Parse: { "label": "theft", "confidence": 0.98 }
            var verdict = JsonSerializer.Deserialize<ModelArtsVerdict>(responseJson, _jsonOpts);
            return verdict ?? new ModelArtsVerdict { Label = "error", Confidence = 0f };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "[ModelArts] Inference call failed for pole {PoleId}", telemetry.pole_id);
            // Return a safe default so the pipeline doesn't crash on AI outage
            return new ModelArtsVerdict { Label = "unknown", Confidence = 0f };
        }
    }

    // ════════════════════════════════════════════════════════════════════════
    // Helpers
    // ════════════════════════════════════════════════════════════════════════

    /// <summary>
    /// Builds the raw electrical waveform JSON payload from the incoming telemetry.
    /// This is what gets stored in OBS as long-term evidence.
    /// </summary>
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

// ── Supporting DTOs ────────────────────────────────────────────────────────

/// <summary>Matches the JSON response body from the ModelArts inference endpoint.</summary>
public class ModelArtsVerdict
{
    [JsonPropertyName("label")]
    public string Label { get; set; } = string.Empty;

    [JsonPropertyName("confidence")]
    public float Confidence { get; set; }
}
