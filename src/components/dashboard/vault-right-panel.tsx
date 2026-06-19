"use client";

import { ArrowUpRight, Plus, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

const learningBalance = [
  { label: "Engineering", value: 70 },
  { label: "Health", value: 20 },
  { label: "Finance", value: 10 },
];

export function VaultRightPanel() {
  return (
    <aside className="relative hidden w-72 shrink-0 flex-col gap-4 overflow-y-auto border-l border-border bg-background p-4 pb-20 xl:flex">
      <h2 className="text-sm font-semibold">Knowledge Insights</h2>

      <Card className="border-border bg-card">
        <CardContent className="flex gap-3 p-4">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-chart-3/10">
            <TrendingUp className="h-4 w-4 text-chart-3" />
          </div>
          <div>
            <p className="text-xs font-medium">Knowledge Growth</p>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              Engineering knowledge base expanded 15% this month with{" "}
              <span className="text-primary">+12 new high-quality links</span>.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border bg-card">
        <CardContent className="p-4">
          <p className="text-xs font-medium">Most Active Area</p>
          <p className="mt-1 font-medium text-primary">Cloud Architecture</p>
          <p className="mt-1 text-[10px] text-muted-foreground">
            34 nodes modified
          </p>
        </CardContent>
      </Card>

      <Card className="border-border bg-card">
        <CardContent className="p-4">
          <p className="text-xs font-medium">Unused Knowledge</p>
          <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
            You saved 8 ideas not connected to any current goals.
          </p>
          <button
            type="button"
            className="mt-3 flex items-center gap-1 text-xs text-primary hover:underline"
          >
            Connect Ideas
            <ArrowUpRight className="h-3 w-3" />
          </button>
        </CardContent>
      </Card>

      <Card className="border-border bg-card">
        <CardContent className="p-4">
          <p className="text-sm font-medium">Learning Balance</p>
          <div className="mt-4 space-y-3">
            {learningBalance.map((item) => (
              <div key={item.label}>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">{item.label}</span>
                  <span className="text-primary">{item.value}%</span>
                </div>
                <Progress value={item.value} className="mt-1.5" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Button
        size="icon"
        className="absolute bottom-6 right-6 h-11 w-11 rounded-xl shadow-lg noirly-glow"
      >
        <Plus className="h-5 w-5" />
      </Button>
    </aside>
  );
}
