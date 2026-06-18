import { APP_NAME } from "@/lib/constants";
import { buildEmailHtml } from "@/lib/email";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export function buildWeeklyReviewEmail(input: {
  greeting: string;
  visionProgress: string;
  actionsCompleted: number;
  focusHours: number;
  topAchievement: string;
}): { subject: string; html: string } {
  const bodyHtml = `
    <p style="margin:0 0 20px;font-size:15px;line-height:1.6;color:#d4d4d4;">Your week in ${APP_NAME}:</p>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
      <tr><td style="padding:10px 0;border-bottom:1px solid #262626;font-size:14px;color:#d4d4d4;">Vision progress</td>
          <td style="padding:10px 0;border-bottom:1px solid #262626;font-size:14px;color:#fafafa;text-align:right;">${input.visionProgress}</td></tr>
      <tr><td style="padding:10px 0;border-bottom:1px solid #262626;font-size:14px;color:#d4d4d4;">Actions completed</td>
          <td style="padding:10px 0;border-bottom:1px solid #262626;font-size:14px;color:#fafafa;text-align:right;">${input.actionsCompleted}</td></tr>
      <tr><td style="padding:10px 0;border-bottom:1px solid #262626;font-size:14px;color:#d4d4d4;">Focus hours</td>
          <td style="padding:10px 0;border-bottom:1px solid #262626;font-size:14px;color:#fafafa;text-align:right;">${input.focusHours}h</td></tr>
      <tr><td style="padding:10px 0;font-size:14px;color:#d4d4d4;">Top achievement</td>
          <td style="padding:10px 0;font-size:14px;color:#a78bfa;text-align:right;">${input.topAchievement}</td></tr>
    </table>
  `;

  return {
    subject: "Your Noirly Weekly Review",
    html: buildEmailHtml({
      title: "Weekly Review",
      greeting: input.greeting,
      bodyHtml,
      actionUrl: `${APP_URL}/dashboard/analytics`,
      actionLabel: "View Analytics",
      footerNote: "Weekly reviews help you stay aligned with your vision.",
    }),
  };
}
