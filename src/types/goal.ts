import type { ActionPriority, GoalCategory, GoalStatus } from "@/types";
import type { MatrixLevel } from "@/lib/goals/priority-matrix";

export type GoalMilestoneDTO = {
  id: string;
  title: string;
  completed: boolean;
};

export type GoalDTO = {
  id: string;
  userId: string;
  visionId?: string;
  title: string;
  description?: string;
  category: GoalCategory;
  priority: ActionPriority;
  impactScore: number;
  effortScore: number;
  targetDate?: string;
  impact: MatrixLevel;
  effort: MatrixLevel;
  progress: number;
  status: GoalStatus;
  milestones: GoalMilestoneDTO[];
  createdAt: string;
  updatedAt: string;
};
