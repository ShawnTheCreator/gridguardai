-- infrastructure/init.sql
CREATE TABLE IF NOT EXISTS telemetry (
    id SERIAL PRIMARY KEY,
    device_id TEXT NOT NULL,
    current DOUBLE PRECISION NOT NULL,
    time TIMESTAMPTZ NOT NULL
);

CREATE TABLE IF NOT EXISTS theft_history_events (
    event_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    house_id TEXT NOT NULL,
    reason TEXT NOT NULL,
    status TEXT NOT NULL
);