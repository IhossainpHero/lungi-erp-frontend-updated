"use client";
// src/app/(auth)/register/page.tsx
import { useAuthStore } from "@/context/auth.store";
import { getErrorMessage } from "@/lib/api";
import { Eye, EyeOff, Loader2, Lock, Phone, User } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";

interface RegisterForm {
  name: string;
  phone: string;
  password: string;
  confirmPassword: string;
}

export default function RegisterPage() {
  const router = useRouter();
  const { register: registerUser, isLoading } = useAuthStore();
  const [showPass, setShowPass] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterForm>();

  const password = watch("password");

  const onSubmit = async (data: RegisterForm) => {
    try {
      await registerUser(data.name, data.phone, data.password);
      toast.success("রেজিস্ট্রেশন সফল হয়েছে! এখন লগইন করুন।");
      router.push("/login");
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  return (
    <div className="w-full max-w-md">
      {/* Logo / Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-[#f9c97d] to-[#e08600] shadow-lg mb-4 relative">
          <svg width="44" height="44" viewBox="0 0 44 44" fill="none">
            <rect
              x="6"
              y="8"
              width="32"
              height="4"
              rx="2"
              fill="white"
              opacity="0.9"
            />
            <rect
              x="6"
              y="20"
              width="32"
              height="4"
              rx="2"
              fill="white"
              opacity="0.7"
            />
            <rect
              x="6"
              y="32"
              width="32"
              height="4"
              rx="2"
              fill="white"
              opacity="0.5"
            />
            <rect
              x="8"
              y="6"
              width="4"
              height="32"
              rx="2"
              fill="white"
              opacity="0.3"
            />
            <rect
              x="20"
              y="6"
              width="4"
              height="32"
              rx="2"
              fill="white"
              opacity="0.3"
            />
            <rect
              x="32"
              y="6"
              width="4"
              height="32"
              rx="2"
              fill="white"
              opacity="0.3"
            />
          </svg>
          <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-md">
            <div className="w-3 h-3 rounded-full bg-[#e08600]" />
          </div>
        </div>
        <h1 className="heading-bengali text-3xl font-bold text-[#1a1208] tracking-tight">
          NPC
        </h1>
        <p className="text-[#7a5730] text-sm mt-1 font-medium">
          নতুন অ্যাকাউন্ট তৈরি করুন
        </p>
      </div>

      {/* Card */}
      <div className="bg-white rounded-2xl shadow-[0_8px_40px_rgba(26,18,8,0.12)] border border-[#ede4d0] overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-[#f9c97d] via-[#e08600] to-[#8f5500]" />

        <div className="p-8">
          <h2 className="text-xl font-semibold text-[#1a1208] mb-1">
            রেজিস্ট্রেশন 📝
          </h2>
          <p className="text-[#7a5730] text-sm mb-7">
            রেজিস্ট্রেশনের পর আপনি স্বয়ংক্রিয়ভাবে সাধারণ স্টাফ (staff)
            অ্যাক্সেস পাবেন, অথবা যদি আপনার নম্বর কোনো পার্টির সাথে মিলে যায়
            তাহলে সেই পার্টির হিসাব দেখতে পাবেন। মডারেটর/অ্যাডমিন অ্যাক্সেসের
            জন্য অ্যাডমিনের সাথে যোগাযোগ করুন।
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-[#2d1f0e] mb-1.5">
                নাম
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7a5730]/60" />
                <input
                  type="text"
                  placeholder="আপনার নাম"
                  className="input-field pl-10"
                  {...register("name", {
                    required: "নাম দিন",
                    minLength: { value: 2, message: "কমপক্ষে ২ অক্ষর" },
                  })}
                />
              </div>
              {errors.name && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.name.message}
                </p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-[#2d1f0e] mb-1.5">
                ফোন নম্বর
              </label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7a5730]/60" />
                <input
                  type="tel"
                  placeholder="01XXXXXXXXX"
                  className="input-field pl-10"
                  {...register("phone", {
                    required: "ফোন নম্বর দিন",
                    pattern: {
                      value: /^01[3-9]\d{8}$/,
                      message: "সঠিক বাংলাদেশি ফোন নম্বর দিন",
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

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-[#2d1f0e] mb-1.5">
                পাসওয়ার্ড
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7a5730]/60" />
                <input
                  type={showPass ? "text" : "password"}
                  placeholder="••••••••"
                  className="input-field pl-10 pr-10"
                  {...register("password", {
                    required: "পাসওয়ার্ড দিন",
                    minLength: { value: 6, message: "কমপক্ষে ৬ অক্ষর" },
                  })}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#7a5730]/60 hover:text-[#e08600] transition-colors"
                >
                  {showPass ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-[#2d1f0e] mb-1.5">
                পাসওয়ার্ড নিশ্চিত করুন
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7a5730]/60" />
                <input
                  type={showPass ? "text" : "password"}
                  placeholder="••••••••"
                  className="input-field pl-10"
                  {...register("confirmPassword", {
                    required: "পাসওয়ার্ড আবার দিন",
                    validate: (v) => v === password || "পাসওয়ার্ড মিলছে না",
                  })}
                />
              </div>
              {errors.confirmPassword && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full flex items-center justify-center gap-2 h-11 mt-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  তৈরি হচ্ছে...
                </>
              ) : (
                "রেজিস্ট্রেশন করুন"
              )}
            </button>
          </form>

          <p className="text-center text-sm text-[#7a5730] mt-5">
            ইতিমধ্যে অ্যাকাউন্ট আছে?{" "}
            <Link
              href="/login"
              className="text-[#e08600] font-medium hover:underline"
            >
              লগইন করুন
            </Link>
          </p>
        </div>
      </div>

      <p className="text-center text-xs text-[#7a5730]/60 mt-6">
        © ২০২৪ NPC · সমস্ত অধিকার সংরক্ষিত
      </p>
    </div>
  );
}
