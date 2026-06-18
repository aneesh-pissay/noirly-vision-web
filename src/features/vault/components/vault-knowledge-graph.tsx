"use client";

import {
  BookOpen,
  GitBranch,
  Rocket,
  Target,
  Zap,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { VaultEntryItem } from "@/features/vault/types";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type VaultKnowledgeGraphProps = {
  entries: VaultEntryItem[];
  onCreateConnection?: () => void;
};

type GraphNodeData = {
  id: string;
  type: string;
  title: string;
  emptyLabel: string;
  icon: LucideIcon;
  connected: boolean;
};

function findPrimaryLinkedEntry(entries: VaultEntryItem[]) {
  const linked = entries.filter((entry) => entry.isLinked);
  if (linked.length === 0) return null;

  return linked.sort((a, b) => {
    const score = (entry: VaultEntryItem) =>
      Number(Boolean(entry.linkedVision)) +
      Number(Boolean(entry.linkedGoal)) +
      Number(Boolean(entry.linkedAction));
    return score(b) - score(a);
  })[0];
}

function buildGraphNodes(entries: VaultEntryItem[]): GraphNodeData[] {
  const primary = findPrimaryLinkedEntry(entries);

  return [
    {
      id: "vision",
      type: "VISION",
      title: primary?.linkedVisionTitle ?? "",
      emptyLabel: "No Vision Yet",
      icon: Rocket,
      connected: Boolean(primary?.linkedVisionTitle),
    },
    {
      id: "goal",
      type: "GOAL",
      title: primary?.linkedGoalTitle ?? "",
      emptyLabel: "No Goals Yet",
      icon: Target,
      connected: Boolean(primary?.linkedGoalTitle),
    },
    {
      id: "knowledge",
      type: "KNOWLEDGE",
      title: primary?.title ?? "",
      emptyLabel: "Capture first knowledge",
      icon: BookOpen,
      connected: Boolean(primary),
    },
    {
      id: "action",
      type: "ACTION",
      title: primary?.linkedActionTitle ?? "",
      emptyLabel: "No Actions Yet",
      icon: Zap,
      connected: Boolean(primary?.linkedActionTitle),
    },
  ];
}

function countConnectedNodes(nodes: GraphNodeData[]) {
  return nodes.filter((node) => node.connected).length;
}

function GraphNodeCard({ node }: { node: GraphNodeData }) {
  const Icon = node.icon;
  const displayTitle = node.connected ? node.title : node.emptyLabel;

  return (
    <div
      className={cn(
        "relative z-10 flex h-[96px] min-w-0 w-full flex-col justify-between overflow-hidden rounded-xl border px-3 py-2.5 transition-colors",
        node.connected
          ? "border-primary/30 bg-[#0F172A] noirly-glow"
          : "border-border/60 bg-[#0F172A]/40 opacity-60"
      )}
    >
      <div className="flex min-w-0 items-center gap-2">
        <div
          className={cn(
            "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg",
            node.connected ? "bg-primary/15" : "bg-muted/30"
          )}
        >
          <Icon
            className={cn(
              "h-3.5 w-3.5",
              node.connected ? "text-primary" : "text-muted-foreground/70"
            )}
          />
        </div>
        <span
          className={cn(
            "truncate text-[9px] font-semibold tracking-wider",
            node.connected ? "text-primary" : "text-muted-foreground/70"
          )}
        >
          {node.type}
        </span>
      </div>
      <p
        className={cn(
          "line-clamp-2 break-words text-xs font-medium leading-snug",
          node.connected ? "text-foreground" : "text-muted-foreground/80"
        )}
        title={displayTitle}
      >
        {displayTitle}
      </p>
    </div>
  );
}

function GridConnectionLines() {
  return (
    <svg
      className="pointer-events-none absolute inset-x-6 top-[48px] z-0 hidden h-3 md:block"
      width="100%"
      height="12"
      preserveAspectRatio="none"
      aria-hidden
    >
      <line
        x1="12.5%"
        y1="50%"
        x2="87.5%"
        y2="50%"
        stroke="#38BDF8"
        strokeWidth="2"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
        className="opacity-70"
      />
      <line
        x1="12.5%"
        y1="50%"
        x2="87.5%"
        y2="50%"
        stroke="#38BDF8"
        strokeWidth="8"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
        className="opacity-20"
        style={{ filter: "blur(4px)" }}
      />
    </svg>
  );
}

function VerticalConnectionLines() {
  return (
    <svg
      className="pointer-events-none absolute left-1/2 top-[96px] bottom-[96px] z-0 w-3 -translate-x-1/2 md:hidden"
      preserveAspectRatio="none"
      aria-hidden
    >
      <line
        x1="50%"
        y1="0%"
        x2="50%"
        y2="100%"
        stroke="#38BDF8"
        strokeWidth="2"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
        className="opacity-70"
      />
    </svg>
  );
}

export function VaultKnowledgeGraph({
  entries,
  onCreateConnection,
}: VaultKnowledgeGraphProps) {
  if (entries.length === 0) {
    return (
      <div className="w-full overflow-hidden rounded-xl border border-dashed border-border bg-[#020617] px-6 py-12 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
          <GitBranch className="h-6 w-6 text-primary" />
        </div>
        <h3 className="mt-4 text-base font-semibold">Capture first knowledge</h3>
        <p className="mx-auto mt-2 max-w-md break-words text-sm leading-relaxed text-muted-foreground">
          Add notes and link them to your vision, goals, and actions.
        </p>
        {onCreateConnection && (
          <Button className="mt-6 rounded-full" onClick={onCreateConnection}>
            Create Entry
          </Button>
        )}
      </div>
    );
  }

  const nodes = buildGraphNodes(entries);
  const connectedCount = countConnectedNodes(nodes);

  return (
    <div className="relative w-full overflow-hidden rounded-xl border border-border bg-[#020617]">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(56, 189, 248, 0.06) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(56, 189, 248, 0.06) 1px, transparent 1px)
          `,
          backgroundSize: "24px 24px",
        }}
      />

      <div className="relative min-w-0 p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <h3 className="text-sm font-semibold">Knowledge Graph</h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Vision → Goal → Knowledge → Action
            </p>
          </div>
          <div className="shrink-0 rounded-lg border border-primary/20 bg-primary/5 px-3 py-1.5">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
              Connected
            </p>
            <p className="text-sm font-semibold text-primary">
              {connectedCount} Node{connectedCount === 1 ? "" : "s"}
            </p>
          </div>
        </div>

        <div className="relative mt-8 w-full min-w-0 overflow-hidden">
          <GridConnectionLines />
          <VerticalConnectionLines />

          <div className="relative z-10 grid w-full min-w-0 grid-cols-1 gap-6 md:grid-cols-4 md:gap-3">
            {nodes.map((node) => (
              <GraphNodeCard key={node.id} node={node} />
            ))}
          </div>
        </div>

        <p className="mt-6 text-center text-[10px] tracking-wide text-muted-foreground">
          <span className="hidden md:inline">
            Vision — Goal — Knowledge — Action
          </span>
          <span className="md:hidden">Vision ↓ Goal ↓ Knowledge ↓ Action</span>
        </p>
      </div>
    </div>
  );
}
