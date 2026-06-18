import { APP_NAME } from "@/lib/constants";
import { buildEmailHtml } from "@/lib/email";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export function buildAchievementEmail(input: {
  greeting: string;
  title: string;
  message: string;
  actionUrl?: string;
}): { subject: string; html: string } {
  return {
    subject: `${input.title} — ${APP_NAME}`,
    html: buildEmailHtml({
      title: input.title,
      greeting: input.greeting,
      bodyHtml: `<p style="margin:0;font-size:15px;line-height:1.6;color:#d4d4d4;">${input.message}</p>`,
      actionUrl: input.actionUrl ?? `${APP_URL}/dashboard`,
      actionLabel: "Open Dashboard",
      footerNote: "Keep building momentum — one focused step at a time.",
    }),
  };
}
