import type { VaultPageData } from "@/features/vault/types";
import type { VaultType } from "@/types";
import {
  BookOpen,
  FileText,
  FolderOpen,
  Lightbulb,
  Scale,
  Sparkles,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export type VaultCollectionFilter = "all" | VaultType;

type VaultCollectionsPanelProps = {
  data: VaultPageData;
  activeFilter: VaultCollectionFilter;
  onFilterChange: (filter: VaultCollectionFilter) => void;
};

const collectionItems: {
  id: VaultCollectionFilter;
  label: string;
  icon: LucideIcon;
  type?: VaultType;
}[] = [
  { id: "all", label: "All Entries", icon: BookOpen },
  { id: "NOTE", label: "Notes", icon: FileText, type: "NOTE" },
  { id: "DECISION", label: "Decisions", icon: Scale, type: "DECISION" },
  { id: "LESSON", label: "Lessons", icon: Lightbulb, type: "LESSON" },
  { id: "RESOURCE", label: "Resources", icon: FolderOpen, type: "RESOURCE" },
  { id: "IDEA", label: "Ideas", icon: Sparkles, type: "IDEA" },
];

function countForFilter(data: VaultPageData, filter: VaultCollectionFilter) {
  if (filter === "all") return data.entries.length;
  return data.entries.filter((entry) => entry.type === filter).length;
}

export function VaultCollectionsPanel({
  data,
  activeFilter,
  onFilterChange,
}: VaultCollectionsPanelProps) {
  return (
    <aside className="hidden w-[260px] shrink-0 lg:block">
      <Card className="overflow-hidden border-border bg-card">
        <CardContent className="p-4">
          <h3 className="truncate text-sm font-semibold">Collections</h3>
          <p className="mt-1 text-[10px] text-muted-foreground">
            Browse by knowledge type
          </p>
          <ul className="mt-3 space-y-1">
            {collectionItems.map((item) => {
              const count = countForFilter(data, item.id);
              const isActive = activeFilter === item.id;

              return (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => onFilterChange(item.id)}
                    className={cn(
                      "flex w-full min-w-0 items-center justify-between gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors",
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-accent hover:text-foreground"
                    )}
                  >
                    <span className="flex min-w-0 items-center gap-2">
                      <item.icon className="h-3.5 w-3.5 shrink-0" />
                      <span className="truncate">{item.label}</span>
                    </span>
                    <span className="shrink-0 text-xs">{count}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </CardContent>
      </Card>
    </aside>
  );
}
