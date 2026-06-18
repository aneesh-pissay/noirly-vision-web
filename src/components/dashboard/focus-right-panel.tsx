"use client";

import { Brain, Leaf, Plus, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

const focusBalance = [
  { label: "Career", value: 70 },
  { label: "Learning", value: 20 },
  { label: "Health", value: 10 },
];

export function FocusRightPanel() {
  return (
    <aside className="relative hidden w-72 shrink-0 flex-col gap-4 overflow-y-auto border-l border-border bg-background p-4 pb-20 xl:flex">
      <h2 className="text-sm font-semibold">Focus Insights</h2>

      <Card className="border-border bg-card">
        <CardContent className="flex gap-3 p-4">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-chart-4/10">
            <Sun className="h-4 w-4 text-chart-4" />
          </div>
          <div>
            <p className="text-xs font-medium">Current State</p>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              Morning performance is up 12%. Your circadian rhythm suggests 45
              more minutes of high-quality work before cognitive decline.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border bg-card">
        <CardContent className="p-4">
          <p className="text-sm font-medium">Focus Balance</p>
          <div className="mt-4 space-y-3">
            {focusBalance.map((item) => (
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

      <Card className="border-border bg-card">
        <CardContent className="flex gap-3 p-4">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-chart-3/10">
            <Leaf className="h-4 w-4 text-chart-3" />
          </div>
          <div>
            <p className="text-xs font-medium">Recovery Reminder</p>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              You&apos;ve been in deep work for 90 minutes. A 5-minute cognitive
              reset will sustain your afternoon performance.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border bg-card">
        <CardContent className="p-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
            <Brain className="h-4 w-4 text-primary" />
          </div>
          <p className="mt-3 text-xs italic leading-relaxed text-muted-foreground">
            &ldquo;The quality of your attention determines the quality of your
            life.&rdquo;
          </p>
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
