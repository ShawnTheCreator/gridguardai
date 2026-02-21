"use client";

import { useRef, useEffect } from "react";
import Link from "next/link";
import { motion, useInView } from "framer-motion";
import {
    Zap,
    Shield,
    Cloud,
    ArrowRight,
    Activity,
    ChevronRight,
    Cpu,
} from "lucide-react";

// ── Animated Electric Globe ──────────────────────────────────────────────────
function ElectricGlobe() {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctxOrNull = canvas.getContext("2d");
        if (!ctxOrNull) return;
        const ctx: CanvasRenderingContext2D = ctxOrNull;

        const W = (canvas.width = 560);
        const H = (canvas.height = 560);
        const cx = W / 2;
        const cy = H / 2;
        const R = 180;

        /* ── Latitude/Longitude grid lines ── */
        const latLines = 10;
        const lngLines = 14;
        let phi = 0;      // rotation angle

        /* ── Lightning bolts ── */
        interface Bolt {
            dx: number; dy: number;
            life: number; maxLife: number;
            x0: number; y0: number;
            segs: { x: number; y: number }[];
        }
        const bolts: Bolt[] = [];

        function fireBolt() {
            const theta = Math.random() * Math.PI * 2;
            const lat = (Math.random() - 0.5) * Math.PI;
            const x0 = cx + R * Math.cos(lat) * Math.cos(theta);
            const y0 = cy + R * Math.cos(lat) * Math.sin(theta);
            const length = 40 + Math.random() * 60;
            const angle = Math.random() * Math.PI * 2;
            const segs: { x: number; y: number }[] = [{ x: x0, y: y0 }];
            let px = x0, py = y0;
            for (let i = 0; i < 6; i++) {
                px += Math.cos(angle + (Math.random() - 0.5)) * (length / 6);
                py += Math.sin(angle + (Math.random() - 0.5)) * (length / 6);
                segs.push({ x: px, y: py });
            }
            bolts.push({ dx: Math.cos(theta), dy: Math.sin(theta), life: 0, maxLife: 18, x0, y0, segs });
        }

        let boltTimer = 0;

        function draw() {
            ctx.clearRect(0, 0, W, H);

            // Globe ambient glow
            const grd = ctx.createRadialGradient(cx, cy, R * 0.1, cx, cy, R * 1.6);
            grd.addColorStop(0, "rgba(204,255,0,0.05)");
            grd.addColorStop(0.5, "rgba(204,255,0,0.02)");
            grd.addColorStop(1, "transparent");
            ctx.fillStyle = grd;
            ctx.fillRect(0, 0, W, H);

            // Outer pulse ring
            ctx.beginPath();
            ctx.arc(cx, cy, R + 10, 0, Math.PI * 2);
            ctx.strokeStyle = "rgba(204,255,0,0.08)";
            ctx.lineWidth = 1;
            ctx.stroke();

            ctx.beginPath();
            ctx.arc(cx, cy, R + 22, 0, Math.PI * 2);
            ctx.strokeStyle = "rgba(204,255,0,0.04)";
            ctx.lineWidth = 1;
            ctx.stroke();

            // Main sphere circle
            ctx.beginPath();
            ctx.arc(cx, cy, R, 0, Math.PI * 2);
            ctx.strokeStyle = "rgba(204,255,0,0.25)";
            ctx.lineWidth = 1.2;
            ctx.stroke();

            // Latitude lines
            ctx.save();
            ctx.beginPath();
            ctx.arc(cx, cy, R, 0, Math.PI * 2);
            ctx.clip();

            ctx.strokeStyle = "rgba(204,255,0,0.12)";
            ctx.lineWidth = 0.7;
            for (let i = 1; i < latLines; i++) {
                const lat = ((i / latLines) - 0.5) * Math.PI;
                const r2 = R * Math.cos(lat);
                const oy = cy + R * Math.sin(lat);
                ctx.beginPath();
                ctx.ellipse(cx, oy, r2, r2 * 0.28, 0, 0, Math.PI * 2);
                ctx.stroke();
            }

            // Longitude lines (rotating)
            for (let i = 0; i < lngLines; i++) {
                const theta = phi + (i / lngLines) * Math.PI;
                ctx.beginPath();
                ctx.ellipse(cx, cy, R * Math.abs(Math.cos(theta)), R, 0, 0, Math.PI * 2);
                const alpha = 0.08 + 0.1 * Math.abs(Math.sin(theta));
                ctx.strokeStyle = `rgba(204,255,0,${alpha})`;
                ctx.lineWidth = 0.7;
                ctx.stroke();
            }
            ctx.restore();

            // Equator line brighter
            ctx.save();
            ctx.beginPath();
            ctx.arc(cx, cy, R, 0, Math.PI * 2);
            ctx.clip();
            ctx.beginPath();
            ctx.ellipse(cx, cy, R, R * 0.28, 0, 0, Math.PI * 2);
            ctx.strokeStyle = "rgba(204,255,0,0.3)";
            ctx.lineWidth = 1;
            ctx.stroke();
            ctx.restore();

            // Node dots on globe surface
            const nodePositions = [
                [0.3, 1.1], [1.0, 2.4], [2.1, 0.8], [3.5, 1.9],
                [4.2, 0.5], [5.0, 2.1], [0.8, 3.8], [2.8, 3.2],
            ];
            for (const [theta, lat] of nodePositions) {
                const t = theta + phi;
                const l = lat - 2;
                const nx = cx + R * Math.cos(l) * Math.cos(t);
                const ny = cy + R * Math.cos(l) * Math.sin(t) * 0.4 + R * Math.sin(l);
                if (Math.cos(t) > 0) {
                    ctx.beginPath();
                    ctx.arc(nx, ny, 2.5, 0, Math.PI * 2);
                    ctx.fillStyle = "rgba(204,255,0,0.9)";
                    ctx.fill();
                    // Pulse ring
                    const pulse = (Date.now() % 1800) / 1800;
                    ctx.beginPath();
                    ctx.arc(nx, ny, 2.5 + pulse * 10, 0, Math.PI * 2);
                    ctx.strokeStyle = `rgba(204,255,0,${0.4 - pulse * 0.4})`;
                    ctx.lineWidth = 1;
                    ctx.stroke();
                }
            }

            // Lightning bolts
            bolts.forEach((bolt) => {
                const progress = bolt.life / bolt.maxLife;
                const alpha = Math.sin(progress * Math.PI) * 0.9;
                if (alpha < 0.01) return;
                ctx.save();
                ctx.beginPath();
                bolt.segs.forEach((s, si) => {
                    if (si === 0) ctx.moveTo(s.x, s.y);
                    else ctx.lineTo(s.x, s.y);
                });
                // Outer glow
                ctx.strokeStyle = `rgba(204,255,0,${alpha * 0.3})`;
                ctx.lineWidth = 5;
                ctx.shadowColor = "#ccff00";
                ctx.shadowBlur = 15;
                ctx.stroke();
                // Core bolt
                ctx.strokeStyle = `rgba(255,255,255,${alpha})`;
                ctx.lineWidth = 1.5;
                ctx.shadowBlur = 0;
                ctx.stroke();
                ctx.restore();
                bolt.life++;
            });

            // Remove dead bolts
            for (let i = bolts.length - 1; i >= 0; i--) {
                if (bolts[i].life >= bolts[i].maxLife) bolts.splice(i, 1);
            }

            // Fire new bolt occasionally
            boltTimer++;
            if (boltTimer > 25 && bolts.length < 4) {
                fireBolt();
                boltTimer = 0;
            }

            phi += 0.004;
        }

        let animId: number;
        const loop = () => {
            draw();
            animId = requestAnimationFrame(loop);
        };
        loop();
        return () => cancelAnimationFrame(animId);
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="w-full max-w-[560px] mx-auto opacity-90"
            style={{ filter: "drop-shadow(0 0 40px rgba(204,255,0,0.15))" }}
        />
    );
}

