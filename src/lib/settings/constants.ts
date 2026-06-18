export const STARTUP_PAGES = [
  "dashboard",
  "vision",
  "execution",
  "focus",
] as const;

export const DATE_FORMATS = ["mdy", "dmy", "ymd"] as const;

export const DATE_FORMAT_LABELS: Record<(typeof DATE_FORMATS)[number], string> = {
  mdy: "Mon DD, YYYY",
  dmy: "DD/MM/YYYY",
  ymd: "YYYY-MM-DD",
};

export const WEEK_START_DAYS = [0, 1, 2, 3, 4, 5, 6] as const;

export const WEEK_START_LABELS: Record<(typeof WEEK_START_DAYS)[number], string> = {
  0: "Sunday",
  1: "Monday",
  2: "Tuesday",
  3: "Wednesday",
  4: "Thursday",
  5: "Friday",
  6: "Saturday",
};

export const THEMES = ["dark", "light", "system"] as const;

export const DENSITIES = ["comfortable", "compact"] as const;

export const SIDEBAR_MODES = ["expanded", "compact"] as const;

export const FOCUS_DURATIONS = [25, 50, 90, 120] as const;

export const ACCENT_COLORS = [
  { id: "sky", value: "#38bdf8", label: "Sky" },
  { id: "violet", value: "#818cf8", label: "Violet" },
  { id: "emerald", value: "#34d399", label: "Emerald" },
  { id: "amber", value: "#fbbf24", label: "Amber" },
  { id: "rose", value: "#f472b6", label: "Rose" },
] as const;

export const SETTINGS_TABS = [
  "Workspace",
  "Preferences",
  "Focus",
  "Notifications",
  "Security",
  "Data",
] as const;

export type SettingsTab = (typeof SETTINGS_TABS)[number];
export type StartupPage = (typeof STARTUP_PAGES)[number];
export type DateFormat = (typeof DATE_FORMATS)[number];
export type ThemeMode = (typeof THEMES)[number];
export type Density = (typeof DENSITIES)[number];
export type SidebarMode = (typeof SIDEBAR_MODES)[number];
export type FocusDuration = (typeof FOCUS_DURATIONS)[number];
