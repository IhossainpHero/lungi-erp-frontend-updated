"use client";
// src/components/DashboardShell.tsx
import { useState } from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

export default function DashboardShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#faf8f4]">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main area — offset by sidebar width on large screens */}
      <div className="lg:pl-[260px] flex flex-col min-h-screen">
        <Topbar onMenuClick={() => setSidebarOpen(true)} />

        <main className="flex-1 p-4 sm:p-6 page-enter">
          {children}
        </main>
      </div>
    </div>
  );
}
