"use client";
// src/hooks/useAuth.ts
import { useAuthStore } from "@/context/auth.store";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function useRequireAuth() {
  const { isAuthenticated, user, loadUser } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("lungi_token");
    if (!token) {
      router.replace("/login");
    } else if (!isAuthenticated) {
      loadUser();
    }
  }, [isAuthenticated, router, loadUser]);

  useEffect(() => {
    if (user?.role === "party" && user.partyId) {
      router.replace(`/parties/${user.partyId}`);
    }
  }, [user, router]);

  return useAuthStore();
}
export function useRedirectIfAuth() {
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated) {
      router.replace("/dashboard");
    }
  }, [isAuthenticated, router]);
}
