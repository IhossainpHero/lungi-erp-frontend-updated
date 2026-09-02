"use client";
import ProtectedLayout from "@/components/ProtectedLayout";
export default function ServicesLayout({ children }: { children: React.ReactNode }) {
  return <ProtectedLayout>{children}</ProtectedLayout>;
}
