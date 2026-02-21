"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, Lock, ChevronRight, AlertTriangle } from "lucide-react";
import Link from "next/link"; // For the hackathon demo flow
import { apiLogin } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);

    const form = e.target as HTMLFormElement;
    const email = (form.elements.namedItem("email") as HTMLInputElement)?.value || "";
    const password = (form.elements.namedItem("password") as HTMLInputElement)?.value || "";

    try {
      const result = await apiLogin(email, password);
      if (result?.token) {
        localStorage.setItem("gridguard_token", result.token);
        localStorage.setItem("gridguard_user", JSON.stringify(result.user));
        router.push("/");
        return;
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Invalid credentials. Access denied.");
      setIsLoading(false);
    }
  };


  return (
    <div className="space-y-8">
      {/* Brand Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-zinc-400 mb-4">
          <div className="w-2 h-2 rounded-full bg-acid animate-pulse" />
          SYSTEM ONLINE: SECURE_GATEWAY_V2
        </div>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tighter text-white font-sans">
          GridGuard <span className="text-zinc-600">AI</span>
        </h1>
        <p className="text-zinc-500 font-mono text-sm">
          Municipal Infrastructure Protection Unit
        </p>
      </div>

      {/* Login Card */}
      <div className="bg-surface border border-border p-8 rounded-lg shadow-2xl relative group">
        {/* Decorative corner markers */}
        <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-acid" />
        <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-acid" />
        <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-acid" />
        <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-acid" />

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] uppercase font-mono tracking-widest text-dim">
              Operator ID
            </label>
            <div className="relative">
              <input
                type="text"
                name="email"
                placeholder="OP-XXXX"
                className="w-full bg-panel border border-border rounded p-3 pl-10 text-sm font-mono text-white focus:outline-none focus:border-acid focus:ring-1 focus:ring-acid transition-all placeholder:text-zinc-700"
                required
              />
              <ShieldCheck className="w-4 h-4 text-zinc-500 absolute left-3 top-3.5" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] uppercase font-mono tracking-widest text-dim">
              Access Key
            </label>
            <div className="relative">
              <input
                type="password"
                name="password"
                placeholder="••••••••••••"
                className="w-full bg-panel border border-border rounded p-3 pl-10 text-sm font-mono text-white focus:outline-none focus:border-acid focus:ring-1 focus:ring-acid transition-all placeholder:text-zinc-700"
                required
              />
              <Lock className="w-4 h-4 text-zinc-500 absolute left-3 top-3.5" />
            </div>
          </div>

          {errorMsg && (
            <div className="p-3 rounded bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-mono text-center">
              {errorMsg}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-acid text-black font-bold uppercase tracking-widest py-3 rounded hover:bg-white transition-colors flex items-center justify-center gap-2 group/btn"
          >
            {isLoading ? (
              <span className="font-mono animate-pulse">AUTHENTICATING...</span>
            ) : (
              <>
                Initiate Session
                <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>
      </div>

      {/* Legal Footer */}
      <div className="text-center space-y-4">
        <div className="flex items-start justify-center gap-2 text-[10px] text-zinc-600 font-mono max-w-xs mx-auto text-left">
          <AlertTriangle className="w-3 h-3 text-danger shrink-0 mt-0.5" />
          <p>
            WARNING: Unauthorized access to this system is a criminal offense under the
            Cybercrimes Act 19 of 2020. All IP addresses are logged and geolocated.
          </p>
        </div>
      </div>
    </div>
  );
}