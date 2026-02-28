-- infrastructure/seed.sql
-- MySQL-compatible seed data (ON DUPLICATE KEY UPDATE instead of ON CONFLICT)

-- Default admin user (password: gridguard123)
INSERT INTO users (id, email, name, password_hash, role, created_at) VALUES
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'thabo@gridguard.co.za', 'Thabo Mokoena',
 '$2a$11$nabsRQfipWla7Gq18t0LYu2pl7HN4DzpT6st9pEmfkLmK6fjx4.gi', 'admin', NOW())
ON DUPLICATE KEY UPDATE id=id;

-- Assets (includes name field matching Asset model)
INSERT INTO assets (id, name, type, location, status, load, lat, lng, last_inspection) VALUES
('TR-01', 'Transformer Alpha',   'Transformer', 'Zone A – Sector 12', 'healthy',  87.3, -26.2041, 28.0473, '2026-01-15'),
('TR-02', 'Transformer Beta',    'Transformer', 'Zone B – Sector 7',  'warning',  65.1, -26.2070, 28.0330, '2026-01-10'),
('TR-03', 'Transformer Gamma',   'Transformer', 'Zone C – Sector 4',  'critical', 92.8, -26.1950, 28.0580, '2025-12-20'),
('PL-01', 'Pole Node Alpha',     'Pole',        'Zone A – Sector 12', 'healthy',  45.0, -26.2000, 28.0400, '2026-02-01'),
('PL-02', 'Pole Node Beta',      'Pole',        'Zone B – Sector 7',  'healthy',  34.2, -26.2100, 28.0500, '2026-01-28'),
('SS-01', 'Main Substation D',   'Substation',  'Zone D – Main Grid', 'healthy',  78.5, -26.1985, 28.0450, '2025-11-30')
ON DUPLICATE KEY UPDATE id=id;

-- Incidents
INSERT INTO incidents (id, time, location, type, status, confidence, created_at) VALUES
('INC-001', '14:23', 'Zone A – Sector 12', 'Meter Bypass',   'active',        94, '2026-02-21 14:23:00'),
('INC-002', '13:45', 'Zone B – Sector 7',  'Cable Hook',     'dispatched',    87, '2026-02-21 13:45:00'),
('INC-003', '12:30', 'Zone C – Sector 4',  'Meter Tampering','active',        91, '2026-02-21 12:30:00'),
('INC-004', '11:15', 'Zone A – Sector 3',  'Bypass Detected','resolved',      78, '2026-02-21 11:15:00'),
('INC-005', '10:00', 'Zone D – Sector 1',  'Cable Hook',     'investigating', 85, '2026-02-21 10:00:00')
ON DUPLICATE KEY UPDATE id=id;

-- Notifications
INSERT INTO notifications (id, title, message, severity, is_read, created_at) VALUES
('b1c2d3e4-f5a6-7890-abcd-ef1234567890', 'TR-03 Critical Thermal',
 'Transformer TR-03 has exceeded thermal threshold at 92.8% load.', 'critical', false, '2026-02-21 14:00:00'),
('c2d3e4f5-a6b7-8901-bcde-f12345678901', 'Backup Complete',
 'System backup completed successfully at 12:00.', 'info', false, '2026-02-21 12:00:00')
ON DUPLICATE KEY UPDATE id=id;

-- System config defaults
INSERT INTO system_config (`key`, `value`) VALUES
('sensitivity',  '95'),
('auto_isolate', 'true')
ON DUPLICATE KEY UPDATE `key`=`key`;

-- Audit logs
INSERT INTO audit_logs (id, time, event, created_at) VALUES
('d3e4f5a6-b7c8-9012-cdef-123456789012', '14:23', 'Pole TR-03 flagged – isolating sector', '2026-02-21 14:23:00'),
('e4f5a6b7-c8d9-0123-def0-234567890123', '14:21', 'AI confidence recalibrated to 96.2%',   '2026-02-21 14:21:00'),
('f5a6b7c8-d9e0-1234-ef01-345678901234', '14:18', 'Manual override on Pole TR-01 cleared', '2026-02-21 14:18:00')
ON DUPLICATE KEY UPDATE id=id;

-- Theft history
INSERT INTO theft_history_events (event_id, timestamp, house_id, reason, status) VALUES
('f47ac10b-58cc-4372-a567-0e02b2c3d479', '2026-02-12 08:15:30', 'HS-99321', 'Bypass detected',                         'Isolated'),
('c9b1420a-8d34-4b5c-9c7a-5b12a3d4e5f6', '2026-02-10 14:22:10', 'HS-44812', 'Meter tampering',                         'Resolved'),
('a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', '2026-02-05 22:05:45', 'HS-11209', 'Unusual load pattern during disconnect', 'Investigation Pending')
ON DUPLICATE KEY UPDATE event_id=event_id;
