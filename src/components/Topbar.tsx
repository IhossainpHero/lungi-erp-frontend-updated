"use client";
// src/components/Topbar.tsx
import { Menu, Bell } from "lucide-react";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/context/auth.store";

const pageTitles: Record<string, string> = {
  "/dashboard":   "ড্যাশবোর্ড",
  "/parties":     "পার্টি তালিকা",
  "/collections": "কালেকশন",
  "/payments":    "পেমেন্ট",
  "/damage":      "ড্যামেজ ক্লেইম",
  "/services":    "সার্ভিস ব্যবস্থাপনা",
  "/settings":    "সেটিংস",
};

const roleLabels: Record<string, string> = {
  admin: "অ্যাডমিন",
  moderator: "মডারেটর",
  staff: "স্টাফ",
};

interface TopbarProps {
  onMenuClick: () => void;
}

export default function Topbar({ onMenuClick }: TopbarProps) {
  const pathname = usePathname();
  const { user } = useAuthStore();

  // Find title for current route
  const title =
    Object.entries(pageTitles).find(([path]) => pathname.startsWith(path))?.[1] ??
    "NPC";

  return (
    <header className="sticky top-0 z-20 h-16 bg-white/90 backdrop-blur-md border-b border-[#ede4d0] flex items-center px-4 gap-4">
      {/* Hamburger - mobile */}
      <button
        onClick={onMenuClick}
        className="lg:hidden p-2 rounded-lg text-[#5c4020] hover:bg-[#faf8f4] transition-colors"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Page title */}
      <h1 className="heading-bengali font-semibold text-[#1a1208] text-lg flex-1">
        {title}
      </h1>

      {/* Right section */}
      <div className="flex items-center gap-2">
        {/* Notification bell (placeholder) */}
        <button className="p-2 rounded-lg text-[#7a5730]/60 hover:text-[#e08600] hover:bg-[#fdf4e7] transition-colors relative">
          <Bell className="w-5 h-5" />
        </button>

        {/* Avatar */}
        <div className="flex items-center gap-2.5 pl-2 border-l border-[#ede4d0]">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#f9c97d] to-[#e08600] flex items-center justify-center">
            <span className="text-white font-bold text-sm">
              {user?.name?.charAt(0) ?? "?"}
            </span>
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-medium text-[#1a1208] leading-tight">{user?.name}</p>
            <p className="text-xs text-[#7a5730]/60">
              {user?.role ? roleLabels[user.role] : ""}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
