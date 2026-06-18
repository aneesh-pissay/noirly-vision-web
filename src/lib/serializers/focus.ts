import {
  calculateFocusDurationSeconds,
} from "@/lib/focus/session-duration";
import { id, iso } from "@/lib/serializers";
import type { IFocusSession } from "@/models/focus-session.model";
import type { FocusSessionDTO } from "@/types/focus";

type FocusSessionSource = Pick<
  IFocusSession,
  | "_id"
  | "userId"
  | "actionId"
  | "mode"
  | "distractionBlocking"
  | "status"
  | "startedAt"
  | "endedAt"
  | "completedAt"
  | "plannedMinutes"
  | "duration"
  | "quality"
  | "reflection"
  | "pausedAt"
  | "totalPausedSeconds"
>;

export function serializeFocusSession(
  session: FocusSessionSource,
  mission = "Focus Session"
): FocusSessionDTO {
  const isPaused = Boolean(session.pausedAt && !session.endedAt);
  const elapsedSeconds = session.endedAt
    ? session.duration * 60
    : calculateFocusDurationSeconds(session);

  return {
    id: id(session._id),
    userId: id(session.userId),
    actionId: session.actionId ? id(session.actionId) : undefined,
    mission,
    mode: session.mode ?? "deep_work",
    distractionBlocking: session.distractionBlocking ?? true,
    status: session.status ?? (session.endedAt ? "completed" : "active"),
    startedAt: iso(session.startedAt) ?? new Date().toISOString(),
    endedAt: iso(session.endedAt),
    completedAt: iso(session.completedAt ?? session.endedAt),
    plannedMinutes: session.plannedMinutes ?? session.duration ?? 60,
    duration: session.duration,
    quality: session.quality,
    reflection: session.reflection,
    isPaused,
    pausedAt: iso(session.pausedAt),
    totalPausedSeconds: session.totalPausedSeconds ?? 0,
    elapsedSeconds,
  };
}
