export const APP_NAME = "Noirly Vision";
export const APP_TAGLINE = "Personal OS";
export const APP_DESCRIPTION =
  "A premium Strategic OS productivity platform for focused action.";

export const DASHBOARD_NAV = [
  {
    id: "dashboard",
    title: "Dashboard",
    href: "/dashboard",
    icon: "LayoutDashboard",
  },
  {
    id: "vision",
    title: "Vision",
    href: "/dashboard/vision",
    icon: "Eye",
  },
  {
    id: "goals",
    title: "Goals",
    href: "/dashboard/goals",
    icon: "Flag",
  },
  {
    id: "milestones",
    title: "Milestones",
    href: "/milestones",
    icon: "Milestone",
  },
  {
    id: "actions",
    title: "Actions",
    href: "/dashboard/execution",
    icon: "ListTodo",
  },
  {
    id: "focus",
    title: "Focus",
    href: "/dashboard/focus",
    icon: "Timer",
  },
  {
    id: "knowledge",
    title: "Knowledge",
    href: "/dashboard/vault",
    icon: "BookOpen",
  },
  {
    id: "analytics",
    title: "Analytics",
    href: "/dashboard/analytics",
    icon: "BarChart3",
  },
] as const;

/** @deprecated Use DASHBOARD_NAV */
export const DASHBOARD_NAV_MAIN = DASHBOARD_NAV.slice(0, 5);

/** @deprecated Use DASHBOARD_NAV */
export const DASHBOARD_NAV_WORKSPACE = DASHBOARD_NAV.slice(5, 8);

export const DASHBOARD_NAV_SETTINGS = {
  title: "Settings",
  href: "/dashboard/settings",
} as const;

export const VISION_STATUSES = ["ACTIVE", "ARCHIVED", "COMPLETED"] as const;

export const VISION_AREAS = [
  "career",
  "health",
  "learning",
  "finance",
  "personal",
  "business",
] as const;

export const VISION_STAGES = [
  "exploring",
  "building",
  "scaling",
  "mastery",
] as const;

export const VISION_STAGE_LABELS: Record<
  (typeof VISION_STAGES)[number],
  string
> = {
  exploring: "Exploring",
  building: "Building",
  scaling: "Scaling",
  mastery: "Mastery",
};

export const GOAL_CATEGORIES = [
  "career",
  "health",
  "learning",
  "finance",
  "personal",
] as const;

export const GOAL_STATUSES = ["ACTIVE", "PAUSED", "COMPLETED"] as const;

export const MILESTONE_STATUSES = ["active", "completed"] as const;

export const ACTION_STATUSES = ["PLANNED", "IN_PROGRESS", "EXECUTED"] as const;

export const ACTION_START_STATUSES = ["PLANNED", "IN_PROGRESS"] as const;

export const ACTION_PRIORITIES = ["low", "medium", "high", "critical"] as const;

export const ACTION_TYPES = [
  "build",
  "learn",
  "review",
  "research",
  "exercise",
] as const;

export const ACTION_TYPE_LABELS: Record<
  (typeof ACTION_TYPES)[number],
  string
> = {
  build: "Build",
  learn: "Learn",
  review: "Review",
  research: "Research",
  exercise: "Exercise",
};

export const FOCUS_MODES = [
  "deep_work",
  "learning",
  "planning",
  "review",
] as const;

export const FOCUS_SESSION_STATUSES = ["active", "completed"] as const;

export const FOCUS_MODE_LABELS: Record<
  (typeof FOCUS_MODES)[number],
  string
> = {
  deep_work: "Deep Work",
  learning: "Learning",
  planning: "Planning",
  review: "Review",
};

export const VAULT_TYPES = [
  "NOTE",
  "DECISION",
  "LESSON",
  "RESOURCE",
  "IDEA",
] as const;

export const VAULT_TYPE_LABELS: Record<
  (typeof VAULT_TYPES)[number],
  string
> = {
  NOTE: "Note",
  DECISION: "Decision",
  LESSON: "Lesson",
  RESOURCE: "Resource",
  IDEA: "Idea",
};

/** Legacy DB values still readable from MongoDB */
export const LEGACY_VAULT_TYPES = ["REFLECTION"] as const;

export const VAULT_ENTRY_TYPES = [
  ...VAULT_TYPES,
  ...LEGACY_VAULT_TYPES,
] as const;

export const REVIEW_CYCLES = ["weekly", "biweekly", "monthly"] as const;