// ── Bento Feature Card ───────────────────────────────────────────────────────
const features = [
    {
        icon: Activity,
        tag: "ENGINE.01",
        title: "Real-Time Detection",
        desc: "CNN-XGBoost hybrid model analyses 1,240 grid nodes simultaneously, flagging anomalies within 300ms of occurrence.",
        accent: "Before GridGuard, hours passed. Now: seconds.",
        size: "lg",
    },
    {
        icon: Shield,
        tag: "ENGINE.02",
        title: "AI Isolation",
        desc: "Surgical auto-isolation cuts only the compromised segment — not the entire feeder. Zero collateral downtime.",
        accent: "Scalpel, not hammer.",
        size: "sm",
    },
    {
        icon: Cloud,
        tag: "ENGINE.03",
        title: "Cloud Scalability",
        desc: "Huawei Cloud ModelArts inference + TaurusDB storage. Designed to scale from one municipality to a continent.",
        accent: "Deploy anywhere. Recover everything.",
        size: "sm",
    },
];

function BentoCard({ feature, index }: { feature: typeof features[0]; index: number }) {
    const Icon = feature.icon;
    const ref = useRef(null);
    const inView = useInView(ref, { once: true, margin: "-80px" });

    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 40 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: index * 0.12, ease: [0.22, 1, 0.36, 1] }}
            whileHover={{ y: -4, scale: 1.01 }}
            className={`relative group overflow-hidden rounded-2xl border border-border bg-panel/60 backdrop-blur-xl p-7 flex flex-col gap-5 cursor-default
        ${feature.size === "lg" ? "md:col-span-2 md:row-span-2" : ""}
      `}
            style={{ boxShadow: "0 0 0 1px rgba(255,255,255,0.03), 0 20px 40px -20px rgba(0,0,0,0.6)" }}
        >
            {/* Hover gradient overlay */}
            <motion.div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{ background: "radial-gradient(ellipse at 30% 20%, rgba(204,255,0,0.05) 0%, transparent 70%)" }}
            />

            {/* Top corner accent */}
            <div className="absolute top-0 left-0 w-12 h-px bg-gradient-to-r from-acid/50 to-transparent" />
            <div className="absolute top-0 left-0 w-px h-12 bg-gradient-to-b from-acid/50 to-transparent" />

            <div className="flex items-start justify-between">
                <div className="w-10 h-10 rounded-lg bg-acid/10 border border-acid/20 flex items-center justify-center group-hover:bg-acid/20 transition-colors">
                    <Icon className="w-5 h-5 text-acid" />
                </div>
                <span className="font-mono text-[10px] text-dim tracking-widest">{feature.tag}</span>
            </div>

            <div className="flex-1 flex flex-col gap-3">
                <h3 className={`font-bold tracking-tight text-white ${feature.size === "lg" ? "text-2xl md:text-3xl" : "text-lg"}`}>
                    {feature.title}
                </h3>
                <p className={`text-zinc-400 leading-relaxed ${feature.size === "lg" ? "text-base" : "text-sm"}`}>
                    {feature.desc}
                </p>
            </div>

            <div className="flex items-center gap-2 pt-2 border-t border-white/5">
                <Zap className="w-3 h-3 text-acid shrink-0" />
                <span className="text-xs font-mono text-acid">{feature.accent}</span>
            </div>
        </motion.div>
    );
}

