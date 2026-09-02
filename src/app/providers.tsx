"use client";
// src/app/providers.tsx
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";
import { useState } from "react";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60 * 5, // 5 minutes
            retry: 1,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3500,
          style: {
            fontFamily: "'Noto Sans Bengali', sans-serif",
            fontSize: "14px",
            background: "#fff",
            color: "#1a1208",
            border: "1px solid #ede4d0",
            boxShadow: "0 4px 12px rgba(26,18,8,0.1)",
          },
          success: {
            iconTheme: { primary: "#e08600", secondary: "#fff" },
          },
          error: {
            iconTheme: { primary: "#dc2626", secondary: "#fff" },
          },
        }}
      />
    </QueryClientProvider>
  );
}
