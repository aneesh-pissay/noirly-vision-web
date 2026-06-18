"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Save, Tag, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  createVaultEntry,
  deleteVaultEntry,
  updateVaultEntry,
} from "@/actions/vault";
import {
  emptyVaultContent,
  VaultTiptapEditor,
} from "@/features/vault/components/vault-tiptap-editor";
import { useVaultDialog } from "@/features/vault/components/vault-dialog-provider";
import type { VaultEntryItem, VaultPageData } from "@/features/vault/types";
import { VAULT_TYPE_LABELS, VAULT_TYPES } from "@/lib/constants";
import type { VaultType } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

type VaultEntrySheetProps = {
  data: VaultPageData;
};

const defaultDraft = {
  title: "",
  type: "NOTE" as VaultType,
  tagsInput: "",
  content: emptyVaultContent(),
  linkedVision: "none",
  linkedGoal: "none",
  linkedAction: "none",
  linkedFocusSession: "none",
};

function parseTagsInput(value: string) {
  return value
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
}

export function VaultEntrySheet({ data }: VaultEntrySheetProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const { open, setOpen, editingEntryId } = useVaultDialog();
  const [error, setError] = useState<string | null>(null);
  const [draft, setDraft] = useState(defaultDraft);

  const editingEntry = useMemo(
    () => data.entries.find((entry) => entry.id === editingEntryId) ?? null,
    [data.entries, editingEntryId]
  );

  const isCreating = !editingEntryId;

  const filteredGoals = useMemo(() => {
    if (draft.linkedVision === "none") return [];
    return data.linkOptions.goals.filter(
      (goal) => goal.visionId === draft.linkedVision
    );
  }, [data.linkOptions.goals, draft.linkedVision]);

  const filteredActions = useMemo(() => {
    if (draft.linkedGoal === "none") return [];
    return data.linkOptions.actions.filter(
      (action) => action.goalId === draft.linkedGoal
    );
  }, [data.linkOptions.actions, draft.linkedGoal]);

  const filteredFocusSessions = useMemo(() => {
    if (draft.linkedAction === "none") return [];
    return data.linkOptions.focusSessions.filter(
      (session) => session.actionId === draft.linkedAction
    );
  }, [data.linkOptions.focusSessions, draft.linkedAction]);

  useEffect(() => {
    if (!open) return;

    setError(null);
    if (editingEntry) {
      setDraft({
        title: editingEntry.title,
        type: editingEntry.type,
        tagsInput: editingEntry.tags.join(", "),
        content: editingEntry.content ?? emptyVaultContent(),
        linkedVision: editingEntry.linkedVision ?? "none",
        linkedGoal: editingEntry.linkedGoal ?? "none",
        linkedAction: editingEntry.linkedAction ?? "none",
        linkedFocusSession: editingEntry.linkedFocusSession ?? "none",
      });
      return;
    }

    setDraft(defaultDraft);
  }, [open, editingEntry]);

  function handleVisionChange(value: string) {
    setDraft((current) => ({
      ...current,
      linkedVision: value,
      linkedGoal: "none",
      linkedAction: "none",
      linkedFocusSession: "none",
    }));
  }

  function handleGoalChange(value: string) {
    setDraft((current) => ({
      ...current,
      linkedGoal: value,
      linkedAction: "none",
      linkedFocusSession: "none",
    }));
  }

  function handleActionChange(value: string) {
    setDraft((current) => ({
      ...current,
      linkedAction: value,
      linkedFocusSession: "none",
    }));
  }

  async function handleSave() {
    setError(null);

    if (!draft.title.trim()) {
      setError("Title is required");
      return;
    }

    const payload = {
      title: draft.title.trim(),
      type: draft.type,
      content: draft.content,
      tags: parseTagsInput(draft.tagsInput),
    };

    const linkPayload = {
      linkedVision:
        draft.linkedVision === "none" ? null : draft.linkedVision,
      linkedGoal: draft.linkedGoal === "none" ? null : draft.linkedGoal,
      linkedAction: draft.linkedAction === "none" ? null : draft.linkedAction,
      linkedFocusSession:
        draft.linkedFocusSession === "none" ? null : draft.linkedFocusSession,
    };

    const result = isCreating
      ? await createVaultEntry({
          ...payload,
          linkedVision: linkPayload.linkedVision ?? undefined,
          linkedGoal: linkPayload.linkedGoal ?? undefined,
          linkedAction: linkPayload.linkedAction ?? undefined,
          linkedFocusSession: linkPayload.linkedFocusSession ?? undefined,
        })
      : editingEntryId
        ? await updateVaultEntry({
            id: editingEntryId,
            ...payload,
            ...linkPayload,
          })
        : null;

    if (!result?.success) {
      setError(result?.error ?? "Failed to save entry");
      return;
    }

    setOpen(false);
    toast.success(isCreating ? "Entry created" : "Entry saved");
    startTransition(() => router.refresh());
  }

  async function handleDelete() {
    if (!editingEntryId) return;
    setError(null);

    const result = await deleteVaultEntry({ id: editingEntryId });
    if (!result.success) {
      setError(result.error ?? "Failed to delete entry");
      return;
    }

    setOpen(false);
    toast.success("Entry deleted");
    startTransition(() => router.refresh());
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-xl">
        <SheetHeader>
          <SheetTitle>{isCreating ? "New Entry" : "Edit Entry"}</SheetTitle>
          <SheetDescription>
            Capture knowledge and connect it to your system.
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 space-y-4 overflow-y-auto px-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="vault-title">Title</Label>
            <Input
              id="vault-title"
              value={draft.title}
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  title: event.target.value,
                }))
              }
              placeholder="Entry title"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Type</Label>
              <Select
                value={draft.type}
                onValueChange={(value) =>
                  setDraft((current) => ({
                    ...current,
                    type: value as VaultType,
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {VAULT_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {VAULT_TYPE_LABELS[type]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="vault-tags">Tags</Label>
              <div className="relative">
                <Tag className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="vault-tags"
                  className="pl-9"
                  value={draft.tagsInput}
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      tagsInput: event.target.value,
                    }))
                  }
                  placeholder="architecture, career"
                />
              </div>
            </div>
          </div>

          <div className="space-y-3 rounded-xl border border-border bg-surface/40 p-4">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              System Connections
            </p>

            <LinkSelect
              label="Vision"
              value={draft.linkedVision}
              options={data.linkOptions.visions}
              placeholder="Select vision"
              emptyLabel="Not connected"
              onChange={handleVisionChange}
            />

            <LinkSelect
              label="Goal"
              value={draft.linkedGoal}
              options={filteredGoals}
              placeholder={
                draft.linkedVision === "none"
                  ? "Select a vision first"
                  : filteredGoals.length > 0
                    ? "Select goal"
                    : "No goals for this vision"
              }
              emptyLabel="No goal linked"
              disabled={draft.linkedVision === "none"}
              onChange={handleGoalChange}
            />

            <LinkSelect
              label="Action"
              value={draft.linkedAction}
              options={filteredActions}
              placeholder={
                draft.linkedGoal === "none"
                  ? "Select a goal first"
                  : filteredActions.length > 0
                    ? "Select action"
                    : "No actions for this goal"
              }
              emptyLabel="No action linked"
              disabled={draft.linkedGoal === "none"}
              onChange={handleActionChange}
            />

            <LinkSelect
              label="Focus Session"
              value={draft.linkedFocusSession}
              options={filteredFocusSessions}
              placeholder={
                draft.linkedAction === "none"
                  ? "Select an action first"
                  : filteredFocusSessions.length > 0
                    ? "Select focus session"
                    : "No sessions for this action"
              }
              emptyLabel="No session linked"
              disabled={draft.linkedAction === "none"}
              onChange={(value) =>
                setDraft((current) => ({
                  ...current,
                  linkedFocusSession: value,
                }))
              }
            />
          </div>

          <VaultTiptapEditor
            content={draft.content}
            onChange={(content) =>
              setDraft((current) => ({ ...current, content }))
            }
          />

          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>

        <SheetFooter>
          <Button type="button" variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          {!isCreating && (
            <Button
              type="button"
              variant="outline"
              onClick={handleDelete}
              disabled={isPending}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>
          )}
          <Button type="button" onClick={handleSave} disabled={isPending}>
            {isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Save Entry
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

function LinkSelect({
  label,
  value,
  options,
  placeholder,
  emptyLabel = "None",
  disabled = false,
  onChange,
}: {
  label: string;
  value: string;
  options: { id: string; title: string }[];
  placeholder: string;
  emptyLabel?: string;
  disabled?: boolean;
  onChange: (value: string) => void;
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Select value={value} onValueChange={onChange} disabled={disabled}>
        <SelectTrigger>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="none">{emptyLabel}</SelectItem>
          {options.map((option) => (
            <SelectItem key={option.id} value={option.id}>
              {option.title}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
