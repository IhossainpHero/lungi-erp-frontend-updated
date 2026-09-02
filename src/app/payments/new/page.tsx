"use client";
// src/app/payments/new/page.tsx

import api, { getErrorMessage } from "@/lib/api";
import type { ILedgerSummary, IParty, PaymentType } from "@/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { clsx } from "clsx";
import { ArrowLeft, CheckCircle, Wallet } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

const typeOptions: { value: PaymentType; label: string; desc: string }[] = [
  { value: "partial", label: "আংশিক", desc: "কিছু টাকা দিলেন" },
  { value: "full", label: "পূর্ণ", desc: "বকেয়া পুরো শোধ" },
  { value: "halkhat", label: "হালখাতা", desc: "বার্ষিক হালখাতা পেমেন্ট" },
];

export default function NewPaymentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();

  // Pre-fill from URL params (coming from party detail page)
  const prePartyId = searchParams.get("partyId") ?? "";

  // -------------------------
  // PARTY LIST — collections/new এর মতো সাধারণ dropdown
  // -------------------------
  const { data: parties = [] } = useQuery({
    queryKey: ["parties"],
    queryFn: async () => {
      const res = await api.get("/parties");
      return res.data?.data || [];
    },
  });

  // Form state
  const [partyId, setPartyId] = useState(prePartyId);
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [amount, setAmount] = useState("");
  const [type, setType] = useState<PaymentType>("partial");
  const [notes, setNotes] = useState("");

  const selectedParty = parties.find((p: IParty) => p._id === partyId);

  // Ledger — show current due
  const { data: ledger } = useQuery({
    queryKey: ["ledger-due", partyId],
    queryFn: () =>
      api
        .get<{ data: ILedgerSummary }>(`/parties/${partyId}/ledger`)
        .then((r) => r.data.data),
    enabled: !!partyId,
  });

  // Auto-fill amount if type = full
  useEffect(() => {
    if (type === "full" && ledger?.totalDue) {
      setAmount(String(ledger.totalDue));
    }
  }, [type, ledger]);

  // Submit
  const mutation = useMutation({
    mutationFn: (body: unknown) => api.post("/payments", body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payments"] });
      queryClient.invalidateQueries({ queryKey: ["ledger", partyId] });
      queryClient.invalidateQueries({ queryKey: ["parties-due"] });
      toast.success("পেমেন্ট সফলভাবে সেভ হয়েছে");
      router.push(partyId ? `/parties/${partyId}` : "/payments");
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!partyId) return toast.error("পার্টি বেছে নিন");
    if (!amount || Number(amount) <= 0) return toast.error("সঠিক পরিমাণ দিন");

    mutation.mutate({
      partyId,
      date,
      amount: Number(amount),
      method: "cash", // "মাধ্যম" ফিল্ড ফর্ম থেকে সরানো হয়েছে, ব্যাকএন্ডের জন্য ডিফল্ট পাঠানো হচ্ছে
      type,
      notes: notes || undefined,
    });
  };

  return (
    <div className="max-w-xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/payments"
          className="p-2 rounded-lg hover:bg-[#fdf4e7] text-[#7a5730] transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-[#1a1208]">নতুন পেমেন্ট</h1>
          <p className="text-sm text-[#7a5730]/70">পার্টির বকেয়া পরিশোধ</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Party selector — collections/new এর মতো dropdown */}
        <div className="card p-4 space-y-3">
          <label className="block text-sm font-semibold text-[#1a1208]">
            পার্টি নির্বাচন
          </label>

          <select
            value={partyId}
            onChange={(e) => {
              setPartyId(e.target.value);
              setAmount("");
            }}
            className="input-field"
          >
            <option value="">Select Party</option>
            {parties.map((p: IParty) => (
              <option key={p._id} value={p._id}>
                {p.name} - {p.hatName}
              </option>
            ))}
          </select>

          {selectedParty && ledger && (
            <div className="bg-[#fdf4e7] border border-[#f9c97d] rounded-lg px-4 py-3">
              <p className="text-xs text-[#7a5730]/70">
                বর্তমান বকেয়া:
                <span className="font-bold text-red-600 ml-1">
                  ৳{ledger.totalDue.toLocaleString()}
                </span>
              </p>
            </div>
          )}
        </div>

        {/* Payment details */}
        <div className="card p-4 space-y-4">
          <h2 className="text-sm font-semibold text-[#1a1208]">
            পেমেন্টের তথ্য
          </h2>

          {/* Date */}
          <div>
            <label className="block text-xs font-medium text-[#7a5730] mb-1.5">
              তারিখ
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              className="input-field"
            />
          </div>

          {/* Type */}
          <div>
            <label className="block text-xs font-medium text-[#7a5730] mb-1.5">
              পেমেন্টের ধরন
            </label>
            <div className="grid grid-cols-3 gap-2">
              {typeOptions.map((t) => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => setType(t.value)}
                  className={clsx(
                    "border rounded-lg px-3 py-2.5 text-left transition-all",
                    type === t.value
                      ? "border-[#e08600] bg-[#fdf4e7] shadow-sm"
                      : "border-[#ede4d0] hover:border-[#e08600]/40",
                  )}
                >
                  <p
                    className={clsx(
                      "text-sm font-semibold",
                      type === t.value ? "text-[#e08600]" : "text-[#1a1208]",
                    )}
                  >
                    {t.label}
                  </p>
                  <p className="text-xs text-[#7a5730]/60 mt-0.5">{t.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Amount */}
          <div>
            <label className="block text-xs font-medium text-[#7a5730] mb-1.5">
              পরিমাণ (টাকা)
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#7a5730]/60 font-medium">
                ৳
              </span>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="০"
                min="1"
                required
                className="input-field pl-8"
              />
            </div>
            {ledger && Number(amount) > ledger.totalDue && (
              <p className="text-xs text-amber-600 mt-1">
                ⚠️ পরিমাণ বর্তমান বকেয়ার (৳{ledger.totalDue.toLocaleString()})
                চেয়ে বেশি
              </p>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-medium text-[#7a5730] mb-1.5">
              নোট <span className="text-[#7a5730]/40">(ঐচ্ছিক)</span>
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="বিশেষ কিছু জানাতে চাইলে লিখুন..."
              className="input-field resize-none"
            />
          </div>
        </div>

        {/* Summary */}
        {partyId && amount && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4">
            <p className="text-sm font-semibold text-green-800 mb-1 flex items-center gap-2">
              <CheckCircle className="w-4 h-4" /> পেমেন্ট সারসংক্ষেপ
            </p>
            <div className="text-sm text-green-700 space-y-0.5">
              <p>
                পার্টি: <strong>{selectedParty?.name}</strong>
              </p>
              <p>
                পরিমাণ: <strong>৳{Number(amount).toLocaleString()}</strong>
              </p>
              <p>
                ধরন:{" "}
                <strong>
                  {typeOptions.find((t) => t.value === type)?.label}
                </strong>
              </p>
              {ledger && (
                <p>
                  পেমেন্টের পর বকেয়া:{" "}
                  <strong>
                    ৳
                    {Math.max(
                      0,
                      ledger.totalDue - Number(amount),
                    ).toLocaleString()}
                  </strong>
                </p>
              )}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <Link
            href="/payments"
            className="flex-1 text-center py-2.5 border border-[#ede4d0] rounded-xl text-sm font-medium text-[#7a5730] hover:bg-[#fdf4e7] transition-colors"
          >
            বাতিল
          </Link>
          <button
            type="submit"
            disabled={mutation.isPending || !partyId}
            className="flex-1 btn-primary flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Wallet className="w-4 h-4" />
            {mutation.isPending ? "সেভ হচ্ছে..." : "পেমেন্ট সেভ করুন"}
          </button>
        </div>
      </form>
    </div>
  );
}
