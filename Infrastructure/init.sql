-- infrastructure/init.sql
CREATE TABLE IF NOT EXISTS telemetry (
    id SERIAL PRIMARY KEY,
    device_id TEXT NOT NULL,
    current DOUBLE PRECISION NOT NULL,
    time TIMESTAMPTZ NOT NULL
);