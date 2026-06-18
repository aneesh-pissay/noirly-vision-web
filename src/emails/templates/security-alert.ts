import { APP_NAME } from "@/lib/constants";
import { buildEmailHtml } from "@/lib/email";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export function buildSecurityAlertEmail(input: {
  greeting: string;
  title: string;
  message: string;
  actionUrl?: string;
  actionLabel?: string;
}): { subject: string; html: string } {
  return {
    subject: `Security alert — ${APP_NAME}`,
    html: buildEmailHtml({
      title: input.title,
      greeting: input.greeting,
      bodyHtml: `
        <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#d4d4d4;">${input.message}</p>
        <p style="margin:0;padding:12px 14px;background:#2a1a1a;border:1px solid #7f1d1d;border-radius:10px;font-size:13px;color:#fca5a5;">
          If you did not perform this action, change your password immediately and review your account security.
        </p>
      `,
      actionUrl: input.actionUrl ?? `${APP_URL}/dashboard/settings`,
      actionLabel: input.actionLabel ?? "Review Security Settings",
      footerNote: "Security alerts are always sent immediately and cannot be disabled.",
    }),
  };
}
