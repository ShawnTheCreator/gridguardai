-- infrastructure/seed.sql
-- Seed data for all tables (matches frontend mock data shapes)

-- Default user (password: gridguard123)
INSERT INTO users (id, email, name, password_hash, role) VALUES
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'thabo@gridguard.co.za', 'Thabo Mokoena', '$2a$11$nabsRQfipWla7Gq18t0LYu2pl7HN4DzpT6st9pEmfkLmK6fjx4.gi', 'admin')
ON CONFLICT (email) DO NOTHING;

-- Assets (matches MOCK_ASSETS from lib/data.ts)
INSERT INTO assets (id, type, location, status, load, lat, lng, last_inspection) VALUES
('TR-01', 'Transformer', 'Zone A – Sector 12', 'healthy', 87.3, -26.2041, 28.0473, '2026-01-15T00:00:00Z'),
('TR-02', 'Transformer', 'Zone B – Sector 7', 'warning', 65.1, -26.2070, 28.0330, '2026-01-10T00:00:00Z'),
('TR-03', 'Transformer', 'Zone C – Sector 4', 'critical', 92.8, -26.1950, 28.0580, '2025-12-20T00:00:00Z'),
('PL-01', 'Pole', 'Zone A – Sector 12', 'healthy', 45.0, -26.2000, 28.0400, '2026-02-01T00:00:00Z'),
('PL-02', 'Pole', 'Zone B – Sector 7', 'healthy', 34.2, -26.2100, 28.0500, '2026-01-28T00:00:00Z'),
('SS-01', 'Substation', 'Zone D – Main Grid', 'healthy', 78.5, -26.1985, 28.0450, '2025-11-30T00:00:00Z')
ON CONFLICT (id) DO NOTHING;

-- Incidents (matches INITIAL_INCIDENTS from alerts/page.tsx)
INSERT INTO incidents (id, time, location, type, status, confidence, created_at) VALUES
('INC-001', '14:23', 'Zone A – Sector 12', 'Meter Bypass', 'active', 94, '2026-02-21T14:23:00Z'),
('INC-002', '13:45', 'Zone B – Sector 7', 'Cable Hook', 'dispatched', 87, '2026-02-21T13:45:00Z'),
('INC-003', '12:30', 'Zone C – Sector 4', 'Meter Tampering', 'active', 91, '2026-02-21T12:30:00Z'),
('INC-004', '11:15', 'Zone A – Sector 3', 'Bypass Detected', 'resolved', 78, '2026-02-21T11:15:00Z'),
('INC-005', '10:00', 'Zone D – Sector 1', 'Cable Hook', 'investigating', 85, '2026-02-21T10:00:00Z')
ON CONFLICT (id) DO NOTHING;

-- Notifications
INSERT INTO notifications (id, title, message, severity, is_read, created_at) VALUES
('b1c2d3e4-f5a6-7890-abcd-ef1234567890', 'TR-03 Critical Thermal', 'Transformer TR-03 has exceeded thermal threshold at 92.8% load.', 'critical', false, '2026-02-21T14:00:00Z'),
('c2d3e4f5-a6b7-8901-bcde-f12345678901', 'Backup Complete', 'System backup completed successfully at 12:00.', 'info', false, '2026-02-21T12:00:00Z')
ON CONFLICT (id) DO NOTHING;

-- System config defaults
INSERT INTO system_config (key, value) VALUES
('sensitivity', '95'),
('auto_isolate', 'true')
ON CONFLICT (key) DO NOTHING;

-- Audit logs (matches SYSTEM_LOGS from lib/data.ts)
INSERT INTO audit_logs (id, time, event) VALUES
('d3e4f5a6-b7c8-9012-cdef-123456789012', '14:23', 'Pole TR-03 flagged – isolating sector'),
('e4f5a6b7-c8d9-0123-def0-234567890123', '14:21', 'AI confidence recalibrated to 96.2%'),
('f5a6b7c8-d9e0-1234-ef01-345678901234', '14:18', 'Manual override on Pole TR-01 cleared')
ON CONFLICT (id) DO NOTHING;

-- Keep existing theft history seed
INSERT INTO theft_history_events (event_id, timestamp, house_id, reason, status) VALUES
('f47ac10b-58cc-4372-a567-0e02b2c3d479', '2026-02-12T08:15:30Z', 'HS-99321', 'Bypass detected', 'Isolated'),
('c9b1420a-8d34-4b5c-9c7a-5b12a3d4e5f6', '2026-02-10T14:22:10Z', 'HS-44812', 'Meter tampering', 'Resolved'),
('a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', '2026-02-05T22:05:45Z', 'HS-11209', 'Unusual load pattern during disconnect', 'Investigation Pending')
ON CONFLICT (event_id) DO NOTHING;
