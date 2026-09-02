"use client";
// src/app/settings/page.tsx
import { useAuthStore } from "@/context/auth.store";
import api, { getErrorMessage } from "@/lib/api";
import type { IUser, UserRole } from "@/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { clsx } from "clsx";
import { CheckCircle2, Lock, Phone, ShieldCheck } from "lucide-react";
import toast from "react-hot-toast";

const roleLabel: Record<UserRole, string> = {
  admin: "অ্যাডমিন",
  moderator: "মডারেটর",
  staff: "স্টাফ",
  party: "পার্টি",
};

const roleBadgeClass: Record<UserRole, string> = {
  admin: "bg-red-50 text-red-600 border-red-200",
  moderator: "bg-blue-50 text-blue-700 border-blue-200",
  staff: "bg-gray-50 text-gray-600 border-gray-200",
  party: "bg-purple-50 text-purple-700 border-purple-200", // ✅ যোগ করো
};

export default function SettingsPage() {
  const { user: currentUser } = useAuthStore();
  const queryClient = useQueryClient();

  const { data: users, isLoading } = useQuery({
    queryKey: ["users"],
    queryFn: () =>
      api.get<{ data: IUser[] }>("/auth/users").then((r) => r.data.data),
  });

  const updateRole = useMutation({
    mutationFn: ({ id, role }: { id: string; role: UserRole }) =>
      api.patch(`/auth/users/${id}/role`, { role }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("রোল আপডেট হয়েছে");
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const approveUser = useMutation({
    mutationFn: (id: string) => api.patch(`/auth/users/${id}/approve`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("ইউজার অনুমোদিত হয়েছে");
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  // ── Non-admin দেখলে অ্যাক্সেস নেই বার্তা দেখাই ─────────────
  if (currentUser && currentUser.role !== "admin") {
    return (
      <div className="card p-10 text-center max-w-lg mx-auto">
        <ShieldCheck className="w-10 h-10 text-[#dfd0b0] mx-auto mb-3" />
        <p className="text-[#7a5730] font-medium">
          এই পেজ শুধুমাত্র অ্যাডমিনদের জন্য
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5 max-w-3xl mx-auto">
      <div className="card p-5">
        <h2 className="heading-bengali text-lg font-bold text-[#1a1208] flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-[#e08600]" />
          ইউজার অ্যাক্সেস ম্যানেজমেন্ট
        </h2>
        <p className="text-sm text-[#7a5730]/70 mt-1">
          কাকে মডারেটর বা অ্যাডমিন অ্যাক্সেস দেবেন তা এখান থেকে নিয়ন্ত্রণ করুন।
          মডারেটর আপডেট সরাসরি করতে পারবে, কিন্তু ডিলিট করতে হলে অ্যাডমিনের
          অনুমোদন লাগবে। নতুন রেজিস্ট্রেশন করা স্টাফদের &quot;Approve&quot; না
          করা পর্যন্ত তারা অ্যাপ অ্যাক্সেস করতে পারবে না।
        </p>
      </div>

      <div className="card overflow-hidden">
        <div className="px-5 py-3 border-b bg-[#faf8f4] font-semibold text-sm text-[#1a1208]">
          সব ইউজার
        </div>

        {isLoading ? (
          <div className="py-10 flex justify-center">
            <div className="w-6 h-6 border-2 border-[#e08600] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (users ?? []).length === 0 ? (
          <p className="p-8 text-center text-[#7a5730]">
            কোনো ইউজার পাওয়া যায়নি
          </p>
        ) : (
          <div className="divide-y divide-[#ede4d0]">
            {users!.map((u) => (
              <div
                key={u._id}
                className="px-5 py-4 flex items-center justify-between gap-4 flex-wrap hover:bg-[#faf8f4] transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#f9c97d] to-[#e08600] flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold text-sm">
                      {u.name.charAt(0)}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-[#1a1208] truncate">
                      {u.name}
                      {currentUser?._id === u._id && (
                        <span className="text-xs text-[#7a5730]/50 font-normal">
                          {" "}
                          (আপনি)
                        </span>
                      )}
                    </p>
                    <div className="flex items-center gap-3 text-xs text-[#7a5730]/70 mt-0.5">
                      {u.phone && (
                        <span className="flex items-center gap-1">
                          <Phone className="w-3 h-3" /> {u.phone}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  {!u.isActive && (
                    <span className="text-xs px-2.5 py-1 rounded-full font-medium border bg-amber-50 text-amber-700 border-amber-200">
                      অনুমোদনের অপেক্ষায়
                    </span>
                  )}

                  <span
                    className={clsx(
                      "text-xs px-2.5 py-1 rounded-full font-medium border",
                      roleBadgeClass[u.role],
                    )}
                  >
                    {roleLabel[u.role]}
                  </span>

                  {!u.isActive && currentUser?._id !== u._id && (
                    <button
                      onClick={() => approveUser.mutate(u._id)}
                      disabled={approveUser.isPending}
                      className="text-xs px-2.5 py-1.5 rounded-full bg-green-50 text-green-700 border border-green-200 font-medium flex items-center gap-1 hover:bg-green-100 transition-colors disabled:opacity-50"
                    >
                      <CheckCircle2 className="w-3 h-3" /> Approve
                    </button>
                  )}

                  {currentUser?._id !== u._id ? (
                    <select
                      value={u.role}
                      disabled={updateRole.isPending}
                      onChange={(e) =>
                        updateRole.mutate({
                          id: u._id,
                          role: e.target.value as UserRole,
                        })
                      }
                      className="input-field text-xs py-1.5 px-2 w-auto"
                    >
                      <option value="staff">স্টাফ</option>
                      <option value="moderator">মডারেটর</option>
                      <option value="admin">অ্যাডমিন</option>
                    </select>
                  ) : (
                    <span className="text-xs text-[#7a5730]/40 flex items-center gap-1 px-2">
                      <Lock className="w-3 h-3" /> নিজের রোল পরিবর্তনযোগ্য নয়
                    </span>
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
