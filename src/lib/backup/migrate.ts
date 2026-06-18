import { DEFAULT_SETTINGS } from "@/lib/settings/defaults";
import type { UserSettings } from "@/features/settings/types";
import {
  BACKUP_APP_NAME,
  BACKUP_PLATFORM,
  BACKUP_SCHEMA_VERSION,
  CURRENT_BACKUP_VERSION,
} from "@/lib/backup/constants";
import type { BackupUserSnapshot, WorkspaceBackup } from "@/lib/backup/types";

type LegacyBackup = {
  version?: number;
  backupSchemaVersion?: string;
  exportedAt?: string;
  app?: string;
  source?: WorkspaceBackup["source"];
  checksum?: string;
  settings?: Partial<UserSettings>;
  visions?: Record<string, unknown>[];
  goals?: Record<string, unknown>[];
  milestones?: Record<string, unknown>[];
  actions?: Record<string, unknown>[];
  focusSessions?: Record<string, unknown>[];
  vaultEntries?: Record<string, unknown>[];
  user?: Partial<BackupUserSnapshot> & { email?: string };
  metadata?: WorkspaceBackup["metadata"];
};

function sanitizeLegacyUser(
  user?: LegacyBackup["user"]
): BackupUserSnapshot {
  return {
    username: user?.username ?? "unknown",
    displayName: user?.displayName ?? user?.username ?? "Unknown User",
    firstName: user?.firstName,
    lastName: user?.lastName,
    avatar: user?.avatar ?? null,
    identityTitle: user?.identityTitle,
    role: user?.role ?? "user",
  };
}

function migrateLegacyBackup(raw: LegacyBackup): WorkspaceBackup {
  const collections = {
    visions: raw.visions ?? [],
    goals: raw.goals ?? [],
    milestones: raw.milestones ?? [],
    actions: raw.actions ?? [],
    focusSessions: raw.focusSessions ?? [],
    vaultEntries: raw.vaultEntries ?? [],
  };

  const totalFocusMinutes = collections.focusSessions.reduce((sum, session) => {
    const duration = session.duration;
    return sum + (typeof duration === "number" ? duration : 0);
  }, 0);

  const metadata = raw.metadata ?? {
    totalVisions: collections.visions.length,
    totalGoals: collections.goals.length,
    totalMilestones: collections.milestones.length,
    totalActions: collections.actions.length,
    totalFocusHours: Math.round((totalFocusMinutes / 60) * 10) / 10,
    totalVaultEntries: collections.vaultEntries.length,
  };

  return {
    backupSchemaVersion: BACKUP_SCHEMA_VERSION,
    version: CURRENT_BACKUP_VERSION,
    exportedAt: raw.exportedAt ?? new Date().toISOString(),
    source:
      raw.source ??
      ({
        app: BACKUP_APP_NAME,
        platform: BACKUP_PLATFORM,
      } satisfies WorkspaceBackup["source"]),
    user: sanitizeLegacyUser(raw.user),
    settings: { ...DEFAULT_SETTINGS, ...(raw.settings ?? {}) },
    ...collections,
    metadata,
    checksum: raw.checksum,
  };
}

function isCompleteBackup(
  backup: Record<string, unknown>
): backup is WorkspaceBackup {
  return (
    backup.backupSchemaVersion === BACKUP_SCHEMA_VERSION &&
    backup.version === CURRENT_BACKUP_VERSION &&
    typeof backup.exportedAt === "string" &&
    backup.source !== undefined &&
    backup.user !== undefined &&
    backup.settings !== undefined &&
    backup.metadata !== undefined &&
    Array.isArray(backup.visions) &&
    Array.isArray(backup.goals) &&
    Array.isArray(backup.milestones) &&
    Array.isArray(backup.actions) &&
    Array.isArray(backup.focusSessions) &&
    Array.isArray(backup.vaultEntries)
  );
}

export function migrateBackupToCurrentVersion(
  backup: Record<string, unknown>
): WorkspaceBackup {
  const version =
    typeof backup.version === "number" ? backup.version : 0;

  if (version > CURRENT_BACKUP_VERSION) {
    throw new Error(
      "This backup was created with a newer version of Noirly Vision. Please update the app before restoring."
    );
  }

  if (isCompleteBackup(backup)) {
    return {
      ...backup,
      user: sanitizeLegacyUser(backup.user),
    };
  }

  return migrateLegacyBackup(backup as LegacyBackup);
}
