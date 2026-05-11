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
          <h1 className="text-3xl font-bold tracking-tight mb-2 font-sans text-black flex items-center gap-3">
            <Server className="text-gray-600 w-8 h-8" />
            Grid Assets
          </h1>
          <p className="text-gray-700 font-mono text-sm">
            Infrastructure inventory and operational status.
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-gray-900 hover:bg-gray-800 rounded text-xs text-white font-mono uppercase transition-colors">
          <Download className="w-3 h-3" /> Export CSV
        </button>
      </div>

      {/* Data Table */}
      <div className="border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 border-b border-gray-200 text-[10px] uppercase font-mono text-black tracking-wider">
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
          <tbody className="divide-y divide-gray-100">
            {assets.map((asset) => (
              <tr key={asset.id} className="group hover:bg-gray-50 transition-colors font-mono text-xs">
                <td className="px-6 py-4 text-black font-bold">{asset.id}</td>
                <td className="px-6 py-4 text-gray-700">{asset.type}</td>
                <td className="px-6 py-4 text-gray-700">{asset.location}</td>
                <td className="px-6 py-4 text-gray-700">
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-1 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${asset.load > 90 ? 'bg-red-600' : asset.load > 70 ? 'bg-yellow-600' : 'bg-green-600'}`}
                        style={{ width: `${asset.load}%` }}
                      />
                    </div>
                    {asset.load}%
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`
                    px-2 py-0.5 rounded text-[10px] uppercase border
                    ${asset.status === 'healthy' ? 'bg-green-100 text-green-700 border-green-200' : ''}
                    ${asset.status === 'warning' ? 'bg-yellow-100 text-yellow-700 border-yellow-200' : ''}
                    ${asset.status === 'critical' ? 'bg-red-100 text-red-700 border-red-200' : ''}
                    ${asset.status === 'offline' ? 'bg-gray-100 text-gray-600 border-gray-200' : ''}
                  `}>
                    {asset.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-700">{asset.lastInspection}</td>
                <td className="px-6 py-4 text-right">
                  <button className="p-1 hover:bg-gray-100 rounded text-gray-700 hover:text-black transition-colors">
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