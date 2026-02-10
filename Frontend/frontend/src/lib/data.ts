// lib/data.ts

export type AssetStatus = "healthy" | "warning" | "critical" | "offline";

export interface Asset {
  id: string;
  type: "Transformer" | "Pole" | "Substation";
  location: string;
  status: AssetStatus;
  load: number; // Percentage
  lastInspection: string;
}

export const MOCK_ASSETS: Asset[] = [
  { id: "TR-01", type: "Transformer", location: "Sector 4 - North", status: "healthy", load: 45, lastInspection: "2026-01-10" },
  { id: "TR-02", type: "Transformer", location: "Sector 4 - East", status: "warning", load: 88, lastInspection: "2026-02-01" },
  { id: "TR-03", type: "Pole", location: "Sector 4 - West", status: "critical", load: 120, lastInspection: "2026-02-11" },
  { id: "TR-04", type: "Pole", location: "Sector 4 - South", status: "healthy", load: 30, lastInspection: "2026-01-15" },
  { id: "SUB-01", type: "Substation", location: "Sector 4 - Main", status: "healthy", load: 65, lastInspection: "2025-12-20" },
  { id: "TR-05", type: "Transformer", location: "Sector 3 - Border", status: "offline", load: 0, lastInspection: "2026-02-09" },
];

export const SYSTEM_LOGS = [
  { id: 1, time: "10:42", event: "User 'Admin' updated threshold to 95%" },
  { id: 2, time: "10:30", event: "Automated isolation triggered on TR-03" },
  { id: 3, time: "09:15", event: "System backup completed" },
];