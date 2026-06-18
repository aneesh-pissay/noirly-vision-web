"use client";

import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

const nodes = [
  { id: "vision", label: "World Class Engineer", x: "left" },
  { id: "goals", label: "Cloud Mastery", x: "center-left" },
  { id: "knowledge", label: "System Design", x: "center-right", active: true },
  { id: "actions", label: "Terraform Sprint", x: "right" },
];

export function KnowledgeGraph() {
  return (
    <div className="relative overflow-hidden rounded-xl border border-border bg-surface p-6">
      <div className="flex flex-wrap items-center justify-center gap-2 text-[10px] text-muted-foreground">
        <span>Vision</span>
        <ArrowRight className="h-3 w-3" />
        <span>Goals</span>
        <ArrowRight className="h-3 w-3" />
        <span>Knowledge</span>
        <ArrowRight className="h-3 w-3" />
        <span>Actions</span>
      </div>

      <div className="relative mt-8 flex min-h-[140px] items-center justify-between gap-4 px-2">
        <div className="absolute left-[12%] right-[12%] top-1/2 h-px -translate-y-1/2 bg-border" />

        {nodes.map((node) => (
          <div key={node.id} className="relative z-10 flex flex-1 flex-col items-center">
            <div
              className={cn(
                "rounded-lg border px-3 py-2 text-center text-[10px] font-medium",
                node.active
                  ? "border-primary/50 bg-primary/10 text-primary noirly-glow"
                  : "border-border bg-card text-foreground"
              )}
            >
              {node.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
