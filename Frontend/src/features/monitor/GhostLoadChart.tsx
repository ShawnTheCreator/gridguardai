"use client";

import React, { useState, useEffect } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine
} from "recharts";

// Initial data: Balanced grid
const INITIAL_DATA = Array.from({ length: 20 }, (_, i) => ({
  time: `10:${30 + i}`,
  supply: 40 + Math.random() * 5, // Total Pole Current
  metered: 38 + Math.random() * 5, // Sum of Legal Meters
}));

export function GhostLoadChart() {
  const [data, setData] = useState(INITIAL_DATA);
  const [isTheftActive, setIsTheftActive] = useState(false);

  // Simulate Live Telemetry
  useEffect(() => {
    const interval = setInterval(() => {
      setData((currentData) => {
        const lastTime = parseInt(currentData[currentData.length - 1].time.split(':')[1]);
        const newTime = `10:${(lastTime + 1) % 60}`;
        
        // Random fluctuation
        let newMetered = 40 + Math.random() * 5;
        
        // THEFT SCENARIO: Supply spikes, Metered stays low
        // This simulates a "Hook-on" bypass invisible to smart meters
        let newSupply = newMetered + (Math.random() * 2); // Normal losses
        
        if (Math.random() > 0.8 || isTheftActive) {
          setIsTheftActive(true); // Keep theft active once triggered for a bit
          newSupply += 30; // Huge jump in pole current (Ghost Load)
          if (Math.random() > 0.9) setIsTheftActive(false); // Randomly stop
        }

        const newDataPoint = {
          time: newTime,
          supply: newSupply,
          metered: newMetered
        };

        return [...currentData.slice(1), newDataPoint];
      });
    }, 1000); // 1-second tick

    return () => clearInterval(interval);
  }, [isTheftActive]);

  return (
    <div className="w-full h-75 bg-surface border border-border rounded-lg p-4 relative overflow-hidden">
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xs font-bold font-mono text-zinc-400 uppercase tracking-widest">
            Real-Time Energy Balancing
          </h3>
          <p className="text-[10px] text-zinc-600 font-mono">
            {"$I_{pole}$ vs $\\Sigma I_{meters}$"}
          </p>
        </div>
        <div className="flex gap-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-danger animate-pulse" />
            <span className="text-[10px] font-mono text-danger">Ghost Load (Theft)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-acid" />
            <span className="text-[10px] font-mono text-acid">Legitimate Load</span>
          </div>
        </div>
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height="85%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorSupply" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ff453a" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#ff453a" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorMetered" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ccff00" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#ccff00" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
          <XAxis 
            dataKey="time" 
            stroke="#525252" 
            fontSize={10} 
            tickLine={false}
            axisLine={false}
          />
          <YAxis 
            stroke="#525252" 
            fontSize={10} 
            tickLine={false} 
            axisLine={false}
            unit="A"
          />
          <Tooltip 
            contentStyle={{ backgroundColor: '#111', borderColor: '#333', fontSize: '12px' }}
            itemStyle={{ fontFamily: 'monospace' }}
          />
          
          {/* Layer 1: The Total Supply (Red) - Drawn first (behind) */}
          <Area 
            type="monotone" 
            dataKey="supply" 
            stroke="#ff453a" 
            strokeWidth={2}
            fillOpacity={1} 
            fill="url(#colorSupply)" 
            isAnimationActive={false}
          />

          {/* Layer 2: The Metered Sum (Green) - Drawn second (on top) */}
          {/* In a real scenario, this would overlap the red, showing the 'gap' as the red area sticking out */}
          <Area 
            type="monotone" 
            dataKey="metered" 
            stroke="#ccff00" 
            strokeWidth={2}
            fillOpacity={1} 
            fill="url(#colorMetered)" 
            isAnimationActive={false}
          />
          
          {isTheftActive && (
            <ReferenceLine x={data[data.length - 2].time} stroke="white" strokeDasharray="3 3" />
          )}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}