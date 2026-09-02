"use client";
import ProtectedLayout from "@/components/ProtectedLayout";
export default function PaymentsLayout({ children }: { children: React.ReactNode }) {
  return <ProtectedLayout>{children}</ProtectedLayout>;
}
