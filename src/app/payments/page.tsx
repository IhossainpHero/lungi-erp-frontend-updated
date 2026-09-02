"use client";
// src/app/payments/page.tsx
import api from "@/lib/api";
import type { IParty, IPayment } from "@/types";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Calendar, Plus, Search, Wallet, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

const methodLabel: Record<string, string> = {
  cash: "নগদ",
  bkash: "বিকাশ",
  bank: "ব্যাংক",
};
const typeLabel: Record<string, string> = {
  partial: "আংশিক",
  full: "পূর্ণ",
  halkhat: "হালখাতা",
};

export default function PaymentsPage() {
  // ── তারিখ ফিল্টার ──
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  // ── সব পার্টি একবারে লোড (client-side name ফিল্টারের জন্য) ──
  const { data: allParties = [] } = useQuery({
    queryKey: ["parties"],
    queryFn: () =>
      api.get<{ data: IParty[] }>("/parties").then((r) => r.data.data),
  });

  // ── পার্টি অটোসাজেশন ──
  const [partyQuery, setPartyQuery] = useState("");
  const [selectedParty, setSelectedParty] = useState<IParty | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestBoxRef = useRef<HTMLDivElement>(null);

  // নাম দিয়ে client-side ফিল্টার — substring match, তাই এক-দুই অক্ষরেও কাজ করে
  const filteredParties: IParty[] =
    partyQuery.trim().length > 0
      ? allParties.filter((p) =>
          p.name.toLowerCase().includes(partyQuery.trim().toLowerCase()),
        )
      : allParties;

  // ইনপুট-এর বাইরে ক্লিক করলে সাজেশন বন্ধ
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        suggestBoxRef.current &&
        !suggestBoxRef.current.contains(e.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSelectParty = (party: IParty) => {
    setSelectedParty(party);
    setPartyQuery(party.name);
    setShowSuggestions(false);
  };

  const handleClearParty = () => {
    setSelectedParty(null);
    setPartyQuery("");
  };

  const handleResetAll = () => {
    setFromDate("");
    setToDate("");
    handleClearParty();
  };

  const hasFilter = !!fromDate || !!toDate || !!selectedParty;

  // ── পেমেন্ট লিস্ট ──
  const { data, isLoading } = useQuery({
    queryKey: ["payments", fromDate, toDate, selectedParty?._id],
    queryFn: () => {
      const params: Record<string, string> = {};
      if (fromDate) params.from = fromDate;
      if (toDate) params.to = toDate;
      if (selectedParty) params.partyId = selectedParty._id;
      return api
        .get<{ data: IPayment[] }>("/payments", { params })
        .then((r) => r.data.data);
    },
  });

  return (
    <div className="space-y-5">
      <div className="flex justify-end">
        <Link
          href="/payments/new"
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> নতুন পেমেন্ট
        </Link>
      </div>

      {/* ══════ ফিল্টার বার ══════ */}
      <div className="card p-4 flex flex-col sm:flex-row gap-3 sm:items-center sm:flex-wrap">
        {/* পার্টি অটোসাজেশন */}
        <div ref={suggestBoxRef} className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-[#7a5730]/50 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={partyQuery}
            onChange={(e) => {
              setPartyQuery(e.target.value);
              setSelectedParty(null);
              setShowSuggestions(true);
            }}
            onFocus={() => setShowSuggestions(true)}
            placeholder="পার্টির নাম লিখুন..."
            className="input-field pl-9 pr-8 text-sm py-2 w-full"
          />
          {partyQuery && (
            <button
              onClick={handleClearParty}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#7a5730]/50 hover:text-[#7a5730]"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}

          {/* সাজেশন ড্রপডাউন */}
          {showSuggestions && !selectedParty && (
            <div className="absolute z-20 top-full left-0 right-0 mt-1 bg-white border border-[#ede4d0] rounded-lg shadow-lg max-h-56 overflow-y-auto">
              {filteredParties.length === 0 ? (
                <div className="px-3 py-3 text-xs text-[#7a5730]/60">
                  কোনো পার্টি পাওয়া যায়নি
                </div>
              ) : (
                filteredParties.map((p) => (
                  <button
                    key={p._id}
                    onClick={() => handleSelectParty(p)}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-[#faf8f4] transition-colors"
                  >
                    <span className="font-medium text-[#1a1208]">{p.name}</span>
                    {p.hatName && (
                      <span className="text-xs text-[#7a5730]/60 ml-1.5">
                        · {p.hatName}
                      </span>
                    )}
                  </button>
                ))
              )}
            </div>
          )}
        </div>

        {/* তারিখ রেঞ্জ */}
        <div className="flex items-center gap-2 flex-wrap">
          <Calendar className="w-4 h-4 text-[#7a5730]/60 hidden sm:block" />
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="input-field text-sm py-2"
          />
          <span className="text-[#7a5730]/50 text-sm">—</span>
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="input-field text-sm py-2"
          />
        </div>

        {hasFilter && (
          <button
            onClick={handleResetAll}
            className="text-sm px-3 py-2 border border-[#ede4d0] rounded-lg text-[#7a5730] hover:bg-[#fdf4e7] transition-colors"
          >
            রিসেট
          </button>
        )}
      </div>

      {/* ══════ পেমেন্ট লিস্ট ══════ */}
      <div className="card overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center py-16">
            <div className="w-7 h-7 border-2 border-[#e08600] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (data ?? []).length === 0 ? (
          <div className="py-16 text-center">
            <Wallet className="w-10 h-10 text-[#dfd0b0] mx-auto mb-3" />
            <p className="text-[#7a5730]">
              {hasFilter ? "এই ফিল্টারে কোনো পেমেন্ট নেই" : "কোনো পেমেন্ট নেই"}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[#ede4d0]">
            {(data ?? []).map((p) => (
              <div
                key={p._id}
                className="flex items-center justify-between gap-3 px-5 py-3.5 hover:bg-[#faf8f4] transition-colors"
              >
                <div className="min-w-0">
                  <p className="font-medium text-[#1a1208] text-sm truncate">
                    {p.partyId && typeof p.partyId === "object"
                      ? (p.partyId as { name: string }).name
                      : "—"}
                  </p>
                  <p className="text-xs text-[#7a5730]/70 mt-0.5">
                    {format(new Date(p.date), "dd/MM/yy")} ·{" "}
                    {methodLabel[p.method]} · {typeLabel[p.type]}
                  </p>
                </div>
                <span className="font-semibold text-green-600 text-sm whitespace-nowrap">
                  ৳{p.amount.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
