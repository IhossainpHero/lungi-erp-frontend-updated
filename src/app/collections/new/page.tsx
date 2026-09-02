"use client";

import api from "@/lib/api";
import type { IParty, IService } from "@/types";
import { useQuery } from "@tanstack/react-query";
import {
  Calendar,
  ClipboardList,
  Loader2,
  MapPin,
  Minus,
  Plus,
  Receipt,
  Trash2,
  User,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

// বাংলাদেশের পরিচিত হাট-বাজারের নাম (suggestion list)
const hatSuggestions = [
  "শাহজাদপুর হাট",
  "সিরাজগঞ্জ হাট",
  "বেলকুচি হাট",
  "এনায়েতপুর হাট",
];

interface LineItemForm {
  serviceId: string;
  quantity: string; // ইনপুটে খালি রাখা যাবে বলে string হিসেবে রাখা হয়েছে
  rate: string; // দর — সার্ভিস সিলেক্ট করলে auto-fill হয়, ম্যানুয়ালি বদলানো যায়
  foldingNumber: string; // ভাঁজ সংখ্যা — string হিসেবে রাখা হয়েছে
}

export default function CreateCollectionPage() {
  const router = useRouter();

  // -------------------------
  // PARTY LIST
  // -------------------------
  const { data: parties = [] } = useQuery({
    queryKey: ["parties"],
    queryFn: async () => {
      const res = await api.get("/parties");
      return res.data?.data || [];
    },
  });

  // -------------------------
  // SERVICES
  // -------------------------
  const { data: services = [] } = useQuery({
    queryKey: ["services"],
    queryFn: async () => {
      const res = await api.get("/services");
      return res.data?.data || [];
    },
  });

  // -------------------------
  // FORM STATE
  // -------------------------
  const [partyId, setPartyId] = useState("");
  const [hatName, setHatName] = useState("");
  const [collectionDate, setCollectionDate] = useState("");
  const [loading, setLoading] = useState(false);

  const [items, setItems] = useState<LineItemForm[]>([
    { serviceId: "", quantity: "", rate: "", foldingNumber: "" },
  ]);

  // -------------------------
  // ADD ITEM
  // -------------------------
  const addItem = () => {
    setItems([
      ...items,
      { serviceId: "", quantity: "", rate: "", foldingNumber: "" },
    ]);
  };

  const removeItem = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const updateItem = (
    index: number,
    key: keyof LineItemForm,
    value: string,
  ) => {
    const copy = [...items];
    copy[index] = { ...copy[index], [key]: value };

    // সার্ভিস বদলালে — rate খালি থাকলে (বা এখনও ম্যানুয়ালি না বদলানো থাকলে)
    // সেই সার্ভিসের ডিফল্ট ratePerThan বসিয়ে দিচ্ছি
    if (key === "serviceId") {
      const svc = services.find((s: IService) => s.serviceId === value);
      if (svc && !copy[index].rate) {
        copy[index].rate = String(svc.ratePerThan);
      }
    }

    setItems(copy);
  };

  // ভাঁজ সংখ্যা +/- বাটন — খালি থাকলে ০ ধরে বাড়ানো/কমানো হবে, ০-এর নিচে যাবে না
  const stepFoldingNumber = (index: number, delta: number) => {
    const current = Number(items[index].foldingNumber) || 0;
    const next = Math.max(0, current + delta);
    updateItem(index, "foldingNumber", String(next));
  };

  const totalThan = items.reduce(
    (sum, item) => sum + (Number(item.quantity) || 0),
    0,
  );
  const totalFolding = items.reduce(
    (sum, item) => sum + (Number(item.foldingNumber) || 0),
    0,
  );
  const totalAmount = items.reduce(
    (sum, item) =>
      sum + (Number(item.quantity) || 0) * (Number(item.rate) || 0),
    0,
  );

  const isFormValid =
    partyId &&
    collectionDate &&
    items.length > 0 &&
    items.every((it) => it.serviceId && Number(it.quantity) > 0);

  // -------------------------
  // SUBMIT
  // -------------------------
  const handleSubmit = async () => {
    if (!isFormValid) return;
    try {
      setLoading(true);

      await api.post("/collections", {
        partyId,
        hatName,
        collectionDate,
        lineItems: items.map((item) => ({
          serviceId: item.serviceId,
          quantity: Number(item.quantity) || 0,
          rate: Number(item.rate) || 0,
          foldingNumber: Number(item.foldingNumber) || 0,
        })),
      });

      router.push("/collections");
    } catch (err) {
      console.error(err);
      alert("Error creating collection");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-5 pb-24 sm:pb-6">
      {/* TITLE */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-[#1a1208]">
          নতুন কালেকশন এন্ট্রি
        </h2>
        <p className="text-sm text-[#7a5730]/70 mt-0.5">
          পার্টি, হাট আর সার্ভিসের তথ্য দিয়ে নতুন কালেকশন যোগ করুন
        </p>
      </div>

      {/* ══════ মূল তথ্য ══════ */}
      <div className="card p-4 sm:p-5 space-y-4">
        <h3 className="text-sm font-semibold text-[#1a1208]">মূল তথ্য</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {/* PARTY SELECT */}
          <div>
            <label className="text-xs font-medium text-[#7a5730] flex items-center gap-1.5 mb-1.5">
              <User className="w-3.5 h-3.5" /> পার্টি নির্বাচন
            </label>
            <select
              value={partyId}
              onChange={(e) => setPartyId(e.target.value)}
              className="input w-full"
            >
              <option value="">পার্টি বাছাই করুন</option>
              {parties.map((p: IParty) => (
                <option key={p._id} value={p._id}>
                  {p.name} - {p.hatName}
                </option>
              ))}
            </select>
          </div>

          {/* HAT NAME */}
          <div>
            <label className="text-xs font-medium text-[#7a5730] flex items-center gap-1.5 mb-1.5">
              <MapPin className="w-3.5 h-3.5" /> হাট নাম
            </label>
            <input
              value={hatName}
              onChange={(e) => setHatName(e.target.value)}
              className="input w-full"
              placeholder="শাহজাদপুর / এনায়েতপুর"
              list="hat-suggestions"
            />
            <datalist id="hat-suggestions">
              {hatSuggestions.map((h) => (
                <option key={h} value={h} />
              ))}
            </datalist>
          </div>

          {/* DATE */}
          <div className="sm:col-span-2">
            <label className="text-xs font-medium text-[#7a5730] flex items-center gap-1.5 mb-1.5">
              <Calendar className="w-3.5 h-3.5" /> তারিখ
            </label>
            <input
              type="date"
              value={collectionDate}
              onChange={(e) => setCollectionDate(e.target.value)}
              className="input w-full sm:w-1/2"
            />
          </div>
        </div>
      </div>

      {/* ══════ সার্ভিস লিস্ট ══════ */}
      <div className="card p-4 sm:p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-[#1a1208] flex items-center gap-1.5">
            <ClipboardList className="w-4 h-4" /> সার্ভিস লিস্ট
          </h3>

          <button
            type="button"
            onClick={addItem}
            className="text-sm text-[#e08600] flex items-center gap-1 font-medium hover:underline"
          >
            <Plus className="w-4 h-4" />
            সার্ভিস যোগ করুন
          </button>
        </div>

        <div className="space-y-3">
          {items.map((item, index) => {
            const lineTotal = Number(item.quantity) * Number(item.rate);
            return (
              <div
                key={index}
                className="bg-[#faf8f4] border border-[#ede4d0] rounded-xl p-3.5 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-[#7a5730]/70">
                    সার্ভিস #{index + 1}
                  </span>
                  {items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeItem(index)}
                      className="text-xs text-red-500 hover:text-red-600 flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> মুছে দিন
                    </button>
                  )}
                </div>

                {/* SERVICE — full width on its own row for readability */}
                <select
                  value={item.serviceId}
                  onChange={(e) =>
                    updateItem(index, "serviceId", e.target.value)
                  }
                  className="input w-full"
                >
                  <option value="">সার্ভিস নির্বাচন করুন</option>
                  {services.map((s: IService) => (
                    <option key={s.serviceId} value={s.serviceId}>
                      {s.label}
                    </option>
                  ))}
                </select>

                <div className="grid grid-cols-3 gap-2.5">
                  {/* থান (QUANTITY) */}
                  <div>
                    <label className="text-[11px] text-[#7a5730]/70 mb-1 block">
                      থান
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={item.quantity}
                      onChange={(e) =>
                        updateItem(index, "quantity", e.target.value)
                      }
                      className="w-full text-sm py-1.5 px-2.5 rounded-lg border-2 border-[#e08600]/40 bg-white text-[#1a1208] font-medium focus:outline-none focus:border-[#e08600] focus:ring-2 focus:ring-[#e08600]/20 transition-colors"
                      placeholder="০"
                    />
                  </div>

                  {/* দর (RATE) */}
                  <div>
                    <label className="text-[11px] text-[#7a5730]/70 mb-1 block">
                      দর (প্রতি থান)
                    </label>
                    <input
                      type="number"
                      min={0}
                      step="0.01"
                      value={item.rate}
                      onChange={(e) =>
                        updateItem(index, "rate", e.target.value)
                      }
                      className="w-full text-sm py-1.5 px-2.5 rounded-lg border-2 border-[#0f7a3d]/40 bg-white text-[#1a1208] font-medium focus:outline-none focus:border-[#0f7a3d] focus:ring-2 focus:ring-[#0f7a3d]/20 transition-colors"
                      placeholder="০"
                    />
                  </div>

                  {/* ভাঁজ সংখ্যা (FOLDING NUMBER) */}
                  <div>
                    <label className="text-[11px] text-[#7a5730]/70 mb-1 block">
                      ফোল্ডিং
                    </label>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => stepFoldingNumber(index, -1)}
                        className="w-7 h-7 flex-shrink-0 flex items-center justify-center border border-[#1b3a9e]/30 rounded-lg text-[#1b3a9e] hover:bg-white transition-colors"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <input
                        type="number"
                        min={0}
                        value={item.foldingNumber}
                        onChange={(e) =>
                          updateItem(index, "foldingNumber", e.target.value)
                        }
                        className="w-full text-center text-sm py-1.5 px-1 rounded-lg border-2 border-[#1b3a9e]/40 bg-white text-[#1a1208] font-medium focus:outline-none focus:border-[#1b3a9e] focus:ring-2 focus:ring-[#1b3a9e]/20 transition-colors"
                        placeholder="০"
                      />
                      <button
                        type="button"
                        onClick={() => stepFoldingNumber(index, 1)}
                        className="w-7 h-7 flex-shrink-0 flex items-center justify-center border border-[#1b3a9e]/30 rounded-lg text-[#1b3a9e] hover:bg-white transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* এই লাইনের সাব-টোটাল */}
                {lineTotal > 0 && (
                  <p className="text-xs text-[#7a5730] text-right pt-1 border-t border-[#ede4d0]">
                    {item.quantity} থান × ৳{item.rate} ={" "}
                    <b className="text-[#e08600]">
                      ৳{lineTotal.toLocaleString()}
                    </b>
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ══════ সামারি + সাবমিট (ডেস্কটপে ইনলাইন, মোবাইলে নিচে স্টিকি) ══════ */}
      <div className="hidden sm:flex items-center justify-between gap-4 card p-4 sm:p-5">
        <div className="flex items-center gap-2 text-sm text-[#7a5730]">
          <Receipt className="w-4 h-4 text-[#e08600]" />
          <span>
            {totalThan} থান · {totalFolding} ফোল্ডিং
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-lg font-bold text-[#e08600]">
            ৳{totalAmount.toLocaleString()}
          </span>
          <button
            disabled={loading || !isFormValid}
            onClick={handleSubmit}
            className="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {loading ? "সংরক্ষণ হচ্ছে..." : "কালেকশন সংরক্ষণ করুন"}
          </button>
        </div>
      </div>

      {/* মোবাইল: স্টিকি বটম বার */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-[#ede4d0] p-3.5 z-30 flex items-center gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-[11px] text-[#7a5730]/70">
            {totalThan} থান · {totalFolding} ফোল্ডিং
          </p>
          <p className="text-lg font-bold text-[#e08600] leading-tight">
            ৳{totalAmount.toLocaleString()}
          </p>
        </div>
        <button
          disabled={loading || !isFormValid}
          onClick={handleSubmit}
          className="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
        >
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          {loading ? "সংরক্ষণ..." : "সংরক্ষণ করুন"}
        </button>
      </div>
    </div>
  );
}
