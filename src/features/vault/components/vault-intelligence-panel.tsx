import type { VaultPageData } from "@/features/vault/types";
import { VAULT_TYPE_LABELS, VAULT_TYPES } from "@/lib/constants";
import type { VaultType } from "@/types";
import { Sparkles, TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

type VaultIntelligencePanelProps = {
  data: VaultPageData;
};

function typeDistribution(data: VaultPageData) {
  const counts = Object.fromEntries(
    VAULT_TYPES.map((type) => [type, 0])
  ) as Record<VaultType, number>;

  for (const entry of data.entries) {
    if (entry.type in counts) {
      counts[entry.type] += 1;
    }
  }

  const total = data.entries.length || 1;

  return VAULT_TYPES.filter((type) => counts[type] > 0).map((type) => ({
    label: VAULT_TYPE_LABELS[type],
    value: Math.round((counts[type] / total) * 100),
  }));
}

function mostActiveArea(data: VaultPageData) {
  const typeCounts = new Map<VaultType, number>();
  for (const entry of data.entries) {
    typeCounts.set(entry.type, (typeCounts.get(entry.type) ?? 0) + 1);
  }

  let best: { label: string; count: number } | null = null;
  for (const [type, count] of typeCounts) {
    const label = VAULT_TYPE_LABELS[type];
    if (!best || count > best.count) {
      best = { label, count };
    }
  }

  return best;
}

export function VaultIntelligencePanel({ data }: VaultIntelligencePanelProps) {
  const isEmpty = data.entries.length === 0;
  const unusedCount = data.entries.filter((entry) => !entry.isLinked).length;
  const activeArea = mostActiveArea(data);
  const balance = typeDistribution(data);

  if (isEmpty) {
    return (
      <aside className="noirly-sidebar-panel hidden w-[320px] shrink-0 flex-col gap-4 overflow-y-auto overflow-x-hidden border-l border-border bg-background p-4 xl:flex">
        <div className="flex min-w-0 items-center gap-2">
          <Sparkles className="h-4 w-4 shrink-0 text-primary" />
          <h2 className="truncate text-sm font-semibold text-primary">
            Vault Intelligence
          </h2>
        </div>

        <Card className="overflow-hidden border-border bg-card">
          <CardContent className="p-4">
            <p className="text-sm font-semibold">
              Your knowledge system is empty.
            </p>
            <ul className="mt-4 space-y-2.5 text-xs text-muted-foreground">
              <li className="flex items-center gap-2">
                <span>○</span>
                <span className="break-words">Capture first idea</span>
              </li>
              <li className="flex items-center gap-2">
                <span>○</span>
                <span className="break-words">Link knowledge to goals</span>
              </li>
              <li className="flex items-center gap-2">
                <span>○</span>
                <span className="break-words">Review insights</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </aside>
    );
  }

  return (
    <aside className="noirly-sidebar-panel hidden w-[320px] shrink-0 flex-col gap-4 overflow-y-auto overflow-x-hidden border-l border-border bg-background p-4 xl:flex">
      <div className="flex min-w-0 items-center gap-2">
        <Sparkles className="h-4 w-4 shrink-0 text-primary" />
        <h2 className="truncate text-sm font-semibold text-primary">
          Vault Intelligence
        </h2>
      </div>

      <Card className="overflow-hidden border-border bg-card">
        <CardContent className="flex min-w-0 gap-3 p-4">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-chart-3/10">
            <TrendingUp className="h-4 w-4 text-chart-3" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">Knowledge Growth</p>
            <p className="mt-1 break-words text-xs leading-relaxed text-muted-foreground line-clamp-2">
              {data.stats.totalEntries} entries captured ·{" "}
              {data.stats.knowledgeAlignment}% linked to your system.
            </p>
          </div>
        </CardContent>
      </Card>

      {activeArea && (
        <Card className="overflow-hidden border-border bg-card">
          <CardContent className="min-w-0 p-4">
            <p className="truncate text-sm font-semibold">Most Active Area</p>
            <p className="mt-1 truncate font-medium text-primary">
              {activeArea.label}
            </p>
            <p className="mt-1 text-[10px] text-muted-foreground">
              {activeArea.count} entr{activeArea.count === 1 ? "y" : "ies"}
            </p>
          </CardContent>
        </Card>
      )}

      <Card className="overflow-hidden border-border bg-card">
        <CardContent className="min-w-0 p-4">
          <p className="truncate text-sm font-semibold">Unused Knowledge</p>
          <p className="mt-2 break-words text-xs leading-relaxed text-muted-foreground line-clamp-2">
            {unusedCount > 0
              ? `${unusedCount} idea${unusedCount === 1 ? "" : "s"} not connected to vision, goals, or actions.`
              : "All entries are connected to your system."}
          </p>
        </CardContent>
      </Card>

      {balance.length > 0 && (
        <Card className="overflow-hidden border-border bg-card">
          <CardContent className="p-4">
            <p className="truncate text-sm font-semibold">Learning Balance</p>
            <div className="mt-4 space-y-3">
              {balance.map((item) => (
                <div key={item.label} className="min-w-0">
                  <div className="flex justify-between text-xs">
                    <span className="truncate text-muted-foreground">
                      {item.label}
                    </span>
                    <span className="shrink-0 text-primary">{item.value}%</span>
                  </div>
                  <Progress value={item.value} className="mt-1.5" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </aside>
  );
}
