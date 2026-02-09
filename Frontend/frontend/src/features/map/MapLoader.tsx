"use client";

import dynamic from "next/dynamic";

// This tells Next.js NOT to render the map on the server
const TacticalMap = dynamic(() => import("./TacticalMap"), { 
  ssr: false,
  loading: () => (
    <div className="w-full h-150 bg-panel border border-border rounded-lg flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-2 border-acid/20 border-t-acid rounded-full animate-spin" />
        <span className="text-[10px] font-mono text-dim uppercase tracking-widest">Initialising Grid Nodes...</span>
      </div>
    </div>
  )
});

export default TacticalMap;