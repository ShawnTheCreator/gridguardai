using System.Net.Http.Json;
using System.Text.Json;
using Backend.Models;
using MQTTnet;

namespace Backend.Services
{
    // Background service — connects to MQTT and orchestrates the detection pipeline.
    // Normal telemetry goes to the Python AI microservice.
    // When an anomaly is flagged, the full cloud integration pipeline fires via TheftService.
    public class GridGuardOrchestrator : BackgroundService
    {
        private readonly ILogger<GridGuardOrchestrator> _logger;
        private readonly IConfiguration _configuration;
        private readonly HttpClient _httpClient;
        private readonly TheftService _theftService;
        private IMqttClient? _mqttClient;

        private const string MQTT_TOPIC = "grid/pole/telemetry";
        private const string AI_SERVICE_URL = "http://localhost:8000/analyze";

        // Anomaly threshold — if anomaly_score is above this we treat it as a potential theft
        // even if the hardware didn't assert the flag (belt-and-suspenders safety net).
        private const float ANOMALY_THRESHOLD = 0.75f;

        public GridGuardOrchestrator(
            ILogger<GridGuardOrchestrator> logger,
            IConfiguration configuration,
            HttpClient httpClient,
            TheftService theftService)
        {
            _logger = logger;
            _configuration = configuration;
            _httpClient = httpClient;
            _theftService = theftService;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("GridGuard Orchestrator starting...");

            var mqttFactory = new MqttClientFactory();
            _mqttClient = mqttFactory.CreateMqttClient();

            var mqttServer = _configuration["Mqtt:Server"] ?? "localhost";
            var mqttPort = int.Parse(_configuration["Mqtt:Port"] ?? "1883");

            var options = new MqttClientOptionsBuilder()
                .WithTcpServer(mqttServer, mqttPort)
                .WithClientId("gridguard-orchestrator")
                .Build();

            // Handle incoming MQTT messages
            _mqttClient.ApplicationMessageReceivedAsync += async e =>
            {
                var payload = e.ApplicationMessage.ConvertPayloadToString();
                _logger.LogInformation("Received MQTT message: {Payload}", payload);

                try
                {
                    var telemetry = JsonSerializer.Deserialize<TelemetryPayload>(payload, new JsonSerializerOptions
                    {
                        PropertyNameCaseInsensitive = true
                    });

                    if (telemetry != null)
                    {
                        await ProcessTelemetryAsync(telemetry, stoppingToken);
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Failed to process MQTT message");
                }
            };

            try
            {
                await _mqttClient.ConnectAsync(options, stoppingToken);
                _logger.LogInformation("Connected to MQTT broker at {Server}:{Port}", mqttServer, mqttPort);

                await _mqttClient.SubscribeAsync(new MqttTopicFilterBuilder()
                    .WithTopic(MQTT_TOPIC)
                    .Build(), stoppingToken);

                _logger.LogInformation("Subscribed to topic: {Topic}", MQTT_TOPIC);

                // Keep running until the host shuts down
                while (!stoppingToken.IsCancellationRequested)
                {
                    await Task.Delay(1000, stoppingToken);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "MQTT connection failed");
            }
            finally
            {
                if (_mqttClient?.IsConnected == true)
                {
                    await _mqttClient.DisconnectAsync();
                }
            }
        }

        /// <summary>
        /// Dual-path processing:
        ///  • Fast path  → Python AI microservice (all telemetry, for logging / ML training)
        ///  • Alert path → TheftService cloud pipeline (only when anomaly detected)
        /// </summary>
        public async Task<TheftVerdict> ProcessTelemetryAsync(TelemetryPayload telemetry, CancellationToken ct = default)
        {
            var request = new AnalysisRequest { telemetry = telemetry };

            TheftVerdict verdict;

            try
            {
                _logger.LogInformation("Forwarding telemetry to AI service for pole {PoleId}", telemetry.pole_id);

                var response = await _httpClient.PostAsJsonAsync(AI_SERVICE_URL, request, ct);
                response.EnsureSuccessStatusCode();

                verdict = await response.Content.ReadFromJsonAsync<TheftVerdict>(ct)
                    ?? new TheftVerdict { is_theft = false, confidence = 0, category = "parse_error" };

                _logger.LogInformation(
                    "AI Verdict for {PoleId}: is_theft={IsTheft}, confidence={Confidence:F2}, category={Category}",
                    telemetry.pole_id, verdict.is_theft, verdict.confidence, verdict.category);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to call AI service");
                verdict = new TheftVerdict
                {
                    is_theft = false,
                    confidence = 0,
                    category = "error",
                    timestamp = DateTime.UtcNow.ToString("O")
                };
            }

            // ── Cloud Integration Alert Path ──────────────────────────────────────
            // Trigger the full OBS → TaurusDB → ModelArts → SignalR pipeline
            // whenever the hardware, anomaly score, or Python microservice raise an alert.
            bool isAnomaly = telemetry.potential_theft
                || telemetry.anomaly_score >= ANOMALY_THRESHOLD
                || verdict.is_theft;

            if (isAnomaly)
            {
                _logger.LogWarning("THEFT ALERT for pole {PoleId} — firing cloud integration pipeline", telemetry.pole_id);

                // Fire-and-forget: the MQTT handler must not block, but we still
                // want structured error logging if the cloud pipeline fails.
                _ = Task.Run(async () =>
                {
                    try
                    {
                        await _theftService.ProcessAlertAsync(telemetry, CancellationToken.None);
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError(ex, "TheftService pipeline failed for pole {PoleId}", telemetry.pole_id);
                    }
                }, CancellationToken.None);
            }

            return verdict;
        }

        // For integration testing without a live MQTT broker
        public async Task SimulateTelemetryAsync(TelemetryPayload telemetry)
        {
            await ProcessTelemetryAsync(telemetry);
        }
    }
}
