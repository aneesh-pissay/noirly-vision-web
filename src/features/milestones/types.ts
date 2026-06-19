import type { GoalItem } from "@/features/goals/types";
import type { FeatureLockDisplay } from "@/lib/progress/permissions";

export interface MilestonesPageData {
  lock: FeatureLockDisplay;
  stats: {
    activeGoals: number;
    milestonesTotal: number;
    milestonesCompleted: number;
  };
  goals: GoalItem[];
}
