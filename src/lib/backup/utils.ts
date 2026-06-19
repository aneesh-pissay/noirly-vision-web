import {
  BACKUP_COLLECTION_KEYS,
  FORBIDDEN_IMPORT_FIELDS,
} from "@/lib/backup/constants";
import type {
  BackupCollectionMap,
  BackupMetadata,
  ImportSummary,
} from "@/lib/backup/types";

export function toPlainDocument<T extends Record<string, unknown>>(
  doc: T
): Record<string, unknown> {
  const plain = JSON.parse(JSON.stringify(doc)) as Record<string, unknown>;
  delete plain.__v;
  for (const key of FORBIDDEN_IMPORT_FIELDS) {
    delete plain[key];
  }
  return plain;
}

export function sanitizeDocumentsForImport(
  items: Record<string, unknown>[]
): Record<string, unknown>[] {
  return items.map((item) => {
    const plain = toPlainDocument(item);
    delete plain.userId;
    return plain;
  });
}

export function buildBackupMetadata(
  collections: BackupCollectionMap
): BackupMetadata {
  const totalFocusMinutes = collections.focusSessions.reduce((sum, session) => {
    const duration = session.duration;
    return sum + (typeof duration === "number" ? duration : 0);
  }, 0);

  return {
    totalVisions: collections.visions.length,
    totalGoals: collections.goals.length,
    totalMilestones: collections.milestones.length,
    totalActions: collections.actions.length,
    totalFocusHours: Math.round((totalFocusMinutes / 60) * 10) / 10,
    totalVaultEntries: collections.vaultEntries.length,
  };
}

export function importSummaryFromCollections(
  collections: BackupCollectionMap,
  metadata: BackupMetadata,
  mode: import("@/lib/backup/constants").ImportMode
): ImportSummary {
  return {
    mode,
    visions: collections.visions.length,
    goals: collections.goals.length,
    milestones: collections.milestones.length,
    actions: collections.actions.length,
    focusSessions: collections.focusSessions.length,
    vaultEntries: collections.vaultEntries.length,
    totalFocusHours: metadata.totalFocusHours,
  };
}

export type ImportSummaryCounts = Omit<ImportSummary, "mode">;

export function formatImportSummaryLines(
  summary: ImportSummaryCounts
): string[] {
  const lines: string[] = [];

  if (summary.visions > 0) {
    lines.push(`${summary.visions} Vision${summary.visions === 1 ? "" : "s"}`);
  }
  if (summary.goals > 0) {
    lines.push(`${summary.goals} Goal${summary.goals === 1 ? "" : "s"}`);
  }
  if (summary.milestones > 0) {
    lines.push(
      `${summary.milestones} Milestone${summary.milestones === 1 ? "" : "s"}`
    );
  }
  if (summary.actions > 0) {
    lines.push(`${summary.actions} Action${summary.actions === 1 ? "" : "s"}`);
  }
  if (summary.focusSessions > 0) {
    lines.push(
      `${summary.focusSessions} Focus Session${summary.focusSessions === 1 ? "" : "s"}`
    );
  }
  if (summary.vaultEntries > 0) {
    lines.push(
      `${summary.vaultEntries} Knowledge Entr${summary.vaultEntries === 1 ? "y" : "ies"}`
    );
  }

  return lines;
}

export function collectionsFromPartialBackup(
  backup: Record<string, unknown>
): BackupCollectionMap {
  const collections = {} as BackupCollectionMap;

  for (const key of BACKUP_COLLECTION_KEYS) {
    const value = backup[key];
    collections[key] = Array.isArray(value)
      ? (value as Record<string, unknown>[])
      : [];
  }

  return collections;
}
