"use server";

import { requireSessionUserId } from "@/lib/auth/session";
import { connectDB } from "@/lib/db";
import {
  buildGoalAlignmentAreas,
  calculateExecutionScore,
  calculateGoalAlignment,
  calculateTodayExecutionMomentum,
  pickTodaysMission,
  startOfToday,
} from "@/lib/execution/metrics";
import { serializeAction, toUiStatus } from "@/lib/serializers/action";
import { id } from "@/lib/serializers";
import Action from "@/models/action.model";
import FocusSession from "@/models/focus-session.model";
import Goal from "@/models/goal.model";
import Milestone from "@/models/milestone.model";
import type { ActionItem, ExecutionPageData } from "@/features/execution/types";
import type { ActionDTO } from "@/types/action";

function toActionItem(
  action: ActionDTO,
  goalTitle?: string,
  isMission = false
): ActionItem {
  return {
    id: action.id,
    title: action.title,
    type: action.type,
    status: toUiStatus(action.status),
    priority: action.priority,
    estimatedMinutes: action.estimatedMinutes,
    completedAt: action.completedAt,
    goalId: action.goalId,
    goalTitle,
    isMission,
  };
}

export async function getExecutionPageData(): Promise<ExecutionPageData> {
  const userId = await requireSessionUserId();
  await connectDB();

  const startOfDay = startOfToday();

  const [actions, goals, milestones, sessionsToday] = await Promise.all([
    Action.find({ userId }).sort({ updatedAt: -1 }).lean(),
    Goal.find({ userId, status: "ACTIVE" }).sort({ title: 1 }).lean(),
    Milestone.find({ userId, status: { $ne: "completed" } })
      .sort({ order: 1, createdAt: 1 })
      .lean(),
    FocusSession.countDocuments({
      userId,
      startedAt: { $gte: startOfDay },
    }),
  ]);

  const goalTitleMap = new Map(
    goals.map((goal) => [goal._id.toString(), goal.title])
  );

  const missionDoc = pickTodaysMission(actions);
  const missionId = missionDoc?._id.toString();

  const items = actions.map((action) => {
    const dto = serializeAction(action);
    const goalTitle = action.goalId
      ? goalTitleMap.get(action.goalId.toString())
      : undefined;

    return toActionItem(
      dto,
      goalTitle,
      missionId === action._id.toString()
    );
  });

  const active = items.filter((item) => item.status !== "executed");
  const executed = items.filter((item) => item.status === "executed");
  const highImpact = active.filter(
    (item) => item.priority === "high" || item.priority === "critical"
  );
  const deepWorkMinutes = active.reduce(
    (sum, item) => sum + item.estimatedMinutes,
    0
  );

  const plannedToday = actions.filter(
    (action) => new Date(action.createdAt) >= startOfDay
  );
  const completedToday = plannedToday.filter(
    (action) => action.status === "EXECUTED"
  );

  const inProgress = active.filter((item) => item.status === "in_progress");

  return {
    stats: {
      executionScore: calculateExecutionScore(actions),
      todayMomentum: calculateTodayExecutionMomentum(actions, startOfDay),
      totalActions: actions.length,
      activeActions: active.length,
      highImpactActions: highImpact.length,
      deepWorkMinutes,
      sessionsToday,
      alignmentScore: calculateGoalAlignment(actions),
      plannedActionsToday: plannedToday.length,
      completedActionsToday: completedToday.length,
    },
    mission: missionDoc
      ? toActionItem(
          serializeAction(missionDoc),
          missionDoc.goalId
            ? goalTitleMap.get(missionDoc.goalId.toString())
            : undefined,
          true
        )
      : null,
    planned: active.filter((item) => item.status === "planned"),
    inProgress,
    executed: executed.slice(0, 20),
    goalOptions: goals.map((goal) => ({
      id: id(goal._id),
      title: goal.title,
      milestones: milestones
        .filter((milestone) => milestone.goalId.toString() === goal._id.toString())
        .map((milestone) => ({
          id: id(milestone._id),
          title: milestone.title,
        })),
    })),
    alignmentAreas: buildGoalAlignmentAreas(actions, goals),
    timeline: inProgress.slice(0, 5).map((item) => ({
      id: item.id,
      time: "In progress",
      title: item.title,
      badge:
        item.priority === "high" || item.priority === "critical"
          ? "High Impact"
          : null,
      active: true,
    })),
  };
}
