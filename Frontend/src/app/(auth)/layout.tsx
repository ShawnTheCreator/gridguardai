"use client";

import { useRef, useEffect } from "react";
import { Zap } from "lucide-react";
import Link from "next/link";

function MiniGlobe() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctxOrNull = canvas.getContext("2d");
    if (!ctxOrNull) return;
    const ctx: CanvasRenderingContext2D = ctxOrNull;
    const W = (canvas.width = 700);
    const H = (canvas.height = 700);
    const cx = W / 2, cy = H / 2, R = 280;
    let phi = 0;
    let animId: number;
    const loop = () => {
      ctx.clearRect(0, 0, W, H);
      const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, R * 1.4);
      g.addColorStop(0, "rgba(204,255,0,0.03)");
      g.addColorStop(1, "transparent");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);
      ctx.strokeStyle = "rgba(204,255,0,0.12)";
      ctx.lineWidth = 0.8;
      for (let i = 1; i < 9; i++) {
        const lat = ((i / 9) - 0.5) * Math.PI;
        const r2 = R * Math.cos(lat);
        const oy = cy + R * Math.sin(lat);
        ctx.beginPath();
        ctx.ellipse(cx, oy, r2, r2 * 0.25, 0, 0, Math.PI * 2);
        ctx.stroke();
      }
      for (let i = 0; i < 12; i++) {
        const t = phi + (i / 12) * Math.PI;
        ctx.beginPath();
        ctx.ellipse(cx, cy, R * Math.abs(Math.cos(t)), R, 0, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(204,255,0,${0.05 + 0.07 * Math.abs(Math.sin(t))})`;
        ctx.stroke();
      }
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(204,255,0,0.15)";
      ctx.lineWidth = 1;
      ctx.stroke();
      phi += 0.003;
      animId = requestAnimationFrame(loop);
    };
    loop();
    return () => cancelAnimationFrame(animId);
  }, []);
  return <canvas ref={canvasRef} className="w-full h-full" />;
}

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen w-full bg-void flex overflow-hidden">
      {/* Left Panel - Visual */}
      <div className="hidden lg:flex lg:w-[52%] relative flex-col justify-between p-12 overflow-hidden border-r border-border">
        <div className="absolute inset-0 bg-grid-pattern opacity-20" />
        <div
          className="absolute inset-0"
          style={{ background: "radial-gradient(ellipse 70% 70% at 50% 50%, rgba(204,255,0,0.04) 0%, transparent 70%)" }}
        />
        {/* Globe */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-[700px] h-[700px] opacity-60">
            <MiniGlobe />
          </div>
        </div>

        {/* Brand */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-acid flex items-center justify-center">
            <Zap className="w-4 h-4 text-void" />
          </div>
          <Link href="/">
            <span className="font-bold tracking-tight text-white">GridGuard <span className="text-acid">AI</span></span>
          </Link>
        </div>

        {/* Headline */}
        <div className="relative z-10 flex flex-col gap-4">
          <p className="text-[10px] font-mono text-acid tracking-widest">MUNICIPAL INFRASTRUCTURE PROTECTION</p>
          <h2 className="text-4xl font-extrabold tracking-tighter text-white leading-tight">
            Surgical precision<br /><span className="text-zinc-600">for every grid.</span>
          </h2>
          {/* Stats */}
          <div className="flex gap-8 mt-4 pt-6 border-t border-border/50">
            {[
              { val: "94.01%", label: "AI Accuracy" },
              { val: "<300ms", label: "Response" },
              { val: "1,240", label: "Nodes Live" },
            ].map((s) => (
              <div key={s.label}>
                <div className="text-lg font-bold text-acid font-mono">{s.val}</div>
                <div className="text-[10px] font-mono text-dim uppercase tracking-wider">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="flex-1 flex items-center justify-center p-6 relative">
        <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none" />
        <div className="relative z-10 w-full max-w-md">
          {children}
        </div>
      </div>
    </div>
  );
}