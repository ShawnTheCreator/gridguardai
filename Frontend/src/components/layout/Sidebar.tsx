"use client";

import React from "react";
import {
  Map,
  Activity,
  Zap,
  LayoutDashboard,
  Settings,
  FolderOpen,
  Server
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { label: "Mission Control", icon: Map, href: "/admin" },
  { label: "Live Telemetry", icon: Activity, href: "/admin/telemetry" },
  { label: "Theft Alerts", icon: Zap, href: "/admin/alerts" },
  { label: "Grid Assets", icon: Server, href: "/admin/assets" },
  { label: "System Config", icon: Settings, href: "/admin/settings" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 border-r border-border bg-surface hidden lg:flex flex-col justify-between h-full shrink-0">
      {/* Context Header */}
      <div className="p-4 border-b border-border">
        <div className="text-[10px] font-mono text-dim uppercase tracking-wider mb-2">
          Current Operation
        </div>
        <div className="flex items-center gap-2 text-sm text-text-main font-medium">
          <FolderOpen className="w-4 h-4 text-acid" />
          <span>Sector 4: Ekurhuleni</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto custom-scroll p-4 space-y-1">
        <div className="px-3 py-2 text-[10px] font-mono text-dim uppercase tracking-wider">
          Modules
        </div>
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 text-sm rounded transition-colors group",
                isActive
                  ? "bg-white/5 text-white"
                  : "text-zinc-400 hover:text-white hover:bg-white/5"
              )}
            >
              <item.icon
                className={cn(
                  "w-4 h-4 transition-colors",
                  isActive ? "text-acid" : "text-dim group-hover:text-acid"
                )}
              />
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* System Load Widget (from HTML reference) */}
      <div className="p-4 border-t border-border">
        <div className="bg-panel rounded border border-border p-3">
          <div className="flex justify-between items-center mb-1">
            <span className="text-[10px] text-zinc-400 font-mono">SERVER LOAD</span>
            <span className="text-[10px] text-white font-mono">82%</span>
          </div>
          <div className="w-full bg-zinc-800 h-1 rounded-full overflow-hidden">
            <div className="bg-acid h-full rounded-full w-[82%] shadow-[0_0_10px_rgba(204,255,0,0.3)]"></div>
          </div>
        </div>
      </div>
    </aside>
  );
}