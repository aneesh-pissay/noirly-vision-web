"use client";

import { Toaster } from "sonner";
import { AuthProvider } from "@/components/providers/auth-provider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      {children}
      <Toaster theme="dark" position="bottom-right" richColors />
    </AuthProvider>
  );
}
