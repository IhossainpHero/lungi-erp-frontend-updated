"use client";
// src/app/parties/new/page.tsx
import api, { getErrorMessage } from "@/lib/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  CheckCircle,
  FileText,
  Loader2,
  MapPin,
  Phone,
  User,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";

// Backend validator থেকে: name, phone?, hatName, address?
interface NewPartyForm {
  name: string;
  phone: string;
  hatName: string;
  address: string;
}

// বাংলাদেশের পরিচিত হাট-বাজারের নাম (suggestion list)
const hatSuggestions = [
  "শাহজাদপুর হাট",
  "সিরাজগঞ্জ হাট",
  "বেলকুচি হাট",
  "এনায়েতপুর হাট",
];

export default function NewPartyPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    watch,
  } = useForm<NewPartyForm>({ mode: "onChange" });

  const nameVal = watch("name", "");

  const mutation = useMutation({
    mutationFn: (data: NewPartyForm) => {
      const payload: Record<string, string> = {
        name: data.name,
        hatName: data.hatName,
      };
      if (data.phone?.trim()) payload.phone = data.phone.trim();
      if (data.address?.trim()) payload.address = data.address.trim();
      return api.post("/parties", payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["parties"] });
      queryClient.invalidateQueries({ queryKey: ["parties-dues"] });
      toast.success("নতুন পার্টি তৈরি হয়েছে!");
      router.push("/parties");
    },
    onError: (err) => {
      toast.error(getErrorMessage(err));
    },
  });

  const onSubmit = (data: NewPartyForm) => {
    mutation.mutate(data);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-4 sm:space-y-5">
      {/* Back link */}
      <Link
        href="/parties"
        className="inline-flex items-center gap-1.5 text-sm text-[#7a5730] hover:text-[#e08600] transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> পার্টি তালিকায় ফিরে যান
      </Link>

      {/* Card */}
      <div className="card overflow-hidden">
        {/* Top accent */}
        <div className="h-1 bg-gradient-to-r from-[#f9c97d] via-[#e08600] to-[#8f5500]" />

        <div className="p-4 sm:p-6">
          {/* Header */}
          <div className="flex items-center gap-3 mb-5 sm:mb-6">
            <div className="w-11 h-11 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-[#f9c97d] to-[#e08600] flex items-center justify-center flex-shrink-0">
              {nameVal ? (
                <span className="text-white font-bold text-lg">
                  {nameVal.charAt(0)}
                </span>
              ) : (
                <User className="w-5 h-5 text-white" />
              )}
            </div>
            <div>
              <h2 className="heading-bengali font-bold text-[#1a1208] text-lg">
                নতুন পার্টি যোগ করুন
              </h2>
              <p className="text-xs text-[#7a5730]/70">* চিহ্নিত তথ্য আবশ্যক</p>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* নাম + ফোন — ডেস্কটপে পাশাপাশি, মোবাইলে স্ট্যাক */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-3">
              {/* নাম */}
              <div>
                <label className="block text-sm font-medium text-[#2d1f0e] mb-1.5">
                  পার্টির নাম <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7a5730]/50" />
                  <input
                    type="text"
                    placeholder="যেমন: মো. রহিম উদ্দিন"
                    className="input-field pl-10"
                    {...register("name", {
                      required: "নাম দিতে হবে",
                      minLength: {
                        value: 2,
                        message: "কমপক্ষে ২ অক্ষর হতে হবে",
                      },
                    })}
                  />
                </div>
                {errors.name && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.name.message}
                  </p>
                )}
              </div>

              {/* ফোন */}
              <div>
                <label className="block text-sm font-medium text-[#2d1f0e] mb-1.5">
                  ফোন নম্বর
                  <span className="text-[#7a5730]/50 font-normal ml-1">
                    (ঐচ্ছিক)
                  </span>
                </label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7a5730]/50" />
                  <input
                    type="tel"
                    placeholder="01XXXXXXXXX"
                    className="input-field pl-10"
                    {...register("phone", {
                      pattern: {
                        value: /^(01[3-9]\d{8})?$/,
                        message: "সঠিক ফোন নম্বর দিন",
                      },
                    })}
                  />
                </div>
                {errors.phone && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.phone.message}
                  </p>
                )}
              </div>
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
                  placeholder="যেমন: শাহজাদপুর হাট"
                  className="input-field pl-10"
                  list="hat-suggestions"
                  {...register("hatName", {
                    required: "হাটের নাম দিতে হবে",
                    minLength: { value: 1, message: "হাট নাম দিতে হবে" },
                  })}
                />
                <datalist id="hat-suggestions">
                  {hatSuggestions.map((h) => (
                    <option key={h} value={h} />
                  ))}
                </datalist>
              </div>
              {errors.hatName && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.hatName.message}
                </p>
              )}
            </div>

            {/* ঠিকানা */}
            <div>
              <label className="block text-sm font-medium text-[#2d1f0e] mb-1.5">
                ঠিকানা
                <span className="text-[#7a5730]/50 font-normal ml-1">
                  (ঐচ্ছিক)
                </span>
              </label>
              <div className="relative">
                <FileText className="absolute left-3.5 top-3.5 w-4 h-4 text-[#7a5730]/50" />
                <textarea
                  rows={3}
                  placeholder="সম্পূর্ণ ঠিকানা লিখুন..."
                  className="input-field pl-10 resize-none"
                  {...register("address")}
                />
              </div>
            </div>

            {/* Divider + Actions */}
            <div className="border-t border-[#ede4d0] pt-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              {/* Submit — মোবাইলে উপরে (প্রাইমারি অ্যাকশন প্রথমে) */}
              <button
                type="submit"
                disabled={mutation.isPending || !isValid}
                className="btn-primary flex-1 flex items-center justify-center gap-2 order-1 sm:order-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {mutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    সংরক্ষণ হচ্ছে...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    পার্টি সংরক্ষণ করুন
                  </>
                )}
              </button>

              {/* Cancel */}
              <Link
                href="/parties"
                className="btn-secondary flex-1 text-center order-2 sm:order-1"
              >
                বাতিল
              </Link>
            </div>
          </form>
        </div>
      </div>

      {/* Info note */}
      <div className="flex items-start gap-2.5 bg-[#fdf4e7] border border-[#f9c97d]/50 rounded-xl px-4 py-3">
        <div className="w-5 h-5 rounded-full bg-[#e08600] flex items-center justify-center flex-shrink-0 mt-0.5">
          <span className="text-white text-xs font-bold">i</span>
        </div>
        <p className="text-sm text-[#5c4020]">
          পার্টি তৈরির পর <strong>কালেকশন</strong> ও <strong>পেমেন্ট</strong>{" "}
          যোগ করে লেজার দেখতে পারবেন।
        </p>
      </div>
    </div>
  );
}
