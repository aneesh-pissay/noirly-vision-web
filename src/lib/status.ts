import type { ActionStatus } from "@/types";

/** Map DB enum to UI-friendly lowercase status. */
export function toUiActionStatus(status: ActionStatus): string {
  const map: Record<ActionStatus, string> = {
    PLANNED: "planned",
    IN_PROGRESS: "in_progress",
    EXECUTED: "executed",
  };
  return map[status];
}

export function isHighScore(score: number): boolean {
  return score >= 50;
}
