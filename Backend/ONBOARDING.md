# GridGuardian AI Backend

Backend API and database for energy monitoring. Uses C# .NET 9 and PostgreSQL.

---

## Requirements

- [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- [WSL 2](https://learn.microsoft.com/en-us/windows/wsl/install) (Windows users)
- PowerShell or Terminal

---

## Structure

```
gridguardai/
├── backend/
│   ├── Controllers/
│   ├── Models/
│   ├── Data/
│   ├── Program.cs
│   └── Dockerfile
├── frontend/
├── infrastructure/
│   └── init.sql
├── docker-compose.yml
└── README.md
```

---

## Setup

**1. Clone the repository**
```
git clone https://github.com/ShawnTheCreator/gridguardai.git
cd gridguardai
```

**2. Start:**

```powershell
docker compose up -d --build
```

Wait 15 seconds for database initialization.

---

## Test

Send data:

```powershell
Invoke-RestMethod -Method Post -Uri "http://localhost:5078/api/telemetry" -Body '{"deviceId": "Test_Unit_01", "current": 45.5}' -ContentType "application/json"
```

Expected:
```
status    device          time
------    ------          ----
Saved     Test_Unit_01    2026-02-07T14:00:00...
```

---

## Troubleshooting

**500 Error:**
- Reset database:

```powershell
docker compose down -v
docker compose up -d --build
```

**View logs:**

```powershell
docker logs gridguardian_api --tail 50
```

---

**Stack:** .NET 9, PostgreSQL, Docker