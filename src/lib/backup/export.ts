import { APP_NAME } from "@/lib/constants";
import { getUserDisplayName } from "@/models/user.model";
import { computeBackupChecksum } from "@/lib/backup/checksum";
import {
  BACKUP_APP_NAME,
  BACKUP_PLATFORM,
  BACKUP_SCHEMA_VERSION,
  CURRENT_BACKUP_VERSION,
  FORBIDDEN_EXPORT_USER_FIELDS,
} from "@/lib/backup/constants";
import type {
  BackupUserSnapshot,
  WorkspaceBackup,
} from "@/lib/backup/types";
import {
  buildBackupMetadata,
  toPlainDocument,
} from "@/lib/backup/utils";

type ExportUserSource = {
  username: string;
  firstName?: string;
  lastName?: string;
  avatar?: string | null;
  identityTitle?: string;
  role: "user" | "admin";
};

type ExportInput = {
  user: ExportUserSource;
  settings: import("@/features/settings/types").UserSettings;
  visions: Record<string, unknown>[];
  goals: Record<string, unknown>[];
  milestones: Record<string, unknown>[];
  actions: Record<string, unknown>[];
  focusSessions: Record<string, unknown>[];
  vaultEntries: Record<string, unknown>[];
};

function toBackupUserSnapshot(user: ExportUserSource): BackupUserSnapshot {
  return {
    username: user.username,
    displayName: getUserDisplayName(user),
    firstName: user.firstName,
    lastName: user.lastName,
    avatar: user.avatar ?? null,
    identityTitle: user.identityTitle,
    role: user.role,
  };
}

export function buildWorkspaceBackup(input: ExportInput): WorkspaceBackup {
  const collections = {
    visions: input.visions.map((doc) => toPlainDocument(doc)),
    goals: input.goals.map((doc) => toPlainDocument(doc)),
    milestones: input.milestones.map((doc) => toPlainDocument(doc)),
    actions: input.actions.map((doc) => toPlainDocument(doc)),
    focusSessions: input.focusSessions.map((doc) => toPlainDocument(doc)),
    vaultEntries: input.vaultEntries.map((doc) => toPlainDocument(doc)),
  };

  const metadata = buildBackupMetadata(collections);

  return {
    backupSchemaVersion: BACKUP_SCHEMA_VERSION,
    version: CURRENT_BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    source: {
      app: BACKUP_APP_NAME,
      platform: BACKUP_PLATFORM,
    },
    user: toBackupUserSnapshot(input.user),
    settings: input.settings,
    ...collections,
    metadata,
  };
}

export function serializeWorkspaceBackup(backup: WorkspaceBackup): string {
  const safe = JSON.parse(JSON.stringify(backup)) as WorkspaceBackup & {
    checksum?: string;
  };

  delete safe.checksum;

  for (const key of FORBIDDEN_EXPORT_USER_FIELDS) {
    if (key in (safe.user as Record<string, unknown>)) {
      delete (safe.user as Record<string, unknown>)[key];
    }
  }

  const checksum = computeBackupChecksum(
    safe as unknown as Record<string, unknown>
  );

  return JSON.stringify({ ...safe, checksum }, null, 2);
}

export function buildBackupFilename(exportedAt: string) {
  const stamp = exportedAt.slice(0, 10);
  return `${APP_NAME.toLowerCase().replace(/\s+/g, "-")}-backup-${stamp}.json`;
}
