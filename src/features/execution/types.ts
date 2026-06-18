import type { ActionPriority, ActionType } from "@/types";

export interface ActionItem {
  id: string;
  title: string;
  type: ActionType;
  status: "planned" | "in_progress" | "executed";
  priority: ActionPriority;
  estimatedMinutes: number;
  completedAt?: string;
  goalId?: string;
  goalTitle?: string;
  isMission: boolean;
}

export interface GoalOption {
  id: string;
  title: string;
  milestones: { id: string; title: string }[];
}

export interface ExecutionPageData {
  stats: {
    /** null = no actions yet (Setup Required) */
    executionScore: number | null;
    todayMomentum: number | null;
    totalActions: number;
    activeActions: number;
    highImpactActions: number;
    deepWorkMinutes: number;
    sessionsToday: number;
    alignmentScore: number;
    plannedActionsToday: number;
    completedActionsToday: number;
  };
  mission: ActionItem | null;
  planned: ActionItem[];
  inProgress: ActionItem[];
  executed: ActionItem[];
  goalOptions: GoalOption[];
  alignmentAreas: { label: string; value: number; actionCount: number }[];
  timeline: {
    id: string;
    time: string;
    title: string;
    badge: string | null;
    active: boolean;
  }[];
}
