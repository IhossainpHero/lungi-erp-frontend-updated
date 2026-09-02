import type { IPayment } from "@/types";
import { clsx } from "clsx";
import { Loader2, Save, X } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";

export default function PaymentEditModal({
  payment,
  isSaving,
  onClose,
  onSave,
}: {
  payment: IPayment;
  isSaving: boolean;
  onClose: () => void;
  onSave: (body: any) => void;
}) {
  const [date, setDate] = useState(payment.date.slice(0, 10));
  const [amount, setAmount] = useState(payment.amount);
  const [type, setType] = useState(payment.type);
  const [notes, setNotes] = useState(payment.notes ?? "");

  const typeOptions: { value: typeof type; label: string }[] = [
    { value: "partial", label: "আংশিক" },
    { value: "full", label: "পূর্ণ" },
    { value: "halkhat", label: "হালখাতা" },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || amount <= 0) {
      toast.error("সঠিক পরিমাণ দিন");
      return;
    }
    onSave({ date, amount: Number(amount), type, notes });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between px-4 sm:px-5 py-4 border-b border-[#ede4d0]">
          <h3 className="font-bold text-[#1a1208]">পেমেন্ট আপডেট করুন</h3>
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
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="input-field"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#2d1f0e] mb-1.5">
              পরিমাণ (টাকা)
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#7a5730]/60 font-medium">
                ৳
              </span>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="input-field pl-8"
                min={1}
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#2d1f0e] mb-1.5">
              পেমেন্টের ধরন
            </label>
            <div className="grid grid-cols-3 gap-2">
              {typeOptions.map((t) => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => setType(t.value)}
                  className={clsx(
                    "border rounded-lg px-3 py-2 text-sm font-medium transition-all",
                    type === t.value
                      ? "border-[#e08600] bg-[#fdf4e7] text-[#e08600]"
                      : "border-[#ede4d0] text-[#7a5730] hover:border-[#e08600]/40",
                  )}
                >
                  {t.label}
                </button>
              ))}
            </div>
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
