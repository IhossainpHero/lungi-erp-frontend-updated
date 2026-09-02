import type { IDamageClaim } from "@/types";
import { clsx } from "clsx";
import { format } from "date-fns";
import { AlertTriangle, Pencil, Plus, ShieldAlert, Trash2 } from "lucide-react";
import Link from "next/link";
import { statusConfig } from "./shared";

export default function DamageTab({
  party,
  partyId,
  damages,
  damageLoading,
  isAdmin,
  canModerate,
  isPartyUser = false,
  onUpdateStatus,
  onEdit,
  onDeleteDirect,
  onRequestDelete,
  onRejectDelete,
}: {
  party: { name: string };
  partyId: string;
  damages: IDamageClaim[] | undefined;
  damageLoading: boolean;
  isAdmin: boolean;
  canModerate: boolean;
  isPartyUser?: boolean;
  onUpdateStatus: (dmgId: string, status: "approved" | "rejected") => void;
  onEdit: (d: IDamageClaim) => void;
  onDeleteDirect: (dmgId: string) => void;
  onRequestDelete: (dmgId: string) => void;
  onRejectDelete: (dmgId: string) => void;
}) {
  return (
    <div className="space-y-4">
      {!isPartyUser && (
        <div className="flex justify-end">
          <Link
            href={`/damage/new?partyId=${partyId}&partyName=${encodeURIComponent(party.name)}`}
            className="btn-primary flex items-center gap-2 text-sm"
          >
            <Plus className="w-4 h-4" /> নতুন ড্যামেজ ক্লেইম
          </Link>
        </div>
      )}

      <div className="card overflow-hidden">
        <div className="px-4 sm:px-5 py-3 border-b bg-[#faf8f4] font-semibold text-sm text-[#1a1208]">
          {party.name} — সব ড্যামেজ ক্লেইম
        </div>

        {damageLoading ? (
          <div className="py-10 flex justify-center">
            <div className="w-6 h-6 border-2 border-[#e08600] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (damages ?? []).length === 0 ? (
          <div className="py-12 text-center">
            <AlertTriangle className="w-10 h-10 text-[#dfd0b0] mx-auto mb-3" />
            <p className="text-[#7a5730]">কোনো ড্যামেজ ক্লেইম নেই</p>
            {!isPartyUser && (
              <Link
                href={`/damage/new?partyId=${partyId}&partyName=${encodeURIComponent(party.name)}`}
                className="mt-3 inline-flex items-center gap-1.5 text-sm text-[#e08600] hover:underline"
              >
                <Plus className="w-4 h-4" /> নতুন ক্লেইম করুন
              </Link>
            )}
          </div>
        ) : (
          <div className="divide-y divide-[#ede4d0]">
            {damages!.map((d) => {
              const cfg = statusConfig[d.status];
              const StatusIcon = cfg.icon;
              return (
                <div
                  key={d._id}
                  className="px-4 sm:px-5 py-4 hover:bg-[#faf8f4] transition-colors"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                        <span
                          className={clsx(
                            "flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full font-medium border",
                            cfg.cls,
                          )}
                        >
                          <StatusIcon className="w-3 h-3" /> {cfg.label}
                        </span>
                        <span className="text-xs text-[#7a5730]/60">
                          {format(new Date(d.claimDate), "dd MMM yyyy")}
                        </span>
                      </div>
                      <p className="text-sm text-[#1a1208]">
                        <span className="font-medium">
                          {d.damagedPieces} পিস
                        </span>
                        <span className="text-[#7a5730]/60 mx-1">×</span>
                        <span>৳{d.pricePerPiece}</span>
                        <span className="text-[#7a5730]/60 mx-1">=</span>
                        <span className="font-bold text-red-600">
                          ৳{d.totalClaim.toLocaleString()}
                        </span>
                      </p>
                      {d.notes && (
                        <p className="text-xs text-[#7a5730]/60 mt-1 italic">
                          {d.notes}
                        </p>
                      )}
                    </div>

                    <div className="flex flex-col items-end gap-2 flex-shrink-0">
                      {d.status === "pending" && isAdmin && (
                        <div className="flex gap-1.5">
                          <button
                            onClick={() => onUpdateStatus(d._id, "approved")}
                            className="text-xs px-3 py-1.5 rounded-lg bg-green-100 text-green-700 hover:bg-green-200 transition-colors font-medium"
                          >
                            অনুমোদন
                          </button>
                          <button
                            onClick={() => onUpdateStatus(d._id, "rejected")}
                            className="text-xs px-3 py-1.5 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 transition-colors font-medium"
                          >
                            প্রত্যাখ্যান
                          </button>
                        </div>
                      )}

                      {canModerate && (
                        <div className="flex gap-1.5">
                          <button
                            onClick={() => onEdit(d)}
                            title="আপডেট করুন"
                            className="p-1.5 rounded-lg border border-[#ede4d0] text-[#5c4020] hover:bg-[#fdf4e7] transition-colors"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          {!d.deleteRequested ? (
                            isAdmin ? (
                              <button
                                onClick={() => {
                                  if (
                                    confirm(
                                      "আপনি কি নিশ্চিত এই ড্যামেজ ক্লেইমটি ডিলিট করতে চান?",
                                    )
                                  ) {
                                    onDeleteDirect(d._id);
                                  }
                                }}
                                title="ডিলিট করুন"
                                className="p-1.5 rounded-lg border border-red-200 text-red-600 bg-red-50 hover:bg-red-100 transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            ) : (
                              <button
                                onClick={() => onRequestDelete(d._id)}
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
                  {d.deleteRequested && isAdmin && (
                    <div className="mt-2.5 flex flex-wrap items-center justify-between gap-3 bg-yellow-50 border border-yellow-200 rounded-lg px-3 py-2">
                      <span className="text-xs text-yellow-800 flex items-center gap-1.5">
                        <ShieldAlert className="w-3.5 h-3.5" />
                        {typeof d.deleteRequestedBy === "object" &&
                        d.deleteRequestedBy?.name
                          ? `${d.deleteRequestedBy.name} ডিলিট রিকোয়েস্ট করেছেন`
                          : "ডিলিট রিকোয়েস্ট করা হয়েছে"}
                        — অনুমোদন করবেন?
                      </span>
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => onDeleteDirect(d._id)}
                          className="text-xs px-2.5 py-1 rounded-md bg-green-100 text-green-700 hover:bg-green-200 font-medium transition-colors"
                        >
                          অনুমোদন
                        </button>
                        <button
                          onClick={() => onRejectDelete(d._id)}
                          className="text-xs px-2.5 py-1 rounded-md bg-red-100 text-red-600 hover:bg-red-200 font-medium transition-colors"
                        >
                          প্রত্যাখ্যান
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
