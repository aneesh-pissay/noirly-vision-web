import { APP_NAME } from "@/lib/constants";
import { buildEmailHtml } from "@/lib/email";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export function buildDailySummaryEmail(input: {
  greeting: string;
  priorityTitle: string;
  pendingActions: number;
  suggestedFocus: string;
}): { subject: string; html: string } {
  const bodyHtml = `
    <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#d4d4d4;">Here is your daily briefing for ${APP_NAME}.</p>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:0 0 16px;">
      <tr><td style="padding:12px 14px;background:#1a1a1a;border:1px solid #262626;border-radius:10px;">
        <p style="margin:0 0 4px;font-size:12px;color:#a3a3a3;text-transform:uppercase;letter-spacing:0.04em;">Today's priority</p>
        <p style="margin:0;font-size:16px;font-weight:600;color:#fafafa;">${input.priorityTitle}</p>
      </td></tr>
    </table>
    <p style="margin:0 0 8px;font-size:14px;color:#d4d4d4;"><strong>${input.pendingActions}</strong> action${input.pendingActions === 1 ? "" : "s"} waiting in your pipeline.</p>
    <p style="margin:0;font-size:14px;color:#d4d4d4;">Suggested focus: <strong>${input.suggestedFocus}</strong></p>
  `;

  return {
    subject: `Your daily briefing — ${APP_NAME}`,
    html: buildEmailHtml({
      title: "Daily Summary",
      greeting: input.greeting,
      bodyHtml,
      actionUrl: `${APP_URL}/dashboard/execution`,
      actionLabel: "Open Actions",
      footerNote: "You can adjust daily summary emails in Settings → Notifications.",
    }),
  };
}
