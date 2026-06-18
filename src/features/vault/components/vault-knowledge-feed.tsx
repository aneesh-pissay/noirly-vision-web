import { BookOpen, Plus } from "lucide-react";
import type { VaultEntryItem } from "@/features/vault/types";
import { VAULT_TYPE_LABELS } from "@/lib/constants";
import type { VaultType } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type VaultKnowledgeFeedProps = {
  entries: VaultEntryItem[];
  selectedId: string | null;
  onSelect: (entry: VaultEntryItem) => void;
  onCreateFirst: () => void;
  canCreate?: boolean;
};

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function stripPreview(content?: string) {
  if (!content) return undefined;

  try {
    const parsed = JSON.parse(content) as {
      content?: { content?: { text?: string }[] }[];
    };
    const text = parsed.content
      ?.flatMap((block) => block.content?.map((node) => node.text ?? "") ?? [])
      .join(" ")
      .trim();
    if (text) return text.slice(0, 140);
  } catch {
    return content.slice(0, 140);
  }

  return undefined;
}

function formatType(type: VaultType) {
  return VAULT_TYPE_LABELS[type] ?? type;
}

function connectionLabel(entry: VaultEntryItem) {
  if (entry.linkedVisionTitle) return `Vision · ${entry.linkedVisionTitle}`;
  if (entry.linkedGoalTitle) return `Goal · ${entry.linkedGoalTitle}`;
  if (entry.linkedActionTitle) return `Action · ${entry.linkedActionTitle}`;
  if (entry.linkedFocusSessionTitle) {
    return `Focus · ${entry.linkedFocusSessionTitle}`;
  }
  return null;
}

export function VaultKnowledgeFeed({
  entries,
  selectedId,
  onSelect,
  onCreateFirst,
  canCreate = true,
}: VaultKnowledgeFeedProps) {
  return (
    <section className="min-w-0 flex-1">
      <Card className="overflow-hidden border-border bg-card">
        <CardContent className="p-4">
          <h3 className="truncate text-sm font-semibold">Knowledge Feed</h3>

          {entries.length === 0 ? (
            <div className="flex flex-col items-center px-4 py-16 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                <BookOpen className="h-6 w-6 text-primary" />
              </div>
              <h4 className="mt-4 text-base font-semibold">
                No knowledge captured yet
              </h4>
              <p className="mt-2 max-w-sm break-words text-sm leading-relaxed text-muted-foreground">
                Save ideas, lessons and decisions from your journey.
              </p>
              {canCreate && (
                <Button className="mt-6 rounded-full" onClick={onCreateFirst}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create First Entry
                </Button>
              )}
            </div>
          ) : (
            <div className="mt-4 space-y-3">
              {entries.map((entry) => {
                const preview = stripPreview(entry.content);
                const connection = connectionLabel(entry);

                return (
                  <button
                    key={entry.id}
                    type="button"
                    onClick={() => onSelect(entry)}
                    className={cn(
                      "w-full min-w-0 overflow-hidden rounded-xl border p-4 text-left transition-colors",
                      selectedId === entry.id
                        ? "border-primary/30 bg-primary/5"
                        : "border-border bg-surface hover:border-primary/20"
                    )}
                  >
                    <div className="flex min-w-0 items-start justify-between gap-2">
                      <p className="min-w-0 flex-1 truncate text-sm font-semibold">
                        {entry.title}
                      </p>
                      <Badge variant="outline" className="shrink-0 text-[9px]">
                        {formatType(entry.type)}
                      </Badge>
                    </div>

                    {preview && (
                      <p className="mt-2 break-words text-xs leading-relaxed text-muted-foreground line-clamp-2">
                        {preview}
                      </p>
                    )}

                    <div className="mt-3 flex min-w-0 flex-wrap items-center gap-2 text-[10px] text-muted-foreground">
                      {connection && (
                        <span className="max-w-full truncate rounded-md border border-border bg-card px-2 py-0.5">
                          {connection}
                        </span>
                      )}
                      <span className="ml-auto shrink-0">
                        {formatDate(entry.updatedAt)}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
