"use client";

import React, { useState, useEffect } from "react";
import { Activity, Zap, Waves, Box } from "lucide-react";
import { HarmonicChart } from "@/features/monitor/HarmonicChart";
import { GhostLoadChart } from "@/features/monitor/GhostLoadChart";
import { apiGetRecentTelemetry } from "@/lib/api"; // Kept for Phase 2 readiness

const INITIAL_METRICS = [
  { id: 1, label: "Avg Voltage (L1)", value: "231.4", unit: "V", status: "normal" },
  { id: 2, label: "Frequency", value: "49.98", unit: "Hz", status: "normal" },
  { id: 3, label: "Power Factor", value: "0.84", unit: "PF", status: "warning" },
  { id: 4, label: "Grid Load", value: "92", unit: "%", status: "critical" }
];

const INITIAL_STREAM = [...Array(5)].map((_, i) => ({
  id: i,
  time: `10:42:${15 + i}`,
  nodeId: `TR-0${i + 1}`,
  metric: "Voltage Sag",
  value: "-12%",
  status: "WARNING"
}));

// Reusable Metric Card
function MetricCard({ label, value, unit, status = "normal" }: any) {
  const color = status === "critical" ? "text-danger" : status === "warning" ? "text-warning" : "text-white";
  const border = status === "critical" ? "border-danger/30" : "border-border";

  return (
    <div className={`bg-surface border ${border} p-4 rounded-lg`}>
      <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest mb-1">{label}</div>
      <div className={`text-2xl font-bold font-mono ${color}`}>
        {value} <span className="text-xs text-zinc-600 font-normal">{unit}</span>
      </div>
    </div>
  )
}

export default function TelemetryPage() {
  const [metrics, setMetrics] = useState(INITIAL_METRICS);
  const [stream, setStream] = useState(INITIAL_STREAM);

  useEffect(() => {
    const fetchTelemetry = async () => {
      try {
        const data = await apiGetRecentTelemetry();
        if (data && data.length > 0) {
          setStream(data.map((d, i) => ({
            id: i,
            time: d.time,
            nodeId: d.deviceId,
            metric: "Current",
            value: `${d.current.toFixed(1)}A`,
            status: d.current > 20 ? "CRITICAL" : d.current > 15 ? "WARNING" : "NORMAL",
          })));
        }
      } catch {
        // API unavailable — keep mock data
      }
    };

    fetchTelemetry();
    const interval = setInterval(fetchTelemetry, 5000); // poll every 5s
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-6 md:p-12 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2 font-sans text-white uppercase">
          Signal Telemetry
        </h1>
        <p className="text-zinc-500 font-mono text-sm">
          Real-time grid stability & power quality monitoring.
        </p>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {metrics.map(m => (
          <MetricCard key={m.id} label={m.label} value={m.value} unit={m.unit} status={m.status} />
        ))}
      </div>

      {/* Deep Dive Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Chart 1: The Harmonic Analysis we just built */}
        <div>
          <div className="mb-4 flex items-center gap-2">
            <div className="w-2 h-2 bg-acid rounded-sm"></div>
            <h2 className="text-sm font-bold text-white uppercase">Power Quality (FFT)</h2>
          </div>
          <HarmonicChart />
        </div>

        {/* Chart 2: Reuse the Ghost Load Chart for context */}
        <div>
          <div className="mb-4 flex items-center gap-2">
            <div className="w-2 h-2 bg-danger rounded-sm"></div>
            <h2 className="text-sm font-bold text-white uppercase">Loss Detection</h2>
          </div>
          <GhostLoadChart />
        </div>
      </div>

      {/* Raw Data Log Table */}
      <div className="border border-border rounded-lg overflow-hidden bg-surface">
        <div className="px-6 py-4 border-b border-border bg-panel">
          <h3 className="text-xs font-bold font-mono text-zinc-400 uppercase tracking-widest">
            Raw Telemetry Stream (Last 10s)
          </h3>
        </div>
        <table className="w-full text-left text-sm font-mono text-zinc-400">
          <thead className="bg-black text-[10px] uppercase text-dim">
            <tr>
              <th className="px-6 py-3 font-medium">Timestamp</th>
              <th className="px-6 py-3 font-medium">Node ID</th>
              <th className="px-6 py-3 font-medium">Metric</th>
              <th className="px-6 py-3 font-medium">Value</th>
              <th className="px-6 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {stream.map((row) => (
              <tr key={row.id} className="hover:bg-white/5 transition-colors">
                <td className="px-6 py-3">{row.time}</td>
                <td className="px-6 py-3 text-white">{row.nodeId}</td>
                <td className="px-6 py-3">{row.metric}</td>
                <td className="px-6 py-3 text-warning">{row.value}</td>
                <td className="px-6 py-3"><span className="px-2 py-0.5 rounded bg-warning/10 text-warning text-[10px] border border-warning/20">{row.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}