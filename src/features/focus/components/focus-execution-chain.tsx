"use client";

import { cn } from "@/lib/utils";

type FocusExecutionChainProps = {
  actionTitle: string;
  goalTitle?: string;
  visionTitle?: string;
  className?: string;
};

export function FocusExecutionChain({
  actionTitle,
  goalTitle,
  visionTitle,
  className,
}: FocusExecutionChainProps) {
  const steps = [
    { label: "Focus Session", value: "Active" },
    { label: "Action", value: actionTitle },
    { label: "Goal", value: goalTitle ?? "No goal linked" },
    { label: "Vision", value: visionTitle ?? "No vision linked" },
  ];

  return (
    <div
      className={cn(
        "rounded-xl border border-border/70 bg-surface/50 px-4 py-3",
        className
      )}
    >
      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        Action Chain
      </p>
      <div className="mt-3 space-y-2">
        {steps.map((step, index) => (
          <div key={step.label}>
            <div className="flex min-w-0 items-start gap-3">
              <div className="flex flex-col items-center">
                <span
                  className={cn(
                    "mt-1 h-2 w-2 shrink-0 rounded-full",
                    index === 0 ? "bg-primary" : "bg-muted-foreground/40"
                  )}
                />
                {index < steps.length - 1 && (
                  <span className="my-1 h-4 w-px bg-border" />
                )}
              </div>
              <div className="min-w-0 pb-1">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  {step.label}
                </p>
                <p
                  className={cn(
                    "truncate text-sm font-medium",
                    !step.value ||
                      step.value.startsWith("No ")
                      ? "text-muted-foreground"
                      : "text-foreground"
                  )}
                  title={step.value}
                >
                  {step.value}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
