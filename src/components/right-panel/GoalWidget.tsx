import Link from "next/link";
import { Plus } from "lucide-react";
import type { RightPanelGoal } from "@/components/right-panel/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

type GoalWidgetProps = {
  goals: RightPanelGoal[];
};

export function GoalWidget({ goals }: GoalWidgetProps) {
  return (
    <Card className="overflow-hidden border-border bg-card">
      <CardHeader className="flex min-w-0 flex-row items-center justify-between pb-3 pt-4">
        <CardTitle className="truncate text-sm font-semibold">Active Goals</CardTitle>
        <Button
          asChild
          variant="ghost"
          size="icon"
          className="h-7 w-7"
        >
          <Link href="/dashboard/goals">
            <Plus className="h-3.5 w-3.5" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent className="space-y-4 pb-4">
        {goals.length > 0 ? (
          goals.map((goal) => (
            <div key={goal.id} className="min-w-0">
              <div className="flex min-w-0 items-center justify-between gap-2 text-xs">
                <span className="min-w-0 truncate text-muted-foreground">
                  {goal.title}
                </span>
                <span className="shrink-0 font-medium text-primary">
                  {goal.progress}%
                </span>
              </div>
              <Progress value={goal.progress} className="mt-1.5" />
            </div>
          ))
        ) : (
          <p className="break-words text-xs text-muted-foreground line-clamp-2">
            No active goals yet.{" "}
            <Link href="/dashboard/goals" className="text-primary hover:underline">
              Add a goal
            </Link>
          </p>
        )}
      </CardContent>
    </Card>
  );
}
