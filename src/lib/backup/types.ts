import type { UserSettings } from "@/features/settings/types";
import type {
  BackupCollectionKey,
  ImportMode,
} from "@/lib/backup/constants";

export type BackupSource = {
  app: "Noirly Vision";
  platform: "web";
};

export type BackupUserSnapshot = {
  username: string;
  displayName: string;
  firstName?: string;
  lastName?: string;
  avatar?: string | null;
  identityTitle?: string;
  role: string;
};

export type BackupMetadata = {
  totalVisions: number;
  totalGoals: number;
  totalMilestones: number;
  totalActions: number;
  totalFocusHours: number;
  totalVaultEntries: number;
};

export type WorkspaceBackup = {
  backupSchemaVersion: "1.0";
  version: number;
  exportedAt: string;
  source: BackupSource;
  user: BackupUserSnapshot;
  settings: UserSettings;
  visions: Record<string, unknown>[];
  goals: Record<string, unknown>[];
  milestones: Record<string, unknown>[];
  actions: Record<string, unknown>[];
  focusSessions: Record<string, unknown>[];
  vaultEntries: Record<string, unknown>[];
  metadata: BackupMetadata;
  checksum?: string;
};

export type ChecksumStatus = "valid" | "legacy" | "invalid";

export type BackupPreview = {
  backupSchemaVersion: string;
  version: number;
  exportedAt: string;
  source: BackupSource;
  metadata: BackupMetadata;
  user: BackupUserSnapshot;
  focusSessionCount: number;
  checksumStatus: ChecksumStatus;
};

export type ImportSummary = {
  mode: ImportMode;
  visions: number;
  goals: number;
  milestones: number;
  actions: number;
  focusSessions: number;
  vaultEntries: number;
  totalFocusHours: number;
};

export type BackupCollectionMap = Record<
  BackupCollectionKey,
  Record<string, unknown>[]
>;
