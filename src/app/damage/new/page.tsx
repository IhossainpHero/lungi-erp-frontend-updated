"use client";
// src/app/damage/new/page.tsx

import api, { getErrorMessage } from "@/lib/api";
import type { IParty } from "@/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";

export default function NewDamagePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();

  // Pre-fill from URL (coming from party detail)
  const prePartyId = searchParams.get("partyId") ?? "";

  const [partyId, setPartyId] = useState(prePartyId);
  const [claimDate, setClaimDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [damagedPieces, setDamagedPieces] = useState("");
  const [pricePerPiece, setPricePerPiece] = useState("");
  const [notes, setNotes] = useState("");

  const totalClaim =
    damagedPieces && pricePerPiece
      ? Number(damagedPieces) * Number(pricePerPiece)
      : 0;

  // সব পার্টির লিস্ট — dropdown এর জন্য
  const { data: parties = [] } = useQuery({
    queryKey: ["parties"],
    queryFn: async () => {
      const res = await api.get("/parties");
      return res.data?.data || [];
    },
  });

  // Submit
  const mutation = useMutation({
    mutationFn: (body: unknown) => api.post("/damage", body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["damage"] });
      queryClient.invalidateQueries({ queryKey: ["party-damage", partyId] });
      toast.success("ড্যামেজ ক্লেইম দাখিল হয়েছে");
      router.push(partyId ? `/parties/${partyId}?tab=damage` : "/damage");
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!partyId) return toast.error("পার্টি বেছে নিন");
    if (!damagedPieces || Number(damagedPieces) < 1)
      return toast.error("পিস সংখ্যা দিন");
    if (!pricePerPiece || Number(pricePerPiece) < 0)
      return toast.error("মূল্য দিন");

    mutation.mutate({
      partyId,
      claimDate,
      damagedPieces: Number(damagedPieces),
      pricePerPiece: Number(pricePerPiece),
      notes: notes || undefined,
    });
  };

  return (
    <div className="max-w-xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/damage"
          className="p-2 rounded-lg hover:bg-[#fdf4e7] text-[#7a5730] transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-[#1a1208]">
            নতুন ড্যামেজ ক্লেইম
          </h1>
          <p className="text-sm text-[#7a5730]/70">
            নষ্ট লুঙ্গির বিবরণ দাখিল করুন
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Party selector — dropdown */}
        <div className="card p-4 space-y-3">
          <label className="block text-sm font-semibold text-[#1a1208]">
            পার্টি বেছে নিন
          </label>
          <select
            value={partyId}
            onChange={(e) => setPartyId(e.target.value)}
            className="input-field"
          >
            <option value="">Select Party</option>
            {parties.map((p: IParty) => (
              <option key={p._id} value={p._id}>
                {p.name} - {p.hatName}
              </option>
            ))}
          </select>
        </div>

        {/* Damage details */}
        <div className="card p-4 space-y-4">
          <h2 className="text-sm font-semibold text-[#1a1208]">ক্ষতির বিবরণ</h2>

          {/* Date */}
          <div>
            <label className="block text-xs font-medium text-[#7a5730] mb-1.5">
              ক্লেইমের তারিখ
            </label>
            <input
              type="date"
              value={claimDate}
              onChange={(e) => setClaimDate(e.target.value)}
              required
              className="input-field"
            />
          </div>

          {/* Pieces + Price in grid */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[#7a5730] mb-1.5">
                ক্ষতিগ্রস্ত পিস সংখ্যা
              </label>
              <input
                type="number"
                value={damagedPieces}
                onChange={(e) => setDamagedPieces(e.target.value)}
                placeholder="০"
                min="1"
                required
                className="input-field"
              />
              <p className="text-xs text-[#7a5730]/50 mt-1">১ থান = ৪ পিস</p>
            </div>
            <div>
              <label className="block text-xs font-medium text-[#7a5730] mb-1.5">
                প্রতি পিস বাজারমূল্য (৳)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7a5730]/60">
                  ৳
                </span>
                <input
                  type="number"
                  value={pricePerPiece}
                  onChange={(e) => setPricePerPiece(e.target.value)}
                  placeholder="০"
                  min="0"
                  required
                  className="input-field pl-7"
                />
              </div>
            </div>
          </div>

          {/* Auto total */}
          {totalClaim > 0 && (
            <div className="bg-[#fdf4e7] border border-[#f9c97d] rounded-lg px-4 py-3 flex justify-between items-center">
              <span className="text-sm text-[#7a5730]">মোট ক্লেইম পরিমাণ</span>
              <span className="text-lg font-bold text-[#e08600]">
                ৳{totalClaim.toLocaleString()}
              </span>
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="block text-xs font-medium text-[#7a5730] mb-1.5">
              বিস্তারিত <span className="text-[#7a5730]/40">(ঐচ্ছিক)</span>
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="লুঙ্গি কীভাবে নষ্ট হয়েছে, কোন ব্যাচ ইত্যাদি..."
              className="input-field resize-none"
            />
          </div>
        </div>

        {/* Info box */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
          <p className="font-semibold mb-1 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" /> জানা দরকার
          </p>
          <p className="text-xs leading-relaxed">
            ক্লেইম দাখিলের পর Admin অনুমোদন করলে তবেই বকেয়া থেকে বাদ যাবে।
            অনুমোদন না হলে বকেয়ায় কোনো প্রভাব পড়বে না।
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Link
            href="/damage"
            className="flex-1 text-center py-2.5 border border-[#ede4d0] rounded-xl text-sm font-medium text-[#7a5730] hover:bg-[#fdf4e7] transition-colors"
          >
            বাতিল
          </Link>
          <button
            type="submit"
            disabled={mutation.isPending || !partyId}
            className="flex-1 btn-primary flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <AlertTriangle className="w-4 h-4" />
            {mutation.isPending ? "দাখিল হচ্ছে..." : "ক্লেইম দাখিল করুন"}
          </button>
        </div>
      </form>
    </div>
  );
}
