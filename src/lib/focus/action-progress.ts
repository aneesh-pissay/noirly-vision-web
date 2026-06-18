import { applyStatusUpdate } from "@/lib/serializers/action";
import {
  syncGoalProgressFromMilestones,
  syncMilestoneCompletionForAction,
} from "@/lib/milestones/sync";
import Action from "@/models/action.model";

function progressFromMinutes(completedMinutes: number, estimatedMinutes: number) {
  const estimate = Math.max(estimatedMinutes, 1);
  return Math.min(100, Math.round((completedMinutes / estimate) * 100));
}

export async function markActionExecutedFromFocus(options: {
  userId: string;
  actionId: string;
}) {
  const action = await Action.findOne({
    _id: options.actionId,
    userId: options.userId,
  }).lean();

  if (!action || action.status === "EXECUTED") {
    return;
  }

  const update: Record<string, unknown> = {
    progress: 100,
    completedMinutes: Math.max(
      action.completedMinutes ?? 0,
      action.estimatedMinutes
    ),
  };
  applyStatusUpdate("EXECUTED", update);

  await Action.findOneAndUpdate(
    { _id: options.actionId, userId: options.userId },
    update
  );

  await syncMilestoneCompletionForAction(options.userId, options.actionId);
}

export async function recordFocusTimeOnAction(options: {
  userId: string;
  actionId: string;
  sessionMinutes: number;
}) {
  const action = await Action.findOne({
    _id: options.actionId,
    userId: options.userId,
  }).lean();

  if (!action || action.status === "EXECUTED") {
    return;
  }

  const completedMinutes =
    (action.completedMinutes ?? 0) + options.sessionMinutes;
  const progress = progressFromMinutes(
    completedMinutes,
    action.estimatedMinutes
  );

  const update: Record<string, unknown> = {
    completedMinutes,
    progress,
  };

  if (action.status === "PLANNED") {
    applyStatusUpdate("IN_PROGRESS", update);
  }

  await Action.findOneAndUpdate(
    { _id: options.actionId, userId: options.userId },
    update
  );
}
