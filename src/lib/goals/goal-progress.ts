export type MilestoneProgressInput = {
  completed: boolean;
};

export function calculateGoalProgress(milestones: MilestoneProgressInput[]): number {
  if (milestones.length === 0) return 0;
  const completed = milestones.filter((milestone) => milestone.completed).length;
  return Math.round((completed / milestones.length) * 100);
}

export function resolveGoalProgress(milestones: MilestoneProgressInput[]): number {
  return calculateGoalProgress(milestones);
}

type GoalProgressSource = {
  _id: { toString(): string };
};

type StoredMilestone = {
  goalId: { toString(): string } | string;
  status: "active" | "completed";
};

export function buildMilestonesByGoalMap(milestones: StoredMilestone[]) {
  const map = new Map<string, MilestoneProgressInput[]>();

  for (const milestone of milestones) {
    const goalId = milestone.goalId.toString();
    const list = map.get(goalId) ?? [];
    list.push({ completed: milestone.status === "completed" });
    map.set(goalId, list);
  }

  return map;
}

export function resolveGoalsProgressMap(
  goals: GoalProgressSource[],
  milestonesByGoal: Map<string, MilestoneProgressInput[]>
): Map<string, number> {
  const map = new Map<string, number>();

  for (const goal of goals) {
    const goalId = goal._id.toString();
    map.set(goalId, resolveGoalProgress(milestonesByGoal.get(goalId) ?? []));
  }

  return map;
}

export function averageResolvedProgress(progressValues: number[]) {
  if (progressValues.length === 0) return 0;
  return Math.round(
    progressValues.reduce((sum, value) => sum + value, 0) / progressValues.length
  );
}
