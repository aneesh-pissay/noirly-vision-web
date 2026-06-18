import { id, iso } from "@/lib/serializers";
import type { IAction } from "@/models/action.model";
import type { ActionDTO } from "@/types/action";
import type { ActionStatus } from "@/types";

type ActionSource = Pick<
  IAction,
  | "_id"
  | "userId"
  | "visionId"
  | "goalId"
  | "milestoneId"
  | "title"
  | "description"
  | "type"
  | "status"
  | "priority"
  | "estimatedMinutes"
  | "completedMinutes"
  | "progress"
  | "completedAt"
  | "createdAt"
  | "updatedAt"
>;

const UI_STATUS_MAP: Record<ActionStatus, "planned" | "in_progress" | "executed"> = {
  PLANNED: "planned",
  IN_PROGRESS: "in_progress",
  EXECUTED: "executed",
};

export function toUiStatus(status: ActionStatus) {
  return UI_STATUS_MAP[status];
}

export function serializeAction(action: ActionSource): ActionDTO {
  return {
    id: id(action._id),
    userId: id(action.userId),
    visionId: action.visionId ? id(action.visionId) : undefined,
    goalId: action.goalId ? id(action.goalId) : undefined,
    milestoneId: action.milestoneId ? id(action.milestoneId) : undefined,
    title: action.title,
    description: action.description,
    type: action.type ?? "build",
    status: action.status,
    priority: action.priority,
    estimatedMinutes: action.estimatedMinutes,
    completedMinutes: action.completedMinutes ?? 0,
    progress: action.progress ?? 0,
    completedAt: iso(action.completedAt),
    createdAt: iso(action.createdAt) ?? new Date().toISOString(),
    updatedAt: iso(action.updatedAt) ?? new Date().toISOString(),
  };
}

export function createStatusFields(status: ActionStatus) {
  if (status === "EXECUTED") {
    return { status, completedAt: new Date() };
  }

  return { status };
}

export function applyStatusUpdate(
  status: ActionStatus,
  update: Record<string, unknown>
) {
  update.status = status;

  if (status === "EXECUTED") {
    update.completedAt = new Date();
    return;
  }

  update.$unset = { completedAt: "" };
}
