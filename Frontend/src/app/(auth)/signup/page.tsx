"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
    User,
    Lock,
    Mail,
    Eye,
    EyeOff,
    ChevronRight,
    AlertTriangle,
    Zap,
    Building2,
    CheckCircle2,
} from "lucide-react";
import Link from "next/link";

// ── Floating Label Input (re-used pattern) ───────────────────────────────────
interface FloatingInputProps {
    id: string;
    type: string;
    label: string;
    value: string;
    onChange: (v: string) => void;
    error?: string;
    icon?: React.ReactNode;
    trailing?: React.ReactNode;
    autoComplete?: string;
}
function FloatingInput({ id, type, label, value, onChange, error, icon, trailing, autoComplete }: FloatingInputProps) {
    const [focused, setFocused] = useState(false);
    const floated = focused || value.length > 0;
    return (
        <div className="relative">
            <motion.div
                animate={error ? { x: [0, -6, 6, -4, 4, 0] } : { x: 0 }}
                transition={{ duration: 0.35, type: "spring" }}
                className={`relative border rounded-lg transition-all duration-200 overflow-hidden
          ${error ? "border-danger shadow-[0_0_0_2px_rgba(255,69,58,0.2)]"
                        : focused ? "border-acid shadow-[0_0_0_2px_rgba(204,255,0,0.15)]"
                            : "border-border"
                    }`}
            >
                <label htmlFor={id} className={`absolute left-10 transition-all duration-200 pointer-events-none font-mono select-none
          ${floated ? "top-1.5 text-[9px] tracking-widest uppercase text-acid" : "top-1/2 -translate-y-1/2 text-sm text-dim"}`}>
                    {label}
                </label>
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-dim">{icon}</div>
                <input
                    id={id} type={type} value={value} autoComplete={autoComplete}
                    onChange={(e) => onChange(e.target.value)}
                    onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
                    className="w-full bg-panel text-white text-sm pt-5 pb-2 px-3 pl-10 pr-10 focus:outline-none font-mono placeholder:text-transparent"
                />
                {trailing && <div className="absolute right-3 top-1/2 -translate-y-1/2">{trailing}</div>}
            </motion.div>
            <AnimatePresence>
                {error && (
                    <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
                        className="mt-1.5 text-[10px] font-mono text-danger flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />{error}
                    </motion.p>
                )}
            </AnimatePresence>
        </div>
    );
}

// ── Password Strength Meter ──────────────────────────────────────────────────
function PasswordStrength({ password }: { password: string }) {
    const checks = [
        { label: "8+ characters", pass: password.length >= 8 },
        { label: "Uppercase letter", pass: /[A-Z]/.test(password) },
        { label: "Number", pass: /\d/.test(password) },
        { label: "Special character", pass: /[^A-Za-z0-9]/.test(password) },
    ];
    const score = checks.filter((c) => c.pass).length;
    const colors = ["bg-dim", "bg-danger", "bg-yellow-500", "bg-acid/60", "bg-acid"];
    const labels = ["", "Weak", "Fair", "Good", "Strong"];

    if (!password) return null;
    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
            <div className="flex gap-1">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className={`flex-1 h-0.5 rounded-full transition-all duration-300 ${i <= score ? colors[score] : "bg-dim/30"}`} />
                ))}
            </div>
            <div className="flex justify-between items-center">
                <div className="flex flex-wrap gap-x-3 gap-y-1">
                    {checks.map((c) => (
                        <span key={c.label} className={`text-[9px] font-mono flex items-center gap-1 transition-colors ${c.pass ? "text-acid" : "text-dim"}`}>
                            <CheckCircle2 className="w-2.5 h-2.5" />{c.label}
                        </span>
                    ))}
                </div>
                {score > 0 && <span className={`text-[10px] font-mono ${score >= 4 ? "text-acid" : score >= 3 ? "text-yellow-500" : "text-danger"}`}>{labels[score]}</span>}
            </div>
        </motion.div>
    );
}

