import type { ActionPriority, ActionStatus, ActionType } from "@/types";

export type ActionDTO = {
  id: string;
  userId: string;
  visionId?: string;
  goalId?: string;
  milestoneId?: string;
  title: string;
  description?: string;
  type: ActionType;
  status: ActionStatus;
  priority: ActionPriority;
  estimatedMinutes: number;
  completedMinutes: number;
  progress: number;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
};
