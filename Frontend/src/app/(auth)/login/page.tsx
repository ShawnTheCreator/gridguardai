"use client";

import React, { useState, useEffect, useId } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldCheck,
  Lock,
  Eye,
  EyeOff,
  ChevronRight,
  AlertTriangle,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { apiLogin } from "@/lib/api";
import { useToast } from "@/components/ui/Toast";

// ── Floating Label Input ─────────────────────────────────────────────────────
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
function FloatingInput({
  id, type, label, value, onChange, error, icon, trailing, autoComplete,
}: FloatingInputProps) {
  const [focused, setFocused] = useState(false);
  const floated = focused || value.length > 0;

  return (
    <div className="relative">
      <motion.div
        animate={error ? { x: [0, -6, 6, -4, 4, 0] } : { x: 0 }}
        transition={{ duration: 0.35, type: "spring" }}
        className={`relative border rounded-lg transition-all duration-200 overflow-hidden
          ${error
            ? "border-danger shadow-[0_0_0_2px_rgba(255,69,58,0.2)]"
            : focused
              ? "border-acid shadow-[0_0_0_2px_rgba(204,255,0,0.15)]"
              : "border-border"
          }
        `}
      >
        {/* Floating label */}
        <label
          htmlFor={id}
          className={`absolute left-10 transition-all duration-200 pointer-events-none font-mono select-none
            ${floated
              ? "top-1.5 text-[9px] tracking-widest uppercase text-acid"
              : "top-1/2 -translate-y-1/2 text-sm text-dim"
            }
          `}
        >
          {label}
        </label>
        {/* Left icon */}
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-dim">
          {icon}
        </div>
        <input
          id={id}
          type={type}
          value={value}
          autoComplete={autoComplete}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className="w-full bg-panel text-white text-sm pt-5 pb-2 px-3 pl-10 pr-10 focus:outline-none font-mono placeholder:text-transparent"
        />
        {trailing && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">{trailing}</div>
        )}
      </motion.div>
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="mt-1.5 text-[10px] font-mono text-danger flex items-center gap-1"
          >
            <AlertTriangle className="w-3 h-3" />
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Social Button ────────────────────────────────────────────────────────────
function SocialButton({ label, logo, onClick }: { label: string; logo: React.ReactNode; onClick: () => void }) {
  return (
    <motion.button
      type="button"
      whileHover={{ scale: 1.02, borderColor: "rgba(204,255,0,0.3)" }}
      whileTap={{ scale: 0.97 }}
      className="flex-1 flex items-center justify-center gap-2.5 py-2.5 border border-border rounded-lg text-xs font-mono text-zinc-400 hover:text-white transition-colors bg-panel/60"
      onClick={onClick}
    >
      {logo}
      {label}
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
export default function LoginPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; api?: string }>({});
  const [isChecking, setIsChecking] = useState(true);

  // Redirect if already logged in
  useEffect(() => {
    const token = localStorage.getItem("gridguard_token");
    if (token) {
      router.replace("/admin");
    } else {
      setIsChecking(false);
    }
  }, [router]);

  const validate = () => {
    const e: typeof errors = {};
    if (!email) e.email = "Operator ID is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = "Invalid email format";
    if (!password) e.password = "Access key is required";
    else if (password.length < 6) e.password = "Access key must be ≥ 6 characters";
    return e;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    setIsLoading(true);
    try {
      const result = await apiLogin(email, password);
      if (result) {
        localStorage.setItem("gridguard_token", result.token);
        localStorage.setItem("gridguard_user", JSON.stringify(result.user));
        router.push("/admin");
      } else {
        setErrors({ api: "Invalid credentials. Check your email and access key." });
        showToast("Incorrect email or password", "error");
        setIsLoading(false);
      }
    } catch {
      setErrors({ api: "Connection error. Is the backend running?" });
      showToast("Incorrect email or password", "error");
      setIsLoading(false);
    }
  };

  if (isChecking) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 rounded-sm bg-acid animate-spin shadow-[0_0_15px_rgba(204,255,0,0.5)]"></div>
          <p className="text-zinc-500 font-mono text-xs uppercase tracking-widest">Verifying Session...</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="space-y-7"
    >
      {/* Header */}
      <div className="space-y-1.5">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-acid/30 bg-acid/5 mb-3">
          <div className="w-1.5 h-1.5 rounded-full bg-acid animate-pulse" />
          <span className="text-[10px] font-mono text-acid tracking-widest">SECURE GATEWAY — ONLINE</span>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tighter text-white">
          Operator Access
        </h1>
        <p className="text-sm text-zinc-500 font-mono">
          GridGuard Mission Control. Authorised personnel only.
        </p>
      </div>

      {/* Social Auth */}
      <div className="flex gap-3">
        <SocialButton
          label="Google"
          logo={<GoogleLogo />}
          onClick={async () => {
            const verifier = [...crypto.getRandomValues(new Uint8Array(32))]
              .map(b => ("0" + b.toString(16)).slice(-2))
              .join("");
            const enc = new TextEncoder();
            const data = enc.encode(verifier);
            const buf = await crypto.subtle.digest("SHA-256", data);
            const hashArray = Array.from(new Uint8Array(buf));
            const challenge = btoa(String.fromCharCode(...hashArray))
              .replace(/\+/g, "-")
              .replace(/\//g, "_")
              .replace(/=+$/, "");
            sessionStorage.setItem("gg_pkce_verifier", verifier);
            const params = new URLSearchParams({
              client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "",
              redirect_uri: `${window.location.origin}/auth/google`,
              response_type: "code",
              scope: "openid email profile",
              code_challenge: challenge,
              code_challenge_method: "S256",
              access_type: "offline",
              include_granted_scopes: "true",
              prompt: "select_account"
            });
            window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
          }}
        />
        <SocialButton
          label="Huawei ID"
          logo={<HuaweiLogo />}
          onClick={async () => {
            const verifier = [...crypto.getRandomValues(new Uint8Array(32))]
              .map(b => ("0" + b.toString(16)).slice(-2))
              .join("");
            const enc = new TextEncoder();
            const data = enc.encode(verifier);
            const buf = await crypto.subtle.digest("SHA-256", data);
            const hashArray = Array.from(new Uint8Array(buf));
            const challenge = btoa(String.fromCharCode(...hashArray))
              .replace(/\+/g, "-")
              .replace(/\//g, "_")
              .replace(/=+$/, "");
            sessionStorage.setItem("gg_pkce_verifier_huawei", verifier);
            const authUrl = process.env.NEXT_PUBLIC_HUAWEI_AUTH_URL || "https://oauth-login.cloud.huawei.com/oauth2/v3/authorize";
            const params = new URLSearchParams({
              client_id: process.env.NEXT_PUBLIC_HUAWEI_CLIENT_ID || "",
              redirect_uri: `${window.location.origin}/auth/huawei`,
              response_type: "code",
              scope: "openid email profile",
              code_challenge: challenge,
              code_challenge_method: "S256"
            });
            window.location.href = `${authUrl}?${params.toString()}`;
          }}
        />
      </div>

      {/* Divider */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-border" />
        <span className="text-[10px] font-mono text-dim tracking-widest">OR CONTINUE WITH</span>
        <div className="flex-1 h-px bg-border" />
      </div>

      {/* Form */}
      <form onSubmit={handleLogin} className="space-y-4" noValidate>
        {/* Card container */}
        <div
          className="relative rounded-xl border border-border bg-panel/60 backdrop-blur-xl p-6 space-y-4"
          style={{ boxShadow: "0 20px 60px -20px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.03)" }}
        >
          {/* Corner accents */}
          <div className="absolute top-0 left-0 w-8 h-px bg-acid/50" />
          <div className="absolute top-0 left-0 h-8 w-px bg-acid/50" />
          <div className="absolute bottom-0 right-0 w-8 h-px bg-acid/30" />
          <div className="absolute bottom-0 right-0 h-8 w-px bg-acid/30" />

          <FloatingInput
            id="email"
            type="email"
            label="Operator Email"
            value={email}
            onChange={setEmail}
            error={errors.email}
            autoComplete="email"
            icon={<ShieldCheck className="w-4 h-4" />}
          />
          <FloatingInput
            id="password"
            type={showPass ? "text" : "password"}
            label="Access Key"
            value={password}
            onChange={setPassword}
            error={errors.password}
            autoComplete="current-password"
            icon={<Lock className="w-4 h-4" />}
            trailing={
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="text-dim hover:text-white transition-colors"
              >
                {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            }
          />

          {/* Remember + Forgot */}
          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-2.5 cursor-pointer group">
              <div
                className="relative w-4 h-4 border border-border rounded flex-shrink-0 cursor-pointer transition-colors"
                style={{ borderColor: rememberMe ? "#ccff00" : undefined, backgroundColor: rememberMe ? "#ccff0020" : undefined }}
                onClick={() => setRememberMe(!rememberMe)}
              >
                {rememberMe && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute inset-0 flex items-center justify-center"
                  >
                    <div className="w-2 h-2 rounded-sm bg-acid" />
                  </motion.div>
                )}
              </div>
              <span className="text-[11px] font-mono text-dim group-hover:text-zinc-400 transition-colors select-none">Remember Me</span>
            </label>
            <Link href="#" className="text-[11px] font-mono text-dim hover:text-acid transition-colors">
              Forgot access key?
            </Link>
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
            <motion.span
              className="font-mono"
              animate={{ opacity: [1, 0.4, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            >
              AUTHENTICATING...
            </motion.span>
          ) : (
            <>
              <Zap className="w-4 h-4" />
              Initiate Session
              <ChevronRight className="w-4 h-4" />
            </>
          )}
        </motion.button>
      </form>

      {/* Sign up link */}
      <p className="text-center text-xs font-mono text-dim">
        New operator?{" "}
        <Link href="/signup" className="text-acid hover:text-white transition-colors">
          Request clearance →
        </Link>
      </p>

      {/* Warning */}
      <div className="flex items-start gap-2 px-3 py-2.5 rounded-lg bg-danger/5 border border-danger/20">
        <AlertTriangle className="w-3 h-3 text-danger shrink-0 mt-0.5" />
        <p className="text-[10px] text-zinc-600 font-mono leading-relaxed">
          Unauthorised access is a criminal offence under the Cybercrimes Act 19 of 2020. All sessions
          are logged and geolocated.
        </p>
      </div>
    </motion.div>
  );
}
