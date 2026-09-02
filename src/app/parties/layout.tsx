"use client";
import ProtectedLayout from "@/components/ProtectedLayout";
export default function PartiesLayout({ children }: { children: React.ReactNode }) {
  return <ProtectedLayout>{children}</ProtectedLayout>;
}
