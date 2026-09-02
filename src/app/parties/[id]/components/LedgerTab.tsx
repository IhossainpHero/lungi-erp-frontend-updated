import type { ILedgerSummary } from "@/types";
import { clsx } from "clsx";
import { format } from "date-fns";
import { Calendar, TrendingUp } from "lucide-react";
import { typeColor, typeIcon } from "./shared";

export default function LedgerTab({
  ledger,
  ledgerLoading,
  selectedDate,
  setSelectedDate,
  mode,
  setMode,
}: {
  ledger: ILedgerSummary | undefined;
  ledgerLoading: boolean;
  selectedDate: string;
  setSelectedDate: (d: string) => void;
  mode: "all" | "date";
  setMode: (m: "all" | "date") => void;
}) {
  return (
    <div className="space-y-4">
      {/* Date filter */}
      <div className="card p-4 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <span className="text-sm font-medium text-[#7a5730] flex items-center gap-2">
          <Calendar className="w-4 h-4" /> তারিখ অনুযায়ী ফিল্টার
        </span>
        <div className="flex gap-2 flex-wrap">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => {
              setSelectedDate(e.target.value);
              setMode("date");
            }}
            className="input-field text-sm py-2 flex-1 min-w-0"
          />
          <button
            onClick={() => {
              setSelectedDate("");
              setMode("all");
            }}
            className={clsx(
              "text-sm px-4 py-2 border rounded-lg font-medium transition-colors flex-shrink-0",
              mode === "all"
                ? "bg-[#e08600] text-white border-[#e08600]"
                : "border-[#ede4d0] text-[#7a5730] hover:bg-[#fdf4e7]",
            )}
          >
            সব দেখুন
          </button>
        </div>
      </div>

      {/* Ledger */}
      <div className="card overflow-hidden">
        <div className="px-4 sm:px-5 py-3 border-b bg-[#faf8f4] font-semibold text-sm text-[#1a1208] flex items-center justify-between">
          <span>লেজার বিস্তারিত</span>
          {mode === "date" && selectedDate && (
            <span className="text-xs font-normal text-[#7a5730]/70">
              {format(new Date(selectedDate), "dd MMMM yyyy")}
            </span>
          )}
        </div>

        {ledgerLoading ? (
          <div className="py-10 flex justify-center">
            <div className="w-6 h-6 border-2 border-[#e08600] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : !ledger?.entries?.length ? (
          <p className="p-8 text-center text-[#7a5730]">
            {mode === "date" ? "এই তারিখে কোনো লেনদেন নেই" : "কোনো লেনদেন নেই"}
          </p>
        ) : (
          <>
            {/* ── ডেস্কটপ: টেবিল ── */}
            <div className="hidden sm:block">
              <div className="grid grid-cols-12 px-5 py-2.5 text-xs font-semibold bg-[#faf8f4] text-[#7a5730] border-b border-[#ede4d0]">
                <span className="col-span-2">তারিখ</span>
                <span className="col-span-1">ধরন</span>
                <span className="col-span-5">বিবরণ</span>
                <span className="col-span-2 text-right">ডেবিট</span>
                <span className="col-span-2 text-right">ক্রেডিট</span>
              </div>
              {ledger.entries.map((e, i) => {
                const Icon = typeIcon[e.type] ?? TrendingUp;
                return (
                  <div
                    key={i}
                    className="grid grid-cols-12 px-5 py-3 hover:bg-[#faf8f4] border-b border-[#ede4d0]/50 last:border-0 text-sm items-center"
                  >
                    <span className="col-span-2 text-[#7a5730] text-xs">
                      {format(new Date(e.date), "dd/MM/yy")}
                    </span>
                    <span className="col-span-1">
                      <Icon className={clsx("w-4 h-4", typeColor[e.type])} />
                    </span>
                    <span className="col-span-5 text-[#1a1208] text-xs leading-relaxed">
                      {e.description}
                    </span>
                    <span className="col-span-2 text-right text-blue-600 font-medium">
                      {e.debit ? `৳${e.debit.toLocaleString()}` : "—"}
                    </span>
                    <span className="col-span-2 text-right text-green-600 font-medium">
                      {e.credit ? `৳${e.credit.toLocaleString()}` : "—"}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* ── মোবাইল: কার্ড লিস্ট ── */}
            <div className="sm:hidden divide-y divide-[#ede4d0]/60">
              {ledger.entries.map((e, i) => {
                const Icon = typeIcon[e.type] ?? TrendingUp;
                return (
                  <div key={i} className="px-4 py-3 space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="flex items-center gap-1.5 text-xs text-[#7a5730]/70">
                        <Icon
                          className={clsx("w-3.5 h-3.5", typeColor[e.type])}
                        />
                        {format(new Date(e.date), "dd MMM yy")}
                      </span>
                      <span
                        className={clsx(
                          "text-sm font-semibold",
                          e.debit ? "text-blue-600" : "text-green-600",
                        )}
                      >
                        {e.debit
                          ? `৳${e.debit.toLocaleString()}`
                          : `৳${e.credit.toLocaleString()}`}
                      </span>
                    </div>
                    <p className="text-xs text-[#1a1208] leading-relaxed">
                      {e.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
