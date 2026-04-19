"use client";

import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/Toast";
import { 
  Terminal, 
  Database, 
  Cloud, 
  GitBranch, 
  Bug, 
  Activity,
  Server,
  Cpu,
  HardDrive,
  Wifi,
  Zap,
  Code2,
  TestTube,
  Settings,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Clock,
  Package,
  Layers
} from "lucide-react";

interface SystemMetric {
  name: string;
  value: string;
  status: "healthy" | "warning" | "critical";
  lastUpdated: string;
}

interface ServiceStatus {
  name: string;
  version: string;
  status: "running" | "stopped" | "error";
  cpu: number;
  memory: number;
  uptime: string;
  requests: number;
}

interface DeploymentInfo {
  environment: string;
  version: string;
  deployedAt: string;
  deployedBy: string;
  commitHash: string;
}

interface LogEntry {
  timestamp: string;
  level: "info" | "warn" | "error" | "debug";
  service: string;
  message: string;
}

export default function DeveloperDashboard() {
  const { showToast } = useToast();
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const [systemMetrics, setSystemMetrics] = useState<SystemMetric[]>([
    {
      name: "API Response Time",
      value: "124ms",
      status: "healthy",
      lastUpdated: "2 min ago"
    },
    {
      name: "Database Connections",
      value: "45/100",
      status: "healthy",
      lastUpdated: "1 min ago"
    },
    {
      name: "MQTT Queue Depth",
      value: "23",
      status: "warning",
      lastUpdated: "30 sec ago"
    },
    {
      name: "AI Model Accuracy",
      value: "94.01%",
      status: "healthy",
      lastUpdated: "5 min ago"
    }
  ]);

  const [services, setServices] = useState<ServiceStatus[]>([
    {
      name: "gridguard-api",
      version: "v2.4.1",
      status: "running",
      cpu: 23,
      memory: 67,
      uptime: "4d 12h 23m",
      requests: 15420
    },
    {
      name: "telemetry-processor",
      version: "v1.8.3",
      status: "running",
      cpu: 45,
      memory: 78,
      uptime: "2d 8h 15m",
      requests: 8934
    },
    {
      name: "ai-inference",
      version: "v3.2.0",
      status: "running",
      cpu: 78,
      memory: 89,
      uptime: "1d 3h 45m",
      requests: 2341
    },
    {
      name: "notification-service",
      version: "v1.1.2",
      status: "error",
      cpu: 0,
      memory: 0,
      uptime: "0m",
      requests: 0
    }
  ]);

  const [deployment] = useState<DeploymentInfo>({
    environment: "production",
    version: "v2.4.1",
    deployedAt: "2026-04-18 14:30:00",
    deployedBy: "shawn",
    commitHash: "a7f3d9e"
  });

  const [logs, setLogs] = useState<LogEntry[]>([
    {
      timestamp: "10:45:23",
      level: "info",
      service: "gridguard-api",
      message: "Authentication successful for user thabo@gridguard.co.za"
    },
    {
      timestamp: "10:45:19",
      level: "warn",
      service: "telemetry-processor",
      message: "High latency detected on MQTT connection"
    },
    {
      timestamp: "10:45:15",
      level: "error",
      service: "notification-service",
      message: "Failed to send SMS alert: Service unavailable"
    },
    {
      timestamp: "10:45:12",
      level: "info",
      service: "ai-inference",
      message: "Model inference completed: theft_confidence=94.2%"
    },
    {
      timestamp: "10:45:08",
      level: "debug",
      service: "gridguard-api",
      message: "Cache hit for pole P-402 telemetry data"
    }
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "healthy":
      case "running": return "text-acid border-acid/30 bg-acid/10";
      case "warning": return "text-yellow-400 border-yellow-400/30 bg-yellow-400/10";
      case "critical":
      case "error": return "text-danger border-danger/30 bg-danger/10";
      case "stopped": return "text-zinc-400 border-zinc-400/30 bg-zinc-400/10";
      default: return "text-zinc-400 border-zinc-400/30 bg-zinc-400/10";
    }
  };

  const getLogLevelColor = (level: string) => {
    switch (level) {
      case "error": return "text-danger";
      case "warn": return "text-yellow-400";
      case "info": return "text-acid";
      case "debug": return "text-zinc-400";
      default: return "text-zinc-400";
    }
  };

  const handleRestartService = (serviceName: string) => {
    showToast(`Restarting ${serviceName}...`, "success");
    // Simulate service restart
    setTimeout(() => {
      setServices(prev => prev.map(service => 
        service.name === serviceName 
          ? { ...service, status: "running" as const, cpu: Math.random() * 50, memory: Math.random() * 80 + 20 }
          : service
      ));
      showToast(`${serviceName} restarted successfully`, "success");
    }, 2000);
  };

  const handleDeploy = () => {
    showToast("Initiating deployment pipeline...", "success");
  };

  return (
    <div className="p-6 md:p-12">
      {/* Header */}
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2 font-sans text-white uppercase">
            Developer Operations <span className="text-acid">DevOps</span>
          </h1>
          <p className="text-zinc-500 font-mono text-sm">
            Production Environment • {deployment.version} • {services.filter(s => s.status === "running").length}/{services.length} Services Running
          </p>
        </div>

        <div className="flex gap-4">
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`px-4 py-2 border border-border rounded text-sm font-mono transition-colors ${
              autoRefresh 
                ? "bg-acid text-black border-acid" 
                : "bg-surface text-white hover:border-acid/30"
            }`}
          >
            {autoRefresh ? "Auto-Refresh ON" : "Auto-Refresh OFF"}
          </button>
          <button
            onClick={handleDeploy}
            className="px-4 py-2 bg-acid text-black font-bold text-sm uppercase hover:bg-white transition-colors rounded"
          >
            Deploy →
          </button>
        </div>
      </div>

      {/* Deployment Info */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
        <div className="border border-border bg-surface/50 p-4 rounded">
          <div className="flex items-center gap-2 mb-2">
            <GitBranch className="w-4 h-4 text-acid" />
            <div className="text-[10px] font-mono text-dim uppercase">Environment</div>
          </div>
          <div className="text-lg font-bold text-white font-mono uppercase">{deployment.environment}</div>
          <div className="text-[9px] text-zinc-600 mt-2">{deployment.deployedAt}</div>
        </div>
        <div className="border border-border bg-surface/50 p-4 rounded">
          <div className="flex items-center gap-2 mb-2">
            <Package className="w-4 h-4 text-acid" />
            <div className="text-[10px] font-mono text-dim uppercase">Version</div>
          </div>
          <div className="text-lg font-bold text-acid font-mono">{deployment.version}</div>
          <div className="text-[9px] text-zinc-600 mt-2">{deployment.commitHash}</div>
        </div>
        <div className="border border-border bg-surface/50 p-4 rounded">
          <div className="flex items-center gap-2 mb-2">
            <Server className="w-4 h-4 text-acid" />
            <div className="text-[10px] font-mono text-dim uppercase">Services</div>
          </div>
          <div className="text-lg font-bold text-white font-mono">{services.filter(s => s.status === "running").length}/{services.length}</div>
          <div className="text-[9px] text-zinc-600 mt-2">operational</div>
        </div>
        <div className="border border-border bg-surface/50 p-4 rounded">
          <div className="flex items-center gap-2 mb-2">
            <Activity className="w-4 h-4 text-acid" />
            <div className="text-[10px] font-mono text-dim uppercase">Total Requests</div>
          </div>
          <div className="text-lg font-bold text-white font-mono">
            {services.reduce((sum, s) => sum + s.requests, 0).toLocaleString()}
          </div>
          <div className="text-[9px] text-zinc-600 mt-2">last 24h</div>
        </div>
        <div className="border border-border bg-surface/50 p-4 rounded">
          <div className="flex items-center gap-2 mb-2">
            <Cloud className="w-4 h-4 text-acid" />
            <div className="text-[10px] font-mono text-dim uppercase">Deployed By</div>
          </div>
          <div className="text-lg font-bold text-white font-mono">{deployment.deployedBy}</div>
          <div className="text-[9px] text-zinc-600 mt-2">via CI/CD</div>
        </div>
      </div>

      {/* System Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Services Status */}
        <div className="border border-border bg-panel p-4 rounded-lg">
          <h3 className="text-xs font-bold font-mono text-zinc-400 uppercase tracking-widest mb-4">
            Microservices Status
          </h3>
          <div className="space-y-3 max-h-80 overflow-y-auto custom-scroll">
            {services.map((service) => (
              <div 
                key={service.name} 
                className={`border border-border/50 rounded-lg p-3 bg-surface/30 cursor-pointer hover:border-acid/30 transition-colors ${
                  selectedService === service.name ? "border-acid" : ""
                }`}
                onClick={() => setSelectedService(service.name)}
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-mono text-white">{service.name}</span>
                      <span className={`px-2 py-1 rounded-full text-[9px] font-mono uppercase border ${getStatusColor(service.status)}`}>
                        {service.status}
                      </span>
                    </div>
                    <div className="text-[10px] font-mono text-dim mt-1">
                      v{service.version} • {service.uptime}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-acid font-mono">{service.requests.toLocaleString()}</div>
                    <div className="text-[9px] font-mono text-dim">requests</div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-2 text-[10px]">
                  <div>
                    <span className="text-dim">CPU:</span>
                    <span className={`ml-1 font-mono ${
                      service.cpu > 80 ? 'text-danger' : service.cpu > 50 ? 'text-yellow-400' : 'text-acid'
                    }`}>{service.cpu}%</span>
                  </div>
                  <div>
                    <span className="text-dim">Memory:</span>
                    <span className={`ml-1 font-mono ${
                      service.memory > 80 ? 'text-danger' : service.memory > 50 ? 'text-yellow-400' : 'text-acid'
                    }`}>{service.memory}%</span>
                  </div>
                </div>

                {service.status === "error" && (
                  <div className="mt-2 pt-2 border-t border-border/50">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRestartService(service.name);
                      }}
                      className="px-3 py-1 bg-acid text-black text-[10px] font-bold uppercase hover:bg-white transition-colors rounded"
                    >
                      Restart Service
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* System Metrics */}
        <div className="border border-border bg-panel p-4 rounded-lg">
          <h3 className="text-xs font-bold font-mono text-zinc-400 uppercase tracking-widest mb-4">
            System Health Metrics
          </h3>
          <div className="space-y-3">
            {systemMetrics.map((metric, index) => (
              <div key={index} className="border border-border/50 rounded-lg p-3 bg-surface/30">
                <div className="flex justify-between items-center">
                  <div>
                    <span className="text-sm font-mono text-white">{metric.name}</span>
                    <div className="text-[10px] font-mono text-dim mt-1">
                      Updated {metric.lastUpdated}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-sm font-bold font-mono ${getStatusColor(metric.status).split(' ')[0]}`}>
                      {metric.value}
                    </div>
                    <span className={`px-2 py-1 rounded-full text-[9px] font-mono uppercase border ${getStatusColor(metric.status)}`}>
                      {metric.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Live Logs */}
      <div className="border border-border bg-panel p-4 rounded-lg mb-8">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xs font-bold font-mono text-zinc-400 uppercase tracking-widest">
            Live System Logs
          </h3>
          <button className="px-3 py-1 bg-surface border border-border rounded text-[10px] font-mono text-white hover:border-acid/30 transition-colors">
            <RefreshCw className="w-3 h-3 inline mr-1" />
            Refresh
          </button>
        </div>
        <div className="bg-void rounded-lg p-4 font-mono text-xs max-h-60 overflow-y-auto custom-scroll">
          {logs.map((log, index) => (
            <div key={index} className="flex gap-4 mb-2 text-[11px]">
              <span className="text-dim">{log.timestamp}</span>
              <span className={`${getLogLevelColor(log.level)} font-bold`}>
                [{log.level.toUpperCase()}]
              </span>
              <span className="text-acid">{log.service}:</span>
              <span className="text-zinc-300">{log.message}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <button className="p-4 border border-border bg-surface/50 rounded-lg hover:border-acid/30 transition-colors group">
          <Terminal className="w-5 h-5 text-acid mb-2 group-hover:scale-110 transition-transform" />
          <div className="text-xs font-mono text-white">SSH Console</div>
        </button>
        <button className="p-4 border border-border bg-surface/50 rounded-lg hover:border-acid/30 transition-colors group">
          <Database className="w-5 h-5 text-acid mb-2 group-hover:scale-110 transition-transform" />
          <div className="text-xs font-mono text-white">Database Admin</div>
        </button>
        <button className="p-4 border border-border bg-surface/50 rounded-lg hover:border-acid/30 transition-colors group">
          <TestTube className="w-5 h-5 text-acid mb-2 group-hover:scale-110 transition-transform" />
          <div className="text-xs font-mono text-white">Run Tests</div>
        </button>
        <button className="p-4 border border-border bg-surface/50 rounded-lg hover:border-acid/30 transition-colors group">
          <Bug className="w-5 h-5 text-acid mb-2 group-hover:scale-110 transition-transform" />
          <div className="text-xs font-mono text-white">Debug Mode</div>
        </button>
      </div>
    </div>
  );
}
