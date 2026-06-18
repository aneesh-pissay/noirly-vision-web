import { formatGreetingName, sendHtmlEmail } from "@/lib/email";
import { buildAchievementEmail } from "@/emails/templates/achievement";
import { buildDailySummaryEmail } from "@/emails/templates/daily-summary";
import { buildSecurityAlertEmail } from "@/emails/templates/security-alert";
import { buildWeeklyReviewEmail } from "@/emails/templates/weekly-review";
import type { NotificationType } from "@/lib/notifications/constants";
import User from "@/models/user.model";

async function getUserEmail(userId: string) {
  const user = await User.findById(userId)
    .select("email firstName username")
    .lean();
  if (!user?.email) return null;
  return user;
}

export async function sendNotificationEmail(
  userId: string,
  input: {
    title: string;
    message: string;
    type: NotificationType;
    actionUrl?: string;
    relatedEntityType?: string;
  }
): Promise<boolean> {
  const user = await getUserEmail(userId);
  if (!user) return false;

  const greeting = formatGreetingName(user.email, {
    firstName: user.firstName,
    username: user.username,
  });

  if (input.type === "security") {
    const email = buildSecurityAlertEmail({
      greeting,
      title: input.title,
      message: input.message,
      actionUrl: input.actionUrl,
    });
    await sendHtmlEmail({ to: user.email, ...email });
    return true;
  }

  if (input.type === "achievement") {
    const email = buildAchievementEmail({
      greeting,
      title: input.title,
      message: input.message,
      actionUrl: input.actionUrl,
    });
    await sendHtmlEmail({ to: user.email, ...email });
    return true;
  }

  const email = buildAchievementEmail({
    greeting,
    title: input.title,
    message: input.message,
    actionUrl: input.actionUrl,
  });
  await sendHtmlEmail({ to: user.email, ...email });
  return true;
}

export async function sendDailySummary(
  userId: string,
  data: {
    priorityTitle: string;
    pendingActions: number;
    suggestedFocus: string;
  }
): Promise<boolean> {
  const user = await getUserEmail(userId);
  if (!user) return false;

  const greeting = formatGreetingName(user.email, {
    firstName: user.firstName,
    username: user.username,
  });

  const email = buildDailySummaryEmail({ greeting, ...data });
  await sendHtmlEmail({ to: user.email, ...email });
  return true;
}

export async function sendWeeklyReview(
  userId: string,
  data: {
    visionProgress: string;
    actionsCompleted: number;
    focusHours: number;
    topAchievement: string;
  }
): Promise<boolean> {
  const user = await getUserEmail(userId);
  if (!user) return false;

  const greeting = formatGreetingName(user.email, {
    firstName: user.firstName,
    username: user.username,
  });

  const email = buildWeeklyReviewEmail({ greeting, ...data });
  await sendHtmlEmail({ to: user.email, ...email });
  return true;
}

export async function sendSecurityEmail(
  userId: string,
  input: {
    title: string;
    message: string;
    actionUrl?: string;
    actionLabel?: string;
  }
): Promise<boolean> {
  const user = await getUserEmail(userId);
  if (!user) return false;

  const greeting = formatGreetingName(user.email, {
    firstName: user.firstName,
    username: user.username,
  });

  const email = buildSecurityAlertEmail({ greeting, ...input });
  await sendHtmlEmail({ to: user.email, ...email });
  return true;
}
