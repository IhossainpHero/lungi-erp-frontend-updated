import type { IDamageClaim } from "@/types";
import { Loader2, Save, X } from "lucide-react";
import { useState } from "react";

export default function DamageEditModal({
  damage,
  isSaving,
  onClose,
  onSave,
}: {
  damage: IDamageClaim;
  isSaving: boolean;
  onClose: () => void;
  onSave: (body: any) => void;
}) {
  const [claimDate, setClaimDate] = useState(damage.claimDate.slice(0, 10));
  const [damagedPieces, setDamagedPieces] = useState(damage.damagedPieces);
  const [pricePerPiece, setPricePerPiece] = useState(damage.pricePerPiece);
  const [notes, setNotes] = useState(damage.notes ?? "");

  const totalClaim = Number(damagedPieces || 0) * Number(pricePerPiece || 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      claimDate,
      damagedPieces: Number(damagedPieces),
      pricePerPiece: Number(pricePerPiece),
      notes,
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between px-4 sm:px-5 py-4 border-b border-[#ede4d0]">
          <h3 className="font-bold text-[#1a1208]">
            ড্যামেজ ক্লেইম আপডেট করুন
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-[#faf8f4] text-[#7a5730]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#2d1f0e] mb-1.5">
              তারিখ
            </label>
            <input
              type="date"
              value={claimDate}
              onChange={(e) => setClaimDate(e.target.value)}
              className="input-field"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-[#2d1f0e] mb-1.5">
                পিস সংখ্যা
              </label>
              <input
                type="number"
                value={damagedPieces}
                onChange={(e) => setDamagedPieces(Number(e.target.value))}
                className="input-field"
                min={0}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#2d1f0e] mb-1.5">
                প্রতি পিস দাম
              </label>
              <input
                type="number"
                value={pricePerPiece}
                onChange={(e) => setPricePerPiece(Number(e.target.value))}
                className="input-field"
                min={0}
                step="0.01"
                required
              />
            </div>
          </div>

          <div className="flex justify-between text-sm bg-[#fdf4e7] rounded-lg px-3 py-2">
            <span className="text-[#7a5730]">মোট দাবি</span>
            <span className="text-red-600 font-bold">
              ৳{totalClaim.toLocaleString()}
            </span>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#2d1f0e] mb-1.5">
              নোট (ঐচ্ছিক)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="input-field"
              rows={2}
            />
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 text-sm px-4 py-2.5 rounded-lg border border-[#ede4d0] text-[#5c4020] hover:bg-[#faf8f4] transition-colors"
            >
              বাতিল
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="flex-1 btn-primary text-sm flex items-center justify-center gap-2"
            >
              {isSaving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              সংরক্ষণ করুন
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
