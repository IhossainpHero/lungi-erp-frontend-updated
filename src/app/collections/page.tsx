"use client";

import { useAuthStore } from "@/context/auth.store";
import api from "@/lib/api";
import type { ICollection, IParty } from "@/types";
import {
  keepPreviousData,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { format } from "date-fns";
import {
  ArrowLeft,
  Calendar,
  FileDown,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

const PAGE_SIZE = 20;

export default function CollectionsPage() {
  const [page, setPage] = useState(1);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const { user } = useAuthStore();
  const isAdmin = user?.role === "admin";
  const isModerator = user?.role === "moderator";

  const queryClient = useQueryClient();

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

  const filteredParties: IParty[] =
    partyQuery.trim().length > 0
      ? allParties.filter((p) =>
          p.name.toLowerCase().includes(partyQuery.trim().toLowerCase()),
        )
      : allParties;

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
    setPage(1);
  };

  const handleClearParty = () => {
    setSelectedParty(null);
    setPartyQuery("");
    setPage(1);
  };

  const handleResetAll = () => {
    setFromDate("");
    setToDate("");
    handleClearParty();
  };

  const hasFilter = !!fromDate || !!toDate || !!selectedParty;

  // ── কালেকশন লিস্ট ──
  const { data, isLoading } = useQuery({
    queryKey: ["collections", page, fromDate, toDate, selectedParty?._id],
    queryFn: async () => {
      const params: Record<string, string | number> = {
        page,
        limit: PAGE_SIZE,
      };
      if (fromDate) params.from = fromDate;
      if (toDate) params.to = toDate;
      if (selectedParty) params.partyId = selectedParty._id;

      const res = await api.get("/collections", { params });
      return res.data?.data;
    },
    placeholderData: keepPreviousData,
  });

  const collections: ICollection[] = data?.collections || [];
  const total = data?.total || 0;
  const totalPages = Math.ceil(total / PAGE_SIZE);

  const handleDownloadBill = async (
    collectionId: string,
    partyName: string,
    date: Date,
  ) => {
    try {
      setDownloadingId(collectionId);

      const res = await api.get(`/collections/${collectionId}/bill`, {
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");

      link.href = url;
      link.setAttribute(
        "download",
        `bill-${partyName}-${format(date, "dd-MM-yyyy")}.pdf`,
      );

      document.body.appendChild(link);
      link.click();
      link.remove();

      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
    } finally {
      setDownloadingId(null);
    }
  };

  const handleDelete = async (collectionId: string, partyName: string) => {
    const confirmMsg = isAdmin
      ? `"${partyName}"-এর এই কালেকশন এন্ট্রিটা স্থায়ীভাবে ডিলিট করবেন?`
      : `"${partyName}"-এর এই কালেকশন এন্ট্রিটার জন্য ডিলিট রিকোয়েস্ট পাঠাবেন? (অ্যাডমিন অনুমোদন করলে তবেই ডিলিট হবে)`;

    if (!window.confirm(confirmMsg)) return;

    try {
      setDeletingId(collectionId);

      if (isAdmin) {
        await api.delete(`/collections/${collectionId}`);
      } else {
        await api.post(`/collections/${collectionId}/request-delete`);
      }

      await queryClient.invalidateQueries({
        queryKey: ["collections"],
      });
    } catch (err: any) {
      console.error(err);
      alert(err?.response?.data?.message || "ডিলিট করা যায়নি");
    } finally {
      setDeletingId(null);
    }
  };

  const canRequestDelete = isAdmin || isModerator;

  return (
    <div className="space-y-5">
      {/* HEADER */}
      <div className="flex items-center justify-between gap-3">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 text-sm font-medium text-[#7a5730] hover:text-[#e08600] transition"
        >
          <ArrowLeft className="w-4 h-4" />
          ড্যাশবোর্ডে ফিরে যান
        </Link>

        <Link
          href="/collections/new"
          className="btn-primary flex items-center gap-2 whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          নতুন কালেকশন
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
            onChange={(e) => {
              setFromDate(e.target.value);
              setPage(1);
            }}
            className="input-field text-sm py-2"
          />
          <span className="text-[#7a5730]/50 text-sm">—</span>
          <input
            type="date"
            value={toDate}
            onChange={(e) => {
              setToDate(e.target.value);
              setPage(1);
            }}
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

      {/* TABLE / LIST */}
      <div className="card overflow-hidden">
        {isLoading ? (
          <div className="py-16 flex justify-center">
            <div className="w-7 h-7 border-2 border-[#e08600] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : collections.length === 0 ? (
          <p className="text-center py-10 text-[#7a5730]">
            {hasFilter ? "এই ফিল্টারে কোনো কালেকশন নেই" : "কোনো কালেকশন নেই"}
          </p>
        ) : (
          <>
            {/* DESKTOP: TABLE */}
            <div className="hidden sm:block">
              <div className="grid grid-cols-8 px-5 py-3 bg-[#faf8f4] text-xs font-semibold">
                <span>তারিখ</span>
                <span>পার্টি</span>
                <span>হাট</span>
                <span className="text-right">থান</span>
                <span className="text-right">ফোল্ডিং</span>
                <span className="text-right">মোট</span>
                <span></span>
                <span></span>
              </div>

              {collections.map((c) => {
                const partyName =
                  c.partyId && typeof c.partyId === "object"
                    ? (c.partyId as any).name
                    : "party";

                return (
                  <div
                    key={c._id}
                    className="grid grid-cols-8 px-5 py-3 hover:bg-[#faf8f4] items-center border-t border-[#ede4d0]/60 first:border-t-0"
                  >
                    <span>
                      {format(new Date(c.collectionDate), "dd/MM/yy")}
                    </span>

                    <Link
                      href={`/parties/${
                        c.partyId && typeof c.partyId === "object"
                          ? (c.partyId as any)._id
                          : c.partyId
                      }`}
                      className="font-medium text-[#1a1208] hover:text-[#e08600] transition truncate"
                    >
                      {c.partyId && typeof c.partyId === "object"
                        ? (c.partyId as any).name
                        : "—"}
                    </Link>

                    <span className="truncate">{c.hatName}</span>

                    <span className="text-right">{c.totalThan}</span>

                    <span className="text-right">{c.totalFolding ?? 0}</span>

                    <span className="text-right font-semibold">
                      ৳{c.totalAmount?.toLocaleString()}
                    </span>

                    <button
                      onClick={() =>
                        handleDownloadBill(
                          c._id,
                          partyName,
                          new Date(c.collectionDate),
                        )
                      }
                      disabled={downloadingId === c._id}
                      className="flex items-center gap-1 justify-end text-[#e08600] hover:underline text-sm disabled:opacity-50"
                    >
                      <FileDown className="w-4 h-4" />
                      {downloadingId === c._id ? "..." : "বিল"}
                    </button>

                    {canRequestDelete ? (
                      <button
                        onClick={() => handleDelete(c._id, partyName)}
                        disabled={
                          deletingId === c._id || c.deleteRequested === true
                        }
                        title={
                          c.deleteRequested
                            ? "ডিলিট রিকোয়েস্ট পাঠানো হয়েছে — অ্যাডমিন অনুমোদনের অপেক্ষায়"
                            : isAdmin
                              ? "ডিলিট করুন"
                              : "ডিলিট রিকোয়েস্ট পাঠান"
                        }
                        className="flex items-center gap-1 justify-end text-red-600 hover:underline text-sm disabled:opacity-40"
                      >
                        <Trash2 className="w-4 h-4" />

                        {deletingId === c._id
                          ? "..."
                          : c.deleteRequested
                            ? "পেন্ডিং"
                            : "ডিলিট"}
                      </button>
                    ) : (
                      <span />
                    )}
                  </div>
                );
              })}
            </div>

            {/* MOBILE: CARD LIST */}
            <div className="sm:hidden divide-y divide-[#ede4d0]">
              {collections.map((c) => {
                const partyName =
                  c.partyId && typeof c.partyId === "object"
                    ? (c.partyId as any).name
                    : "party";

                return (
                  <div key={c._id} className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <Link
                          href={`/parties/${
                            c.partyId && typeof c.partyId === "object"
                              ? (c.partyId as any)._id
                              : c.partyId
                          }`}
                          className="font-semibold text-[#1a1208] hover:text-[#e08600] transition block truncate"
                        >
                          {partyName}
                        </Link>

                        <div className="flex items-center gap-1.5 text-xs text-[#7a5730]/70 mt-0.5">
                          <span>
                            {format(new Date(c.collectionDate), "dd/MM/yy")}
                          </span>

                          {c.hatName && (
                            <>
                              <span>·</span>
                              <span className="truncate">{c.hatName}</span>
                            </>
                          )}
                        </div>
                      </div>

                      <span className="text-base font-bold text-[#e08600] whitespace-nowrap">
                        ৳{c.totalAmount?.toLocaleString()}
                      </span>
                    </div>

                    <div className="flex gap-4 text-xs text-[#7a5730] mt-2.5">
                      <span>
                        <b className="text-[#1a1208]">{c.totalThan}</b> থান
                      </span>

                      <span>
                        <b className="text-[#1a1208]">{c.totalFolding ?? 0}</b>{" "}
                        ফোল্ডিং
                      </span>
                    </div>

                    <div className="flex items-center gap-4 mt-3 pt-3 border-t border-[#ede4d0]">
                      <button
                        onClick={() =>
                          handleDownloadBill(
                            c._id,
                            partyName,
                            new Date(c.collectionDate),
                          )
                        }
                        disabled={downloadingId === c._id}
                        className="flex items-center gap-1.5 text-[#e08600] text-sm font-medium disabled:opacity-50"
                      >
                        <FileDown className="w-4 h-4" />
                        {downloadingId === c._id ? "..." : "বিল ডাউনলোড"}
                      </button>

                      {canRequestDelete && (
                        <button
                          onClick={() => handleDelete(c._id, partyName)}
                          disabled={
                            deletingId === c._id || c.deleteRequested === true
                          }
                          className="flex items-center gap-1.5 text-red-600 text-sm font-medium disabled:opacity-40 ml-auto"
                        >
                          <Trash2 className="w-4 h-4" />

                          {deletingId === c._id
                            ? "..."
                            : c.deleteRequested
                              ? "পেন্ডিং"
                              : "ডিলিট"}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* PAGINATION */}
      <div className="flex justify-center items-center gap-2 pt-4">
        <button
          disabled={page <= 1}
          onClick={() => setPage((p) => p - 1)}
          className="px-3 py-1 border rounded disabled:opacity-40"
        >
          Prev
        </button>

        <span className="px-3 py-1">
          Page {page} / {totalPages || 1}
        </span>

        <button
          disabled={page >= totalPages}
          onClick={() => setPage((p) => p + 1)}
          className="px-3 py-1 border rounded disabled:opacity-40"
        >
          Next
        </button>
      </div>
    </div>
  );
}
