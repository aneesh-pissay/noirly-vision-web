export const BACKUP_APP_NAME = "Noirly Vision" as const;
export const BACKUP_SCHEMA_VERSION = "1.0" as const;
export const BACKUP_PLATFORM = "web" as const;
export const CURRENT_BACKUP_VERSION = 1 as const;

export const BACKUP_COLLECTION_KEYS = [
  "visions",
  "goals",
  "milestones",
  "actions",
  "focusSessions",
  "vaultEntries",
] as const;

export type BackupCollectionKey = (typeof BACKUP_COLLECTION_KEYS)[number];

export const FORBIDDEN_EXPORT_USER_FIELDS = [
  "password",
  "email",
  "verificationToken",
  "verificationTokenExpiry",
  "resetPasswordToken",
  "resetPasswordExpiry",
  "tokenVersion",
] as const;

export const FORBIDDEN_IMPORT_FIELDS = [
  ...FORBIDDEN_EXPORT_USER_FIELDS,
  "session",
  "sessions",
  "authToken",
  "authTokens",
  "loginSession",
  "loginSessions",
  "token",
  "refreshToken",
  "accessToken",
  "jwt",
] as const;

export const IMPORT_MODES = ["replace", "merge"] as const;
export type ImportMode = (typeof IMPORT_MODES)[number];
