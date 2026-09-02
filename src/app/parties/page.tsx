"use client";
// src/app/parties/page.tsx
import api from "@/lib/api";
import type { IParty } from "@/types";
import { useQuery } from "@tanstack/react-query";
import { clsx } from "clsx";
import {
  ArrowLeft,
  ChevronRight,
  MapPin,
  Phone,
  Plus,
  Search,
  User,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function PartiesPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"all" | "active" | "inactive">("all");

  const { data, isLoading } = useQuery({
    queryKey: ["parties"],
    queryFn: () =>
      api.get<{ data: IParty[] }>("/parties").then((r) => r.data.data),
  });

  const filtered = (data ?? []).filter((p) => {
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      (p.name ?? "").toLowerCase().includes(q) ||
      (p.phone ?? "").includes(q) ||
      (p.hatName ?? "").toLowerCase().includes(q);
    const matchStatus = status === "all" || p.status === status;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-5">
      {/* Back */}
      <Link
        href="/dashboard"
        className="sticky top-16 z-10 inline-flex items-center gap-1.5 text-sm text-[#7a5730] hover:text-[#e08600] bg-[#faf8f4] py-2"
      >
        <ArrowLeft className="w-4 h-4" /> ড্যাশবোর্ডে ফিরে যান
      </Link>

      {/* Actions row */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7a5730]/50" />
          <input
            type="text"
            placeholder="নাম, ফোন বা হাটের নাম দিয়ে খুঁজুন..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-10"
          />
        </div>
        <div className="flex gap-2">
          {(["all", "active", "inactive"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatus(s)}
              className={clsx(
                "px-4 py-2.5 rounded-lg text-sm font-medium transition-all border",
                status === s
                  ? "bg-[#e08600] text-white border-[#e08600]"
                  : "bg-white text-[#5c4020] border-[#ede4d0] hover:border-[#e08600]/50",
              )}
            >
              {s === "all" ? "সব" : s === "active" ? "সক্রিয়" : "নিষ্ক্রিয়"}
            </button>
          ))}
        </div>
        <Link
          href="/parties/new"
          className="btn-primary flex items-center gap-2 whitespace-nowrap"
        >
          <Plus className="w-4 h-4" /> নতুন পার্টি
        </Link>
      </div>

      {/* List */}
      <div className="card overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-7 h-7 border-2 border-[#e08600] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center">
            <User className="w-10 h-10 text-[#dfd0b0] mx-auto mb-3" />
            <p className="text-[#7a5730] font-medium">
              কোনো পার্টি পাওয়া যায়নি
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[#ede4d0]">
            {filtered.map((party) => (
              <Link
                key={party._id}
                href={`/parties/${party._id}`}
                className="flex items-center gap-4 px-5 py-4 hover:bg-[#faf8f4] transition-colors group"
              >
                {/* Avatar */}
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#f9c97d] to-[#e08600] flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold">
                    {party.name.charAt(0)}
                  </span>
                </div>
                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-[#1a1208] truncate">
                    {party.name}
                  </p>
                  <div className="flex items-center gap-3 mt-0.5">
                    {party.phone && (
                      <span className="flex items-center gap-1 text-xs text-[#7a5730]/70">
                        <Phone className="w-3 h-3" /> {party.phone}
                      </span>
                    )}
                    <span className="flex items-center gap-1 text-xs text-[#7a5730]/70">
                      <MapPin className="w-3 h-3" /> {party.hatName || "—"}
                    </span>
                  </div>
                </div>
                {/* Status badge */}
                <span
                  className={clsx(
                    "text-xs px-2.5 py-1 rounded-full font-medium",
                    party.status === "active"
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-600",
                  )}
                >
                  {party.status === "active" ? "সক্রিয়" : "নিষ্ক্রিয়"}
                </span>
                <ChevronRight className="w-4 h-4 text-[#dfd0b0] group-hover:text-[#e08600] transition-colors" />
              </Link>
            ))}
          </div>
        )}
      </div>

      <p className="text-xs text-[#7a5730]/60 text-right">
        মোট {filtered.length} টি পার্টি
      </p>
    </div>
  );
}
