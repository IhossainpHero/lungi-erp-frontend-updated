"use client";
// src/app/parties/[id]/edit/page.tsx
import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import api, { getErrorMessage } from "@/lib/api";
import type { IParty } from "@/types";
import {
  ArrowLeft, User, Phone, MapPin, FileText, Loader2, CheckCircle, Trash2,
  ShieldAlert, Send,
} from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";
import { useAuthStore } from "@/context/auth.store";

interface EditPartyForm {
  name: string;
  phone: string;
  hatName: string;
  address: string;
  status: "active" | "inactive";
}

export default function EditPartyPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  const { data: party, isLoading } = useQuery({
    queryKey: ["party", id],
    queryFn: () => api.get<{ data: IParty }>(`/parties/${id}`).then((r) => r.data.data),
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<EditPartyForm>({ mode: "onChange" });

  // Party লোড হলে form-এ fill করি
  useEffect(() => {
    if (party) {
      reset({
        name: party.name,
        phone: party.phone ?? "",
        hatName: party.hatName,
        address: party.address ?? "",
        status: party.status,
      });
    }
  }, [party, reset]);

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: (data: EditPartyForm) => {
      const payload: Record<string, string> = {
        name: data.name,
        hatName: data.hatName,
        status: data.status,
      };
      if (data.phone?.trim()) payload.phone = data.phone.trim();
      if (data.address?.trim()) payload.address = data.address.trim();
      return api.put(`/parties/${id}`, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["parties"] });
      queryClient.invalidateQueries({ queryKey: ["party", id] });
      toast.success("পার্টি আপডেট হয়েছে!");
      router.push(`/parties/${id}`);
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  // Soft delete (admin only) — status: inactive, সাথে সাথে সংশ্লিষ্ট কালেকশন ডাটাও মুছে যাবে
  const deleteMutation = useMutation({
    mutationFn: () => api.delete(`/parties/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["parties"] });
      toast.success("পার্টি নিষ্ক্রিয় করা হয়েছে এবং সংশ্লিষ্ট কালেকশন ডাটা মুছে ফেলা হয়েছে");
      router.push("/parties");
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  // moderator → ডিলিট/নিষ্ক্রিয় করার রিকোয়েস্ট, admin অনুমোদন করবে
  const requestDeleteMutation = useMutation({
    mutationFn: () => api.post(`/parties/${id}/delete-request`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["party", id] });
      toast.success("নিষ্ক্রিয় করার রিকোয়েস্ট পাঠানো হয়েছে — অ্যাডমিন অনুমোদনের অপেক্ষায়");
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  // admin → pending রিকোয়েস্ট অনুমোদন/প্রত্যাখ্যান
  const resolveDeleteRequestMutation = useMutation({
    mutationFn: (action: "approve" | "reject") =>
      api.patch(`/parties/${id}/delete-request`, { action }),
    onSuccess: (_res, action) => {
      queryClient.invalidateQueries({ queryKey: ["party", id] });
      queryClient.invalidateQueries({ queryKey: ["parties"] });
      if (action === "approve") {
        toast.success("পার্টি নিষ্ক্রিয় করা হয়েছে এবং সংশ্লিষ্ট কালেকশন ডাটা মুছে ফেলা হয়েছে");
        router.push("/parties");
      } else {
        toast.success("রিকোয়েস্ট প্রত্যাখ্যান করা হয়েছে");
      }
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const onSubmit = (data: EditPartyForm) => updateMutation.mutate(data);

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-7 h-7 border-2 border-[#e08600] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!party) {
    return <p className="text-center py-20 text-[#7a5730]">পার্টি পাওয়া যায়নি</p>;
  }

  return (
    <div className="max-w-xl space-y-5">
      {/* Back */}
      <Link
        href={`/parties/${id}`}
        className="inline-flex items-center gap-1.5 text-sm text-[#7a5730] hover:text-[#e08600] transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> পার্টি বিবরণে ফিরে যান
      </Link>

      <div className="card overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-[#f9c97d] via-[#e08600] to-[#8f5500]" />

        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#f9c97d] to-[#e08600] flex items-center justify-center">
                <span className="text-white font-bold text-lg">{party.name.charAt(0)}</span>
              </div>
              <div>
                <h2 className="heading-bengali font-bold text-[#1a1208] text-lg">পার্টি সম্পাদনা</h2>
                <p className="text-xs text-[#7a5730]/70">{party.name}</p>
              </div>
            </div>

            {/* নিষ্ক্রিয় করুন — admin: সরাসরি, moderator: রিকোয়েস্ট (admin approval লাগবে) */}
            {party.status === "active" && (
              <>
                {user?.role === "admin" && (
                  <button
                    onClick={() => {
                      if (confirm(`"${party.name}" নিষ্ক্রিয় করতে চান? এতে এই পার্টির সব কালেকশন ডাটাও মুছে যাবে।`)) {
                        deleteMutation.mutate();
                      }
                    }}
                    disabled={deleteMutation.isPending}
                    className="flex items-center gap-1.5 text-xs text-red-500 hover:text-red-700 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors border border-red-200"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    নিষ্ক্রিয় করুন
                  </button>
                )}

                {user?.role === "moderator" && (
                  party.deleteRequest?.status === "pending" ? (
                    <span className="text-xs px-3 py-1.5 rounded-lg bg-yellow-50 text-yellow-700 border border-yellow-200 font-medium">
                      অনুমোদনের অপেক্ষায়
                    </span>
                  ) : (
                    <button
                      onClick={() => {
                        if (confirm(`"${party.name}" নিষ্ক্রিয় করার জন্য অ্যাডমিনের কাছে রিকোয়েস্ট পাঠাতে চান?`)) {
                          requestDeleteMutation.mutate();
                        }
                      }}
                      disabled={requestDeleteMutation.isPending}
                      className="flex items-center gap-1.5 text-xs text-red-500 hover:text-red-700 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors border border-red-200"
                    >
                      <Send className="w-3.5 h-3.5" />
                      নিষ্ক্রিয় করার রিকোয়েস্ট
                    </button>
                  )
                )}
              </>
            )}
          </div>

          {/* Pending delete-request banner — admin only */}
          {user?.role === "admin" && party.deleteRequest?.status === "pending" && (
            <div className="mb-6 flex items-center justify-between gap-3 bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-3">
              <span className="text-sm text-yellow-800 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 flex-shrink-0" />
                {typeof party.deleteRequest.requestedBy === "object" && party.deleteRequest.requestedBy?.name
                  ? `${party.deleteRequest.requestedBy.name} এই পার্টি নিষ্ক্রিয় করার রিকোয়েস্ট করেছেন`
                  : "এই পার্টি নিষ্ক্রিয় করার রিকোয়েস্ট করা হয়েছে"}
                — অনুমোদন করবেন?
              </span>
              <div className="flex gap-2 flex-shrink-0">
                <button
                  onClick={() => resolveDeleteRequestMutation.mutate("approve")}
                  disabled={resolveDeleteRequestMutation.isPending}
                  className="text-xs px-3 py-1.5 rounded-md bg-green-100 text-green-700 hover:bg-green-200 font-medium transition-colors"
                >
                  অনুমোদন
                </button>
                <button
                  onClick={() => resolveDeleteRequestMutation.mutate("reject")}
                  disabled={resolveDeleteRequestMutation.isPending}
                  className="text-xs px-3 py-1.5 rounded-md bg-red-100 text-red-600 hover:bg-red-200 font-medium transition-colors"
                >
                  প্রত্যাখ্যান
                </button>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* নাম */}
            <div>
              <label className="block text-sm font-medium text-[#2d1f0e] mb-1.5">
                পার্টির নাম <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7a5730]/50" />
                <input
                  type="text"
                  className="input-field pl-10"
                  {...register("name", {
                    required: "নাম দিতে হবে",
                    minLength: { value: 2, message: "কমপক্ষে ২ অক্ষর" },
                  })}
                />
              </div>
              {errors.name && (
                <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>
              )}
            </div>

            {/* ফোন */}
            <div>
              <label className="block text-sm font-medium text-[#2d1f0e] mb-1.5">
                ফোন নম্বর <span className="text-[#7a5730]/50 font-normal">(ঐচ্ছিক)</span>
              </label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7a5730]/50" />
                <input
                  type="tel"
                  placeholder="01XXXXXXXXX"
                  className="input-field pl-10"
                  {...register("phone", {
                    pattern: { value: /^(01[3-9]\d{8})?$/, message: "সঠিক ফোন নম্বর দিন" },
                  })}
                />
              </div>
              {errors.phone && (
                <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>
              )}
            </div>

            {/* হাটের নাম */}
            <div>
              <label className="block text-sm font-medium text-[#2d1f0e] mb-1.5">
                হাটের নাম <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7a5730]/50" />
                <input
                  type="text"
                  className="input-field pl-10"
                  {...register("hatName", { required: "হাটের নাম দিতে হবে" })}
                />
              </div>
              {errors.hatName && (
                <p className="text-red-500 text-xs mt-1">{errors.hatName.message}</p>
              )}
            </div>

            {/* ঠিকানা */}
            <div>
              <label className="block text-sm font-medium text-[#2d1f0e] mb-1.5">
                ঠিকানা <span className="text-[#7a5730]/50 font-normal">(ঐচ্ছিক)</span>
              </label>
              <div className="relative">
                <FileText className="absolute left-3.5 top-3.5 w-4 h-4 text-[#7a5730]/50" />
                <textarea
                  rows={3}
                  className="input-field pl-10 resize-none"
                  {...register("address")}
                />
              </div>
            </div>

            {/* স্ট্যাটাস — admin only */}
            {user?.role === "admin" && (
              <div>
                <label className="block text-sm font-medium text-[#2d1f0e] mb-1.5">স্ট্যাটাস</label>
                <select className="input-field" {...register("status")}>
                  <option value="active">সক্রিয়</option>
                  <option value="inactive">নিষ্ক্রিয়</option>
                </select>
              </div>
            )}

            {/* Buttons */}
            <div className="border-t border-[#ede4d0] pt-4 flex items-center gap-3">
              <Link href={`/parties/${id}`} className="btn-secondary flex-1 text-center">
                বাতিল
              </Link>
              <button
                type="submit"
                disabled={updateMutation.isPending || !isDirty}
                className="btn-primary flex-1 flex items-center justify-center gap-2"
              >
                {updateMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    আপডেট হচ্ছে...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    আপডেট করুন
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
