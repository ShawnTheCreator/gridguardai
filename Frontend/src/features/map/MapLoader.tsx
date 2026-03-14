"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import { Box, Map as MapIcon, Layers } from "lucide-react";
import { cn } from "@/lib/utils";

// 2D Tactical Map
const TacticalMap = dynamic<any>(() => import("./TacticalMap"), {
  ssr: false,
  loading: () => <MapSkeleton label="Initialising Tactical Layer..." />
});

// 3D Digital Twin Map
const DigitalTwinMap = dynamic<any>(() => import("./DigitalTwinMap"), {
  ssr: false,
  loading: () => <MapSkeleton label="Loading Photorealistic Tiles..." />
});

function MapSkeleton({ label }: { label: string }) {
  return (
    <div className="w-full h-150 bg-panel border border-border rounded-lg flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-2 border-acid/20 border-t-acid rounded-full animate-spin" />
        <span className="text-[10px] font-mono text-dim uppercase tracking-widest">{label}</span>
      </div>
    </div>
  );
}

export default function MapLoader(props: any) {
  const [viewMode, setViewMode] = useState<"2d" | "3d">("2d");

  return (
    <div className="space-y-4">
      {/* View Switcher */}
      <div className="flex items-center justify-between">
        <div className="flex bg-void/50 border border-border p-1 rounded-lg">
          <button
            onClick={() => setViewMode("2d")}
            className={cn(
              "flex items-center gap-2 px-4 py-1.5 rounded-md text-[10px] font-mono uppercase tracking-wider transition-all",
              viewMode === "2d" ? "bg-acid text-void font-bold shadow-[0_0_10px_#ccff0055]" : "text-zinc-500 hover:text-zinc-300"
            )}
          >
            <MapIcon className="w-3 h-3" />
            2D Tactical
          </button>
          <button
            onClick={() => setViewMode("3d")}
            className={cn(
              "flex items-center gap-2 px-4 py-1.5 rounded-md text-[10px] font-mono uppercase tracking-wider transition-all",
              viewMode === "3d" ? "bg-acid text-void font-bold shadow-[0_0_10px_#ccff0055]" : "text-zinc-500 hover:text-zinc-300"
            )}
          >
            <Box className="w-3 h-3" />
            3D Digital Twin
          </button>
        </div>

        {viewMode === "3d" && (
          <div className="flex items-center gap-4 animate-pulse">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-acid" />
              <span className="text-[9px] font-mono text-acid uppercase tracking-tighter">Google 3D Tiles Active</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
              <span className="text-[9px] font-mono text-blue-400 uppercase tracking-tighter">OpenSky Feed Live</span>
            </div>
          </div>
        )}
      </div>

      {/* Map Container */}
      <div className="relative group">
        <div className="absolute inset-0 bg-acid/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none rounded-lg" />
        {viewMode === "2d" ? (
          <TacticalMap {...props} />
        ) : (
          <DigitalTwinMap {...props} />
        )}
      </div>
    </div>
  );
}
