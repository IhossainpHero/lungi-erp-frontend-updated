"use client";
// src/hooks/useRealtimeSync.ts
import { useAuthStore } from "@/context/auth.store";
import { getSocket } from "@/lib/socket";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

export function useRealtimeSync() {
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated) return;

    const socket = getSocket();
    socket.connect();

    const handleDataChanged = () => {
      // যেকোনো জায়গায় (যেকোনো user) কোনো এন্ট্রি করলে/আপডেট/ডিলিট হলে
      // সব active query সাথে সাথে refetch হবে — রিফ্রেশ করা লাগবে না
      queryClient.invalidateQueries();
    };

    socket.on("data:changed", handleDataChanged);

    return () => {
      socket.off("data:changed", handleDataChanged);
      socket.disconnect();
    };
  }, [isAuthenticated, queryClient]);
}
