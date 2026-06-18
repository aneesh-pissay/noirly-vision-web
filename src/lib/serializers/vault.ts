import { isVaultEntryLinked } from "@/lib/vault/metrics";
import { id, iso } from "@/lib/serializers";
import type { IVaultEntry } from "@/models/vault-entry.model";
import type { VaultEntryDTO } from "@/types/vault";
import type { VaultType } from "@/types";

function normalizeVaultType(type: string): VaultType {
  if (type === "REFLECTION") return "LESSON";
  return type as VaultType;
}

type VaultEntrySource = Pick<
  IVaultEntry,
  | "_id"
  | "userId"
  | "type"
  | "title"
  | "content"
  | "tags"
  | "linkedVision"
  | "linkedGoal"
  | "linkedAction"
  | "linkedFocusSession"
  | "createdAt"
  | "updatedAt"
>;

type VaultEntryTitles = {
  linkedVisionTitle?: string;
  linkedGoalTitle?: string;
  linkedActionTitle?: string;
  linkedFocusSessionTitle?: string;
};

export function serializeVaultEntry(
  entry: VaultEntrySource,
  titles: VaultEntryTitles = {}
): VaultEntryDTO {
  return {
    id: id(entry._id),
    userId: id(entry.userId),
    type: normalizeVaultType(entry.type),
    title: entry.title,
    content: entry.content,
    tags: entry.tags ?? [],
    linkedVision: entry.linkedVision ? id(entry.linkedVision) : undefined,
    linkedGoal: entry.linkedGoal ? id(entry.linkedGoal) : undefined,
    linkedAction: entry.linkedAction ? id(entry.linkedAction) : undefined,
    linkedFocusSession: entry.linkedFocusSession
      ? id(entry.linkedFocusSession)
      : undefined,
    linkedVisionTitle: titles.linkedVisionTitle,
    linkedGoalTitle: titles.linkedGoalTitle,
    linkedActionTitle: titles.linkedActionTitle,
    linkedFocusSessionTitle: titles.linkedFocusSessionTitle,
    isLinked: isVaultEntryLinked(entry),
    createdAt: iso(entry.createdAt) ?? new Date().toISOString(),
    updatedAt: iso(entry.updatedAt) ?? new Date().toISOString(),
  };
}
