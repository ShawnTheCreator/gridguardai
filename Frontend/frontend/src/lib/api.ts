/**
 * GridGuard AI — Frontend API Client
 * 
 * Every call is wrapped in try/catch with graceful fallback.
 * If the backend is unreachable, returns null so callers fall back to mock data.
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5078";

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

export async function apiLogin(email: string, password: string): Promise<LoginResponse | null> {
    return request<LoginResponse>("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
    });
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
    return request<DashboardSummary>("/api/dashboard/summary");
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
    return request<ApiAsset[]>("/api/assets");
}

export async function apiGetAsset(id: string) {
    return request<ApiAsset>(`/api/assets/${id}`);
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
    return request<ApiIncident[]>(`/api/incidents${query}`);
}

export async function apiDispatchIncident(id: string) {
    return request<ApiIncident>(`/api/incidents/${id}/dispatch`, { method: "PUT" });
}

// --- Telemetry ---

export async function apiGetRecentTelemetry() {
    return request<Array<{ time: string; deviceId: string; current: number }>>("/api/telemetry/recent");
}

// --- Settings ---

export interface ApiSettings {
    sensitivity: number;
    autoIsolate: boolean;
}

export async function apiGetSettings() {
    return request<ApiSettings>("/api/settings");
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
    return request<ApiAuditLog[]>("/api/settings/logs");
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
    return request<ApiNotification[]>("/api/notifications");
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
