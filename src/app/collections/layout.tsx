"use client";
import ProtectedLayout from "@/components/ProtectedLayout";
export default function CollectionsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ProtectedLayout>{children}</ProtectedLayout>;
}
