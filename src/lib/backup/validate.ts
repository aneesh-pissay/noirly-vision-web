import { z } from "zod";
import {
  DATE_FORMATS,
  DENSITIES,
  FOCUS_DURATIONS,
  SIDEBAR_MODES,
  STARTUP_PAGES,
  THEMES,
  WEEK_START_DAYS,
} from "@/lib/settings/constants";
import { verifyBackupChecksum } from "@/lib/backup/checksum";
import {
  BACKUP_APP_NAME,
  BACKUP_COLLECTION_KEYS,
  BACKUP_PLATFORM,
  BACKUP_SCHEMA_VERSION,
  CURRENT_BACKUP_VERSION,
} from "@/lib/backup/constants";
import type { WorkspaceBackup } from "@/lib/backup/types";
import { collectionsFromPartialBackup } from "@/lib/backup/utils";

const backupUserSchema = z.object({
  username: z.string(),
  displayName: z.string(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  avatar: z.string().nullable().optional(),
  identityTitle: z.string().optional(),
  role: z.string(),
});

const backupSettingsSchema = z.object({
  workspaceName: z.string(),
  startupPage: z.enum(STARTUP_PAGES),
  dateFormat: z.enum(DATE_FORMATS),
  timezone: z.string(),
  weekStartDay: z.number(),
  theme: z.enum(THEMES),
  accentColor: z.string(),
  density: z.enum(DENSITIES),
  sidebarMode: z.enum(SIDEBAR_MODES),
  animationsEnabled: z.boolean(),
  focusDuration: z
    .number()
    .refine((value) =>
      (FOCUS_DURATIONS as readonly number[]).includes(value)
    ),
  breakReminder: z.boolean(),
  autoStartNextSession: z.boolean(),
  dailyFocusTargetHours: z.number(),
  bestFocusWindow: z.string(),
  notificationsEnabled: z.boolean(),
  dailyPlanningReminder: z.boolean(),
  goalReviewReminder: z.boolean(),
  focusReminder: z.boolean(),
  weeklyReview: z.boolean(),
  morningCheckInTime: z.string(),
  eveningReviewTime: z.string(),
});

const backupMetadataSchema = z.object({
  totalVisions: z.number(),
  totalGoals: z.number(),
  totalMilestones: z.number(),
  totalActions: z.number(),
  totalFocusHours: z.number(),
  totalVaultEntries: z.number(),
});

const backupSourceSchema = z.object({
  app: z.literal(BACKUP_APP_NAME),
  platform: z.literal(BACKUP_PLATFORM),
});

const documentArraySchema = z.array(z.record(z.string(), z.unknown()));

export const workspaceBackupSchema = z.object({
  backupSchemaVersion: z.literal(BACKUP_SCHEMA_VERSION),
  version: z.number().int().positive(),
  exportedAt: z.string().min(1),
  source: backupSourceSchema,
  user: backupUserSchema,
  settings: backupSettingsSchema,
  visions: documentArraySchema,
  goals: documentArraySchema,
  milestones: documentArraySchema,
  actions: documentArraySchema,
  focusSessions: documentArraySchema,
  vaultEntries: documentArraySchema,
  metadata: backupMetadataSchema,
  checksum: z.string().optional(),
});

export function parseBackupJson(raw: string): unknown {
  try {
    return JSON.parse(raw);
  } catch {
    throw new Error("Invalid JSON backup file");
  }
}

export function assertBackupCollectionsExist(backup: Record<string, unknown>) {
  for (const key of BACKUP_COLLECTION_KEYS) {
    if (!(key in backup)) {
      throw new Error(`Backup is missing required collection: ${key}`);
    }
    if (!Array.isArray(backup[key])) {
      throw new Error(`Backup collection "${key}" must be an array`);
    }
  }
}

export function validateWorkspaceBackup(
  backup: unknown,
  options: { requireChecksum?: boolean } = {}
): WorkspaceBackup {
  if (!backup || typeof backup !== "object") {
    throw new Error("Invalid backup format");
  }

  const record = backup as Record<string, unknown>;

  if (record.version === undefined || record.version === null) {
    throw new Error("Backup version is required");
  }

  if (typeof record.version !== "number") {
    throw new Error("Backup version must be a number");
  }

  if (record.version > CURRENT_BACKUP_VERSION) {
    throw new Error(
      "This backup was created with a newer version of Noirly Vision. Please update the app before restoring."
    );
  }

  assertBackupCollectionsExist(record);

  const parsed = workspaceBackupSchema.safeParse(record);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid backup structure");
  }

  const checksumResult = verifyBackupChecksum(record);
  if (checksumResult.status === "invalid") {
    throw new Error(
      "Backup file is corrupted or was modified. Checksum verification failed."
    );
  }

  if (options.requireChecksum && checksumResult.status === "legacy") {
    throw new Error("Backup is missing a checksum and cannot be imported.");
  }

  const collections = collectionsFromPartialBackup(parsed.data);
  const metadata = parsed.data.metadata;

  if (metadata.totalVisions !== collections.visions.length) {
    throw new Error("Backup metadata does not match visions collection");
  }
  if (metadata.totalGoals !== collections.goals.length) {
    throw new Error("Backup metadata does not match goals collection");
  }
  if (metadata.totalMilestones !== collections.milestones.length) {
    throw new Error("Backup metadata does not match milestones collection");
  }
  if (metadata.totalActions !== collections.actions.length) {
    throw new Error("Backup metadata does not match actions collection");
  }
  if (metadata.totalVaultEntries !== collections.vaultEntries.length) {
    throw new Error("Backup metadata does not match vault entries collection");
  }

  return parsed.data as WorkspaceBackup;
}
