import mongoose, { type Document, type Model, Schema } from "mongoose";
import { DEFAULT_NOTIFICATION_PREFERENCES } from "@/lib/notifications/constants";

export interface INotificationPreferences extends Document {
  userId: mongoose.Types.ObjectId;
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
  createdAt: Date;
  updatedAt: Date;
}

const notificationPreferencesSchema = new Schema<INotificationPreferences>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    channels: {
      inApp: {
        type: Boolean,
        default: DEFAULT_NOTIFICATION_PREFERENCES.channels.inApp,
      },
      push: {
        type: Boolean,
        default: DEFAULT_NOTIFICATION_PREFERENCES.channels.push,
      },
      email: {
        type: Boolean,
        default: DEFAULT_NOTIFICATION_PREFERENCES.channels.email,
      },
    },
    push: {
      enabled: {
        type: Boolean,
        default: DEFAULT_NOTIFICATION_PREFERENCES.push.enabled,
      },
      dailyPlanning: {
        type: Boolean,
        default: DEFAULT_NOTIFICATION_PREFERENCES.push.dailyPlanning,
      },
      focusReminder: {
        type: Boolean,
        default: DEFAULT_NOTIFICATION_PREFERENCES.push.focusReminder,
      },
      achievements: {
        type: Boolean,
        default: DEFAULT_NOTIFICATION_PREFERENCES.push.achievements,
      },
    },
    email: {
      enabled: {
        type: Boolean,
        default: DEFAULT_NOTIFICATION_PREFERENCES.email.enabled,
      },
      dailySummary: {
        type: Boolean,
        default: DEFAULT_NOTIFICATION_PREFERENCES.email.dailySummary,
      },
      weeklyReview: {
        type: Boolean,
        default: DEFAULT_NOTIFICATION_PREFERENCES.email.weeklyReview,
      },
      achievements: {
        type: Boolean,
        default: DEFAULT_NOTIFICATION_PREFERENCES.email.achievements,
      },
      security: {
        type: Boolean,
        default: DEFAULT_NOTIFICATION_PREFERENCES.email.security,
      },
    },
  },
  { timestamps: true }
);

notificationPreferencesSchema.index({ userId: 1 }, { unique: true });

const NotificationPreferences: Model<INotificationPreferences> =
  mongoose.models.NotificationPreferences ??
  mongoose.model<INotificationPreferences>(
    "NotificationPreferences",
    notificationPreferencesSchema
  );

export default NotificationPreferences;
