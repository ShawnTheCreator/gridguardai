/**
 * GridGuard AI — Frontend API Client
 * 
 * Every call is wrapped in try/catch with graceful fallback.
 * If the backend is unreachable, returns null so callers fall back to mock data.
 */

import { 
    MOCK_ASSETS, 
    MOCK_DASHBOARD_SUMMARY, 
    MOCK_INCIDENTS, 
    MOCK_NOTIFICATIONS, 
    MOCK_TELEMETRY,
    SYSTEM_LOGS
} from "./data";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

async function request<T>(path: string, options?: RequestInit): Promise<T | null> {
    try {
        const token = typeof window !== "undefined" ? localStorage.getItem("gridguard_token") : null;
        const headers: Record<string, string> = {
            "Content-Type": "application/json",
            ...(options?.headers as Record<string, string> || {}),
        };
        if (token) {
            headers["Authorization"] = `Bearer ${token}`;
        }

        const res = await fetch(`${API_BASE}${path}`, {
            ...options,
            headers,
        });

        if (!res.ok) return null;
        return await res.json() as T;
    } catch {
        // Network error, CORS, timeout — silently return null
        return null;
    }
}

// --- Auth ---

export interface LoginResponse {
    token: string;
    user: { id: string; email: string; name: string; role: string };
}

export async function apiLogin(email: string, password: string, recaptchaToken?: string): Promise<LoginResponse | null> {
    try {
        const res = await fetch(`${API_BASE}/api/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password, recaptchaToken }),
        });

        if (res.ok) {
            return await res.json() as LoginResponse;
        }
        
        // If backend returns 401 or other error, check for demo credentials
        if (email === "thabo@gridguard.co.za" && password === "gridguard123") {
            return {
                token: "demo-token-admin",
                user: { id: "1", email: "thabo@gridguard.co.za", name: "Thabo Mokoena", role: "worker" }
            };
        }
        if (email === "patrick@gridguard.co.za" && password === "governance123") {
            return {
                token: "demo-token-governance",
                user: { id: "2", email: "patrick@gridguard.co.za", name: "Patrick Nkosi", role: "governance" }
            };
        }
        if (email === "shawn@gridguard.co.za" && password === "dev123") {
            return {
                token: "demo-token-dev",
                user: { id: "3", email: "shawn@gridguard.co.za", name: "Shawn The Creator", role: "dev" }
            };
        }
        if (email === "admin@gridguard.co.za" && password === "admin123") {
            return {
                token: "demo-token-admin",
                user: { id: "4", email: "admin@gridguard.co.za", name: "System Admin", role: "admin" }
            };
        }
        return null;
    } catch {
        // Network error - fallback to demo if credentials match
        if (email === "thabo@gridguard.co.za" && password === "gridguard123") {
            return {
                token: "demo-token-admin",
                user: { id: "1", email: "thabo@gridguard.co.za", name: "Thabo Mokoena", role: "worker" }
            };
        }
        if (email === "patrick@gridguard.co.za" && password === "governance123") {
            return {
                token: "demo-token-governance",
                user: { id: "2", email: "patrick@gridguard.co.za", name: "Patrick Nkosi", role: "governance" }
            };
        }
        if (email === "shawn@gridguard.co.za" && password === "dev123") {
            return {
                token: "demo-token-dev",
                user: { id: "3", email: "shawn@gridguard.co.za", name: "Shawn The Creator", role: "dev" }
            };
        }
        if (email === "admin@gridguard.co.za" && password === "admin123") {
            return {
                token: "demo-token-admin",
                user: { id: "4", email: "admin@gridguard.co.za", name: "System Admin", role: "admin" }
            };
        }
        return null;
    }
}

export async function apiSignup(email: string, password: string, name: string, recaptchaToken?: string): Promise<LoginResponse | null> {
    try {
        const res = await fetch(`${API_BASE}/api/auth/signup`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password, name, recaptchaToken }),
        });

        if (!res.ok) return null;
        return await res.json() as LoginResponse;
    } catch {
        return null;
    }
}

export async function apiGetMe() {
    return request<{ id: string; email: string; name: string; role: string }>("/api/auth/me");
}

export async function apiLogout() {
    return request("/api/auth/logout", { method: "POST" });
}

// --- Dashboard ---

export interface DashboardSummary {
    totalNodes: number;
    activeAlerts: number;
    investigatingCount: number;
    avgLoad: number;
    latestConfidence: number;
    totalSectorLoad: number;
    activeLosses: number;
}

export async function apiGetDashboardSummary() {
    return (await request<DashboardSummary>("/api/dashboard/summary")) || MOCK_DASHBOARD_SUMMARY;
}

// --- Assets ---

export interface ApiAsset {
    id: string;
    type: string;
    location: string;
    status: string;
    load: number;
    lat: number;
    lng: number;
    lastInspection: string;
}

export async function apiGetAssets() {
    return (await request<ApiAsset[]>("/api/assets")) || (MOCK_ASSETS as unknown as ApiAsset[]);
}

export async function apiGetAsset(id: string) {
    const asset = await request<ApiAsset>(`/api/assets/${id}`);
    if (asset) return asset;
    return (MOCK_ASSETS.find(a => a.id === id) as unknown as ApiAsset) || null;
}

export async function apiUpdateAsset(id: string, data: { status?: string; load?: number }) {
    return request<ApiAsset>(`/api/assets/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
    });
}

