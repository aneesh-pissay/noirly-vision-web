import Link from "next/link";
import type { StrategicIntelligence } from "@/lib/intelligence/resolver";
import type { SystemMaturityLevel } from "@/lib/progress/lifecycle";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { RightPanelShell } from "@/components/right-panel/right-panel-shell";
import { cn } from "@/lib/utils";

const STATE_COLORS: Record<SystemMaturityLevel, string> = {
  EMPTY: "text-chart-4",
  VISION_ACTIVE: "text-chart-2",
  GOAL_ACTIVE: "text-primary",
  ROADMAP_ACTIVE: "text-chart-2",
  EXECUTING: "text-primary",
  OPTIMIZED: "text-chart-3",
};

const STATE_BADGE: Record<SystemMaturityLevel, string> = {
  EMPTY: "border-chart-4/30 bg-chart-4/10 text-chart-4",
  VISION_ACTIVE: "border-chart-2/30 bg-chart-2/10 text-chart-2",
  GOAL_ACTIVE: "border-primary/30 bg-primary/10 text-primary",
  ROADMAP_ACTIVE: "border-chart-2/30 bg-chart-2/10 text-chart-2",
  EXECUTING: "border-primary/30 bg-primary/10 text-primary",
  OPTIMIZED: "border-chart-3/30 bg-chart-3/10 text-chart-3",
};

type StrategicIntelligencePanelProps = {
  title?: string;
  intelligence: StrategicIntelligence;
};

export function StrategicIntelligencePanel({
  title = "Intelligence",
  intelligence,
}: StrategicIntelligencePanelProps) {
  const level = intelligence.systemState;

  return (
    <RightPanelShell>
      <div className="min-w-0">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-primary">
          Strategic OS
        </p>
        <div className="mt-1 flex items-center gap-2">
          <h2 className="truncate text-sm font-semibold">{title}</h2>
          <span
            className={cn(
              "shrink-0 rounded-full border px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide",
              STATE_BADGE[level]
            )}
          >
            {intelligence.statusLabel}
          </span>
        </div>
      </div>

      <Card className="overflow-hidden border-border bg-card">
        <CardContent className="space-y-4 p-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Status
            </p>
            <p className={cn("mt-1 text-sm font-medium capitalize", STATE_COLORS[level])}>
              {intelligence.statusLabel}
            </p>
          </div>

          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Current
            </p>
            <p className={cn("mt-1 text-sm font-medium", STATE_COLORS[level])}>
              {intelligence.currentPriority ?? "Create your vision"}
            </p>
          </div>

          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Next Step
            </p>
            <p className="mt-1 text-sm font-medium">{intelligence.nextStep.title}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {intelligence.nextStep.description}
            </p>
            <Button asChild size="sm" variant="outline" className="mt-3 w-full rounded-full">
              <Link href={intelligence.nextStep.href}>Continue</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </RightPanelShell>
  );
}
