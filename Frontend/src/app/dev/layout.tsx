"use client";

import { Sidebar } from "@/components/layout/DevSidebar";
import { useAuth } from "@/hooks/useAuth";

export default function DevLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { loading } = useAuth('dev');

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-void">
        <div className="text-acid font-mono">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-void">
      <Sidebar />
      <main className="flex-1 overflow-y-auto custom-scroll">
        {children}
      </main>
    </div>
  );
}
