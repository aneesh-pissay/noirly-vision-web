import { ArrowRight } from "lucide-react";

const workflow = [
  {
    step: "Vision",
    detail: "Become your best version",
  },
  {
    step: "Goal",
    detail: "Build measurable progress",
  },
  {
    step: "Action",
    detail: "Execute today",
  },
  {
    step: "Focus",
    detail: "Protect deep work",
  },
  {
    step: "Vault",
    detail: "Capture learning",
  },
] as const;

export function HeroMockup() {
  return (
    <div className="relative mx-auto mt-16 max-w-4xl">
      <div className="absolute inset-0 -z-10 rounded-3xl bg-primary/10 blur-3xl" />
      <div className="overflow-hidden rounded-2xl border border-border/80 bg-card shadow-2xl noirly-glow">
        <div className="flex items-center gap-2 border-b border-border bg-surface px-4 py-3">
          <div className="flex gap-1.5">
            <div className="h-2.5 w-2.5 rounded-full bg-red-500/60" />
            <div className="h-2.5 w-2.5 rounded-full bg-yellow-500/60" />
            <div className="h-2.5 w-2.5 rounded-full bg-green-500/60" />
          </div>
          <span className="ml-2 text-xs text-muted-foreground">
            noirly vision — workflow
          </span>
        </div>

        <div className="p-6 sm:p-8">
          <p className="text-sm font-medium text-muted-foreground">
            How your personal OS connects
          </p>
          <div className="mt-6 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between">
            {workflow.map((item, index) => (
              <div key={item.step} className="flex items-center gap-3 sm:contents">
                <div className="min-w-0 flex-1 rounded-xl border border-border bg-surface px-4 py-3 text-left">
                  <p className="text-sm font-semibold text-foreground">
                    {item.step}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {item.detail}
                  </p>
                </div>
                {index < workflow.length - 1 ? (
                  <ArrowRight className="hidden h-4 w-4 shrink-0 text-primary/70 sm:block" />
                ) : null}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
