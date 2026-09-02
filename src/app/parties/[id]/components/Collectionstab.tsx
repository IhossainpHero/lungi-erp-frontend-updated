import type { ICollection } from "@/types";
import { clsx } from "clsx";
import { format } from "date-fns";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Pencil,
  ShieldAlert,
  Trash2,
} from "lucide-react";
import { ITEMS_PER_PAGE } from "./shared";

export default function CollectionsTab({
  collectionsData,
  colLoading,
  colPage,
  setColPage,
  fromDate,
  setFromDate,
  toDate,
  setToDate,
  isAdmin,
  canModerate,
  onEdit,
  onDeleteDirect,
  onRequestDelete,
  onResolveDelete,
}: {
  collectionsData: { collections: ICollection[]; total: number } | undefined;
  colLoading: boolean;
  colPage: number;
  setColPage: (updater: (p: number) => number) => void;
  fromDate: string;
  setFromDate: (v: string) => void;
  toDate: string;
  setToDate: (v: string) => void;
  isAdmin: boolean;
  canModerate: boolean;
  onEdit: (col: ICollection) => void;
  onDeleteDirect: (colId: string) => void;
  onRequestDelete: (colId: string) => void;
  onResolveDelete: (colId: string, action: "approve" | "reject") => void;
}) {
  const totalCols = collectionsData?.total ?? 0;
  const totalPages = Math.ceil(totalCols / ITEMS_PER_PAGE);

  return (
    <div className="space-y-4">
      <div className="card p-4 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <span className="text-sm font-medium text-[#7a5730] flex items-center gap-2">
          <Calendar className="w-4 h-4" /> তারিখ রেঞ্জ
        </span>
        <div className="flex gap-2 flex-wrap items-center">
          <input
            type="date"
            value={fromDate}
            onChange={(e) => {
              setFromDate(e.target.value);
              setColPage(() => 1);
            }}
            className="input-field text-sm py-2"
          />
          <span className="text-[#7a5730]/50 text-sm">—</span>
          <input
            type="date"
            value={toDate}
            onChange={(e) => {
              setToDate(e.target.value);
              setColPage(() => 1);
            }}
            className="input-field text-sm py-2"
          />
          {(fromDate || toDate) && (
            <button
              onClick={() => {
                setFromDate("");
                setToDate("");
                setColPage(() => 1);
              }}
              className="text-sm px-3 py-2 border border-[#ede4d0] rounded-lg text-[#7a5730] hover:bg-[#fdf4e7]"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="px-4 sm:px-5 py-3 border-b bg-[#faf8f4] flex justify-between items-center">
          <span className="font-semibold text-sm text-[#1a1208]">
            কালেকশন লিস্ট
          </span>
          <span className="text-xs text-[#7a5730]/60">মোট {totalCols} টি</span>
        </div>

        {colLoading ? (
          <div className="py-10 flex justify-center">
            <div className="w-6 h-6 border-2 border-[#e08600] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (collectionsData?.collections ?? []).length === 0 ? (
          <p className="p-8 text-center text-[#7a5730]">কোনো কালেকশন নেই</p>
        ) : (
          <>
            <div className="divide-y divide-[#ede4d0]/60">
              {collectionsData!.collections.map((col) => (
                <div
                  key={col._id}
                  className="px-4 sm:px-5 py-4 hover:bg-[#faf8f4] transition-colors"
                >
                  <div className="flex flex-wrap justify-between items-start mb-2 gap-3">
                    <div>
                      <span className="text-sm font-semibold text-[#1a1208]">
                        {format(new Date(col.collectionDate), "dd MMM yyyy")}
                      </span>
                      <span className="ml-2 text-xs text-[#7a5730]/60 bg-[#fdf4e7] px-2 py-0.5 rounded-full">
                        {col.hatName}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="text-sm font-bold text-[#e08600]">
                          ৳{col.totalAmount.toLocaleString()}
                        </p>
                        <p className="text-xs text-[#7a5730]/60">
                          {col.totalThan} থান · {col.totalFolding ?? 0} ফোল্ডিং
                        </p>
                      </div>
                      {canModerate && (
                        <div className="flex gap-1.5 flex-shrink-0">
                          <button
                            onClick={() => onEdit(col)}
                            title="আপডেট করুন"
                            className="p-1.5 rounded-lg border border-[#ede4d0] text-[#5c4020] hover:bg-[#fdf4e7] transition-colors"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          {!col.deleteRequested ? (
                            isAdmin ? (
                              <button
                                onClick={() => {
                                  if (
                                    confirm(
                                      "আপনি কি নিশ্চিত এই কালেকশনটি ডিলিট করতে চান?",
                                    )
                                  ) {
                                    onDeleteDirect(col._id);
                                  }
                                }}
                                title="ডিলিট করুন"
                                className="p-1.5 rounded-lg border border-red-200 text-red-600 bg-red-50 hover:bg-red-100 transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            ) : (
                              <button
                                onClick={() => onRequestDelete(col._id)}
                                title="ডিলিট রিকোয়েস্ট পাঠান (অ্যাডমিন অনুমোদন লাগবে)"
                                className="p-1.5 rounded-lg border border-red-200 text-red-600 bg-red-50 hover:bg-red-100 transition-colors disabled:opacity-50"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )
                          ) : (
                            <span className="text-xs px-2 py-1 rounded-lg bg-yellow-50 text-yellow-700 border border-yellow-200 font-medium">
                              অনুমোদনের অপেক্ষায়
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Pending delete-request banner — admin only */}
                  {col.deleteRequested && isAdmin && (
                    <div className="mb-2 flex flex-wrap items-center justify-between gap-3 bg-yellow-50 border border-yellow-200 rounded-lg px-3 py-2">
                      <span className="text-xs text-yellow-800 flex items-center gap-1.5">
                        <ShieldAlert className="w-3.5 h-3.5" />
                        {typeof col.deleteRequestedBy === "object" &&
                        col.deleteRequestedBy?.name
                          ? `${col.deleteRequestedBy.name} ডিলিট রিকোয়েস্ট করেছেন`
                          : "ডিলিট রিকোয়েস্ট করা হয়েছে"}
                        — অনুমোদন করবেন?
                      </span>
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => onResolveDelete(col._id, "approve")}
                          className="text-xs px-2.5 py-1 rounded-md bg-green-100 text-green-700 hover:bg-green-200 font-medium transition-colors"
                        >
                          অনুমোদন
                        </button>
                        <button
                          onClick={() => onResolveDelete(col._id, "reject")}
                          className="text-xs px-2.5 py-1 rounded-md bg-red-100 text-red-600 hover:bg-red-200 font-medium transition-colors"
                        >
                          প্রত্যাখ্যান
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="flex flex-wrap gap-1.5">
                    {col.lineItems.map((item, idx) => (
                      <span
                        key={idx}
                        className="text-xs bg-white border border-[#ede4d0] text-[#5c4020] px-2.5 py-1 rounded-full"
                      >
                        {item.serviceName} · {item.quantity} থান
                        {item.foldingNumber
                          ? ` · ${item.foldingNumber} ফোল্ডিং
`
                          : ""}{" "}
                        · ৳{item.ratePerThan}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex flex-wrap items-center justify-between gap-2 px-4 sm:px-5 py-3 border-t border-[#ede4d0] bg-[#faf8f4]">
                <span className="text-xs text-[#7a5730]/60">
                  {colPage} / {totalPages} পৃষ্ঠা · মোট {totalCols} টি
                </span>
                <div className="flex gap-1 items-center">
                  <button
                    onClick={() => setColPage((p) => Math.max(1, p - 1))}
                    disabled={colPage === 1}
                    className="p-1.5 rounded border border-[#ede4d0] disabled:opacity-40 hover:bg-[#fdf4e7] transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4 text-[#7a5730]" />
                  </button>
                  {Array.from(
                    { length: Math.min(totalPages, 5) },
                    (_, i) => i + 1,
                  ).map((pg) => (
                    <button
                      key={pg}
                      onClick={() => setColPage(() => pg)}
                      className={clsx(
                        "w-8 h-8 text-xs rounded border transition-colors font-medium",
                        colPage === pg
                          ? "bg-[#e08600] text-white border-[#e08600]"
                          : "border-[#ede4d0] text-[#7a5730] hover:bg-[#fdf4e7]",
                      )}
                    >
                      {pg}
                    </button>
                  ))}
                  <button
                    onClick={() =>
                      setColPage((p) => Math.min(totalPages, p + 1))
                    }
                    disabled={colPage === totalPages}
                    className="p-1.5 rounded border border-[#ede4d0] disabled:opacity-40 hover:bg-[#fdf4e7] transition-colors"
                  >
                    <ChevronRight className="w-4 h-4 text-[#7a5730]" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
