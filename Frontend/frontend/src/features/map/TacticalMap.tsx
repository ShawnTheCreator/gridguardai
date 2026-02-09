"use client";

import React, { useEffect } from "react";
import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Mock data for transformer poles in a municipal sector
const GRID_NODES = [
  { id: "TR-01", lat: -26.17, lng: 28.23, status: "healthy", load: 45 },
  { id: "TR-02", lat: -26.18, lng: 28.24, status: "warning", load: 88 },
  { id: "TR-03", lat: -26.16, lng: 28.22, status: "active_theft", load: 120 },
  { id: "TR-04", lat: -26.19, lng: 28.25, status: "healthy", load: 30 },
];

const STATUS_COLORS = {
  healthy: "#00cc66",     // Success Green
  warning: "#ffaa00",     // Warning Amber
  active_theft: "#ff3300" // Danger Red
};

export default function TacticalMap() {
  // Fix for default Leaflet icons in Next.js
  useEffect(() => {
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
      iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
      shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
    });
  }, []);

  return (
    <div className="w-full h-150 border border-border rounded-lg overflow-hidden relative group">
      {/* Tactical Overlay Legend */}
      <div className="absolute top-4 right-4 z-1000 bg-surface/90 backdrop-blur-md border border-border p-3 rounded font-mono text-[10px] space-y-2">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
          <span className="text-zinc-400 uppercase tracking-tighter">Healthy Grid</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-warning" />
          <span className="text-zinc-400 uppercase tracking-tighter">Thermal Stress</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-danger shadow-[0_0_8px_#ff3300]" />
          <span className="text-white font-bold uppercase tracking-tighter">Active Bypass</span>
        </div>
      </div>

      <MapContainer
        center={[-26.17, 28.23]}
        zoom={13}
        className="w-full h-full grayscale-[0.8] contrast-[1.2] invert-[0.9] hue-rotate-180"
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {GRID_NODES.map((node) => (
          <CircleMarker
            key={node.id}
            center={[node.lat, node.lng]}
            radius={8}
            pathOptions={{
              fillColor: STATUS_COLORS[node.status as keyof typeof STATUS_COLORS],
              fillOpacity: 0.8,
              color: node.status === 'active_theft' ? '#fff' : 'transparent',
              weight: 2,
            }}
          >
            <Popup className="tactical-popup">
              <div className="font-mono text-xs">
                <div className="font-bold border-b border-zinc-200 pb-1 mb-1">ASSET: {node.id}</div>
                <div>Status: <span className="uppercase">{node.status.replace('_', ' ')}</span></div>
                <div>Current Load: {node.load}%</div>
              </div>
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  );
}