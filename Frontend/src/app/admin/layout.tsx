"use client";
import React from "react";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { useRequireAuth } from "@/lib/auth";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = useRequireAuth();
  if (!user) return null; // Block render until auth is confirmed
  return (
    <div className="flex flex-col h-screen w-full bg-void overflow-hidden">
      <Header />
      <div className="flex flex-1 overflow-hidden relative">
        <Sidebar />
        {/* Main Content Area with the Grid Background */}
        <main className="flex-1 overflow-y-auto custom-scroll min-w-0 bg-grid-pattern relative">
          {children}
        </main>
      </div>
    </div>
  );
}