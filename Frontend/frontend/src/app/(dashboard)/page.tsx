import MapLoader from "@/features/map/MapLoader";

export default function DashboardPage() {
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
        <MapLoader />
      </div>

      {/* Analytics Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="border border-border bg-surface/50 p-4 rounded">
            <div className="text-[10px] font-mono text-dim uppercase mb-1">AI Theft Confidence</div>
            <div className="text-2xl font-bold text-acid">94.01%</div>
            <div className="text-[9px] text-zinc-600 mt-2">Based on CNN-XGBoost signature matching [cite: 71]</div>
        </div>
        <div className="border border-border bg-surface/50 p-4 rounded">
            <div className="text-[10px] font-mono text-dim uppercase mb-1">Thermal Overload Risk</div>
            <div className="text-2xl font-bold text-warning">Medium</div>
            <div className="text-[9px] text-zinc-600 mt-2">3 Transformers at 85%+ capacity [cite: 99]</div>
        </div>
        <div className="md:col-span-2 border border-border bg-surface/50 p-4 rounded flex items-center justify-between">
            <div>
                <div className="text-[10px] font-mono text-dim uppercase mb-1">Auto-Isolation Status</div>
                <div className="text-sm font-bold text-white uppercase">Ready / Armed</div>
            </div>
            <button className="px-4 py-2 bg-acid text-black font-bold text-xs uppercase hover:bg-white transition-colors">
                Emergency Manual Override
            </button>
        </div>
      </div>
    </div>
  );
}