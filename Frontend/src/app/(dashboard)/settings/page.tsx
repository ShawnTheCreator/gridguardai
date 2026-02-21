"use client";

import React, { useState } from "react";
import { Save, RefreshCw, Power, Shield, Bell, Lock } from "lucide-react";
import { SYSTEM_LOGS } from "@/lib/data";
import { useToast } from "@/components/ui/Toast"; // Import hook

export default function SettingsPage() {
  const { showToast } = useToast(); // Hook
  const [sensitivity, setSensitivity] = useState(95);
  const [autoIsolate, setAutoIsolate] = useState(true);
  const [saving, setSaving] = useState(false);

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      showToast("System Configuration Synced Successfully", "success"); // Trigger toast
    }, 1000);
  };

  return (
    <div className="p-6 md:p-12 w-full space-y-8"> {/* Full width */}
      {/* Header */}
      <div className="flex justify-between items-center border-b border-border pb-6">
        <div>
            <h1 className="text-3xl font-bold tracking-tight mb-2 font-sans text-white uppercase">
            System Configuration
            </h1>
            <p className="text-zinc-500 font-mono text-sm">
            Manage detection algorithms and automated response protocols.
            </p>
        </div>
        <button 
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2 bg-acid text-black font-bold uppercase text-xs rounded hover:bg-white transition-colors disabled:opacity-50"
        >
            {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? "Syncing..." : "Save Changes"}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Algorithm Controls */}
        <div className="lg:col-span-2 space-y-6">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Threshold Card */}
                <div className="bg-surface border border-border p-6 rounded-lg">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <h3 className="font-mono text-sm text-acid uppercase flex items-center gap-2">
                                <Shield className="w-4 h-4" /> Detection Sensitivity
                            </h3>
                            <p className="text-[10px] text-zinc-500 mt-1">
                                Confidence threshold for automatic flagging.
                            </p>
                        </div>
                        <span className="text-2xl font-bold text-white font-mono">{sensitivity}%</span>
                    </div>
                    <input 
                        type="range" 
                        min="50" 
                        max="99" 
                        value={sensitivity} 
                        onChange={(e) => setSensitivity(parseInt(e.target.value))}
                        className="w-full accent-acid h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-zinc-600 font-mono mt-2 uppercase">
                        <span>Balanced</span>
                        <span>Aggressive</span>
                    </div>
                </div>

                {/* Automation Card */}
                <div className="bg-surface border border-border p-6 rounded-lg flex flex-col justify-between">
                    <div>
                        <h3 className="font-mono text-sm text-white uppercase flex items-center gap-2">
                            <Power className="w-4 h-4 text-danger" />
                            Auto-Isolation
                        </h3>
                        <p className="text-[10px] text-zinc-500 mt-1">
                            Grant AI permission to disconnect lines.
                        </p>
                    </div>
                    <div className="flex items-center justify-between mt-4 bg-zinc-900/50 p-3 rounded border border-white/5">
                        <span className="text-xs font-mono text-zinc-400">Status: {autoIsolate ? "ARMED" : "MANUAL"}</span>
                        <button 
                            onClick={() => setAutoIsolate(!autoIsolate)}
                            className={`w-12 h-6 rounded-full p-1 transition-colors ${autoIsolate ? 'bg-acid' : 'bg-zinc-800'}`}
                        >
                            <div className={`w-4 h-4 bg-black rounded-full transition-transform ${autoIsolate ? 'translate-x-6' : 'translate-x-0'}`} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Notification Settings (New Section) */}
            <div className="bg-surface border border-border p-6 rounded-lg">
                <h3 className="font-mono text-sm text-white uppercase flex items-center gap-2 mb-4">
                    <Bell className="w-4 h-4 text-zinc-400" /> Alert Preferences
                </h3>
                <div className="space-y-3">
                    {['SMS Alerts (Critical)', 'Email Reports (Daily)', 'Push Notifications'].map((item, i) => (
                        <div key={i} className="flex items-center gap-3 p-3 border border-white/5 rounded hover:bg-white/5 cursor-pointer transition-colors" onClick={() => showToast("Preference Updated", "info")}>
                            <div className="w-4 h-4 border border-zinc-500 rounded flex items-center justify-center">
                                <div className="w-2 h-2 bg-acid rounded-sm" />
                            </div>
                            <span className="text-xs font-mono text-zinc-300">{item}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>

        {/* Right Column: Logs (Stretches full height) */}
        <div className="bg-panel border border-border rounded-lg overflow-hidden flex flex-col h-full min-h-125">
            <div className="p-4 border-b border-white/5 bg-zinc-900/50 flex justify-between items-center">
                <h3 className="font-mono text-xs text-zinc-400 uppercase tracking-widest">System Audit Log</h3>
                <Lock className="w-3 h-3 text-zinc-600" />
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {SYSTEM_LOGS.map((log) => (
                    <div key={log.id} className="flex gap-3 text-xs border-b border-white/5 pb-3 last:border-0 group">
                        <span className="font-mono text-dim shrink-0 group-hover:text-acid transition-colors">{log.time}</span>
                        <span className="text-zinc-300 font-mono">{log.event}</span>
                    </div>
                ))}
            </div>
        </div>

      </div>
    </div>
  );
}