/**
 * useSignalR — connects to the GridGuard SignalR hub and listens for theft alerts.
 * Install: npm install @microsoft/signalr
 */
"use client";

import { useEffect, useRef, useState } from "react";
import * as signalR from "@microsoft/signalr";

export interface TheftAlert {
    pole_id: string;
    status: "Red" | "Green" | "Pending";
    confidence_score: number;
    waveform_url: string;
    timestamp: string;
}

const HUB_URL =
    process.env.NEXT_PUBLIC_API_URL
        ? `${process.env.NEXT_PUBLIC_API_URL}/hubs/gridguard`
        : "http://localhost:5078/hubs/gridguard";

export function useSignalR() {
    const [latestAlert, setLatestAlert] = useState<TheftAlert | null>(null);
    const [connectionStatus, setConnectionStatus] = useState<"connecting" | "connected" | "disconnected">("connecting");
    const connectionRef = useRef<signalR.HubConnection | null>(null);

    useEffect(() => {
        const connection = new signalR.HubConnectionBuilder()
            .withUrl(HUB_URL, {
                accessTokenFactory: () => localStorage.getItem("gridguard_token") ?? "",
            })
            .withAutomaticReconnect()
            .configureLogging(signalR.LogLevel.Warning)
            .build();

        connectionRef.current = connection;

        connection.on("TheftAlert", (alert: TheftAlert) => {
            setLatestAlert(alert);
        });

        connection.onreconnecting(() => setConnectionStatus("connecting"));
        connection.onreconnected(() => setConnectionStatus("connected"));
        connection.onclose(() => setConnectionStatus("disconnected"));

        connection
            .start()
            .then(() => setConnectionStatus("connected"))
            .catch(() => setConnectionStatus("disconnected"));

        return () => {
            connection.stop();
        };
    }, []);

    return { latestAlert, connectionStatus };
}
