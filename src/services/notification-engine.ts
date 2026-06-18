import { connectDB } from "@/lib/db";
import type { NotificationType } from "@/lib/notifications/constants";
import { getOrCreateNotificationPreferences } from "@/lib/notifications/preferences";
import type { CreateNotificationInput } from "@/lib/notifications/types";
import {
  buildDedupeKey,
  shouldAllowEmail,
  shouldAllowPush,
} from "@/lib/notifications/utils";
import Notification from "@/models/notification.model";
import type { INotification } from "@/models/notification.model";
import {
  sendDailySummary,
  sendNotificationEmail,
  sendWeeklyReview,
} from "@/services/email-service";
import { sendPushNotification } from "@/services/push-service";

export type NotificationDeliveryExtras = {
  dailySummary?: {
    priorityTitle: string;
    pendingActions: number;
    suggestedFocus: string;
  };
  weeklyReview?: {
    visionProgress: string;
    actionsCompleted: number;
    focusHours: number;
    topAchievement: string;
  };
};

export type SendNotificationInput = CreateNotificationInput;

function resolveChannels(
  input: CreateNotificationInput,
  prefs: Awaited<ReturnType<typeof getOrCreateNotificationPreferences>>
) {
  const priority = input.priority ?? "normal";
  const pushAllowed =
    shouldAllowPush(input.type, priority) &&
    prefs.channels.push &&
    prefs.push.enabled;
  const emailAllowed =
    shouldAllowEmail(input.type, input.relatedEntity?.type) &&
    prefs.channels.email &&
    prefs.email.enabled;

  let push = input.channels?.push ?? pushAllowed;
  let email = input.channels?.email ?? emailAllowed;
  const inApp = input.channels?.inApp ?? prefs.channels.inApp;

  if (input.type === "security") {
    email = prefs.email.security;
    push = false;
  }

  if (input.type === "achievement") {
    push = push && prefs.push.achievements;
    email = email && prefs.email.achievements;
  }

  if (input.type === "review") {
    if (input.relatedEntity?.type === "daily") {
      push = push && prefs.push.dailyPlanning;
      email = email && prefs.email.dailySummary;
    }
    if (input.relatedEntity?.type === "weekly") {
      email = email && prefs.email.weeklyReview;
    }
  }

  if (input.type === "focus") {
    push = push && prefs.push.focusReminder;
  }

  if (input.type === "strategy" || input.type === "execution") {
    push = push && prefs.push.dailyPlanning;
  }

  return { inApp, push, email };
}

export async function createNotification(
  input: CreateNotificationInput
): Promise<INotification | null> {
  await connectDB();

  const dedupeKey = input.skipDedupe ? undefined : buildDedupeKey(input);

  if (dedupeKey) {
    const existing = await Notification.findOne({ dedupeKey }).lean();
    if (existing) return null;
  }

  const prefs = await getOrCreateNotificationPreferences(input.userId);
  const channels = resolveChannels(input, prefs);

  if (!channels.inApp && !channels.push && !channels.email) {
    return null;
  }

  try {
    const notification = await Notification.create({
      userId: input.userId,
      type: input.type,
      title: input.title,
      message: input.message,
      priority: input.priority ?? "normal",
      channels,
      delivery: {
        pushSent: false,
        emailSent: false,
      },
      relatedEntity: input.relatedEntity
        ? {
            type: input.relatedEntity.type,
            id: input.relatedEntity.id,
          }
        : undefined,
      actionUrl: input.actionUrl,
      dedupeKey,
      isRead: false,
    });

    return notification;
  } catch (error) {
    const mongoError = error as { code?: number };
    if (mongoError.code === 11000 && dedupeKey) {
      return null;
    }
    throw error;
  }
}

export async function deliverNotification(
  notificationId: string,
  extras?: NotificationDeliveryExtras
): Promise<INotification | null> {
  await connectDB();

  const notification = await Notification.findById(notificationId);
  if (!notification) return null;

  const userId = notification.userId.toString();
  const updates: Partial<INotification["delivery"]> = {
    ...notification.delivery,
  };

  if (notification.channels.push && !notification.delivery.pushSent) {
    try {
      const sent = await sendPushNotification(userId, {
        title: notification.title,
        body: notification.message,
        url: notification.actionUrl,
      });
      if (sent) {
        updates.pushSent = true;
        updates.pushSentAt = new Date();
      }
    } catch (error) {
      console.error("[Notification] Push delivery failed:", error);
    }
  }

  if (notification.channels.email && !notification.delivery.emailSent) {
    try {
      let sent = false;

      if (extras?.dailySummary) {
        sent = await sendDailySummary(userId, extras.dailySummary);
      } else if (extras?.weeklyReview) {
        sent = await sendWeeklyReview(userId, extras.weeklyReview);
      } else {
        sent = await sendNotificationEmail(userId, {
          title: notification.title,
          message: notification.message,
          type: notification.type as NotificationType,
          actionUrl: notification.actionUrl,
          relatedEntityType: notification.relatedEntity?.type,
        });
      }

      if (sent) {
        updates.emailSent = true;
        updates.emailSentAt = new Date();
      }
    } catch (error) {
      console.error("[Notification] Email delivery failed:", error);
    }
  }

  notification.delivery = {
    pushSent: updates.pushSent ?? notification.delivery.pushSent,
    pushSentAt: updates.pushSentAt ?? notification.delivery.pushSentAt,
    emailSent: updates.emailSent ?? notification.delivery.emailSent,
    emailSentAt: updates.emailSentAt ?? notification.delivery.emailSentAt,
  };

  await notification.save();
  return notification;
}

/**
 * Create a notification record, then deliver enabled channels (in-app, push, email).
 */
export async function sendNotification(
  input: SendNotificationInput,
  extras?: NotificationDeliveryExtras
): Promise<INotification | null> {
  const notification = await createNotification(input);
  if (!notification) return null;
  return deliverNotification(notification._id.toString(), extras);
}

export async function createAndSendNotification(
  input: CreateNotificationInput,
  extras?: NotificationDeliveryExtras
): Promise<INotification | null> {
  return sendNotification(input, extras);
}
