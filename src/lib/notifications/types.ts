import type {
  NotificationPriority,
  NotificationType,
} from "@/lib/notifications/constants";

export type NotificationChannels = {
  inApp: boolean;
  push: boolean;
  email: boolean;
};

export type NotificationDelivery = {
  pushSent: boolean;
  pushSentAt?: Date;
  emailSent: boolean;
  emailSentAt?: Date;
};

export type RelatedEntity = {
  type: string;
  id?: string;
};

export type CreateNotificationInput = {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  priority?: NotificationPriority;
  channels?: Partial<NotificationChannels>;
  relatedEntity?: RelatedEntity;
  actionUrl?: string;
  skipDedupe?: boolean;
};

export type NotificationPreferencesData = {
  channels: {
    inApp: boolean;
    push: boolean;
    email: boolean;
  };
  push: {
    enabled: boolean;
    dailyPlanning: boolean;
    focusReminder: boolean;
    achievements: boolean;
  };
  email: {
    enabled: boolean;
    dailySummary: boolean;
    weeklyReview: boolean;
    achievements: boolean;
    security: boolean;
  };
};

export type SerializedNotification = {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  priority: NotificationPriority;
  actionUrl?: string;
  isRead: boolean;
  createdAt: string;
  relatedEntity?: RelatedEntity;
};
