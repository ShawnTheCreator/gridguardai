using System.Net.Http.Json;
using System.Text.Json;
using Backend.Models;
using MQTTnet;

namespace Backend.Services
{
    // background service - connects to MQTT and forwards to Python AI
    public class GridGuardOrchestrator : BackgroundService
    {
        private readonly ILogger<GridGuardOrchestrator> _logger;
        private readonly IConfiguration _configuration;
        private readonly HttpClient _httpClient;
        private IMqttClient? _mqttClient;
        private const string MQTT_TOPIC = "grid/pole/telemetry";
        private const string AI_SERVICE_URL = "http://localhost:8000/analyze";

        public GridGuardOrchestrator(
            ILogger<GridGuardOrchestrator> logger,
            IConfiguration configuration,
            HttpClient httpClient)
        {
            _logger = logger;
            _configuration = configuration;
            _httpClient = httpClient;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("GridGuard Orchestrator starting...");
            
            var mqttFactory = new MqttClientFactory();
            _mqttClient = mqttFactory.CreateMqttClient();

            // read from config or use defaults
            var mqttServer = _configuration["Mqtt:Server"] ?? "localhost";
            var mqttPort = int.Parse(_configuration["Mqtt:Port"] ?? "1883");

            var options = new MqttClientOptionsBuilder()
                .WithTcpServer(mqttServer, mqttPort)
                .WithClientId("gridguard-orchestrator")
                .Build();

            // handle incoming messages
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

                // keep running until cancelled
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

        // main method - forwards to Python service
        public async Task<TheftVerdict> ProcessTelemetryAsync(TelemetryPayload telemetry, CancellationToken ct = default)
        {
            var request = new AnalysisRequest { telemetry = telemetry };
            
            try
            {
                _logger.LogInformation("Forwarding telemetry to AI service for pole {PoleId}", telemetry.pole_id);
                
                var response = await _httpClient.PostAsJsonAsync(AI_SERVICE_URL, request, ct);
                response.EnsureSuccessStatusCode();
                
                var verdict = await response.Content.ReadFromJsonAsync<TheftVerdict>(ct);
                
                if (verdict != null)
                {
                    _logger.LogInformation(
                        "AI Verdict for {PoleId}: is_theft={IsTheft}, confidence={Confidence:F2}, category={Category}",
                        telemetry.pole_id, verdict.is_theft, verdict.confidence, verdict.category);
                    
                    if (verdict.is_theft)
                    {
                        _logger.LogWarning("THEFT DETECTED at pole {PoleId} with confidence {Confidence:F2}", 
                            telemetry.pole_id, verdict.confidence);
                    }
                    
                    return verdict;
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to call AI service");
            }

            // return error state if something went wrong
            return new TheftVerdict 
            { 
                is_theft = false, 
                confidence = 0, 
                category = "error",
                timestamp = DateTime.UtcNow.ToString("O")
            };
        }

        // for testing without MQTT
        public async Task SimulateTelemetryAsync(TelemetryPayload telemetry)
        {
            await ProcessTelemetryAsync(telemetry);
        }
    }
}