// --- Incidents ---

export interface ApiIncident {
    id: string;
    time: string;
    location: string;
    type: string;
    status: string;
    confidence: number;
    createdAt: string;
}

export async function apiGetIncidents(status?: string) {
    const query = status && status !== "all" ? `?status=${status}` : "";
    return (await request<ApiIncident[]>(`/api/incidents${query}`)) || MOCK_INCIDENTS;
}

export async function apiDispatchIncident(id: string) {
    return request<ApiIncident>(`/api/incidents/${id}/dispatch`, { method: "PUT" });
}

// --- Telemetry ---

export async function apiGetRecentTelemetry() {
    return (await request<Array<{ time: string; deviceId: string; current: number }>>("/api/telemetry/recent")) || MOCK_TELEMETRY;
}

// --- Settings ---

export interface ApiSettings {
    sensitivity: number;
    autoIsolate: boolean;
}

export async function apiGetSettings() {
    return (await request<ApiSettings>("/api/settings")) || { sensitivity: 85, autoIsolate: true };
}

export async function apiUpdateSettings(data: { sensitivity: number; autoIsolate: boolean }) {
    return request("/api/settings", {
        method: "PUT",
        body: JSON.stringify(data),
    });
}

export interface ApiAuditLog {
    id: string;
    time: string;
    event: string;
}

export async function apiGetAuditLogs() {
    return (await request<ApiAuditLog[]>("/api/settings/logs")) || (SYSTEM_LOGS as unknown as ApiAuditLog[]);
}

// --- Notifications ---

export interface ApiNotification {
    id: string;
    title: string;
    message: string;
    severity: string;
    isRead: boolean;
    createdAt: string;
}

export async function apiGetNotifications() {
    return (await request<ApiNotification[]>("/api/notifications")) || MOCK_NOTIFICATIONS;
}

export async function apiMarkNotificationsRead() {
    return request("/api/notifications/read-all", { method: "PUT" });
}

// --- Theft History ---

export interface ApiTheftEvent {
    eventId: string;
    timestamp: string;
    houseId: string;
    reason: string;
    status: string;
}

export async function apiGetTheftHistory() {
    return request<ApiTheftEvent[]>("/api/reports/theft-history");
}

// --- Cookie Consent ---

export interface CookieConsentStatus {
    hasConsent: boolean;
    essential: boolean;
    analytics: boolean;
    marketing: boolean;
    consentDate?: string;
}

export interface CookieConsentRequest {
    essential: boolean;
    analytics: boolean;
    marketing: boolean;
}

export async function apiGetCookieConsent(): Promise<CookieConsentStatus> {
    return (await request<CookieConsentStatus>("/api/cookies/status")) || {
        hasConsent: false,
        essential: false,
        analytics: false,
        marketing: false,
    };
}

export async function apiSetCookieConsent(consent: CookieConsentRequest) {
    return request("/api/cookies/consent", {
        method: "POST",
        body: JSON.stringify(consent),
    });
}

export async function apiRejectAllCookies() {
    return request("/api/cookies/reject", {
        method: "POST",
    });
}

export async function apiResetCookieConsent() {
    return request("/api/cookies/reset", {
        method: "POST",
    });
}
