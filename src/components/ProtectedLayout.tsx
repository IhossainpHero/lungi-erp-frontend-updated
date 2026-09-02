"use client";
// src/components/ProtectedLayout.tsx
import { useRequireAuth } from "@/hooks/useAuth";
import { useRealtimeSync } from "@/hooks/useRealtimeSync";
import { usePathname } from "next/navigation";
import DashboardShell from "./DashboardShell";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, user } = useRequireAuth();
  const pathname = usePathname();
  useRealtimeSync();

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

  if (user && !user.isActive) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#faf8f4]">
        <p className="text-[#7a5730] font-semibold text-center px-4">
          Without admin approval you cannot access
        </p>
      </div>
    );
  }

  // ✅ পার্টি ইউজার শুধু নিজের /parties/{partyId} পেজেই ঢুকতে পারবে,
  // অন্য যেকোনো URL-এ গেলে সাথে সাথে নিজের পেজে ফেরত পাঠাবে
  if (user?.role === "party") {
    const ownPath = `/parties/${user.partyId}`;
    if (pathname !== ownPath) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-[#faf8f4]">
          <div className="flex flex-col items-center gap-3">
            <div className="w-6 h-6 border-2 border-[#e08600] border-t-transparent rounded-full animate-spin" />
            <p className="text-[#7a5730] text-sm">রিডাইরেক্ট হচ্ছে...</p>
          </div>
        </div>
      );
    }
  }

  return <DashboardShell>{children}</DashboardShell>;
}
