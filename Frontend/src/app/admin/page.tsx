"use client";

import { useState, useEffect } from "react";
import MapLoader from "@/features/map/MapLoader";
import { ControlDrawer } from "@/features/control/ControlDrawer";
import { GhostLoadChart } from "@/features/monitor/GhostLoadChart";
import { useToast } from "@/components/ui/Toast";
import { 
  apiGetDashboardSummary, 
  apiGetAssets, 
  apiGetIncidents,
  apiGetRecentTelemetry,
  type ApiAsset,
  type ApiIncident
} from "@/lib/api";

export default function DashboardPage() {
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const { showToast } = useToast();
  const [totalSectorLoad, setTotalSectorLoad] = useState("14.2");
  const [activeLosses, setActiveLosses] = useState("R12,450");
  const [totalNodes, setTotalNodes] = useState("1,240");
  const [activeAlerts, setActiveAlerts] = useState("2");
  const [assets, setAssets] = useState<ApiAsset[]>([]);
  const [incidents, setIncidents] = useState<ApiIncident[]>([]);
  const [telemetry, setTelemetry] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const [summary, assetsData, incidentsData, telemetryData] = await Promise.all([
          apiGetDashboardSummary(),
          apiGetAssets(),
          apiGetIncidents(),
          apiGetRecentTelemetry()
        ]);

        if (summary) {
          setTotalSectorLoad(summary.totalSectorLoad.toString());
          setActiveLosses(`R${summary.activeLosses.toLocaleString()}`);
          setTotalNodes(summary.totalNodes.toLocaleString());
          setActiveAlerts(summary.activeAlerts.toString());
        }

        if (assetsData) {
          setAssets(assetsData);
        }

        if (incidentsData) {
          setIncidents(incidentsData);
        }

        if (telemetryData) {
          setTelemetry(telemetryData);
        }
      } catch (error) {
        console.error("Failed to load dashboard data:", error);
        /* keep hardcoded values on error */
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleNodeClick = (id: string) => {
    setSelectedNodeId(id);
    setIsDrawerOpen(true);
  };

  const handleEmergencyOverride = () => {
    showToast("EMERGENCY OVERRIDE INITIATED: SECTOR 4 ISOLATING...", "error");
  };

  if (loading) {
    return (
      <div className="p-6 md:p-12 bg-gray-100 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <div className="text-gray-600 font-mono">Loading dashboard data...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-12 bg-gray-100 min-h-screen">
      <div className="flex justify-between items-end mb-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-white border border-gray-200 flex items-center justify-center shadow-sm">
            <img src="/Logo.webp" alt="GridGuard" className="w-8 h-8 object-contain" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight mb-2 font-sans text-black">
              Situational Awareness
            </h1>
            <p className="text-gray-700 font-mono text-sm">
              Sector 4: Monitoring {totalNodes} Nodes | {activeAlerts} Active Alerts Detected
            </p>
          </div>
        </div>

        <div className="hidden md:flex gap-6">
          <div className="text-right px-4 py-2 bg-white rounded-lg border border-gray-200">
            <div className="text-[10px] font-mono text-gray-500 uppercase">Total Sector Load</div>
            <div className="text-xl font-bold text-black font-mono">{totalSectorLoad} <span className="text-xs text-gray-500">MW</span></div>
          </div>
          <div className="text-right px-4 py-2 bg-white rounded-lg border border-gray-200">
            <div className="text-[10px] font-mono text-gray-500 uppercase">Active Losses</div>
            <div className="text-xl font-bold text-red-600 font-mono">{activeLosses} <span className="text-xs text-gray-500">/hr</span></div>
          </div>
        </div>
      </div>

      {/* The Map Component */}
      <div className="mb-8">
        <MapLoader onPoleClick={handleNodeClick} />
      </div>

      {/* Analytics Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
          <div className="text-xs font-medium text-gray-600 uppercase mb-2">AI Theft Confidence</div>
          <div className="text-2xl font-bold text-green-600">94.01%</div>
          <div className="text-xs text-gray-500 mt-2">Based on CNN-XGBoost signature matching</div>
        </div>
        <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
          <div className="text-xs font-medium text-gray-600 uppercase mb-2">Thermal Overload Risk</div>
          <div className="text-2xl font-bold text-yellow-600">Medium</div>
          <div className="text-xs text-gray-500 mt-2">3 Transformers at 85%+ capacity</div>
        </div>
        <div className="md:col-span-2 bg-white p-5 rounded-lg border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-medium text-gray-600 uppercase mb-2">Auto-Isolation Status</div>
            <div className="text-sm font-bold text-black flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500"></span>
              Ready / Armed
            </div>
          </div>
          <button
            onClick={handleEmergencyOverride}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium text-sm rounded-lg transition-colors shadow-sm"
          >
            Emergency Override
          </button>
        </div>
      </div>

      {/* Telemetry Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2">
          <GhostLoadChart />
        </div>

        <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm flex flex-col">
          <h3 className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-4">
            Live Event Log
          </h3>
          <div className="flex-1 space-y-3 overflow-hidden">
            {[
              { time: "10:34", msg: "Energy Balance Normal", sub: "Pole TR-04 stable", status: "normal" },
              { time: "10:33", msg: "Load Fluctuation Detected", sub: "Pole TR-12 monitoring", status: "warning" },
              { time: "10:32", msg: "Energy Balance Normal", sub: "Pole TR-04 stable", status: "normal" },
            ].map((log, i) => (
              <div key={i} className="flex gap-3 text-sm border-b border-gray-100 pb-3 last:border-0">
                <span className="font-mono text-gray-500 text-xs">{log.time}</span>
                <div className="flex-1">
                  <span className={`block font-medium ${log.status === 'warning' ? 'text-yellow-600' : 'text-black'}`}>{log.msg}</span>
                  <span className="text-gray-500 text-xs">{log.sub}</span>
                </div>
                <span className={`w-2 h-2 rounded-full mt-1 ${log.status === 'warning' ? 'bg-yellow-500' : 'bg-green-500'}`}></span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <ControlDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        nodeId={selectedNodeId}
      />
    </div>
  );
}