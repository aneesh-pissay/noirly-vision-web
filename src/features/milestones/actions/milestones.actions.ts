"use server";

import { getGoalsPageData } from "@/features/goals/actions/goals.actions";
import type { MilestonesPageData } from "@/features/milestones/types";
import { requireSessionUserId } from "@/lib/auth/session";
import { loadOsCounts } from "@/lib/progress/load-os-counts";
import { resolveMilestonesLock } from "@/lib/progress/permissions";

export async function getMilestonesPageData(): Promise<MilestonesPageData> {
  const userId = await requireSessionUserId();
  const counts = await loadOsCounts(userId);
  const lock = resolveMilestonesLock(counts);

  if (!lock.unlocked) {
    return {
      lock,
      stats: {
        activeGoals: 0,
        milestonesTotal: 0,
        milestonesCompleted: 0,
      },
      goals: [],
    };
  }

  const goalsData = await getGoalsPageData();

  return {
    lock,
    stats: {
      activeGoals: goalsData.stats.activeGoals,
      milestonesTotal: goalsData.stats.milestonesTotal,
      milestonesCompleted: goalsData.stats.milestonesCompleted,
    },
    goals: goalsData.goals,
  };
}
