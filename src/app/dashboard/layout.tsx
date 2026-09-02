"use client";
// src/app/dashboard/layout.tsx
import DashboardShell from "@/components/DashboardShell";
import { useRequireAuth } from "@/hooks/useAuth";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useRequireAuth();

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#faf8f4]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-[#e08600] border-t-transparent rounded-full animate-spin" />
          <p className="text-[#7a5730] text-sm">লোড হচ্ছে...</p>
        </div>
      </div>
    );
  }

  return <DashboardShell>{children}</DashboardShell>;
}
