"use client";

import { useState } from "react";
import MapLoader from "@/features/map/MapLoader";
import { ControlDrawer } from "@/features/control/ControlDrawer";
import { GhostLoadChart } from "@/features/monitor/GhostLoadChart";
import { useToast } from "@/components/ui/Toast";

export default function DashboardPage() {
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const { showToast } = useToast();

  const handleNodeClick = (id: string) => {
    setSelectedNodeId(id);
    setIsDrawerOpen(true);
  };

  const handleEmergencyOverride = () => {
    showToast("EMERGENCY OVERRIDE INITIATED: SECTOR 4 ISOLATING...", "error");
  };

  return (
    <div className="p-6 md:p-12">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2 font-sans text-white uppercase">
            Situational Awareness <span className="text-acid">Live</span>
          </h1>
          <p className="text-zinc-500 font-mono text-sm">
            Sector 4: Monitoring 1,240 Nodes | 2 Active Alerts Detected
          </p>
        </div>
        
        <div className="hidden md:flex gap-4">
            <div className="text-right">
                <div className="text-[10px] font-mono text-dim uppercase">Total Sector Load</div>
                <div className="text-xl font-bold text-white font-mono">14.2 <span className="text-xs text-zinc-500">MW</span></div>
            </div>
            <div className="h-10 w-px bg-border"></div>
            <div className="text-right">
                <div className="text-[10px] font-mono text-dim uppercase">Active Losses</div>
                <div className="text-xl font-bold text-danger font-mono">R12,450 <span className="text-xs text-zinc-500">/hr</span></div>
            </div>
        </div>
      </div>
      
      {/* The Map Component */}
      <div className="mb-8">
        <MapLoader onPoleClick={handleNodeClick} />
      </div>

      {/* Analytics Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="border border-border bg-surface/50 p-4 rounded">
            <div className="text-[10px] font-mono text-dim uppercase mb-1">AI Theft Confidence</div>
            <div className="text-2xl font-bold text-acid">94.01%</div>
            [cite_start]<div className="text-[9px] text-zinc-600 mt-2">Based on CNN-XGBoost signature matching [cite: 71]</div>
        </div>
        <div className="border border-border bg-surface/50 p-4 rounded">
            <div className="text-[10px] font-mono text-dim uppercase mb-1">Thermal Overload Risk</div>
            <div className="text-2xl font-bold text-white">Medium</div>
            [cite_start]<div className="text-[9px] text-zinc-600 mt-2">3 Transformers at 85%+ capacity [cite: 99]</div>
        </div>
        <div className="md:col-span-2 border border-border bg-surface/50 p-4 rounded flex items-center justify-between">
            <div>
                <div className="text-[10px] font-mono text-dim uppercase mb-1">Auto-Isolation Status</div>
                <div className="text-sm font-bold text-white uppercase">Ready / Armed</div>
            </div>
            <button 
                onClick={handleEmergencyOverride}
                className="px-4 py-2 bg-acid text-black font-bold text-xs uppercase hover:bg-white transition-colors shadow-[0_0_15px_rgba(204,255,0,0.4)]"
            >
                Emergency Manual Override
            </button>
        </div>
      </div>

      {/* Telemetry Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2">
           <GhostLoadChart />
        </div>

        <div className="border border-border bg-panel p-4 rounded-lg flex flex-col">
            <h3 className="text-xs font-bold font-mono text-zinc-400 uppercase tracking-widest mb-4">
                Live Event Log
            </h3>
            <div className="flex-1 space-y-3 overflow-hidden relative">
                {[
                    { time: "10:34", msg: "Energy Balance Normal", sub: "Pole TR-04 stable" },
                    { time: "10:33", msg: "Energy Balance Normal", sub: "Pole TR-04 stable" },
                    { time: "10:32", msg: "Energy Balance Normal", sub: "Pole TR-04 stable" },
                ].map((log, i) => (
                    <div key={i} className="flex gap-3 text-xs border-b border-white/5 pb-2">
                        <span className="font-mono text-dim">{log.time}</span>
                        <div>
                            <span className="text-acid block">{log.msg}</span>
                            <span className="text-zinc-500 text-[10px]">{log.sub}</span>
                        </div>
                    </div>
                ))}
                <div className="absolute bottom-0 w-full h-10 bg-linear-to-t from-panel to-transparent"></div>
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