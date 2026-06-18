"use client";

import { BrandingLoader } from "@/components/layout/logo";
import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Loader2 } from "lucide-react";

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Invalid verification link");
      return;
    }

    async function verifyEmail() {
      try {
        const response = await fetch("/api/auth/verify-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Verification failed");
        }

        setStatus("success");
        setMessage(data.message);
        setTimeout(() => router.push("/login"), 3000);
      } catch (err) {
        setStatus("error");
        setMessage(err instanceof Error ? err.message : "Verification failed");
      }
    }

    void verifyEmail();
  }, [token, router]);

  return (
    <div className="space-y-4 text-center">
      {status === "loading" && (
        <>
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Verifying your email...</p>
        </>
      )}
      {status === "success" && (
        <>
          <h2 className="text-lg font-semibold">Email verified</h2>
          <p className="text-sm text-muted-foreground">{message}</p>
          <p className="text-xs text-muted-foreground">Redirecting to sign in...</p>
        </>
      )}
      {status === "error" && (
        <>
          <h2 className="text-lg font-semibold text-destructive">
            Verification failed
          </h2>
          <p className="text-sm text-muted-foreground">{message}</p>
          <Link href="/login" className="text-sm text-primary hover:underline">
            Back to sign in
          </Link>
        </>
      )}
    </div>
  );
}

export function VerifyEmailContentWrapper() {
  return (
    <Suspense fallback={<BrandingLoader />}>
      <VerifyEmailContent />
    </Suspense>
  );
}
