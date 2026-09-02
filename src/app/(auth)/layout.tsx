// src/app/(auth)/layout.tsx
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fdf4e7] via-[#faf8f4] to-[#f5f0e8] flex items-center justify-center p-4">
      {children}
    </div>
  );
}
