export type GoalWorkflowStatus =
  | "planning"
  | "in_progress"
  | "blocked";

export type GoalWorkflowState = {
  status: GoalWorkflowStatus;
  label: string;
  message: string;
};

const BLOCKED_INACTIVE_DAYS = 14;

function daysSince(date: Date) {
  return (Date.now() - date.getTime()) / (1000 * 60 * 60 * 24);
}

export function resolveGoalLastActivityAt(
  goalId: string,
  goalUpdatedAt: Date,
  actions: Array<{
    goalId?: { toString(): string } | null;
    updatedAt: Date;
  }>,
  focusSessions: Array<{
    actionId?: { toString(): string } | null;
    endedAt?: Date | null;
  }>,
  actionGoalIds: Map<string, string>
) {
  let latest = goalUpdatedAt.getTime();

  for (const action of actions) {
    if (action.goalId?.toString() !== goalId) continue;
    latest = Math.max(latest, action.updatedAt.getTime());
  }

  for (const session of focusSessions) {
    const sessionGoalId = session.actionId
      ? actionGoalIds.get(session.actionId.toString())
      : undefined;

    if (sessionGoalId !== goalId || !session.endedAt) continue;
    latest = Math.max(latest, session.endedAt.getTime());
  }

  return new Date(latest);
}

export function resolveGoalWorkflowStatus(input: {
  milestoneCount: number;
  actionCount: number;
  hasInProgressAction: boolean;
  lastActivityAt: Date;
}): GoalWorkflowState {
  if (daysSince(input.lastActivityAt) >= BLOCKED_INACTIVE_DAYS) {
    return {
      status: "blocked",
      label: "Blocked",
      message: "No activity for 14+ days",
    };
  }

  if (input.milestoneCount === 0) {
    return {
      status: "planning",
      label: "Active",
      message: "Waiting for milestones",
    };
  }

  if (input.actionCount === 0) {
    return {
      status: "planning",
      label: "Planning",
      message: "Add actions to your milestones",
    };
  }

  if (input.hasInProgressAction) {
    return {
      status: "in_progress",
      label: "In Progress",
      message: "Active work underway",
    };
  }

  return {
    status: "planning",
    label: "Planning",
    message: "Actions ready to start",
  };
}

export function resolveGoalNextStep(state: GoalWorkflowState): {
  title: string;
  description?: string;
} {
  switch (state.status) {
    case "planning":
      return state.message.includes("milestones")
        ? { title: "Create your first milestone" }
        : {
            title: "Add your first action",
            description: "Connect milestones to executable work.",
          };
    case "blocked":
      return {
        title: "Resume this goal",
        description: state.message,
      };
    case "in_progress":
      return {
        title: "Continue execution",
        description: "Pick up your in-progress action",
      };
  }
}
