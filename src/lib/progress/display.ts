import { isSystemStarted } from "@/lib/progress/lifecycle";

export type ProgressDisplay =
  | { kind: "percent"; value: number; note?: string }
  | { kind: "label"; label: string };

export function visionProgressDisplay(
  progress: number | null,
  hasVision: boolean,
  _connectedGoalCount = 0
): ProgressDisplay {
  if (!hasVision) {
    return { kind: "label", label: "Setup Required" };
  }
  if (progress !== null) {
    return { kind: "percent", value: progress };
  }
  return { kind: "label", label: "Active" };
}

export function goalProgressDisplay(
  progress: number,
  milestoneCount: number
): ProgressDisplay {
  if (milestoneCount === 0) {
    return { kind: "label", label: "Active — waiting for milestones" };
  }
  return { kind: "percent", value: progress };
}

export function roadmapProgressDisplay(
  completed: number,
  total: number
): ProgressDisplay {
  if (total === 0) {
    return { kind: "label", label: "Planning" };
  }
  return {
    kind: "percent",
    value: Math.round((completed / total) * 100),
  };
}

export type ExecutionDisplayContext = {
  hasVision?: boolean;
  milestoneCount?: number;
};

export function executionScoreDisplay(
  score: number | null,
  totalActions: number,
  context?: ExecutionDisplayContext
): ProgressDisplay {
  const hasVision = context?.hasVision ?? true;
  const milestoneCount = context?.milestoneCount ?? 0;

  if (!hasVision) {
    return { kind: "label", label: "No active system" };
  }

  if (totalActions > 0 && score !== null) {
    return { kind: "percent", value: score };
  }

  if (milestoneCount > 0) {
    return { kind: "label", label: "Ready for actions" };
  }

  return { kind: "label", label: "Waiting for actions" };
}

export function focusScoreDisplay(
  score: number | null,
  sessionCount: number
): ProgressDisplay {
  if (sessionCount === 0 || score === null) {
    return { kind: "label", label: "Ready — needs an action" };
  }
  return { kind: "percent", value: score };
}

export function analyticsMetricDisplay(
  value: number | null,
  hasData: boolean
): ProgressDisplay {
  if (!hasData || value === null) {
    return { kind: "label", label: "Collecting data" };
  }
  return { kind: "percent", value };
}

export function formatProgressDisplay(display: ProgressDisplay): string {
  return display.kind === "percent" ? `${display.value}%` : display.label;
}

export function progressBarValue(display: ProgressDisplay): number {
  return display.kind === "percent" ? display.value : 0;
}

export function showProgressBar(display: ProgressDisplay): boolean {
  return display.kind === "percent";
}

export function progressNote(display: ProgressDisplay): string | undefined {
  return display.kind === "percent" ? display.note : undefined;
}

export { isSystemStarted };
