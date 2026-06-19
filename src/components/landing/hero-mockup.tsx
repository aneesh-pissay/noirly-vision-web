const workflowSteps = [
  { title: "Vision", subtitle: "Direction" },
  { title: "Goals", subtitle: "Targets" },
  { title: "Milestones", subtitle: "Checkpoints" },
  { title: "Actions", subtitle: "Execute" },
  { title: "Focus", subtitle: "Deep Work" },
  { title: "Knowledge", subtitle: "Learn" },
] as const;

export function HeroMockup() {
  return (
    <div className="relative mx-auto mt-16 w-full max-w-5xl">
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
            How your system connects
          </p>
          <div className="mt-6 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <div className="mx-auto flex w-max min-w-full items-start justify-center gap-1.5 px-1 sm:gap-2">
              {workflowSteps.map((step, index) => (
                <div key={step.title} className="flex items-start">
                  {index > 0 ? (
                    <span
                      className="mx-1.5 shrink-0 pt-1 text-sm text-primary/70 sm:mx-2"
                      aria-hidden
                    >
                      →
                    </span>
                  ) : null}
                  <div className="shrink-0 text-center">
                    <p className="whitespace-nowrap text-sm font-semibold text-foreground">
                      {step.title}
                    </p>
                    <p className="mt-0.5 whitespace-nowrap text-[10px] text-muted-foreground sm:text-xs">
                      {step.subtitle}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
