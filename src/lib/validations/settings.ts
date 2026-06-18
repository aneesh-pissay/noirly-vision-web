import { z } from "zod";
import {
  DATE_FORMATS,
  DENSITIES,
  FOCUS_DURATIONS,
  SIDEBAR_MODES,
  STARTUP_PAGES,
  THEMES,
  WEEK_START_DAYS,
} from "@/lib/settings/constants";

const timeSchema = z
  .string()
  .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Use HH:mm format");

export const updateProfileSchema = z.object({
  displayName: z.string().min(1, "Display name is required").max(80),
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(30),
  identityTitle: z.string().max(100).optional(),
});

export const updateAvatarSchema = z.object({
  avatar: z.string().url("Enter a valid image URL").nullable(),
});

export const updateWorkspaceSettingsSchema = z.object({
  workspaceName: z.string().min(1).max(80),
  startupPage: z.enum(STARTUP_PAGES),
  dateFormat: z.enum(DATE_FORMATS),
  timezone: z.string().min(1).max(80),
  weekStartDay: z.coerce
    .number()
    .refine(
      (value): value is (typeof WEEK_START_DAYS)[number] =>
        (WEEK_START_DAYS as readonly number[]).includes(value),
      "Invalid week start day"
    ),
});

export const updatePreferencesSettingsSchema = z.object({
  theme: z.enum(THEMES),
  accentColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  density: z.enum(DENSITIES),
  sidebarMode: z.enum(SIDEBAR_MODES),
  animationsEnabled: z.boolean(),
});

export const updateFocusSettingsSchema = z.object({
  focusDuration: z.coerce
    .number()
    .refine(
      (value): value is (typeof FOCUS_DURATIONS)[number] =>
        (FOCUS_DURATIONS as readonly number[]).includes(value),
      "Invalid focus duration"
    ),
  breakReminder: z.boolean(),
  autoStartNextSession: z.boolean(),
  dailyFocusTargetHours: z.coerce.number().int().min(1).max(12),
  bestFocusWindow: timeSchema,
});

export const updateNotificationPreferencesSchema = z.object({
  channels: z.object({
    inApp: z.boolean(),
    push: z.boolean(),
    email: z.boolean(),
  }),
  push: z.object({
    enabled: z.boolean(),
    dailyPlanning: z.boolean(),
    focusReminder: z.boolean(),
    achievements: z.boolean(),
  }),
  email: z.object({
    enabled: z.boolean(),
    dailySummary: z.boolean(),
    weeklyReview: z.boolean(),
    achievements: z.boolean(),
    security: z.boolean(),
  }),
  morningCheckInTime: timeSchema,
  eveningReviewTime: timeSchema,
});

/** @deprecated Use updateNotificationPreferencesSchema */
export const updateNotificationSettingsSchema = updateNotificationPreferencesSchema;

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(1, "Confirm your new password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const importBackupSchema = z.object({
  backup: z.string().min(2),
  mode: z.enum(["replace", "merge"]).default("replace"),
});

export const deleteAccountSchema = z.object({
  password: z.string().min(1, "Password is required"),
});
