"use client";

import React from "react";
import { X, Zap, ShieldAlert, Thermometer, Activity, Fingerprint } from "lucide-react";
import { cn } from "@/lib/utils";

interface ControlDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  nodeId: string | null;
}

export function ControlDrawer({ isOpen, onClose, nodeId }: ControlDrawerProps) {
  if (!nodeId) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className={cn(
          "fixed inset-0 bg-black/60 backdrop-blur-sm z-1100 transition-opacity duration-300",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
      />

      {/* Drawer */}
      <div 
        className={cn(
          "fixed inset-y-0 right-0 w-full max-w-md bg-surface border-l border-border z-1200 shadow-2xl transition-transform duration-500 ease-in-out transform",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* Header */}
        <div className="p-6 border-b border-border flex justify-between items-center bg-panel">
          <div>
            <div className="text-[10px] font-mono text-acid uppercase tracking-widest mb-1">Precision Control</div>
            <h2 className="text-xl font-bold text-white font-sans uppercase">Pole ID: {nodeId}</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors text-zinc-500 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-8 overflow-y-auto h-[calc(100vh-100px)] custom-scroll">
          
          {/* 1. AI Forensic Confidence Section */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <Fingerprint className="w-4 h-4 text-acid" />
              <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-400">AI Forensic Analysis</h3>
            </div>
            <div className="bg-panel border border-border p-4 rounded relative overflow-hidden">
              <div className="flex justify-between items-end mb-4">
                <span className="text-3xl font-bold text-white font-mono">98.4%</span>
                <span className="text-[10px] font-mono text-acid uppercase">Match Confirmed</span>
              </div>
              {/* Waveform Visualization Mockup */}
              <div className="h-12 flex items-center gap-0.5">
                {[...Array(30)].map((_, i) => (
                  <div 
                    key={i} 
                    className="flex-1 bg-acid/30 rounded-full" 
                    style={{ height: `${Math.random() * 100}%` }} 
                  />
                ))}
              </div>
              <p className="text-[9px] text-zinc-600 mt-3 font-mono leading-relaxed">
                Signature matches illegal bypass pattern detected via CNN-XGBoost classifier[cite: 70].
              </p>
            </div>
          </section>

          {/* 2. Scalpel Ports Section */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <Zap className="w-4 h-4 text-acid" />
              <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-400">Smart Managed Ports</h3>
            </div>
            <div className="grid grid-cols-1 gap-3">
              {[
                { label: "Line 01 - Legal", status: "online", theft: false },
                { label: "Line 02 - Illegal Bypass", status: "active_theft", theft: true },
                { label: "Line 03 - Legal", status: "online", theft: false },
                { label: "Line 04 - Legal", status: "online", theft: false },
              ].map((port, i) => (
                <div 
                  key={i} 
                  className={cn(
                    "flex items-center justify-between p-4 border rounded transition-all",
                    port.theft ? "border-danger bg-danger/5" : "border-border bg-panel"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className={cn("w-2 h-2 rounded-full", port.theft ? "bg-danger animate-pulse" : "bg-success")} />
                    <span className={cn("text-xs font-mono font-bold", port.theft ? "text-danger" : "text-white")}>
                      {port.label}
                    </span>
                  </div>
                  {port.theft && (
                    <button className="px-3 py-1 bg-danger text-white text-[10px] font-bold uppercase hover:bg-white hover:text-danger transition-all">
                      Isolate
                    </button>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* 3. Thermal Stress Section */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <Thermometer className="w-4 h-4 text-warning" />
              <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-400">Thermal Profile</h3>
            </div>
            <div className="bg-panel border border-border p-4 rounded">
              <div className="flex justify-between items-center mb-2">
                <span className="text-[10px] font-mono text-zinc-500">Core Temperature</span>
                <span className="text-sm font-bold text-warning font-mono">82°C</span>
              </div>
              <div className="w-full bg-black h-2 rounded-full overflow-hidden">
                <div className="bg-linear-to-r from-success via-warning to-danger h-full w-[82%]" />
              </div>
              <p className="text-[9px] text-zinc-600 mt-2">Current load exceeds safe operating threshold.</p>
            </div>
          </section>

        </div>
      </div>
    </>
  );
}