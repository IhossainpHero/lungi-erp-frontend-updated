import type { IPayment } from "@/types";
import { format } from "date-fns";
import { Pencil, Plus, Trash2, Wallet } from "lucide-react";
import Link from "next/link";
import { paymentTypeLabel } from "./shared";

export default function PaymentsTab({
  party,
  partyId,
  payments,
  paymentsLoading,
  payFromDate,
  setPayFromDate,
  payToDate,
  setPayToDate,
  isPartyUser,
  isAdmin,
  canModerate,
  onEdit,
  onDeleteDirect,
}: {
  party: { name: string };
  partyId: string;
  payments: IPayment[] | undefined;
  paymentsLoading: boolean;
  payFromDate: string;
  setPayFromDate: (v: string) => void;
  payToDate: string;
  setPayToDate: (v: string) => void;
  isAdmin: boolean;
  canModerate: boolean;
  isPartyUser?: boolean; // ✅ নতুন
  onEdit: (p: IPayment) => void;
  onDeleteDirect: (payId: string) => void;
}) {
  return (
    <div className="space-y-4">
      {/* Date filter */}
      <div className="card p-4 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <span className="text-sm font-medium text-[#7a5730] flex items-center gap-2">
          তারিখ রেঞ্জ
        </span>
        <div className="flex gap-2 flex-wrap items-center">
          <input
            type="date"
            value={payFromDate}
            onChange={(e) => setPayFromDate(e.target.value)}
            className="input-field text-sm py-2"
          />
          <span className="text-[#7a5730]/50 text-sm">—</span>
          <input
            type="date"
            value={payToDate}
            onChange={(e) => setPayToDate(e.target.value)}
            className="input-field text-sm py-2"
          />
          {(payFromDate || payToDate) && (
            <button
              onClick={() => {
                setPayFromDate("");
                setPayToDate("");
              }}
              className="text-sm px-3 py-2 border border-[#ede4d0] rounded-lg text-[#7a5730] hover:bg-[#fdf4e7]"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {!isPartyUser && (
        <div className="flex justify-end">
          <Link
            href={`/payments/new?partyId=${partyId}&partyName=${encodeURIComponent(party.name)}`}
            className="btn-primary flex items-center gap-2 text-sm"
          >
            <Plus className="w-4 h-4" /> নতুন পেমেন্ট
          </Link>
        </div>
      )}

      <div className="card overflow-hidden">
        <div className="px-4 sm:px-5 py-3 border-b bg-[#faf8f4] flex justify-between items-center">
          <span className="font-semibold text-sm text-[#1a1208]">
            {party.name} — সব পেমেন্ট
          </span>
          <span className="text-xs text-[#7a5730]/60">
            মোট {(payments ?? []).length} টি
          </span>
        </div>

        {paymentsLoading ? (
          <div className="py-10 flex justify-center">
            <div className="w-6 h-6 border-2 border-[#e08600] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (payments ?? []).length === 0 ? (
          <div className="py-12 text-center">
            <Wallet className="w-10 h-10 text-[#dfd0b0] mx-auto mb-3" />
            <p className="text-[#7a5730]">কোনো পেমেন্ট নেই</p>
          </div>
        ) : (
          <div className="divide-y divide-[#ede4d0]">
            {payments!.map((p) => (
              <div
                key={p._id}
                className="px-4 sm:px-5 py-4 flex flex-wrap items-center justify-between gap-3 hover:bg-[#faf8f4] transition-colors"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="text-sm font-semibold text-[#1a1208]">
                      {format(new Date(p.date), "dd MMM yyyy")}
                    </span>
                    <span className="text-xs bg-[#fdf4e7] text-[#7a5730] px-2 py-0.5 rounded-full">
                      {paymentTypeLabel[p.type] ?? p.type}
                    </span>
                  </div>
                  {p.notes && (
                    <p className="text-xs text-[#7a5730]/60 italic">
                      {p.notes}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <p className="text-sm font-bold text-green-600">
                    ৳{p.amount.toLocaleString()}
                  </p>
                  {canModerate && (
                    <div className="flex gap-1.5 flex-shrink-0">
                      <button
                        onClick={() => onEdit(p)}
                        title="আপডেট করুন"
                        className="p-1.5 rounded-lg border border-[#ede4d0] text-[#5c4020] hover:bg-[#fdf4e7] transition-colors"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      {isAdmin && (
                        <button
                          onClick={() => {
                            if (
                              confirm(
                                "আপনি কি নিশ্চিত এই পেমেন্টটি ডিলিট করতে চান?",
                              )
                            ) {
                              onDeleteDirect(p._id);
                            }
                          }}
                          title="ডিলিট করুন"
                          className="p-1.5 rounded-lg border border-red-200 text-red-600 bg-red-50 hover:bg-red-100 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
