"use client";
// src/app/damage/page.tsx
import { useAuthStore } from "@/context/auth.store";
import api from "@/lib/api";
import type { IDamageClaim, IParty } from "@/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { clsx } from "clsx";
import { format } from "date-fns";
import { AlertTriangle, CheckCircle, Clock, Plus, XCircle } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import toast from "react-hot-toast";

const statusConfig = {
  pending: {
    label: "অপেক্ষমান",
    icon: Clock,
    class: "bg-yellow-50 text-yellow-700",
  },
  approved: {
    label: "অনুমোদিত",
    icon: CheckCircle,
    class: "bg-green-50 text-green-700",
  },
  rejected: {
    label: "প্রত্যাখ্যাত",
    icon: XCircle,
    class: "bg-red-50 text-red-600",
  },
};

export default function DamagePage() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  // ---------- Filters ----------
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [partyId, setPartyId] = useState("");

  // সব পার্টির লিস্ট — dropdown এর জন্য
  const { data: parties = [] } = useQuery({
    queryKey: ["parties"],
    queryFn: async () => {
      const res = await api.get("/parties");
      return res.data?.data || [];
    },
  });

  const clearFilters = () => {
    setFromDate("");
    setToDate("");
    setPartyId("");
  };

  const hasFilters = !!(fromDate || toDate || partyId);

  // ---------- Damage list (filtered) ----------
  const { data, isLoading } = useQuery({
    queryKey: ["damage", partyId, fromDate, toDate],
    queryFn: () => {
      const params = new URLSearchParams();
      if (partyId) params.set("partyId", partyId);
      if (fromDate) params.set("from", fromDate);
      if (toDate) params.set("to", toDate);
      return api
        .get<{ data: IDamageClaim[] }>(`/damage?${params.toString()}`)
        .then((r) => r.data.data);
    },
  });

  const updateStatus = useMutation({
    mutationFn: ({
      id,
      status,
    }: {
      id: string;
      status: "approved" | "rejected";
    }) => api.patch(`/damage/${id}/status`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["damage"] });
      toast.success("স্ট্যাটাস আপডেট হয়েছে");
    },
    onError: () => toast.error("আপডেট ব্যর্থ হয়েছে"),
  });

  return (
    <div className="space-y-5">
      <div className="flex justify-end">
        <Link
          href="/damage/new"
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> নতুন ক্লেইম
        </Link>
      </div>

      {/* ---------- Filter bar ---------- */}
      <div className="card p-4 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Party filter — select dropdown */}
          <div>
            <label className="block text-xs font-medium text-[#7a5730] mb-1.5">
              পার্টি
            </label>
            <select
              value={partyId}
              onChange={(e) => setPartyId(e.target.value)}
              className="input-field"
            >
              <option value="">সব পার্টি</option>
              {parties.map((p: IParty) => (
                <option key={p._id} value={p._id}>
                  {p.name} - {p.hatName}
                </option>
              ))}
            </select>
          </div>

          {/* From date */}
          <div>
            <label className="block text-xs font-medium text-[#7a5730] mb-1.5">
              তারিখ থেকে
            </label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="input-field"
            />
          </div>

          {/* To date */}
          <div>
            <label className="block text-xs font-medium text-[#7a5730] mb-1.5">
              তারিখ পর্যন্ত
            </label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="input-field"
            />
          </div>
        </div>

        {hasFilters && (
          <button
            onClick={clearFilters}
            className="text-xs text-[#e08600] hover:underline font-medium"
          >
            ফিল্টার মুছে ফেলুন
          </button>
        )}
      </div>

      <div className="card overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center py-16">
            <div className="w-7 h-7 border-2 border-[#e08600] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (data ?? []).length === 0 ? (
          <div className="py-16 text-center">
            <AlertTriangle className="w-10 h-10 text-[#dfd0b0] mx-auto mb-3" />
            <p className="text-[#7a5730]">
              {hasFilters
                ? "এই ফিল্টারে কোনো ক্লেইম পাওয়া যায়নি"
                : "কোনো ড্যামেজ ক্লেইম নেই"}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[#ede4d0]">
            {(data ?? []).map((d) => {
              const cfg = statusConfig[d.status];
              const Icon = cfg.icon;
              return (
                <div
                  key={d._id}
                  className="px-5 py-4 flex items-start justify-between gap-4 hover:bg-[#faf8f4] transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium text-[#1a1208] text-sm">
                        {d.partyId && typeof d.partyId === "object"
                          ? (d.partyId as { name: string }).name
                          : "—"}
                      </p>
                      <span
                        className={clsx(
                          "flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium",
                          cfg.class,
                        )}
                      >
                        <Icon className="w-3 h-3" /> {cfg.label}
                      </span>
                    </div>
                    <p className="text-xs text-[#7a5730]/70">
                      {format(new Date(d.claimDate), "dd/MM/yy")} ·{" "}
                      {d.damagedPieces} পিস × ৳{d.pricePerPiece}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-[#1a1208]">
                      ৳{d.totalClaim.toLocaleString()}
                    </p>
                    {d.status === "pending" && user?.role === "admin" && (
                      <div className="flex gap-1.5 mt-2 justify-end">
                        <button
                          onClick={() =>
                            updateStatus.mutate({
                              id: d._id,
                              status: "approved",
                            })
                          }
                          className="text-xs px-2.5 py-1 rounded bg-green-100 text-green-700 hover:bg-green-200 transition-colors"
                        >
                          অনুমোদন
                        </button>
                        <button
                          onClick={() =>
                            updateStatus.mutate({
                              id: d._id,
                              status: "rejected",
                            })
                          }
                          className="text-xs px-2.5 py-1 rounded bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
                        >
                          প্রত্যাখ্যান
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
