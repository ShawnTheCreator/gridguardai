# GridGuard AI Backend

South Africa loses R23 billion annually to electricity theft. Illegal connections cause transformer explosions costing R200k-R500k each. 

**The Gap**: Current meters can't detect "tap-offs" that bypass the meter entirely, and manual audits in high-theft areas put technicians at physical risk.

**Our Solution**: Sensors are placed in high-risk zones to detect missing power. Neural Networks are used analyzes vibration patterns to confirm an illegal line. Smart relays disconnect only that line. Paying customers stay powered.

---

## What We Are Building

**Energy Balancing**: Observer meters at distribution poles calculate `I_pole - Σ I_meters > Threshold` in real-time.

**AI Validation**: Hybrid Convolutional Neural Network - Long Short-Term Memory (CNN-LSTM) on Huawei ModelArts confirms theft.

**Scalpel Isolation**: Message Queuing Telemetry Transport (MQTT) commands via Huawei Internet of Things Device Access (IoTDA) disconnect only the illegal bypass. Paying customers stay powered.

---

## Stack

| Layer | Technology | Role |
|-------|-----------|------|
| **Backend** | .NET 9 | Application Programming Interface (API) orchestration |
| **Database** | TimescaleDB | Time-series telemetry |
| **IoT** | Huawei IoTDA | MQTT telemetry & commands |
| **AI** | Huawei ModelArts | Theft validation |
| **Frontend** | Next.js 14 | Real-time dashboard |

---

## Structure

```
gridguardai/
├── backend/
├── frontend/
├── infrastructure/
├── docker-compose.yml
└── README.md
```

---

## Setup

**Requirements**: Docker Desktop, Windows Subsystem for Linux 2 (WSL 2) for Windows users

**Start**:

```bash
git clone https://github.com/ShawnTheCreator/gridguardai.git
cd gridguardai
docker compose up -d --build
```

**Stop**:

```bash
docker compose down
```

**View logs**:

```bash
docker compose logs -f
```

Wait 15 seconds for database initialization.

**Test**:

```bash
curl -X POST http://localhost:5078/api/telemetry \
  -H "Content-Type: application/json" \
  -d '{"deviceId": "P-402", "current": 45.5}'
```

---

## API Endpoints

**Telemetry**:
- `GET /api/poles` - All poles, Global Positioning System (GPS) coordinates, status
- `GET /api/poles/{id}/telemetry/live` - Real-time current/voltage
- `GET /api/poles/{id}/health` - Transformer thermal stress
- `POST /api/telemetry` - Ingest sensor data

**AI & Forensics**:
- `POST /api/forensics/analyze` - Send waveform to ModelArts
- `GET /api/alerts/pending` - Active "Ghost Loads" under review

**Control**:
- `POST /api/control/isolate` - Disconnect specific port
- `POST /api/control/limit` - Trigger 10 Ampere (10A) brownout
- `POST /api/control/restore` - Re-energize line

**Reports**:
- `GET /api/reports/theft-history` - Audit log
- `GET /api/reports/savings-estimate` - Return on Investment (ROI) in South African Rand (ZAR)

---

## Architecture Flow

```
Distribution Pole (Edge)
  ↓ Energy Balance Check
  ↓ MQTT via Huawei IoTDA
.NET 9 Backend
  ↓ Anomaly → ModelArts API
Huawei ModelArts
  ↓ Theft confirmed (93-99%)
  ↓ Command via IoTDA
Smart Relay
  ↓ Scalpel disconnect
Next.js Dashboard
  ↓ Live update via SignalR
```

---
