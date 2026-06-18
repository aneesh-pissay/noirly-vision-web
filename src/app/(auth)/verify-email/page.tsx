import type { Metadata } from "next";
import { VerifyEmailContentWrapper } from "@/components/forms/verify-email-content";

export const metadata: Metadata = {
  title: "Verify Email",
};

export default function VerifyEmailPage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Verify your email</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Confirming your Noirly Vision account
      </p>
      <div className="mt-6">
        <VerifyEmailContentWrapper />
      </div>
    </div>
  );
}
