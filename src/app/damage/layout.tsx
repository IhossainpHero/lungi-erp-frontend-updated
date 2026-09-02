"use client";
import ProtectedLayout from "@/components/ProtectedLayout";
export default function DamageLayout({ children }: { children: React.ReactNode }) {
  return <ProtectedLayout>{children}</ProtectedLayout>;
}
