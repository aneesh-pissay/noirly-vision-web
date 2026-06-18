export type ActionResult<T = void> = {
  success: boolean;
  data?: T;
  error?: string;
};

export type AuthProvider = "credentials" | "google" | "github";

export type VisionStatus = "ACTIVE" | "ARCHIVED" | "COMPLETED";

export type VisionArea =
  | "career"
  | "health"
  | "learning"
  | "finance"
  | "personal"
  | "business";

export type VisionStage = "exploring" | "building" | "scaling" | "mastery";

export type GoalCategory =
  | "career"
  | "health"
  | "learning"
  | "finance"
  | "personal";

export type GoalStatus = "ACTIVE" | "PAUSED" | "COMPLETED";

export type MilestoneStatus = "active" | "completed";

export type ActionStatus = "PLANNED" | "IN_PROGRESS" | "EXECUTED";

export type ActionType = "build" | "learn" | "review" | "research" | "exercise";

export type FocusMode = "deep_work" | "learning" | "planning" | "review";

export type ActionPriority = "low" | "medium" | "high" | "critical";

export type VaultType =
  | "NOTE"
  | "DECISION"
  | "LESSON"
  | "RESOURCE"
  | "IDEA";

export type ReviewCycle = "weekly" | "biweekly" | "monthly";
