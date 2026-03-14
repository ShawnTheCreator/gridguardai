DROP TABLE IF EXISTS audit_logs;
DROP TABLE IF EXISTS system_config;
DROP TABLE IF EXISTS notifications;
DROP TABLE IF EXISTS incidents;
DROP TABLE IF EXISTS assets;
DROP TABLE IF EXISTS theft_history_events;
DROP TABLE IF EXISTS telemetry;
DROP TABLE IF EXISTS users;

-- 2. CREATE TABLES
CREATE TABLE users (
    id CHAR(36) PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    username VARCHAR(255) DEFAULT '',
    name VARCHAR(255) DEFAULT '',
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'operator',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE assets (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL,
    location VARCHAR(255),
    status VARCHAR(50) DEFAULT 'healthy',
    `load` DOUBLE,
    lat DOUBLE,
    lng DOUBLE,
    last_inspection DATETIME
);

CREATE TABLE incidents (
    id VARCHAR(50) PRIMARY KEY,
    time VARCHAR(20),
    location VARCHAR(255),
    type VARCHAR(100),
    status VARCHAR(50),
    confidence INT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE notifications (
    id CHAR(36) PRIMARY KEY,
    title VARCHAR(255),
    message TEXT,
    severity VARCHAR(50),
    is_read BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE system_config (
    `key` VARCHAR(100) PRIMARY KEY,
    `value` TEXT,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE audit_logs (
    id CHAR(36) PRIMARY KEY,
    time VARCHAR(20),
    event TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE telemetry (
    `time` DATETIME NOT NULL,
    device_id VARCHAR(50) NOT NULL,
    voltage DOUBLE,
    current DOUBLE,
    power DOUBLE,
    PRIMARY KEY (`time`, device_id)
);

CREATE TABLE theft_history_events (
    event_id CHAR(36) PRIMARY KEY,
    timestamp DATETIME,
    house_id VARCHAR(50),
    reason TEXT,
    status VARCHAR(50)
);

-- 3. INITIAL DATA (Template)
-- IMPORTANT: Add your secure initial user here
-- INSERT INTO users (id, email, username, name, password_hash, role, created_at) VALUES
-- (UUID(), 'admin@example.com', 'admin', 'System Admin', 'YOUR_HASH_HERE', 'admin', NOW());
