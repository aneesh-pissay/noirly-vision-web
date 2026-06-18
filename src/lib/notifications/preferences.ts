import { connectDB } from "@/lib/db";
import { DEFAULT_NOTIFICATION_PREFERENCES } from "@/lib/notifications/constants";
import type { NotificationPreferencesData } from "@/lib/notifications/types";
import NotificationPreferences from "@/models/notification-preferences.model";
import Settings from "@/models/settings.model";

export function serializeNotificationPreferences(
  prefs: {
    channels: NotificationPreferencesData["channels"];
    push: NotificationPreferencesData["push"];
    email: NotificationPreferencesData["email"];
  } | null
): NotificationPreferencesData {
  if (!prefs) {
    return JSON.parse(JSON.stringify(DEFAULT_NOTIFICATION_PREFERENCES));
  }

  return {
    channels: { ...DEFAULT_NOTIFICATION_PREFERENCES.channels, ...prefs.channels },
    push: { ...DEFAULT_NOTIFICATION_PREFERENCES.push, ...prefs.push },
    email: { ...DEFAULT_NOTIFICATION_PREFERENCES.email, ...prefs.email },
  };
}

export async function getOrCreateNotificationPreferences(userId: string) {
  await connectDB();

  const existing = await NotificationPreferences.findOne({ userId }).lean();
  if (existing) {
    return serializeNotificationPreferences(existing);
  }

  const settings = await Settings.findOne({ userId })
    .select(
      "notificationsEnabled dailyPlanningReminder focusReminder weeklyReview"
    )
    .lean();

  const initial: NotificationPreferencesData = {
    channels: {
      inApp: settings?.notificationsEnabled ?? true,
      push: true,
      email: true,
    },
    push: {
      enabled: settings?.notificationsEnabled ?? true,
      dailyPlanning: settings?.dailyPlanningReminder ?? true,
      focusReminder: settings?.focusReminder ?? true,
      achievements: true,
    },
    email: {
      enabled: true,
      dailySummary: false,
      weeklyReview: settings?.weeklyReview ?? true,
      achievements: true,
      security: true,
    },
  };

  await NotificationPreferences.create({ userId, ...initial });
  return initial;
}

export async function upsertNotificationPreferences(
  userId: string,
  data: NotificationPreferencesData
) {
  await connectDB();

  await NotificationPreferences.findOneAndUpdate(
    { userId },
    { $set: data },
    { upsert: true, new: true }
  );

  await Settings.findOneAndUpdate(
    { userId },
    {
      $set: {
        notificationsEnabled: data.channels.inApp,
        dailyPlanningReminder: data.push.dailyPlanning,
        focusReminder: data.push.focusReminder,
        weeklyReview: data.email.weeklyReview,
      },
    },
    { upsert: true }
  );
}
