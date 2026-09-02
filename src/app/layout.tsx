// src/app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "NPC",
  description: "লুঙ্গি ব্যবসা ম্যানেজমেন্ট সিস্টেম",
  icons: { icon: "/favicon.ico" },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="bn">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
