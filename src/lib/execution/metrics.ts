import type { ActionPriority, ActionStatus } from "@/types";

const PRIORITY_WEIGHT: Record<ActionPriority, number> = {
  critical: 4,
  high: 3,
  medium: 2,
  low: 1,
};

export type ActionMetricSource = {
  status: ActionStatus;
  priority: ActionPriority;
  goalId?: { toString(): string } | string | null;
  createdAt: Date;
  completedAt?: Date | null;
};

export function startOfToday(date = new Date()) {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  return start;
}

export function isActiveAction(status: ActionStatus) {
  return status === "PLANNED" || status === "IN_PROGRESS";
}

export function pickTodaysMission<T extends ActionMetricSource>(
  actions: T[]
): T | null {
  const active = actions.filter((action) => isActiveAction(action.status));
  if (active.length === 0) return null;

  return [...active].sort(
    (a, b) => PRIORITY_WEIGHT[b.priority] - PRIORITY_WEIGHT[a.priority]
  )[0];
}

export function calculateExecutionScore(actions: ActionMetricSource[]) {
  if (actions.length === 0) return null;

  const completed = actions.filter((action) => action.status === "EXECUTED").length;
  return Math.round((completed / actions.length) * 100);
}

export function calculateTodayExecutionMomentum(
  actions: ActionMetricSource[],
  startOfDay = startOfToday()
) {
  const plannedToday = actions.filter(
    (action) => new Date(action.createdAt) >= startOfDay
  );

  if (plannedToday.length === 0) return null;

  const completedToday = plannedToday.filter(
    (action) => action.status === "EXECUTED"
  ).length;

  return Math.round((completedToday / plannedToday.length) * 100);
}

export function calculateGoalAlignment(actions: ActionMetricSource[]) {
  if (actions.length === 0) return 0;

  const linked = actions.filter((action) => Boolean(action.goalId)).length;
  return Math.round((linked / actions.length) * 100);
}

export function buildGoalAlignmentAreas(
  actions: ActionMetricSource[],
  goals: { _id: { toString(): string }; title: string }[]
) {
  if (actions.length === 0) return [];

  return goals
    .map((goal) => {
      const goalId = goal._id.toString();
      const linked = actions.filter(
        (action) => action.goalId?.toString() === goalId
      ).length;

      return {
        label: goal.title,
        value: Math.round((linked / actions.length) * 100),
        actionCount: linked,
      };
    })
    .filter((area) => area.actionCount > 0);
}
