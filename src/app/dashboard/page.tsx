"use client";

import { useAuthStore } from "@/context/auth.store";
import api from "@/lib/api";
import type { ICollection, IPartyDue, IPayment } from "@/types";
import { useQuery } from "@tanstack/react-query";
import { format, isSameDay } from "date-fns";
import {
  AlertTriangle,
  ArrowRight,
  ClipboardList,
  TrendingUp,
  Users,
  Wallet,
} from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  const { user } = useAuthStore();

  // -------------------------
  // SAFE QUERIES
  // -------------------------

  const { data: duesData = [] } = useQuery({
    queryKey: ["parties-dues"],
    queryFn: async () => {
      const res = await api.get<{ data: IPartyDue[] }>("/parties/dues");
      return Array.isArray(res.data.data) ? res.data.data : [];
    },
  });

  // /collections পেজিনেটেড অবজেক্ট রিটার্ন করে: { collections, total, page, limit }
  const { data: collectionsResult = { collections: [], total: 0 } } = useQuery({
    queryKey: ["collections-recent"],
    queryFn: async () => {
      const res = await api.get<{
        data: { collections: ICollection[]; total: number };
      }>("/collections", { params: { page: 1, limit: 100 } });

      return {
        collections: Array.isArray(res.data.data?.collections)
          ? res.data.data.collections
          : [],
        total: res.data.data?.total ?? 0,
      };
    },
  });

  const collectionsData = collectionsResult.collections;

  const { data: paymentsData = [] } = useQuery({
    queryKey: ["payments-recent"],
    queryFn: async () => {
      const res = await api.get<{ data: IPayment[] }>("/payments");
      return Array.isArray(res.data.data) ? res.data.data : [];
    },
  });

  // -------------------------
  // SAFE CALCULATIONS
  // -------------------------

  const totalDue = duesData.reduce((s, d) => s + (d.totalDue ?? 0), 0);
  const partiesWithDue = duesData.filter((d) => d.totalDue > 0).length;
  const totalCollections = collectionsResult.total; // ✅ সার্ভার-সাইড মোট সংখ্যা (fetch করা পেজের length না)

  // তারিখ অনুযায়ী গ্রুপ করা — যেহেতু collectionsData ইতিমধ্যে collectionDate অনুযায়ী descending sort করা আসে
  type CollectionGroup = { dateLabel: string; items: ICollection[] };
  const groupedByDay: CollectionGroup[] = [];
  for (const c of collectionsData) {
    const cDate = new Date(c.collectionDate);
    const last = groupedByDay[groupedByDay.length - 1];
    if (last && isSameDay(new Date(last.items[0].collectionDate), cDate)) {
      last.items.push(c);
    } else {
      groupedByDay.push({
        dateLabel: format(cDate, "dd MMMM yyyy"),
        items: [c],
      });
    }
  }

  const formatTaka = (n: number) =>
    "৳" + n.toLocaleString("bn-BD", { maximumFractionDigits: 0 });

  // -------------------------
  // STATS
  // -------------------------

  const stats = [
    {
      label: "মোট বকেয়া",
      value: formatTaka(totalDue),
      sub: `${partiesWithDue} পার্টির বকেয়া`,
      icon: TrendingUp,
      color: "text-red-600",
      bg: "bg-red-50",
      href: "/parties",
    },
    {
      label: "মোট পার্টি",
      value: duesData.length.toLocaleString("bn-BD"),
      sub: "নিবন্ধিত পার্টি",
      icon: Users,
      color: "text-blue-600",
      bg: "bg-blue-50",
      href: "/parties",
    },
    {
      label: "কালেকশন",
      value: totalCollections.toLocaleString("bn-BD"),
      sub: "মোট এন্ট্রি",
      icon: ClipboardList,
      color: "text-amber-600",
      bg: "bg-amber-50",
      href: "/collections",
    },
    {
      label: "পেমেন্ট",
      value: paymentsData.length.toLocaleString("bn-BD"),
      sub: "মোট লেনদেন",
      icon: Wallet,
      color: "text-green-600",
      bg: "bg-green-50",
      href: "/payments",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div>
        <h2 className="heading-bengali text-2xl font-bold text-[#1a1208]">
          আস-সালামু আলাইকুম, {user?.name} 👋
        </h2>
        <p className="text-[#7a5730] text-sm mt-1">
          আজকের তারিখ: {format(new Date(), "dd MMMM yyyy")}
        </p>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <Link
              key={s.label}
              href={s.href}
              className="card p-5 hover:shadow-card-hover transition-shadow group"
            >
              <div className="flex items-start justify-between mb-3">
                <div className={`p-2.5 rounded-lg ${s.bg}`}>
                  <Icon className={`w-5 h-5 ${s.color}`} />
                </div>
                <ArrowRight className="w-4 h-4 text-[#dfd0b0] group-hover:text-[#e08600] transition-colors" />
              </div>
              <p className="heading-bengali text-2xl font-bold text-[#1a1208]">
                {s.value}
              </p>
              <p className="text-sm font-medium text-[#2d1f0e] mt-0.5">
                {s.label}
              </p>
              <p className="text-xs text-[#7a5730]/70 mt-0.5">{s.sub}</p>
            </Link>
          );
        })}
      </div>

      {/* CONTENT */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Recent collections — তারিখ অনুযায়ী গ্রুপ করা, স্ক্রলযোগ্য */}
        <div className="card overflow-hidden flex flex-col">
          <div className="flex items-center justify-between px-5 py-4 border-b border-[#ede4d0]">
            <h3 className="font-semibold text-[#1a1208] flex items-center gap-2">
              <ClipboardList className="w-4 h-4 text-[#e08600]" />
              সাম্প্রতিক কালেকশন
            </h3>
            <span className="text-xs text-[#7a5730]/70">
              মোট {totalCollections.toLocaleString("bn-BD")} এন্ট্রি
            </span>
          </div>

          <div className="max-h-[420px] overflow-y-auto">
            {groupedByDay.length === 0 ? (
              <p className="px-5 py-6 text-sm text-[#7a5730]/60 text-center">
                কোনো রেকর্ড নেই
              </p>
            ) : (
              groupedByDay.map((group) => (
                <div key={group.dateLabel}>
                  <div className="px-5 py-1.5 bg-[#faf8f4] text-xs font-semibold text-[#7a5730] sticky top-0">
                    {group.dateLabel}
                  </div>
                  <div className="divide-y divide-[#ede4d0]">
                    {group.items.map((c) => (
                      <div
                        key={c._id}
                        className="px-5 py-3 flex justify-between hover:bg-[#faf8f4]"
                      >
                        <div>
                          <p className="text-sm font-medium text-[#1a1208]">
                            {c.partyId && typeof c.partyId === "object"
                              ? c.partyId.name
                              : "—"}
                          </p>
                          <p className="text-xs text-[#7a5730]/60">
                            {c.hatName}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-[#1a1208]">
                            ৳{c.totalAmount?.toLocaleString() ?? 0}
                          </p>
                          <p className="text-xs text-[#7a5730]/60">
                            {c.totalThan} থান
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Top dues */}
        <div className="card overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-[#ede4d0]">
            <h3 className="font-semibold text-[#1a1208] flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-500" />
              সর্বোচ্চ বকেয়া পার্টি
            </h3>
          </div>

          <div className="divide-y divide-[#ede4d0]">
            {duesData.filter((d) => d.totalDue > 0).length === 0 ? (
              <p className="px-5 py-6 text-sm text-[#7a5730]/60 text-center">
                কোনো বকেয়া নেই 🎉
              </p>
            ) : (
              duesData
                .filter((d) => d.totalDue > 0)
                .sort((a, b) => b.totalDue - a.totalDue)
                .slice(0, 5)
                .map((d) => (
                  <Link
                    key={d.party._id}
                    href={`/parties/${d.party._id}`}
                    className="px-5 py-3 flex justify-between hover:bg-[#faf8f4]"
                  >
                    <div>
                      <p className="text-sm font-medium text-[#1a1208]">
                        {d.party.name}
                      </p>
                      <p className="text-xs text-[#7a5730]/60">
                        {d.party.hatName}
                      </p>
                    </div>
                    <span className="text-sm font-semibold text-red-600">
                      ৳{d.totalDue.toLocaleString()}
                    </span>
                  </Link>
                ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
