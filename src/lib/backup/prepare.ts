import { migrateBackupToCurrentVersion } from "@/lib/backup/migrate";
import type { BackupPreview, WorkspaceBackup } from "@/lib/backup/types";
import { verifyBackupChecksum } from "@/lib/backup/checksum";
import {
  assertBackupCollectionsExist,
  parseBackupJson,
  validateWorkspaceBackup,
  workspaceBackupSchema,
} from "@/lib/backup/validate";

export function parseAndPrepareBackup(
  raw: string,
  options: { requireChecksum?: boolean } = {}
) {
  const parsed = parseBackupJson(raw);

  if (!parsed || typeof parsed !== "object") {
    throw new Error("Invalid backup format");
  }

  const migrated = migrateBackupToCurrentVersion(parsed as Record<string, unknown>);
  return validateWorkspaceBackup(migrated, options);
}

export function inspectBackupPreview(raw: string): BackupPreview {
  const parsed = parseBackupJson(raw);

  if (!parsed || typeof parsed !== "object") {
    throw new Error("Invalid backup format");
  }

  const record = parsed as Record<string, unknown>;
  const migrated = migrateBackupToCurrentVersion(record);
  assertBackupCollectionsExist(migrated as unknown as Record<string, unknown>);

  const structure = workspaceBackupSchema.safeParse(migrated);
  if (!structure.success) {
    throw new Error(
      structure.error.issues[0]?.message ?? "Invalid backup structure"
    );
  }

  const checksumStatus = verifyBackupChecksum({
    ...record,
    checksum: record.checksum ?? migrated.checksum,
  }).status;

  return toBackupPreview(structure.data as WorkspaceBackup, checksumStatus);
}

export function toBackupPreview(
  backup: WorkspaceBackup,
  checksumStatus: BackupPreview["checksumStatus"] = "valid"
): BackupPreview {
  return {
    backupSchemaVersion: backup.backupSchemaVersion,
    version: backup.version,
    exportedAt: backup.exportedAt,
    source: backup.source,
    metadata: backup.metadata,
    user: backup.user,
    focusSessionCount: backup.focusSessions.length,
    checksumStatus,
  };
}