// ── Social Button ────────────────────────────────────────────────────────────
function SocialButton({ label, logo }: { label: string; logo: React.ReactNode }) {
    return (
        <motion.button type="button" whileHover={{ scale: 1.02, borderColor: "rgba(204,255,0,0.3)" }} whileTap={{ scale: 0.97 }}
            className="flex-1 flex items-center justify-center gap-2.5 py-2.5 border border-border rounded-lg text-xs font-mono text-zinc-400 hover:text-white transition-colors bg-panel/60">
            {logo}{label}
        </motion.button>
    );
}

const GoogleLogo = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
);

const HuaweiLogo = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14.5v-3.67L7.77 14.9 7 13.6l3.23-2.1L7 9.4l.77-1.3 3.23 2.07V6.5h1.5v3.67L15.23 8.1 16 9.4l-3.23 2.1L16 13.6l-.77 1.3-3.23-2.07V16.5H11z" />
    </svg>
);

// ── Page ─────────────────────────────────────────────────────────────────────
export default function SignupPage() {
    const router = useRouter();
    const [fullName, setFullName] = useState("");
    const [org, setOrg] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPass, setShowPass] = useState(false);
    const [agreed, setAgreed] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [submitted, setSubmitted] = useState(false);

    const validate = () => {
        const e: Record<string, string> = {};
        if (!fullName.trim()) e.fullName = "Full name is required";
        if (!org.trim()) e.org = "Organisation is required";
        if (!email) e.email = "Email is required";
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = "Invalid email";
        if (!password) e.password = "Password is required";
        else if (password.length < 8) e.password = "Must be at least 8 characters";
        if (!agreed) e.agreed = "You must accept the terms";
        return e;
    };

    const handleSignup = (e: React.FormEvent) => {
        e.preventDefault();
        const errs = validate();
        setErrors(errs);
        if (Object.keys(errs).length > 0) return;
        setIsLoading(true);
        setTimeout(() => {
            setIsLoading(false);
            setSubmitted(true);
        }, 1800);
    };

    if (submitted) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center gap-6 text-center py-8"
            >
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                    className="w-16 h-16 rounded-full bg-acid/10 border border-acid/40 flex items-center justify-center"
                >
                    <CheckCircle2 className="w-8 h-8 text-acid" />
                </motion.div>
                <h2 className="text-2xl font-extrabold tracking-tighter text-white">Clearance Requested</h2>
                <p className="text-sm text-zinc-500 font-mono leading-relaxed max-w-xs">
                    Your operator registration has been submitted. You&apos;ll receive access credentials via
                    secure channel within 24 hours.
                </p>
                <Link href="/login">
                    <motion.button
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        className="mt-2 px-6 py-3 bg-acid text-black font-bold text-sm tracking-wider rounded-xl"
                    >
                        Back to Login
                    </motion.button>
                </Link>
            </motion.div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="space-y-6"
        >
            {/* Header */}
            <div className="space-y-1.5">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-acid/30 bg-acid/5 mb-3">
                    <Zap className="w-3 h-3 text-acid" />
                    <span className="text-[10px] font-mono text-acid tracking-widest">REQUEST OPERATOR CLEARANCE</span>
                </div>
                <h1 className="text-3xl font-extrabold tracking-tighter text-white">
                    Create Account
                </h1>
                <p className="text-sm text-zinc-500 font-mono">
                    Register your organisation with GridGuard AI.
                </p>
            </div>

            {/* Social Auth */}
            <div className="flex gap-3">
                <SocialButton label="Google" logo={<GoogleLogo />} />
                <SocialButton label="Huawei ID" logo={<HuaweiLogo />} />
            </div>

            {/* Divider */}
            <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-border" />
                <span className="text-[10px] font-mono text-dim tracking-widest">OR REGISTER WITH EMAIL</span>
                <div className="flex-1 h-px bg-border" />
            </div>

            {/* Form */}
            <form onSubmit={handleSignup} noValidate className="space-y-4">
                <div
                    className="relative rounded-xl border border-border bg-panel/60 backdrop-blur-xl p-6 space-y-4"
                    style={{ boxShadow: "0 20px 60px -20px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.03)" }}
                >
                    <div className="absolute top-0 left-0 w-8 h-px bg-acid/50" />
                    <div className="absolute top-0 left-0 h-8 w-px bg-acid/50" />
                    <div className="absolute bottom-0 right-0 w-8 h-px bg-acid/30" />
                    <div className="absolute bottom-0 right-0 h-8 w-px bg-acid/30" />

                    <div className="grid grid-cols-2 gap-3">
                        <div className="col-span-2 sm:col-span-1">
                            <FloatingInput id="fullName" type="text" label="Full Name" value={fullName}
                                onChange={setFullName} error={errors.fullName} autoComplete="name"
                                icon={<User className="w-4 h-4" />} />
                        </div>
                        <div className="col-span-2 sm:col-span-1">
                            <FloatingInput id="org" type="text" label="Organisation" value={org}
                                onChange={setOrg} error={errors.org} autoComplete="organization"
                                icon={<Building2 className="w-4 h-4" />} />
                        </div>
                    </div>

                    <FloatingInput id="email" type="email" label="Official Email" value={email}
                        onChange={setEmail} error={errors.email} autoComplete="email"
                        icon={<Mail className="w-4 h-4" />} />

                    <div className="space-y-2">
                        <FloatingInput id="password" type={showPass ? "text" : "password"} label="Set Access Key"
                            value={password} onChange={setPassword} error={errors.password} autoComplete="new-password"
                            icon={<Lock className="w-4 h-4" />}
                            trailing={
                                <button type="button" onClick={() => setShowPass(!showPass)} className="text-dim hover:text-white transition-colors">
                                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            }
                        />
                        <PasswordStrength password={password} />
                    </div>

                    {/* Terms */}
                    <div className="space-y-1.5">
                        <label className="flex items-start gap-3 cursor-pointer group">
                            <div
                                className="relative mt-0.5 w-4 h-4 border border-border rounded flex-shrink-0 cursor-pointer transition-colors"
                                style={{ borderColor: agreed ? "#ccff00" : errors.agreed ? "#ff453a" : undefined, backgroundColor: agreed ? "#ccff0020" : undefined }}
                                onClick={() => setAgreed(!agreed)}
                            >
                                {agreed && (
                                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute inset-0 flex items-center justify-center">
                                        <div className="w-2 h-2 rounded-sm bg-acid" />
                                    </motion.div>
                                )}
                            </div>
                            <span className="text-[11px] font-mono text-dim group-hover:text-zinc-400 transition-colors select-none leading-relaxed">
                                I agree to the{" "}
                                <Link href="#" className="text-acid hover:text-white transition-colors">Terms of Service</Link>{" "}
                                and{" "}
                                <Link href="#" className="text-acid hover:text-white transition-colors">Security Policy</Link>
                            </span>
                        </label>
                        <AnimatePresence>
                            {errors.agreed && (
                                <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
                                    className="text-[10px] font-mono text-danger flex items-center gap-1 ml-7">
                                    <AlertTriangle className="w-3 h-3" />{errors.agreed}
                                </motion.p>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* Submit */}
                <motion.button
                    type="submit"
                    disabled={isLoading}
                    whileHover={!isLoading ? { scale: 1.02, boxShadow: "0 0 30px rgba(204,255,0,0.3)" } : {}}
                    whileTap={!isLoading ? { scale: 0.98 } : {}}
                    className="w-full bg-acid text-black font-bold uppercase tracking-widest py-3.5 rounded-xl hover:bg-white transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-70"
                >
                    {isLoading ? (
                        <motion.span className="font-mono" animate={{ opacity: [1, 0.4, 1] }} transition={{ duration: 1, repeat: Infinity }}>
                            SUBMITTING REQUEST...
                        </motion.span>
                    ) : (
                        <>
                            <Zap className="w-4 h-4" />
                            Request Clearance
                            <ChevronRight className="w-4 h-4" />
                        </>
                    )}
                </motion.button>
            </form>

            <p className="text-center text-xs font-mono text-dim">
                Already have clearance?{" "}
                <Link href="/login" className="text-acid hover:text-white transition-colors">
                    Sign in →
                </Link>
            </p>
        </motion.div>
    );
}
