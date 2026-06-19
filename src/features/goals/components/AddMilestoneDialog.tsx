"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { createMilestonesForGoal } from "@/actions/milestones";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type MilestoneDraft = {
  title: string;
  targetDate: string;
  successCriteria: string;
};

type AddMilestoneDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  goalId: string;
  goalTitle: string;
};

function emptyDraft(): MilestoneDraft {
  return { title: "", targetDate: "", successCriteria: "" };
}

export function AddMilestoneDialog({
  open,
  onOpenChange,
  goalId,
  goalTitle,
}: AddMilestoneDialogProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [drafts, setDrafts] = useState<MilestoneDraft[]>([emptyDraft()]);

  useEffect(() => {
    if (!open) return;
    setDrafts([emptyDraft()]);
    setError(null);
  }, [open, goalId]);

  function updateDraft(index: number, patch: Partial<MilestoneDraft>) {
    setDrafts((current) =>
      current.map((draft, i) => (i === index ? { ...draft, ...patch } : draft))
    );
  }

  async function handleSave() {
    const milestones = drafts
      .map((draft) => ({
        title: draft.title.trim(),
        targetDate: draft.targetDate || undefined,
        successCriteria: draft.successCriteria.trim() || undefined,
      }))
      .filter((milestone) => milestone.title.length > 0);

    if (milestones.length === 0) {
      setError("Add at least one milestone title");
      return;
    }

    setSaving(true);
    setError(null);

    const result = await createMilestonesForGoal({ goalId, milestones });
    setSaving(false);

    if (!result.success) {
      setError(result.error ?? "Failed to add milestones");
      return;
    }

    toast.success("Milestones added");
    onOpenChange(false);
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Add Milestone</DialogTitle>
          <DialogDescription>
            Break <span className="font-medium">{goalTitle}</span> into measurable
            checkpoints that connect to actions.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {drafts.map((draft, index) => (
            <div
              key={index}
              className="space-y-3 rounded-xl border border-border bg-surface/30 p-4"
            >
              <div className="flex items-center gap-2">
                <Input
                  value={draft.title}
                  placeholder="Learn Kubernetes"
                  onChange={(event) =>
                    updateDraft(index, { title: event.target.value })
                  }
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="shrink-0"
                  disabled={drafts.length === 1}
                  onClick={() =>
                    setDrafts((current) => current.filter((_, i) => i !== index))
                  }
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label className="text-xs">Target date</Label>
                  <Input
                    type="date"
                    value={draft.targetDate}
                    onChange={(event) =>
                      updateDraft(index, { targetDate: event.target.value })
                    }
                  />
                </div>
                <div className="space-y-1.5 sm:col-span-1">
                  <Label className="text-xs">Success criteria</Label>
                  <Input
                    value={draft.successCriteria}
                    placeholder="Can deploy to production"
                    onChange={(event) =>
                      updateDraft(index, { successCriteria: event.target.value })
                    }
                  />
                </div>
              </div>
            </div>
          ))}

          <Button
            type="button"
            variant="outline"
            size="sm"
            className="rounded-full"
            onClick={() => setDrafts((current) => [...current, emptyDraft()])}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add another
          </Button>
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Milestones
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
