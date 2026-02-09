"use client";

import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Cell
} from "recharts";

const DATA = [
  { name: 'Fund', val: 100 }, // Fundamental Frequency (50Hz)
  { name: '3rd', val: 12 },   // 3rd Harmonic (Distortion)
  { name: '5th', val: 28 },   // 5th Harmonic (HIGH - Suspicious)
  { name: '7th', val: 8 },
  { name: '9th', val: 5 },
  { name: '11th', val: 2 },
];

export function HarmonicChart() {
  return (
    <div className="w-full h-87.5 bg-surface border border-border rounded-lg p-6 relative">
      <div className="flex justify-between items-start mb-6">
        <div>
            <h3 className="text-xs font-bold font-mono text-zinc-400 uppercase tracking-widest">
                Harmonic Distortion Analysis (THD)
            </h3>
            <p className="text-[10px] text-zinc-600 font-mono mt-1">
                FFT Signature: Pole TR-03
            </p>
        </div>
        <div className="text-right">
            <div className="text-2xl font-bold text-warning font-mono">18.4%</div>
            <div className="text-[9px] text-zinc-500 uppercase tracking-widest">Total Distortion</div>
        </div>
      </div>

      <ResponsiveContainer width="100%" height="80%">
        <BarChart data={DATA}>
          <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
          <XAxis 
            dataKey="name" 
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
          />
          <Tooltip 
            cursor={{fill: '#1a1a1a'}}
            contentStyle={{ backgroundColor: '#000', borderColor: '#333', color: '#fff' }}
            itemStyle={{ fontFamily: 'monospace' }}
          />
          <ReferenceLine y={15} stroke="#ff453a" strokeDasharray="3 3" label={{ position: 'top', value: 'IEC LIMIT', fill: '#ff453a', fontSize: 9 }} />
          <Bar dataKey="val" radius={[2, 2, 0, 0]}>
            {DATA.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={entry.val > 15 && index !== 0 ? '#ff453a' : '#222'} 
                stroke={entry.val > 15 && index !== 0 ? '#ff453a' : '#ccff00'}
                strokeWidth={1}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}