"use client";
// src/components/Sidebar.tsx
import { useAuthStore } from "@/context/auth.store";
import { clsx } from "clsx";
import {
  AlertTriangle,
  ChevronRight,
  ClipboardList,
  LayoutDashboard,
  LogOut,
  Settings,
  ShieldCheck,
  Users,
  Wallet,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
  adminOnly?: boolean;
  badge?: string;
}

const navItems: NavItem[] = [
  { href: "/dashboard", label: "ড্যাশবোর্ড", icon: LayoutDashboard },
  { href: "/parties", label: "পার্টি", icon: Users },
  { href: "/collections", label: "কালেকশন", icon: ClipboardList },
  { href: "/payments", label: "পেমেন্ট", icon: Wallet },
  { href: "/damage", label: "ড্যামেজ ক্লেইম", icon: AlertTriangle },
  { href: "/services", label: "সার্ভিস", icon: Settings, adminOnly: true },
  { href: "/settings", label: "সেটিংস", icon: ShieldCheck, adminOnly: true },
];

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export default function Sidebar({ open, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();
  const isParty = user?.role === "party";

  // ✅ পার্টি ইউজারের জন্য শুধু নিজের হিসাবের একটাই লিংক
  const visibleItems: NavItem[] = isParty
    ? [{ href: `/parties/${user?.partyId}`, label: "আমার হিসাব", icon: Wallet }]
    : navItems.filter((item) => !item.adminOnly || user?.role === "admin");

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-[#1a1208]/40 backdrop-blur-sm z-30 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar panel */}
      <aside
        className={clsx(
          "fixed top-0 left-0 h-full z-40 flex flex-col transition-transform duration-300 ease-in-out",
          "w-[260px] bg-[#1a1208]",
          open ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-5 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#f9c97d] to-[#e08600] flex items-center justify-center flex-shrink-0">
              <svg width="22" height="22" viewBox="0 0 44 44" fill="none">
                <rect
                  x="6"
                  y="8"
                  width="32"
                  height="4"
                  rx="2"
                  fill="white"
                  opacity="0.9"
                />
                <rect
                  x="6"
                  y="20"
                  width="32"
                  height="4"
                  rx="2"
                  fill="white"
                  opacity="0.7"
                />
                <rect
                  x="6"
                  y="32"
                  width="32"
                  height="4"
                  rx="2"
                  fill="white"
                  opacity="0.5"
                />
                <rect
                  x="8"
                  y="6"
                  width="4"
                  height="32"
                  rx="2"
                  fill="white"
                  opacity="0.3"
                />
                <rect
                  x="20"
                  y="6"
                  width="4"
                  height="32"
                  rx="2"
                  fill="white"
                  opacity="0.3"
                />
                <rect
                  x="32"
                  y="6"
                  width="4"
                  height="32"
                  rx="2"
                  fill="white"
                  opacity="0.3"
                />
              </svg>
            </div>
            <div>
              <span className="heading-bengali text-white font-bold text-base leading-tight block">
                NPC
              </span>
              <span className="text-[#f9c97d]/60 text-[11px] leading-tight">
                ম্যানেজমেন্ট সিস্টেম
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden text-white/40 hover:text-white p-1 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nav items */}
        <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-0.5">
          {visibleItems.map((item) => {
            const Icon = item.icon;
            const active =
              pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={clsx(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 group",
                  active
                    ? "bg-[#e08600] text-white shadow-[0_2px_8px_rgba(224,134,0,0.4)]"
                    : "text-white/60 hover:text-white hover:bg-white/8",
                )}
              >
                <Icon
                  className={clsx(
                    "w-4.5 h-4.5 flex-shrink-0",
                    active
                      ? "text-white"
                      : "text-white/50 group-hover:text-white/80",
                  )}
                  size={18}
                />
                <span className="flex-1">{item.label}</span>
                {active && (
                  <ChevronRight className="w-3.5 h-3.5 text-white/70" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* User profile + logout */}
        <div className="px-3 pb-4 border-t border-white/10 pt-4 space-y-1">
          {/* User info */}
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-white/5">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#f9c97d] to-[#e08600] flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold text-sm">
                {user?.name?.charAt(0) ?? "U"}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-medium truncate">
                {user?.name}
              </p>
              <p className="text-white/40 text-xs">
                {user?.role === "admin"
                  ? "অ্যাডমিন"
                  : user?.role === "moderator"
                    ? "মডারেটর"
                    : "স্টাফ"}
              </p>
            </div>
          </div>

          {/* Logout */}
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-white/50 hover:text-red-400 hover:bg-red-500/10 transition-all duration-150"
          >
            <LogOut size={16} />
            লগআউট
          </button>
        </div>
      </aside>
    </>
  );
}
