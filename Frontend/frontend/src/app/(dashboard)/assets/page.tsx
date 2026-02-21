"use client";

import React, { useState, useEffect } from "react";
import { MOCK_ASSETS, type Asset } from "@/lib/data";
import { Server, MoreHorizontal, Download } from "lucide-react";
import { apiGetAssets } from "@/lib/api";

export default function AssetsPage() {
  const [assets, setAssets] = useState(MOCK_ASSETS);

  useEffect(() => {
    (async () => {
      try {
        const data = await apiGetAssets();
        if (data && data.length > 0) {
          setAssets(data.map(a => ({
            id: a.id,
            type: a.type as Asset["type"],
            location: a.location,
            status: a.status as Asset["status"],
            load: a.load,
            lastInspection: new Date(a.lastInspection).toLocaleDateString(),
          })));
        }
      } catch {
        // API unavailable — keep mock data
      }
    })();
  }, []);

  return (
    <div className="p-6 md:p-12 space-y-8">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2 font-sans text-white uppercase flex items-center gap-3">
            <Server className="text-acid w-8 h-8" />
            Grid Assets
          </h1>
          <p className="text-zinc-500 font-mono text-sm">
            Infrastructure inventory and operational status.
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded text-xs text-white font-mono uppercase transition-colors">
          <Download className="w-3 h-3" /> Export CSV
        </button>
      </div>

      {/* Data Table */}
      <div className="border border-border rounded-lg overflow-hidden bg-surface">
        <table className="w-full text-left text-sm">
          <thead className="bg-panel border-b border-border text-[10px] uppercase font-mono text-zinc-500 tracking-wider">
            <tr>
              <th className="px-6 py-4 font-medium">Asset ID</th>
              <th className="px-6 py-4 font-medium">Type</th>
              <th className="px-6 py-4 font-medium">Location</th>
              <th className="px-6 py-4 font-medium">Load Capacity</th>
              <th className="px-6 py-4 font-medium">Status</th>
              <th className="px-6 py-4 font-medium">Last Inspection</th>
              <th className="px-6 py-4 font-medium text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {assets.map((asset) => (
              <tr key={asset.id} className="group hover:bg-white/5 transition-colors font-mono text-xs">
                <td className="px-6 py-4 text-white font-bold">{asset.id}</td>
                <td className="px-6 py-4 text-zinc-400">{asset.type}</td>
                <td className="px-6 py-4 text-zinc-400">{asset.location}</td>
                <td className="px-6 py-4 text-zinc-300">
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-1 bg-black rounded-full overflow-hidden">
                      <div
                        className={`h-full ${asset.load > 90 ? 'bg-danger' : asset.load > 70 ? 'bg-warning' : 'bg-success'}`}
                        style={{ width: `${asset.load}%` }}
                      />
                    </div>
                    {asset.load}%
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`
                    px-2 py-0.5 rounded text-[10px] uppercase border
                    ${asset.status === 'healthy' ? 'bg-success/10 text-success border-success/20' : ''}
                    ${asset.status === 'warning' ? 'bg-warning/10 text-warning border-warning/20' : ''}
                    ${asset.status === 'critical' ? 'bg-danger/10 text-danger border-danger/20 animate-pulse' : ''}
                    ${asset.status === 'offline' ? 'bg-zinc-800 text-zinc-400 border-zinc-700' : ''}
                  `}>
                    {asset.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-zinc-500">{asset.lastInspection}</td>
                <td className="px-6 py-4 text-right">
                  <button className="p-1 hover:bg-white/10 rounded text-zinc-500 hover:text-white transition-colors">
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}