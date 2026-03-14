"use client";

import React, { useEffect, useRef } from "react";
// import { Ion, Viewer, createGooglePhotorealistic3DTileset } from "resium";

/**
 * CONFIGURATION (FOR DEMO/PRODUCTION)
 * 
 * 1. CESIUM_ION_TOKEN: Get from https://cesium.com/ion/
 * 2. GOOGLE_MAPS_API_KEY: Get from https://console.cloud.google.com/ (Maps Platform)
 * 3. OPENSKY_CREDENTIALS: (Optional) Register at https://opensky-network.org
 */
const CONFIG = {
  CESIUM_ION_TOKEN: process.env.NEXT_PUBLIC_CESIUM_ION_TOKEN || "YOUR_CESIUM_ION_TOKEN",
  GOOGLE_MAPS_API_KEY: process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY,
  OPENSKY_CLIENT_ID: process.env.NEXT_PUBLIC_OPENSKY_CLIENT_ID,
  OPENSKY_CLIENT_SECRET: process.env.NEXT_PUBLIC_OPENSKY_CLIENT_SECRET,
  ADSB_EXCHANGE_KEY: process.env.NEXT_PUBLIC_ADSB_EXCHANGE_KEY,
};

/**
 * DIGITAL TWIN MAP (CONCEPTUAL)
 */ 


export default function DigitalTwinMap() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // 1. Initialise Cesium Viewer
    // const viewer = new Viewer(containerRef.current, {
    //   terrainProvider: await createWorldTerrainAsync(),
    //   baseLayerPicker: false,
    // });

    // 2. Load Google Photorealistic 3D Tileset
    // const tileset = await createGooglePhotorealistic3DTileset();
    // viewer.scene.primitives.add(tileset);

    // 3. Track Drone / Flight Assets (OpenSky / ADS-B Exchange)
    // const drone = viewer.entities.add({
    //   position: Cartesian3.fromDegrees(28.23, -26.17, 150), // Lat, Lng, Altitude
    //   model: { uri: "/models/drone.glb" },
    //   label: { text: "INSPECTION DRONE #01" }
    // });

    // 4. Highlight Grid Assets (Poles/Transformers)
    // viewer.entities.add({
    //   position: Cartesian3.fromDegrees(28.23, -26.17),
    //   point: { pixelSize: 10, color: Color.LIME },
    //   label: { text: "POLE TR-01", font: "12px monospace" }
    // });

  }, []);

  return (
    <div className="relative w-full h-200 bg-black rounded-xl overflow-hidden border border-border">
      <div ref={containerRef} className="w-full h-full" />
      
      {/* HUD Overlay */}
      <div className="absolute top-6 left-6 z-10 space-y-4">
        <div className="bg-void/80 backdrop-blur-md border border-acid/20 p-4 rounded-lg">
          <div className="text-[10px] font-mono text-acid uppercase tracking-widest mb-1">
            Visual Mode: Digital Twin
          </div>
          <div className="text-xl font-bold text-white uppercase">
            3D Infrastructure View
          </div>
        </div>

        {/* Real-time Flight Feed (OpenSky Integration) */}
        <div className="bg-void/80 backdrop-blur-md border border-border p-4 rounded-lg w-64">
          <div className="text-[10px] font-mono text-zinc-500 uppercase mb-2">
            Nearby Air Traffic (OpenSky API)
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs font-mono">
              <span className="text-white">ZA-DRONE-04</span>
              <span className="text-acid">150m AGL</span>
            </div>
            <div className="flex justify-between items-center text-xs font-mono">
              <span className="text-zinc-500">SAA-102 (Boeing)</span>
              <span className="text-zinc-600">3500m</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
