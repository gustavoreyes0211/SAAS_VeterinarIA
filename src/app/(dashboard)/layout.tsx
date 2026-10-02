import React from "react";
import { CollapsibleSidebar } from "@/components/layout/CollapsibleSidebar";
import { Header } from "@/components/layout/Header";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen w-full bg-slate-950 text-slate-100 overflow-hidden font-sans">
      {/* Sidebar Colapsable con Tooltips */}
      <CollapsibleSidebar branchId="central" />

      {/* Contenedor Principal */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Header branchId="central" />
        <main className="flex-1 overflow-y-auto p-6 bg-gradient-to-b from-slate-950 via-slate-900/50 to-slate-950">
          {children}
        </main>
      </div>
    </div>
  );
}
