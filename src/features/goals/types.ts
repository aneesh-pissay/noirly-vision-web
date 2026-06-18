import type { GoalCategory, GoalStatus } from "@/types";
import type { GoalOption } from "@/features/execution/types";
import type { GoalWorkflowState } from "@/lib/goals/goal-workflow-status";
import type { FeatureLockDisplay } from "@/lib/progress/permissions";

export interface GoalMilestoneItem {
  id: string;
  name: string;
  completed: boolean;
  completedActions: number;
  totalActions: number;
  progress: number;
}

export interface GoalItem {
  id: string;
  title: string;
  description?: string;
  category: GoalCategory;
  status: GoalStatus;
  progress: number;
  impact: "low" | "high";
  effort: "low" | "high";
  impactScore: number;
  effortScore: number;
  priority: string;
  visionId?: string;
  targetDate?: string;
  milestones: GoalMilestoneItem[];
  actionCount: number;
}

export interface PriorityMatrixActionItem {
  id: string;
  title: string;
  goalTitle: string;
  category: GoalCategory;
  impactScore: number;
  effortScore: number;
  status: string;
}

export interface GoalCategoryInsight {
  name: string;
  category: GoalCategory;
  goals: number;
  milestones: number;
  focusHours: number;
  actions: number;
}

export interface GoalsIntelligenceData {
  hasGoals: boolean;
  primaryGoalTitle: string | null;
  workflow: GoalWorkflowState | null;
  nextStepTitle: string | null;
  milestonesCompleted: number;
  milestonesTotal: number;
}

export interface GoalsPageData {
  lock: FeatureLockDisplay;
  stats: {
    activeGoals: number;
    averageProgress: number;
    milestonesTotal: number;
    milestonesCompleted: number;
    alignmentScore: number;
  };
  primaryGoal: GoalItem | null;
  goals: GoalItem[];
  goalOptions: GoalOption[];
  categories: GoalCategoryInsight[];
  priorityMatrix: {
    highImpactLowEffort: PriorityMatrixActionItem[];
    highImpactHighEffort: PriorityMatrixActionItem[];
    lowImpactLowEffort: PriorityMatrixActionItem[];
    lowImpactHighEffort: PriorityMatrixActionItem[];
  };
  totalActions: number;
}
