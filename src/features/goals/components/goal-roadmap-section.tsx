import type { ReactNode } from "react";
import { Check, Circle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import type { GoalMilestoneItem } from "@/features/goals/types";

export type MilestoneRoadmapCardProps = {
  id: string;
  title: string;
  completedActions: number;
  totalActions: number;
  /** null = no actions linked yet */
  progress: number | null;
  completed: boolean;
  footer?: ReactNode;
};

function milestoneStatusBadge(completed: boolean, progress: number | null) {
  if (completed) {
    return {
      label: "Completed",
      className: "border-primary/40 bg-primary/10 text-primary",
    };
  }

  if (progress === null) {
    return {
      label: "Needs Actions",
      className: "border-destructive/40 bg-destructive/10 text-destructive",
    };
  }

  if (progress > 0) {
    return {
      label: "In Progress",
      className: "border-chart-4/40 bg-chart-4/10 text-chart-4",
    };
  }

  return {
    label: "Pending",
    className: "border-border bg-surface text-muted-foreground",
  };
}

export function milestoneRoadmapStatus(milestone: GoalMilestoneItem) {
  if (milestone.completed) return "Completed";

  if (milestone.totalActions === 0) return "Not started";

  const remaining = milestone.totalActions - milestone.completedActions;
  return `${remaining} action${remaining === 1 ? "" : "s"} remaining`;
}

export function MilestoneRoadmapCard({
  title,
  completedActions,
  totalActions,
  progress,
  completed,
  footer,
}: MilestoneRoadmapCardProps) {
  const status = milestoneStatusBadge(completed, progress);
  const hasActions = totalActions > 0;

  return (
    <div className="rounded-xl border border-border bg-background/50 p-4">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-medium leading-snug">{title}</p>
        <Badge variant="outline" className={cn("shrink-0 text-[10px]", status.className)}>
          {status.label}
        </Badge>
      </div>
      <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
        <span>
          {hasActions ? `${completedActions}/${totalActions} actions` : "No actions linked"}
        </span>
        {hasActions ? (
          <span className="font-medium text-primary">{progress ?? 0}%</span>
        ) : (
          <span className="font-medium text-muted-foreground">—</span>
        )}
      </div>
      {hasActions && <Progress value={progress ?? 0} className="mt-3 h-1.5" />}
      {footer && <div className="mt-3">{footer}</div>}
    </div>
  );
}

type GoalMilestoneRoadmapListProps = {
  milestones: GoalMilestoneItem[];
  onAddAction?: (milestoneId: string) => void;
};

export function GoalMilestoneRoadmapList({
  milestones,
  onAddAction,
}: GoalMilestoneRoadmapListProps) {
  return (
    <ul className="mt-4 space-y-4">
      {milestones.map((milestone) => {
        const statusLabel = milestoneRoadmapStatus(milestone);

        return (
          <li
            key={milestone.id}
            className="flex items-start gap-3 rounded-xl border border-border bg-background/40 px-4 py-3"
          >
            {milestone.completed ? (
              <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/20">
                <Check className="h-3 w-3 text-primary" />
              </div>
            ) : (
              <Circle className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" />
            )}

            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium">{milestone.name}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">{statusLabel}</p>
              {!milestone.completed && onAddAction && (
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-3 rounded-full"
                  onClick={() => onAddAction(milestone.id)}
                >
                  Add Action
                </Button>
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );
}

type GoalRoadmapSectionProps = {
  goalTitle: string;
  /** null = no milestones yet (Setup Required) */
  goalProgress: number | null;
  goalProgressNote?: string;
  milestones: MilestoneRoadmapCardProps[];
  emptyState?: ReactNode;
};

export function GoalRoadmapSection({
  goalTitle,
  goalProgress,
  goalProgressNote,
  milestones,
  emptyState,
}: GoalRoadmapSectionProps) {
  const hasMilestones = milestones.length > 0;
  const progressLabel =
    goalProgress === null ? "Active — waiting for milestones" : `${goalProgress}%`;

  return (
    <div className="rounded-xl border border-border bg-surface/30 p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Goal Roadmap
          </p>
          <h4 className="mt-2 text-base font-semibold">{goalTitle}</h4>
        </div>
        <div className="text-right sm:min-w-[88px]">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
            Goal Progress
          </p>
          <p
            className={cn(
              "mt-1 font-bold",
              goalProgress === null
                ? "text-sm text-muted-foreground"
                : "text-lg text-primary"
            )}
          >
            {progressLabel}
          </p>
          {goalProgressNote && goalProgress !== null && (
            <p className="mt-0.5 text-[10px] text-muted-foreground">
              {goalProgressNote}
            </p>
          )}
        </div>
      </div>
      {hasMilestones && goalProgress !== null && (
        <Progress value={goalProgress} className="mt-4 h-2" />
      )}

      {!hasMilestones ? (
        emptyState
      ) : (
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {milestones.map((milestone) => (
            <MilestoneRoadmapCard key={milestone.id} {...milestone} />
          ))}
        </div>
      )}
    </div>
  );
}
