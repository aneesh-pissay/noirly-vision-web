import Link from "next/link";
import { Eye, Rocket } from "lucide-react";
import type { SystemChecklist } from "@/components/right-panel/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { RightPanelShell } from "@/components/right-panel/right-panel-shell";

const checklistItems: {
  key: keyof SystemChecklist;
  label: string;
}[] = [
  { key: "hasVision", label: "Create Vision" },
  { key: "hasGoals", label: "Add Goals" },
  { key: "hasActions", label: "Plan Actions" },
  { key: "hasFocusSession", label: "Complete Focus Session" },
  { key: "hasVaultEntry", label: "Capture Knowledge" },
];

type EmptyRightPanelProps = {
  checklist: SystemChecklist;
  setupProgress: number;
};

export function EmptyRightPanel({
  checklist,
  setupProgress,
}: EmptyRightPanelProps) {
  return (
    <RightPanelShell>
      <div className="min-w-0">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-primary">
          Strategic OS
        </p>
        <h2 className="mt-1 truncate text-lg font-semibold">Build Your System</h2>
      </div>

      <Card className="overflow-hidden border-border bg-card">
        <CardHeader className="pb-2 pt-4">
          <CardTitle className="flex min-w-0 items-center gap-2 text-sm font-semibold">
            <Rocket className="h-4 w-4 shrink-0 text-primary" />
            <span className="truncate">Start With Vision</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="pb-4">
          <p className="break-words text-xs leading-relaxed text-muted-foreground line-clamp-2">
            Define where you want to go first.
          </p>
          <Button asChild className="mt-4 w-full rounded-full">
            <Link href="/dashboard/vision">
              <Eye className="mr-2 h-4 w-4" />
              Create Vision
            </Link>
          </Button>
        </CardContent>
      </Card>

      <Card className="overflow-hidden border-border bg-card">
        <CardHeader className="pb-2 pt-4">
          <CardTitle className="truncate text-sm font-semibold">System Setup</CardTitle>
        </CardHeader>
        <CardContent className="pb-4">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium text-primary">
              {setupProgress}/5 Completed
            </span>
          </div>
          <Progress
            value={(setupProgress / 5) * 100}
            className="mt-2 h-2"
          />
          <ul className="mt-4 space-y-2.5">
            {checklistItems.map((item) => {
              const done = checklist[item.key];
              return (
                <li
                  key={item.key}
                  className="flex items-center gap-2 text-xs text-muted-foreground"
                >
                  <span
                    className={
                      done ? "text-primary" : "text-muted-foreground/60"
                    }
                  >
                    {done ? "●" : "○"}
                  </span>
                  <span className={cn("truncate", done ? "text-foreground" : undefined)}>
                    {item.label}
                  </span>
                </li>
              );
            })}
          </ul>
        </CardContent>
      </Card>

      <Card className="overflow-hidden border-border bg-surface">
        <CardContent className="p-4">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Getting Started
          </p>
          <p className="mt-2 break-words text-xs leading-relaxed text-muted-foreground line-clamp-2">
            Noirly connects Vision → Goals → Milestones → Actions → Focus → Knowledge.
          </p>
        </CardContent>
      </Card>
    </RightPanelShell>
  );
}
