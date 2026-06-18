import { DEFAULT_SETTINGS } from "@/lib/settings/defaults";
import type { ISettings } from "@/models/settings.model";
import type { UserSettings } from "@/features/settings/types";

export function serializeUserSettings(
  settings: Partial<ISettings> | null | undefined
): UserSettings {
  if (!settings) return { ...DEFAULT_SETTINGS };

  return {
    workspaceName: settings.workspaceName ?? DEFAULT_SETTINGS.workspaceName,
    startupPage: settings.startupPage ?? DEFAULT_SETTINGS.startupPage,
    dateFormat: settings.dateFormat ?? DEFAULT_SETTINGS.dateFormat,
    timezone: settings.timezone ?? DEFAULT_SETTINGS.timezone,
    weekStartDay: settings.weekStartDay ?? DEFAULT_SETTINGS.weekStartDay,
    theme: settings.theme ?? DEFAULT_SETTINGS.theme,
    accentColor: settings.accentColor ?? DEFAULT_SETTINGS.accentColor,
    density: settings.density ?? DEFAULT_SETTINGS.density,
    sidebarMode: settings.sidebarMode ?? DEFAULT_SETTINGS.sidebarMode,
    animationsEnabled:
      settings.animationsEnabled ?? DEFAULT_SETTINGS.animationsEnabled,
    focusDuration: settings.focusDuration ?? DEFAULT_SETTINGS.focusDuration,
    breakReminder: settings.breakReminder ?? DEFAULT_SETTINGS.breakReminder,
    autoStartNextSession:
      settings.autoStartNextSession ?? DEFAULT_SETTINGS.autoStartNextSession,
    dailyFocusTargetHours:
      settings.dailyFocusTargetHours ?? DEFAULT_SETTINGS.dailyFocusTargetHours,
    bestFocusWindow:
      settings.bestFocusWindow ?? DEFAULT_SETTINGS.bestFocusWindow,
    notificationsEnabled:
      settings.notificationsEnabled ?? DEFAULT_SETTINGS.notificationsEnabled,
    dailyPlanningReminder:
      settings.dailyPlanningReminder ?? DEFAULT_SETTINGS.dailyPlanningReminder,
    goalReviewReminder:
      settings.goalReviewReminder ?? DEFAULT_SETTINGS.goalReviewReminder,
    focusReminder: settings.focusReminder ?? DEFAULT_SETTINGS.focusReminder,
    weeklyReview: settings.weeklyReview ?? DEFAULT_SETTINGS.weeklyReview,
    morningCheckInTime:
      settings.morningCheckInTime ?? DEFAULT_SETTINGS.morningCheckInTime,
    eveningReviewTime:
      settings.eveningReviewTime ?? DEFAULT_SETTINGS.eveningReviewTime,
  };
}
