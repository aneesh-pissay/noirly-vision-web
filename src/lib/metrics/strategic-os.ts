import {
  calculateExecutionScore,
  pickTodaysMission,
  type ActionMetricSource,
} from "@/lib/execution/metrics";
import {
  averageResolvedProgress,
  buildMilestonesByGoalMap,
  calculateGoalProgress,
  resolveGoalsProgressMap,
} from "@/lib/goals/goal-progress";
import type { FocusSessionMetricSource } from "@/lib/focus/metrics";

export type MilestoneRecord = {
  _id: { toString(): string };
  goalId: { toString(): string } | string;
  title: string;
  status: "active" | "completed";
};

export type GoalRecord = {
  _id: { toString(): string };
  title: string;
  visionId?: { toString(): string } | string | null;
  progress?: number;
  status?: string;
};

export type ActionRecord = ActionMetricSource & {
  _id: { toString(): string };
  title: string;
  milestoneId?: { toString(): string } | string | null;
  goalId?: { toString(): string } | string | null;
};

export function calculateVisionProgress(
  connectedGoals: GoalRecord[],
  milestones: MilestoneRecord[]
): number | null {
  if (connectedGoals.length === 0) return null;

  // Vision progress requires at least one milestone in connected goals.
  // Goals without milestones mean the workflow is incomplete.
  const connectedGoalIds = new Set(
    connectedGoals.map((g) => g._id.toString())
  );
  const hasAnyMilestone = milestones.some((m) =>
    connectedGoalIds.has(m.goalId.toString())
  );
  if (!hasAnyMilestone) return null;

  const milestonesByGoal = buildMilestonesByGoalMap(milestones);
  const progressMap = resolveGoalsProgressMap(connectedGoals, milestonesByGoal);
  const values = connectedGoals.map(
    (goal) => progressMap.get(goal._id.toString()) ?? goal.progress ?? 0
  );

  return averageResolvedProgress(values);
}

export function calculateMilestoneProgress(
  completedActions: number,
  totalActions: number
): number | null {
  if (totalActions === 0) return null;
  return Math.round((completedActions / totalActions) * 100);
}

export function calculateFocusScore(
  sessions: FocusSessionMetricSource[]
): number | null {
  const completed = sessions.filter(
    (session) => session.endedAt && session.duration > 0
  );
  if (completed.length === 0) return null;

  return Math.round(
    completed.reduce((sum, session) => sum + session.quality, 0) /
      completed.length
  );
}

export function resolveExecutionScore(actions: ActionRecord[]): number | null {
  return calculateExecutionScore(actions);
}

export function resolveActiveMission(actions: ActionRecord[]): ActionRecord | null {
  return (
    actions.find((action) => action.status === "IN_PROGRESS") ??
    pickTodaysMission(actions)
  );
}

export type StrategicChain = {
  visionTitle: string | null;
  goalTitle: string | null;
  milestoneTitle: string | null;
  actionTitle: string | null;
};

export function buildStrategicChain(options: {
  visionTitle: string | null;
  goals: GoalRecord[];
  milestones: MilestoneRecord[];
  actions: ActionRecord[];
  mission: ActionRecord | null;
}): StrategicChain {
  const { visionTitle, goals, milestones, actions, mission } = options;

  if (!mission) {
    return {
      visionTitle,
      goalTitle: null,
      milestoneTitle: null,
      actionTitle: null,
    };
  }

  const goalId = mission.goalId?.toString();
  const milestoneId = mission.milestoneId?.toString();

  const goal = goalId
    ? goals.find((item) => item._id.toString() === goalId)
    : undefined;

  const milestone = milestoneId
    ? milestones.find((item) => item._id.toString() === milestoneId)
    : undefined;

  return {
    visionTitle,
    goalTitle: goal?.title ?? null,
    milestoneTitle: milestone?.title ?? null,
    actionTitle: mission.title,
  };
}

export function countCompletedActions(actions: ActionRecord[]) {
  return actions.filter((action) => action.status === "EXECUTED").length;
}

export function resolveGoalProgressValue(
  goalId: string,
  milestones: MilestoneRecord[]
): number {
  const goalMilestones = milestones
    .filter((milestone) => milestone.goalId.toString() === goalId)
    .map((milestone) => ({ completed: milestone.status === "completed" }));

  return calculateGoalProgress(goalMilestones);
}
