export const NOTIFICATION_TYPES = [
  "strategy",
  "execution",
  "focus",
  "review",
  "achievement",
  "security",
] as const;

export type NotificationType = (typeof NOTIFICATION_TYPES)[number];

export const NOTIFICATION_TYPE_LABELS: Record<NotificationType, string> = {
  strategy: "Strategy",
  execution: "Actions",
  focus: "Focus",
  review: "Review",
  achievement: "Achievement",
  security: "Security",
};

export const NOTIFICATION_PRIORITIES = [
  "low",
  "normal",
  "high",
  "urgent",
] as const;

export type NotificationPriority = (typeof NOTIFICATION_PRIORITIES)[number];

export const PUSH_ELIGIBLE_TYPES: NotificationType[] = [
  "focus",
  "review",
  "execution",
];

export const DEFAULT_NOTIFICATION_PREFERENCES = {
  channels: {
    inApp: true,
    push: true,
    email: true,
  },
  push: {
    enabled: true,
    dailyPlanning: true,
    focusReminder: true,
    achievements: true,
  },
  email: {
    enabled: true,
    dailySummary: false,
    weeklyReview: true,
    achievements: true,
    security: true,
  },
} as const;