// ── Ticker ───────────────────────────────────────────────────────────────────
const tickerItems = [
    "SECTOR-4 NOMINAL",
    "94.01% DETECTION ACCURACY",
    "1,240 NODES ONLINE",
    "HUAWEI CLOUD: CONNECTED",
    "MODELARTS: ACTIVE",
    "LAST ALERT: 2.3 MIN AGO",
    "LOSSES PREVENTED: R12,450/HR",
    "AUTO-ISOLATION: ARMED",
];

// ── Page ─────────────────────────────────────────────────────────────────────
export default function HomePage() {
    const heroRef = useRef(null);
    const heroInView = useInView(heroRef, { once: true });

    return (
        <div className="min-h-screen bg-void overflow-x-hidden">

            {/* Nav */}
            <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-10 py-4 border-b border-border/50 backdrop-blur-xl bg-void/70">
                <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-md bg-acid flex items-center justify-center">
                        <Zap className="w-4 h-4 text-void" />
                    </div>
                    <span className="font-bold text-white tracking-tight text-sm">GridGuard <span className="text-acid">AI</span></span>
                </div>
                <div className="hidden md:flex items-center gap-8">
                    {["Platform", "Sectors", "Compliance", "Blog"].map((item) => (
                        <a key={item} href="#" className="text-xs font-mono text-zinc-500 hover:text-white transition-colors tracking-wider">{item}</a>
                    ))}
                </div>
                <Link href="/login">
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="px-4 py-2 text-xs font-bold font-mono uppercase tracking-widest text-black bg-acid hover:bg-white transition-colors rounded-md"
                    >
                        Mission Control →
                    </motion.button>
                </Link>
            </nav>

            {/* Live Ticker */}
            <div className="fixed top-[57px] left-0 right-0 z-40 border-b border-border/30 bg-void/50 backdrop-blur-md overflow-hidden">
                <motion.div
                    className="flex gap-12 py-1.5 whitespace-nowrap"
                    animate={{ x: ["0%", "-50%"] }}
                    transition={{ duration: 28, ease: "linear", repeat: Infinity }}
                >
                    {[...tickerItems, ...tickerItems].map((item, i) => (
                        <span key={i} className="text-[10px] font-mono text-dim tracking-widest shrink-0">
                            <span className="text-acid mr-2">▸</span>
                            {item}
                        </span>
                    ))}
                </motion.div>
            </div>

            {/* ── HERO ── */}
            <section className="relative min-h-screen flex items-center pt-28 pb-16 px-6 md:px-12">
                {/* Background grid */}
                <div className="absolute inset-0 bg-grid-pattern opacity-40" />
                {/* Radial glow */}
                <div
                    className="absolute inset-0 pointer-events-none"
                    style={{ background: "radial-gradient(ellipse 60% 50% at 70% 50%, rgba(204,255,0,0.04) 0%, transparent 70%)" }}
                />

                <div className="relative z-10 max-w-7xl mx-auto w-full grid md:grid-cols-2 gap-16 items-center">
                    {/* Left text */}
                    <div ref={heroRef} className="flex flex-col gap-8">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={heroInView ? { opacity: 1, y: 0 } : {}}
                            transition={{ duration: 0.5 }}
                            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-acid/30 bg-acid/5 w-fit"
                        >
                            <div className="w-1.5 h-1.5 rounded-full bg-acid animate-pulse" />
                            <span className="text-[10px] font-mono text-acid tracking-widest">GRIDGUARD ACTIVE — SECTOR 4</span>
                        </motion.div>

                        <motion.h1
                            initial={{ opacity: 0, y: 30 }}
                            animate={heroInView ? { opacity: 1, y: 0 } : {}}
                            transition={{ duration: 0.6, delay: 0.1 }}
                            className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tighter text-white leading-[0.95]"
                        >
                            Stop Theft.{" "}
                            <br />
                            <span
                                className="text-transparent bg-clip-text"
                                style={{ backgroundImage: "linear-gradient(90deg, #ccff00, #a8cc00)" }}
                            >
                                Save the Grid.
                            </span>
                            <br />
                            <span className="text-zinc-600">Precisely.</span>
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={heroInView ? { opacity: 1, y: 0 } : {}}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            className="text-zinc-400 text-base md:text-lg leading-relaxed max-w-lg"
                        >
                            GridGuard AI is the scalpel your grid deserves. Instead of blunt shutdowns that punish
                            entire neighbourhoods, our AI detects energy theft at node level and isolates only the
                            compromised segment — in under 300ms.
                        </motion.p>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={heroInView ? { opacity: 1, y: 0 } : {}}
                            transition={{ duration: 0.6, delay: 0.3 }}
                            className="flex flex-wrap items-center gap-4"
                        >
                            <Link href="/login">
                                <motion.button
                                    whileHover={{ scale: 1.03, boxShadow: "0 0 30px rgba(204,255,0,0.3)" }}
                                    whileTap={{ scale: 0.97 }}
                                    className="flex items-center gap-3 px-7 py-3.5 bg-acid text-black font-bold text-sm tracking-wider rounded-lg transition-all"
                                >
                                    <Zap className="w-4 h-4" />
                                    Access Mission Control
                                    <ArrowRight className="w-4 h-4" />
                                </motion.button>
                            </Link>
                            <Link href="/signup">
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.97 }}
                                    className="flex items-center gap-2 px-6 py-3.5 border border-border text-zinc-300 text-sm font-mono tracking-wider rounded-lg hover:border-acid/50 hover:text-white transition-all"
                                >
                                    Request Demo
                                    <ChevronRight className="w-4 h-4" />
                                </motion.button>
                            </Link>
                        </motion.div>

                        {/* Stats row */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={heroInView ? { opacity: 1 } : {}}
                            transition={{ duration: 0.8, delay: 0.5 }}
                            className="flex gap-8 pt-4 border-t border-border/50"
                        >
                            {[
                                { val: "94.01%", label: "Detection Accuracy" },
                                { val: "<300ms", label: "Response Time" },
                                { val: "Zero", label: "Collateral Downtime" },
                            ].map((s) => (
                                <div key={s.label}>
                                    <div className="text-xl font-bold text-acid font-mono">{s.val}</div>
                                    <div className="text-[10px] font-mono text-dim uppercase tracking-wider mt-0.5">{s.label}</div>
                                </div>
                            ))}
                        </motion.div>
                    </div>

                    {/* Right: Globe */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={heroInView ? { opacity: 1, scale: 1 } : {}}
                        transition={{ duration: 1, delay: 0.2 }}
                        className="flex flex-col items-center justify-center"
                    >
                        <div className="relative">
                            <ElectricGlobe />
                            {/* Floating badge */}
                            <motion.div
                                animate={{ y: [0, -8, 0] }}
                                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                                className="absolute bottom-10 right-0 bg-panel/90 backdrop-blur-md border border-border rounded-xl px-4 py-3 flex items-center gap-3"
                            >
                                <div className="w-2 h-2 rounded-full bg-acid animate-pulse" />
                                <div>
                                    <div className="text-[10px] font-mono text-dim">LIVE ALERTS</div>
                                    <div className="text-sm font-bold text-danger">2 Active Threats</div>
                                </div>
                            </motion.div>
                            <motion.div
                                animate={{ y: [0, 6, 0] }}
                                transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                                className="absolute top-16 left-0 bg-panel/90 backdrop-blur-md border border-border rounded-xl px-4 py-3 flex items-center gap-3"
                            >
                                <Cpu className="w-4 h-4 text-acid" />
                                <div>
                                    <div className="text-[10px] font-mono text-dim">AI ENGINE</div>
                                    <div className="text-sm font-bold text-white">CNN-XGBoost Active</div>
                                </div>
                            </motion.div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* ── BENTO GRID ── */}
            <section className="py-24 px-6 md:px-12 relative">
                <div
                    className="absolute inset-0 pointer-events-none"
                    style={{ background: "radial-gradient(ellipse 50% 60% at 50% 0%, rgba(204,255,0,0.03) 0%, transparent 60%)" }}
                />
                <div className="max-w-7xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="mb-14"
                    >
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-border bg-panel/40 mb-5">
                            <span className="text-[10px] font-mono text-dim tracking-widest">CORE CAPABILITIES</span>
                        </div>
                        <h2 className="text-4xl md:text-5xl font-extrabold tracking-tighter text-white leading-tight">
                            Three engines.{" "}
                            <span className="text-zinc-600">One mission.</span>
                        </h2>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-3 auto-rows-auto gap-5">
                        {features.map((f, i) => (
                            <BentoCard key={f.tag} feature={f} index={i} />
                        ))}
                    </div>
                </div>
            </section>

            {/* ── CTA BANNER ── */}
            <section className="py-20 px-6 md:px-12">
                <div className="max-w-7xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.7 }}
                        className="relative border border-border rounded-2xl p-12 md:p-20 text-center overflow-hidden"
                        style={{ background: "linear-gradient(135deg, #0a0a0a 0%, #111111 100%)" }}
                    >
                        <div
                            className="absolute inset-0 pointer-events-none"
                            style={{ background: "radial-gradient(ellipse 60% 80% at 50% 50%, rgba(204,255,0,0.05) 0%, transparent 70%)" }}
                        />
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-px bg-gradient-to-r from-transparent via-acid/50 to-transparent" />
                        <div className="relative z-10 flex flex-col items-center gap-6">
                            <span className="text-[10px] font-mono text-acid tracking-widest">READY TO DEPLOY?</span>
                            <h2 className="text-4xl md:text-5xl font-extrabold tracking-tighter text-white">
                                Protect your grid today.
                            </h2>
                            <p className="text-zinc-500 max-w-md text-sm leading-relaxed">
                                Join the municipalities already using GridGuard AI to prevent millions in energy losses every year.
                            </p>
                            <Link href="/signup">
                                <motion.button
                                    whileHover={{ scale: 1.04, boxShadow: "0 0 40px rgba(204,255,0,0.35)" }}
                                    whileTap={{ scale: 0.96 }}
                                    className="mt-2 flex items-center gap-3 px-8 py-4 bg-acid text-black font-bold tracking-wider rounded-xl text-sm"
                                >
                                    <Shield className="w-4 h-4" />
                                    Get Started Free
                                </motion.button>
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t border-border px-6 md:px-12 py-8">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded bg-acid flex items-center justify-center">
                            <Zap className="w-3 h-3 text-void" />
                        </div>
                        <span className="text-xs font-mono text-dim">GridGuard AI © 2026</span>
                    </div>
                    <span className="text-[10px] font-mono text-zinc-700 tracking-wider">
                        BUILT FOR HUAWEI CLOUD HACKATHON 2026
                    </span>
                </div>
            </footer>
        </div>
    );
}
