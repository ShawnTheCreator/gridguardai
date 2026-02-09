import React from "react";
import { Bell, Search, ChevronDown, HelpCircle } from "lucide-react";

export function Header() {
  return (
    <header className="w-full h-14 bg-surface border-b border-border flex items-center justify-between px-4 sm:px-6 relative z-50 shrink-0">
      {/* Brand / Left */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 group cursor-pointer">
          {/* The Acid Square Logo */}
          <div className="w-5 h-5 bg-acid rounded-sm group-hover:bg-white transition-colors shadow-[0_0_8px_rgba(204,255,0,0.4)]"></div>
          <h1 className="font-bold tracking-tight text-white text-sm uppercase">
            GridGuard <span className="text-zinc-500 font-normal">AI</span>
          </h1>
        </div>

        {/* Divider */}
        <div className="hidden md:flex items-center">
          <span className="text-border mx-2 text-xl font-thin">/</span>
          <div className="flex items-center gap-2 px-2 py-1 rounded hover:bg-white/5 transition-colors cursor-pointer">
            <span className="text-xs text-zinc-400 font-mono">Mission Control</span>
            <ChevronDown className="w-3 h-3 text-zinc-500" />
          </div>
        </div>
      </div>

      {/* Center Search (Visual Only) */}
      <div className="hidden lg:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <div className="relative group">
          <input
            type="text"
            placeholder="Search asset ID (e.g. TR-404)..."
            className="bg-panel border border-border rounded-md py-1.5 pl-9 pr-24 text-xs text-zinc-300 focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 w-80 transition-all placeholder:text-zinc-600 font-mono"
          />
          <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2 group-focus-within:text-white transition-colors" />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
            <span className="text-[10px] text-zinc-600 font-mono border border-zinc-800 rounded px-1.5 py-0.5">
              CTRL K
            </span>
          </div>
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-3">
        <button className="w-8 h-8 flex items-center justify-center rounded hover:bg-white/5 text-zinc-400 hover:text-white transition-colors relative">
          <Bell className="w-4 h-4" />
          <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-acid rounded-full border border-surface"></span>
        </button>
        <button className="w-8 h-8 flex items-center justify-center rounded hover:bg-white/5 text-zinc-400 hover:text-white transition-colors">
          <HelpCircle className="w-4 h-4" />
        </button>
        <div className="h-5 w-px bg-border mx-1"></div>
        <div className="flex items-center gap-2 pl-1 cursor-pointer hover:opacity-80 transition-opacity">
          <div className="w-6 h-6 rounded-full bg-linear-to-tr from-zinc-700 to-zinc-600 border border-zinc-500"></div>
        </div>
      </div>
    </header>
  );
}