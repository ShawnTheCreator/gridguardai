"use client";

import React, { useState, useRef, useEffect } from "react";
import { Bell, Search, User, LogOut, Menu, X, Palette } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { MOCK_ASSETS } from "@/lib/data"; // Ensure you have created lib/data.ts
import { useToast } from "@/components/ui/Toast";

export function Header() {
  const router = useRouter();
  const { showToast } = useToast();

  // States
  const [searchQuery, setSearchQuery] = useState("");
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isThemeMenuOpen, setIsThemeMenuOpen] = useState(false);
  const [searchResults, setSearchResults] = useState<typeof MOCK_ASSETS>([]);

  const themes = [
    { id: "acid", label: "Tactical (Acid)", color: "bg-[#ccff00]" },
    { id: "security", label: "Alert (Crimson)", color: "bg-[#ff3e3e]" },
    { id: "satellite", label: "Satellite (Cyan)", color: "bg-[#00f2ff]" },
  ];

  const handleThemeChange = (id: string) => {
    showToast(`Visual override: ${id.toUpperCase()} protocol enabled`, "info");
    setIsThemeMenuOpen(false);
    // In a real implementation, this would update a CSS variable or context
  };

  // Search Logic
  useEffect(() => {
    if (searchQuery.length > 0) {
      const results = MOCK_ASSETS.filter(asset =>
        asset.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        asset.location.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 5);
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  const handleLogout = () => {
    localStorage.removeItem("gridguard_token");
    localStorage.removeItem("gridguard_user");
    showToast("Session Terminated", "info");
    setTimeout(() => router.push("/login"), 1000);
  };

  const handleAssetClick = (id: string) => {
    setSearchQuery(""); // Clear search
    showToast(`Navigating to Asset ${id}...`, "info");
    // In a real app, router.push(`/assets/${id}`);
  };

  return (
    <header className="w-full h-14 bg-surface border-b border-border flex items-center justify-between px-4 sm:px-6 relative z-50 shrink-0">

      {/* Brand / Left */}
      <div className="flex items-center gap-4">
        <Link href="/" className="flex items-center gap-2 group cursor-pointer">
          <div className="w-5 h-5 bg-acid rounded-sm group-hover:bg-white transition-colors shadow-[0_0_8px_rgba(204,255,0,0.4)]"></div>
          <h1 className="font-bold tracking-tight text-white text-sm uppercase">
            GridGuard <span className="text-zinc-500 font-normal">AI</span>
          </h1>
        </Link>
      </div>

      {/* Center Search - Functional */}
      <div className="hidden lg:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <div className="relative group w-96">
          <input
            type="text"
            placeholder="Search asset ID (e.g. TR-03)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-panel border border-border rounded-md py-1.5 pl-9 pr-24 text-xs text-zinc-300 focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 w-full transition-all placeholder:text-zinc-600 font-mono"
          />
          <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2 group-focus-within:text-white transition-colors" />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
            <span className="text-[10px] text-zinc-600 font-mono border border-zinc-800 rounded px-1.5 py-0.5">
              CTRL K
            </span>
          </div>

          {/* Search Results Dropdown */}
          {searchQuery && (
            <div className="absolute top-full left-0 w-full mt-2 bg-surface border border-border rounded shadow-xl overflow-hidden z-100">
              {searchResults.length > 0 ? (
                searchResults.map(asset => (
                  <div
                    key={asset.id}
                    onClick={() => handleAssetClick(asset.id)}
                    className="px-4 py-2 hover:bg-white/5 cursor-pointer border-b border-white/5 last:border-0"
                  >
                    <div className="text-xs text-white font-bold font-mono">{asset.id}</div>
                    <div className="text-[10px] text-zinc-500 uppercase">{asset.type} • {asset.location}</div>
                  </div>
                ))
              ) : (
                <div className="p-4 text-xs text-zinc-500 text-center font-mono">No assets found matching query.</div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-3">

        {/* Theme Switcher */}
        <div className="relative">
          <button
            onClick={() => { setIsThemeMenuOpen(!isThemeMenuOpen); setIsNotifOpen(false); setIsUserMenuOpen(false); }}
            className="w-8 h-8 flex items-center justify-center rounded hover:bg-white/5 text-zinc-400 hover:text-white transition-colors"
            title="UI Theme Override"
          >
            <Palette className="w-4 h-4" />
          </button>

          {isThemeMenuOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setIsThemeMenuOpen(false)}></div>
              <div className="absolute right-0 top-full mt-2 w-48 bg-surface border border-border rounded shadow-xl z-50 py-1 animate-in fade-in zoom-in-95 duration-200">
                <div className="px-4 py-2 border-b border-white/5">
                  <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Theme Protocol</span>
                </div>
                {themes.map((theme) => (
                  <button
                    key={theme.id}
                    onClick={() => handleThemeChange(theme.id)}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-xs text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
                  >
                    <div className={`w-2 h-2 rounded-full ${theme.color}`} />
                    {theme.label}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        <div className="h-5 w-px bg-border mx-1"></div>

        {/* Notifications Dropdown */}
        <div className="relative">
          <button
            onClick={() => { setIsNotifOpen(!isNotifOpen); setIsUserMenuOpen(false); }}
            className="w-8 h-8 flex items-center justify-center rounded hover:bg-white/5 text-zinc-400 hover:text-white transition-colors relative"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-acid rounded-full border border-surface"></span>
          </button>

          {isNotifOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setIsNotifOpen(false)}></div>
              <div className="absolute right-0 top-full mt-2 w-72 bg-surface border border-border rounded shadow-xl z-50 py-1 animate-in fade-in zoom-in-95 duration-200">
                <div className="px-4 py-2 border-b border-white/5 flex justify-between items-center">
                  <span className="text-[10px] font-mono text-zinc-500 uppercase">System Alerts</span>
                  <span className="text-[10px] text-acid cursor-pointer hover:underline">Mark all read</span>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  <div className="px-4 py-3 border-b border-white/5 hover:bg-white/5 cursor-pointer group">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-1.5 h-1.5 bg-danger rounded-full animate-pulse"></div>
                      <div className="text-xs text-white font-bold group-hover:text-acid transition-colors">TR-03 Critical Thermal</div>
                    </div>
                    <div className="text-[10px] text-zinc-500 font-mono">Core temp exceeded 85°C. Auto-isolation queued.</div>
                    <div className="text-[9px] text-zinc-600 mt-1">2 mins ago</div>
                  </div>
                  <div className="px-4 py-3 hover:bg-white/5 cursor-pointer group">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-1.5 h-1.5 bg-success rounded-full"></div>
                      <div className="text-xs text-white font-bold group-hover:text-acid transition-colors">Backup Complete</div>
                    </div>
                    <div className="text-[10px] text-zinc-500 font-mono">Daily encrypted snapshot synced to cloud.</div>
                    <div className="text-[9px] text-zinc-600 mt-1">1 hour ago</div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        <div className="h-5 w-px bg-border mx-1"></div>

        {/* User Menu Dropdown */}
        <div className="relative">
          <button
            onClick={() => { setIsUserMenuOpen(!isUserMenuOpen); setIsNotifOpen(false); }}
            className="flex items-center gap-2 pl-1 cursor-pointer hover:opacity-80 transition-opacity"
          >
            <div className="w-6 h-6 rounded-full bg-linear-to-tr from-zinc-700 to-zinc-600 border border-zinc-500 flex items-center justify-center text-[10px] font-bold text-white shadow-lg">
              OP
            </div>
          </button>

          {isUserMenuOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setIsUserMenuOpen(false)}></div>
              <div className="absolute right-0 top-full mt-2 w-56 bg-surface border border-border rounded shadow-xl z-50 py-1 animate-in fade-in zoom-in-95 duration-200">
                <div className="px-4 py-3 border-b border-white/5 bg-zinc-900/50">
                  <div className="text-xs text-white font-bold">Operator 42</div>
                  <div className="text-[10px] text-zinc-500 font-mono">Session ID: 882X-9</div>
                </div>
                <Link
                  href="/admin/profile"
                  onClick={() => setIsUserMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-xs text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
                >
                  <User className="w-3.5 h-3.5" /> My Profile
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-xs text-danger hover:bg-danger/10 text-left transition-colors border-t border-white/5"
                >
                  <LogOut className="w-3.5 h-3.5" /> Terminate Session
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}