"use client";

import { Flag, Sparkles, Target } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type {
  VisionTimelineEventType,
  VisionTrajectoryItem,
} from "@/features/vision/types";

type VisionTimelineProps = {
  trajectory: VisionTrajectoryItem[];
};

const eventMeta: Record<
  VisionTimelineEventType,
  { icon: typeof Sparkles; badgeClass: string }
> = {
  vision_created: {
    icon: Sparkles,
    badgeClass: "border-primary/40 bg-primary/10 text-primary",
  },
  goal_completed: {
    icon: Target,
    badgeClass: "border-chart-2/40 bg-chart-2/10 text-chart-2",
  },
  milestone_achieved: {
    icon: Flag,
    badgeClass: "border-chart-4/40 bg-chart-4/10 text-chart-4",
  },
};

export function VisionTimeline({ trajectory }: VisionTimelineProps) {
  if (trajectory.length === 0) {
    return (
      <Card className="border-border bg-card">
        <CardContent className="p-6">
          <h3 className="text-sm font-semibold">Vision Journey</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            Milestones, goals, and vision milestones will appear here as you
            progress.
          </p>
          <div className="mt-6 rounded-xl border border-dashed border-border px-4 py-8 text-center">
            <p className="text-sm text-muted-foreground">No journey events yet</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border bg-card">
      <CardContent className="p-6">
        <h3 className="text-sm font-semibold">Vision Journey</h3>
        <p className="mt-1 text-xs text-muted-foreground">
          Key moments from your vision — creation, completed goals, and major
          milestones.
        </p>

        <div className="relative mt-6">
          <div className="absolute bottom-3 left-[11px] top-3 w-px bg-border" />
          <ul className="space-y-6">
            {trajectory.map((item, index) => {
              const meta = eventMeta[item.type];
              const Icon = meta.icon;
              const isLast = index === trajectory.length - 1;

              return (
                <li key={item.id} className="relative flex gap-4 pl-0">
                  <div
                    className={cn(
                      "relative z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border bg-card",
                      meta.badgeClass
                    )}
                  >
                    <Icon className="h-3 w-3" />
                  </div>

                  <div className={cn("min-w-0 flex-1 pb-1", isLast && "pb-0")}>
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge
                        variant="outline"
                        className={cn("text-[10px]", meta.badgeClass)}
                      >
                        {item.eventLabel}
                      </Badge>
                      <span className="text-[10px] text-muted-foreground">
                        {item.dateLabel}
                      </span>
                    </div>
                    <p className="mt-2 text-sm font-medium">{item.title}</p>
                    {item.description && (
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {item.description}
                      </p>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
