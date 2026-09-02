import api from "@/lib/api";
import type { ICollection } from "@/types";
import { useQuery } from "@tanstack/react-query";
import { Loader2, Plus, Save, Trash2, X } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { hatSuggestions } from "./shared";

export default function CollectionEditModal({
  collection,
  isSaving,
  onClose,
  onSave,
}: {
  collection: ICollection;
  isSaving: boolean;
  onClose: () => void;
  onSave: (body: any) => void;
}) {
  const [collectionDate, setCollectionDate] = useState(
    collection.collectionDate.slice(0, 10),
  );
  const [hatName, setHatName] = useState(collection.hatName ?? "");
  const [notes, setNotes] = useState(collection.notes ?? "");
  const [lineItems, setLineItems] = useState(
    collection.lineItems.map((li) => ({
      serviceId: li.serviceId,
      serviceName: li.serviceName,
      quantity: String(li.quantity ?? ""),
      ratePerThan: String(li.ratePerThan ?? ""),
      foldingNumber: String(li.foldingNumber ?? 0),
    })),
  );

  // সার্ভিস লিস্ট — সার্ভিস বদলানো/নতুন লাইন যোগ করার জন্য dropdown-এ লাগবে
  const { data: services = [] } = useQuery({
    queryKey: ["services"],
    queryFn: () =>
      api
        .get<{
          data: { serviceId: string; label: string; ratePerThan: number }[];
        }>("/services")
        .then((r) => r.data.data),
  });

  const updateItem = (
    idx: number,
    field: "serviceId" | "quantity" | "ratePerThan" | "foldingNumber",
    value: string,
  ) => {
    setLineItems((prev) =>
      prev.map((li, i) => {
        if (i !== idx) return li;
        if (field === "serviceId") {
          const svc = services.find((s) => s.serviceId === value);
          return {
            ...li,
            serviceId: value,
            serviceName: svc?.label ?? li.serviceName,
            // সার্ভিস বদলালে rate খালি/০ থাকলে সার্ভিসের ডিফল্ট রেট বসিয়ে দিচ্ছি
            ratePerThan:
              Number(li.ratePerThan) > 0
                ? li.ratePerThan
                : String(svc?.ratePerThan ?? ""),
          };
        }
        return { ...li, [field]: value };
      }),
    );
  };

  const addLineItem = () => {
    setLineItems((prev) => [
      ...prev,
      {
        serviceId: "",
        serviceName: "",
        quantity: "",
        ratePerThan: "",
        foldingNumber: "0",
      },
    ]);
  };

  const removeLineItem = (idx: number) => {
    setLineItems((prev) => prev.filter((_, i) => i !== idx));
  };

  const stepFolding = (idx: number, delta: number) => {
    const current = Number(lineItems[idx].foldingNumber) || 0;
    updateItem(idx, "foldingNumber", String(Math.max(0, current + delta)));
  };

  const totalThan = lineItems.reduce(
    (s, li) => s + Number(li.quantity || 0),
    0,
  );
  const totalFolding = lineItems.reduce(
    (s, li) => s + Number(li.foldingNumber || 0),
    0,
  );
  const totalAmount = lineItems.reduce(
    (s, li) => s + Number(li.quantity || 0) * Number(li.ratePerThan || 0),
    0,
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (lineItems.length === 0) {
      toast.error("কমপক্ষে একটা সার্ভিস লাইন থাকা লাগবে");
      return;
    }
    if (lineItems.some((li) => !li.serviceId)) {
      toast.error("প্রতিটা লাইনে সার্ভিস নির্বাচন করুন");
      return;
    }
    onSave({
      collectionDate,
      hatName,
      notes,
      lineItems: lineItems.map((li) => ({
        serviceId: li.serviceId,
        quantity: Number(li.quantity),
        rate: Number(li.ratePerThan),
        foldingNumber: Number(li.foldingNumber) || 0,
      })),
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-4 sm:px-5 py-4 border-b border-[#ede4d0]">
          <h3 className="font-bold text-[#1a1208]">কালেকশন আপডেট করুন</h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-[#faf8f4] text-[#7a5730]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-[#2d1f0e] mb-1.5">
                তারিখ
              </label>
              <input
                type="date"
                value={collectionDate}
                onChange={(e) => setCollectionDate(e.target.value)}
                className="input-field"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#2d1f0e] mb-1.5">
                হাট নাম
              </label>
              <input
                type="text"
                value={hatName}
                onChange={(e) => setHatName(e.target.value)}
                className="input-field"
                placeholder="হাট নাম"
                list="hat-suggestions-edit"
              />
              <datalist id="hat-suggestions-edit">
                {hatSuggestions.map((h) => (
                  <option key={h} value={h} />
                ))}
              </datalist>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-sm font-medium text-[#2d1f0e]">
                লাইন আইটেম
              </label>
              <button
                type="button"
                onClick={addLineItem}
                className="text-xs text-[#e08600] flex items-center gap-1 font-medium"
              >
                <Plus className="w-3.5 h-3.5" /> সার্ভিস যোগ করুন
              </button>
            </div>
            <div className="space-y-2">
              {lineItems.map((li, idx) => (
                <div
                  key={idx}
                  className="bg-[#faf8f4] rounded-lg p-2.5 space-y-2"
                >
                  <div className="flex items-center gap-2">
                    <select
                      value={li.serviceId}
                      onChange={(e) =>
                        updateItem(idx, "serviceId", e.target.value)
                      }
                      className="input-field flex-1 text-sm py-1.5"
                    >
                      <option value="">সার্ভিস নির্বাচন</option>
                      {services.map((s) => (
                        <option key={s.serviceId} value={s.serviceId}>
                          {s.label}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => removeLineItem(idx)}
                      className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 flex-shrink-0"
                      title="এই লাইন মুছে দিন"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <input
                      type="number"
                      value={li.quantity}
                      onChange={(e) =>
                        updateItem(idx, "quantity", e.target.value)
                      }
                      className="flex-1 min-w-[70px] text-sm py-1.5 px-2.5 rounded-lg border-2 border-[#e08600]/40 bg-white text-[#1a1208] font-medium focus:outline-none focus:border-[#e08600] focus:ring-2 focus:ring-[#e08600]/20 transition-colors"
                      min={0}
                      step="0.01"
                      placeholder="থান"
                    />
                    <span className="text-xs text-[#7a5730]/60">×</span>
                    <input
                      type="number"
                      value={li.ratePerThan}
                      onChange={(e) =>
                        updateItem(idx, "ratePerThan", e.target.value)
                      }
                      className="flex-1 min-w-[70px] text-sm py-1.5 px-2.5 rounded-lg border-2 border-[#0f7a3d]/40 bg-white text-[#1a1208] font-medium focus:outline-none focus:border-[#0f7a3d] focus:ring-2 focus:ring-[#0f7a3d]/20 transition-colors"
                      min={0}
                      step="0.01"
                      placeholder="রেট"
                    />
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button
                        type="button"
                        onClick={() => stepFolding(idx, -1)}
                        className="w-7 h-7 flex items-center justify-center border border-[#ede4d0] rounded hover:bg-white"
                      >
                        −
                      </button>
                      <input
                        type="number"
                        value={li.foldingNumber}
                        onChange={(e) =>
                          updateItem(idx, "foldingNumber", e.target.value)
                        }
                        className="w-14 text-center text-sm py-1.5 px-1 rounded-lg border-2 border-[#1b3a9e]/40 bg-white text-[#1a1208] font-medium focus:outline-none focus:border-[#1b3a9e] focus:ring-2 focus:ring-[#1b3a9e]/20 transition-colors"
                        min={0}
                        placeholder="ফোল্ডিং
"
                      />
                      <button
                        type="button"
                        onClick={() => stepFolding(idx, 1)}
                        className="w-7 h-7 flex items-center justify-center border border-[#ede4d0] rounded hover:bg-white"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap justify-between gap-2 text-sm bg-[#fdf4e7] rounded-lg px-3 py-2">
            <span className="text-[#7a5730]">
              মোট থান: <b>{totalThan}</b> · ফোল্ডিং: <b>{totalFolding}</b>
            </span>
            <span className="text-[#e08600] font-bold">
              ৳{totalAmount.toLocaleString()}
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
