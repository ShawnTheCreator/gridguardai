namespace Backend.Models
{
    // matches the python service payload
    public class TelemetryPayload
    {
        public string pole_id { get; set; } = string.Empty;
        public long timestamp { get; set; }
        public float supply_current { get; set; }
        public float meter_sum { get; set; }
        public float voltage { get; set; }
        public float differential { get; set; }
        public bool potential_theft { get; set; }
        public float anomaly_score { get; set; }
    }

    public class AnalysisRequest
    {
        public TelemetryPayload telemetry { get; set; } = new();
    }

    // what python returns
    public class TheftVerdict
    {
        public bool is_theft { get; set; }
        public float confidence { get; set; }
        public string category { get; set; } = string.Empty;
        public object? details { get; set; }
        public float processing_time_ms { get; set; }
        public string timestamp { get; set; } = string.Empty;
    }

    // full result with timestamps
    public class OrchestratedResult
    {
        public TelemetryPayload telemetry { get; set; } = new();
        public TheftVerdict ai_verdict { get; set; } = new();
        public string received_at { get; set; } = string.Empty;
        public string processed_at { get; set; } = string.Empty;
    }
}
