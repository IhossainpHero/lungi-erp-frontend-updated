"use client";
// src/app/services/page.tsx
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import type { IService } from "@/types";
import { Settings, Pencil, X, Check } from "lucide-react";
import { useState } from "react";
import { useAuthStore } from "@/context/auth.store";
import toast from "react-hot-toast";
import { clsx } from "clsx";

const categoryLabel: Record<string, string> = {
  marchraise: "মার্চরাইজ",
  wash: "ওয়াশ",
  tana: "তানা",
};
const locationLabel: Record<string, string> = {
  shahajadpur: "শাহজাদপুর",
  dhaka: "ঢাকা",
};

export default function ServicesPage() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [editId, setEditId] = useState<string | null>(null);
  const [editRate, setEditRate] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["services"],
    queryFn: () => api.get<{ data: IService[] }>("/services").then((r) => r.data.data),
  });

  const updateRate = useMutation({
    mutationFn: ({ id, rate }: { id: string; rate: number }) =>
      api.put(`/services/${id}`, { ratePerThan: rate }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["services"] });
      setEditId(null);
      toast.success("রেট আপডেট হয়েছে");
    },
    onError: () => toast.error("আপডেট ব্যর্থ"),
  });

  const grouped = (data ?? []).reduce((acc, s) => {
    const key = s.category;
    if (!acc[key]) acc[key] = [];
    acc[key].push(s);
    return acc;
  }, {} as Record<string, IService[]>);

  return (
    <div className="space-y-5">
      {isLoading ? (
        <div className="flex justify-center py-16">
          <div className="w-7 h-7 border-2 border-[#e08600] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        Object.entries(grouped).map(([cat, services]) => (
          <div key={cat} className="card overflow-hidden">
            <div className="px-5 py-3.5 bg-[#faf8f4] border-b border-[#ede4d0] flex items-center gap-2">
              <Settings className="w-4 h-4 text-[#e08600]" />
              <h3 className="font-semibold text-[#1a1208]">{categoryLabel[cat] ?? cat}</h3>
              <span className="text-xs text-[#7a5730]/60 ml-auto">{services.length} টি সার্ভিস</span>
            </div>
            <div className="divide-y divide-[#ede4d0]">
              {services.map((s) => (
                <div key={s._id} className="flex items-center justify-between px-5 py-3.5">
                  <div>
                    <p className="font-medium text-[#1a1208] text-sm">{s.label}</p>
                    <p className="text-xs text-[#7a5730]/60">
                      {locationLabel[s.location]} {s.variant ? `· ${s.variant === "vip" ? "VIP" : "নরমাল"}` : ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    {editId === s._id ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          value={editRate}
                          onChange={(e) => setEditRate(e.target.value)}
                          className="w-24 input-field py-1.5 text-right"
                          autoFocus
                        />
                        <button
                          onClick={() => updateRate.mutate({ id: s._id, rate: Number(editRate) })}
                          className="p-1.5 rounded-lg bg-green-100 text-green-700 hover:bg-green-200"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setEditId(null)}
                          className="p-1.5 rounded-lg bg-red-100 text-red-600 hover:bg-red-200"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <span className="font-semibold text-[#1a1208]">
                          ৳{s.ratePerThan.toLocaleString()}<span className="text-xs font-normal text-[#7a5730]/70">/থান</span>
                        </span>
                        {user?.role === "admin" && (
                          <button
                            onClick={() => { setEditId(s._id); setEditRate(String(s.ratePerThan)); }}
                            className="p-1.5 rounded-lg text-[#7a5730]/50 hover:text-[#e08600] hover:bg-[#fdf4e7] transition-colors"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
