"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { GripVertical, Loader2, Plus } from "lucide-react";
import { updateActionStatus } from "@/actions/execution";
import { ACTION_TYPE_LABELS } from "@/lib/constants";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { ActionItem } from "@/features/execution/types";
import type { ActionStatus } from "@/types";

type PipelineColumn = {
  key: ActionStatus;
  title: string;
  items: ActionItem[];
};

type ActionPipelineProps = {
  planned: ActionItem[];
  inProgress: ActionItem[];
  executed: ActionItem[];
  onAddPlanned: () => void;
};

function formatMinutes(minutes: number) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

function formatPriority(priority: string) {
  return `${priority.charAt(0).toUpperCase()}${priority.slice(1)} Priority`;
}

function KanbanCard({
  action,
  isDragging,
  onDragStart,
  onDragEnd,
}: {
  action: ActionItem;
  isDragging: boolean;
  onDragStart: () => void;
  onDragEnd: () => void;
}) {
  return (
    <div
      draggable
      onDragStart={(event) => {
        event.dataTransfer.setData("text/action-id", action.id);
        event.dataTransfer.effectAllowed = "move";
        onDragStart();
      }}
      onDragEnd={onDragEnd}
      className={cn(
        "cursor-grab rounded-lg border border-border bg-surface p-3 active:cursor-grabbing",
        isDragging && "opacity-50"
      )}
    >
      <div className="flex items-start gap-2">
        <GripVertical className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium">{action.title}</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            <Badge variant="outline" className="text-[9px]">
              {ACTION_TYPE_LABELS[action.type]}
            </Badge>
            <Badge variant="outline" className="text-[9px]">
              {formatPriority(action.priority)}
            </Badge>
          </div>
          <p className="mt-2 text-[10px] text-muted-foreground">
            {action.status === "executed" && action.completedAt
              ? `Done · ${new Date(action.completedAt).toLocaleTimeString()}`
              : formatMinutes(action.estimatedMinutes)}
          </p>
          {action.goalTitle && (
            <Badge
              variant="outline"
              className="mt-2 border-primary/30 bg-primary/10 text-[9px] text-primary"
            >
              {action.goalTitle}
            </Badge>
          )}
          {(action.priority === "high" || action.priority === "critical") &&
            action.status === "in_progress" && (
              <Badge
                variant="outline"
                className="mt-2 border-destructive/30 bg-destructive/10 text-[9px] text-destructive"
              >
                High Impact
              </Badge>
            )}
          {action.status === "executed" && (
            <Badge
              variant="secondary"
              className="mt-2 bg-chart-3/10 text-[9px] text-chart-3"
            >
              Done
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
}

function KanbanColumn({
  column,
  isDragOver,
  isUpdating,
  draggingId,
  onDragOver,
  onDragLeave,
  onDrop,
  onDragStart,
  onDragEnd,
  onAdd,
}: {
  column: PipelineColumn;
  isDragOver: boolean;
  isUpdating: boolean;
  draggingId: string | null;
  onDragOver: (event: React.DragEvent) => void;
  onDragLeave: () => void;
  onDrop: (event: React.DragEvent) => void;
  onDragStart: (id: string) => void;
  onDragEnd: () => void;
  onAdd?: () => void;
}) {
  return (
    <div
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      className={cn(
        "flex min-h-[280px] flex-col rounded-xl border border-border bg-card/50 p-3 transition-colors",
        isDragOver && "border-primary/50 bg-primary/5"
      )}
    >
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          {column.title} ({column.items.length})
        </p>
        {isUpdating && <Loader2 className="h-3 w-3 animate-spin text-primary" />}
      </div>

      <div className="mt-3 flex flex-1 flex-col gap-2">
        {column.items.map((action) => (
          <KanbanCard
            key={action.id}
            action={action}
            isDragging={draggingId === action.id}
            onDragStart={() => onDragStart(action.id)}
            onDragEnd={onDragEnd}
          />
        ))}
      </div>

      {onAdd && (
        <button
          type="button"
          onClick={onAdd}
          className="mt-3 flex items-center gap-1 text-[10px] text-muted-foreground transition-colors hover:text-primary"
        >
          <Plus className="h-3 w-3" />
          Add Planned
        </button>
      )}
    </div>
  );
}

export function ActionPipeline({
  planned,
  inProgress,
  executed,
  onAddPlanned,
}: ActionPipelineProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<ActionStatus | null>(
    null
  );
  const [updatingColumn, setUpdatingColumn] = useState<ActionStatus | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);

  const columns: PipelineColumn[] = [
    { key: "PLANNED", title: "Planned", items: planned },
    { key: "IN_PROGRESS", title: "In Progress", items: inProgress },
    { key: "EXECUTED", title: "Completed", items: executed },
  ];

  async function moveAction(actionId: string, status: ActionStatus) {
    setUpdatingColumn(status);
    setError(null);

    const result = await updateActionStatus({ id: actionId, status });

    setUpdatingColumn(null);
    setDraggingId(null);
    setDragOverColumn(null);

    if (!result.success) {
      setError(result.error ?? "Failed to move action");
      return;
    }

    startTransition(() => {
      router.refresh();
    });
  }

  function handleDrop(status: ActionStatus) {
    return (event: React.DragEvent) => {
      event.preventDefault();
      const actionId = event.dataTransfer.getData("text/action-id");
      if (!actionId) return;

      const current = [...planned, ...inProgress, ...executed].find(
        (item) => item.id === actionId
      );
      if (!current) return;

      const currentStatus =
        current.status === "planned"
          ? "PLANNED"
          : current.status === "in_progress"
            ? "IN_PROGRESS"
            : "EXECUTED";

      if (currentStatus === status) {
        setDragOverColumn(null);
        setDraggingId(null);
        return;
      }

      void moveAction(actionId, status);
    };
  }

  return (
    <div>
      <h3 className="mb-1 text-sm font-semibold">Action Pipeline</h3>
      <p className="mb-3 text-xs text-muted-foreground">
        Drag actions between columns to update status.
      </p>

      {error && <p className="mb-3 text-sm text-destructive">{error}</p>}

      <div className="grid gap-3 lg:grid-cols-3">
        {columns.map((column) => (
          <KanbanColumn
            key={column.key}
            column={column}
            isDragOver={dragOverColumn === column.key}
            isUpdating={isPending || updatingColumn === column.key}
            draggingId={draggingId}
            onDragOver={(event) => {
              event.preventDefault();
              event.dataTransfer.dropEffect = "move";
              setDragOverColumn(column.key);
            }}
            onDragLeave={() => setDragOverColumn(null)}
            onDrop={handleDrop(column.key)}
            onDragStart={setDraggingId}
            onDragEnd={() => {
              setDraggingId(null);
              setDragOverColumn(null);
            }}
            onAdd={column.key === "PLANNED" ? onAddPlanned : undefined}
          />
        ))}
      </div>
    </div>
  );
}
