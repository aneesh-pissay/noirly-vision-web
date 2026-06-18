import type { NotificationPreferencesData } from "@/lib/notifications/types";
import type {
  DateFormat,
  Density,
  FocusDuration,
  SidebarMode,
  StartupPage,
  ThemeMode,
} from "@/lib/settings/constants";

export interface UserSettings {
  workspaceName: string;
  startupPage: StartupPage;
  dateFormat: DateFormat;
  timezone: string;
  weekStartDay: number;
  theme: ThemeMode;
  accentColor: string;
  density: Density;
  sidebarMode: SidebarMode;
  animationsEnabled: boolean;
  focusDuration: FocusDuration;
  breakReminder: boolean;
  autoStartNextSession: boolean;
  dailyFocusTargetHours: number;
  bestFocusWindow: string;
  notificationsEnabled: boolean;
  dailyPlanningReminder: boolean;
  goalReviewReminder: boolean;
  focusReminder: boolean;
  weeklyReview: boolean;
  morningCheckInTime: string;
  eveningReviewTime: string;
}

export interface SettingsProfile {
  displayName: string;
  username: string;
  email: string;
  role: string;
  identityTitle: string;
  avatar: string | null;
}

export interface WorkspaceStats {
  visions: number;
  goals: number;
  milestones: number;
  actions: number;
  focusSessions: number;
  vaultEntries: number;
}

export interface ProfilePageData {
  profile: SettingsProfile;
  activeVisionTitle: string | null;
}

export interface SettingsPageData {
  settings: UserSettings;
  notificationPreferences: NotificationPreferencesData;
  profile: SettingsProfile;
  activeVisionTitle: string | null;
  workspaceStats: WorkspaceStats;
  session: {
    currentDevice: string;
  };
}
