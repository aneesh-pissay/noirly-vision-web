"use server";

import { revalidatePath } from "next/cache";
import { failure, parseZodError, success } from "@/lib/actions/utils";
import { comparePassword, hashPassword } from "@/lib/auth/jwt";
import { requireSessionUserId } from "@/lib/auth/session";
import { connectDB } from "@/lib/db";
import { buildWorkspaceBackup, buildBackupFilename, serializeWorkspaceBackup } from "@/lib/backup/export";
import { applyWorkspaceBackup } from "@/lib/backup/import";
import { inspectBackupPreview, parseAndPrepareBackup } from "@/lib/backup/prepare";
import type { BackupPreview, ImportSummary } from "@/lib/backup/types";
import {
  importSummaryFromCollections,
  collectionsFromPartialBackup,
} from "@/lib/backup/utils";
import { serializeUserSettings } from "@/lib/settings/serialize";
import {
  getOrCreateNotificationPreferences,
  upsertNotificationPreferences,
} from "@/lib/notifications/preferences";
import {
  changePasswordSchema,
  deleteAccountSchema,
  importBackupSchema,
  updateAvatarSchema,
  updateFocusSettingsSchema,
  updateNotificationPreferencesSchema,
  updatePreferencesSettingsSchema,
  updateProfileSchema,
  updateWorkspaceSettingsSchema,
} from "@/lib/validations/settings";
import { notifySecurityEvent } from "@/services/workspace-analyzer";
import Action from "@/models/action.model";
import FocusSession from "@/models/focus-session.model";
import Goal from "@/models/goal.model";
import Milestone from "@/models/milestone.model";
import Settings from "@/models/settings.model";
import User, { getUserDisplayName } from "@/models/user.model";
import VaultEntry from "@/models/vault-entry.model";
import Vision from "@/models/vision.model";
import type { ProfilePageData, SettingsPageData } from "@/features/settings/types";
import type { ActionResult } from "@/types";

async function upsertSettings(
  userId: string,
  update: Record<string, unknown>
) {
  await Settings.findOneAndUpdate(
    { userId },
    { $set: update },
    { upsert: true, new: true }
  );
}

export async function getProfilePageData(): Promise<ProfilePageData> {
  const userId = await requireSessionUserId();
  await connectDB();

  const [vision, user] = await Promise.all([
    Vision.findOne({ userId, status: "ACTIVE" }).select("title").lean(),
    User.findById(userId)
      .select(
        "username firstName lastName email avatar identityTitle role createdAt"
      )
      .lean(),
  ]);

  return {
    profile: {
      displayName: user ? getUserDisplayName(user) : "User",
      username: user?.username ?? "",
      email: user?.email ?? "",
      role: user?.role ?? "user",
      identityTitle: user?.identityTitle ?? "",
      avatar: user?.avatar ?? null,
    },
    activeVisionTitle: vision?.title ?? null,
  };
}

export async function getSettingsPageData(): Promise<SettingsPageData> {
  const userId = await requireSessionUserId();
  await connectDB();

  const [
    settings,
    notificationPreferences,
    vision,
    user,
    visionCount,
    goalCount,
    milestoneCount,
    actionCount,
    focusSessionCount,
    vaultEntryCount,
  ] = await Promise.all([
    Settings.findOne({ userId }).lean(),
    getOrCreateNotificationPreferences(userId),
    Vision.findOne({ userId, status: "ACTIVE" }).select("title").lean(),
    User.findById(userId)
      .select(
        "username firstName lastName email avatar identityTitle role createdAt"
      )
      .lean(),
    Vision.countDocuments({ userId }),
    Goal.countDocuments({ userId }),
    Milestone.countDocuments({ userId }),
    Action.countDocuments({ userId }),
    FocusSession.countDocuments({ userId }),
    VaultEntry.countDocuments({ userId }),
  ]);

  return {
    settings: serializeUserSettings(settings),
    notificationPreferences,
    profile: {
      displayName: user ? getUserDisplayName(user) : "User",
      username: user?.username ?? "",
      email: user?.email ?? "",
      role: user?.role ?? "user",
      identityTitle: user?.identityTitle ?? "",
      avatar: user?.avatar ?? null,
    },
    activeVisionTitle: vision?.title ?? null,
    workspaceStats: {
      visions: visionCount,
      goals: goalCount,
      milestones: milestoneCount,
      actions: actionCount,
      focusSessions: focusSessionCount,
      vaultEntries: vaultEntryCount,
    },
    session: {
      currentDevice: "This browser",
    },
  };
}

export async function updateProfile(
  input: unknown
): Promise<ActionResult> {
  const userId = await requireSessionUserId();
  const parsed = updateProfileSchema.safeParse(input);
  if (!parsed.success) return failure(parseZodError(parsed.error));

  try {
    await connectDB();

    const existing = await User.findOne({
      username: parsed.data.username,
      _id: { $ne: userId },
    }).lean();

    if (existing) {
      return failure("Username is already taken");
    }

    const nameParts = parsed.data.displayName.trim().split(/\s+/);
    const firstName = nameParts[0] ?? "";
    const lastName = nameParts.slice(1).join(" ");

    await User.findByIdAndUpdate(userId, {
      username: parsed.data.username,
      firstName,
      lastName: lastName || undefined,
      identityTitle: parsed.data.identityTitle?.trim() || undefined,
    });

    revalidatePath("/dashboard/settings");
    revalidatePath("/profile");
    revalidatePath("/dashboard", "layout");
    return success(undefined);
  } catch {
    return failure("Failed to update profile");
  }
}

export async function updateAvatar(
  input: unknown
): Promise<ActionResult> {
  const userId = await requireSessionUserId();
  const parsed = updateAvatarSchema.safeParse(input);
  if (!parsed.success) return failure(parseZodError(parsed.error));

  try {
    await connectDB();
    await User.findByIdAndUpdate(userId, { avatar: parsed.data.avatar });
    revalidatePath("/dashboard/settings");
    revalidatePath("/profile");
    revalidatePath("/dashboard", "layout");
    return success(undefined);
  } catch {
    return failure("Failed to update avatar");
  }
}

export async function updateWorkspaceSettings(
  input: unknown
): Promise<ActionResult> {
  const userId = await requireSessionUserId();
  const parsed = updateWorkspaceSettingsSchema.safeParse(input);
  if (!parsed.success) return failure(parseZodError(parsed.error));

  try {
    await connectDB();
    await upsertSettings(userId, parsed.data);
    revalidatePath("/dashboard/settings");
    return success(undefined);
  } catch {
    return failure("Failed to update workspace settings");
  }
}

export async function updatePreferencesSettings(
  input: unknown
): Promise<ActionResult> {
  const userId = await requireSessionUserId();
  const parsed = updatePreferencesSettingsSchema.safeParse(input);
  if (!parsed.success) return failure(parseZodError(parsed.error));

  try {
    await connectDB();
    await upsertSettings(userId, parsed.data);
    revalidatePath("/dashboard/settings");
    revalidatePath("/dashboard", "layout");
    return success(undefined);
  } catch {
    return failure("Failed to update preferences");
  }
}

export async function updateFocusSettings(
  input: unknown
): Promise<ActionResult> {
  const userId = await requireSessionUserId();
  const parsed = updateFocusSettingsSchema.safeParse(input);
  if (!parsed.success) return failure(parseZodError(parsed.error));

  try {
    await connectDB();
    await upsertSettings(userId, parsed.data);
    revalidatePath("/dashboard/settings");
    revalidatePath("/dashboard/focus");
    return success(undefined);
  } catch {
    return failure("Failed to update focus settings");
  }
}

export async function updateNotificationSettings(
  input: unknown
): Promise<ActionResult> {
  const userId = await requireSessionUserId();
  const parsed = updateNotificationPreferencesSchema.safeParse(input);
  if (!parsed.success) return failure(parseZodError(parsed.error));

  try {
    await connectDB();
    const { morningCheckInTime, eveningReviewTime, ...preferences } = parsed.data;

    await upsertNotificationPreferences(userId, preferences);
    await upsertSettings(userId, { morningCheckInTime, eveningReviewTime });
    revalidatePath("/dashboard/settings");
    return success(undefined);
  } catch {
    return failure("Failed to update notification settings");
  }
}

export async function changePassword(
  input: unknown
): Promise<ActionResult> {
  const userId = await requireSessionUserId();
  const parsed = changePasswordSchema.safeParse(input);
  if (!parsed.success) return failure(parseZodError(parsed.error));

  try {
    await connectDB();
    const user = await User.findById(userId).select("+password");
    if (!user?.password) return failure("User not found");

    const valid = await comparePassword(
      parsed.data.currentPassword,
      user.password
    );
    if (!valid) return failure("Current password is incorrect");

    user.password = await hashPassword(parsed.data.newPassword);
    user.tokenVersion = (user.tokenVersion ?? 0) + 1;
    await user.save();

    void notifySecurityEvent(userId, {
      key: "password_change",
      title: "Password changed",
      message: "Your account password was changed successfully.",
      actionUrl: "/dashboard/settings",
    }).catch(console.error);

    return success(undefined);
  } catch {
    return failure("Failed to change password");
  }
}

export async function logoutAllDevices(): Promise<ActionResult> {
  const userId = await requireSessionUserId();

  try {
    await connectDB();
    await User.findByIdAndUpdate(userId, { $inc: { tokenVersion: 1 } });
    return success(undefined);
  } catch {
    return failure("Failed to logout other devices");
  }
}

export async function resetWorkspace(): Promise<ActionResult> {
  const userId = await requireSessionUserId();

  try {
    await connectDB();

    await Promise.all([
      Vision.deleteMany({ userId }),
      Goal.deleteMany({ userId }),
      Milestone.deleteMany({ userId }),
      Action.deleteMany({ userId }),
      FocusSession.deleteMany({ userId }),
      VaultEntry.deleteMany({ userId }),
    ]);

    void notifySecurityEvent(userId, {
      key: "workspace_reset",
      title: "Workspace reset",
      message: "All workspace data was cleared from your account.",
      actionUrl: "/dashboard",
    }).catch(console.error);

    revalidatePath("/dashboard", "layout");
    return success(undefined);
  } catch {
    return failure("Failed to reset workspace");
  }
}

export async function deleteWorkspaceData(): Promise<ActionResult> {
  return resetWorkspace();
}

export async function deleteAccount(
  input: unknown
): Promise<ActionResult> {
  const userId = await requireSessionUserId();
  const parsed = deleteAccountSchema.safeParse(input);
  if (!parsed.success) return failure(parseZodError(parsed.error));

  try {
    await connectDB();
    const user = await User.findById(userId).select("+password");
    if (!user?.password) return failure("User not found");

    const valid = await comparePassword(parsed.data.password, user.password);
    if (!valid) return failure("Password is incorrect");

    await Promise.all([
      Vision.deleteMany({ userId }),
      Goal.deleteMany({ userId }),
      Milestone.deleteMany({ userId }),
      Action.deleteMany({ userId }),
      FocusSession.deleteMany({ userId }),
      VaultEntry.deleteMany({ userId }),
      Settings.deleteMany({ userId }),
      User.findByIdAndDelete(userId),
    ]);

    return success(undefined);
  } catch {
    return failure("Failed to delete account");
  }
}

export async function exportWorkspaceBackup(): Promise<
  ActionResult<{ json: string; filename: string }>
> {
  const userId = await requireSessionUserId();

  try {
    await connectDB();

    const [
      settings,
      visions,
      goals,
      milestones,
      actions,
      focusSessions,
      vaultEntries,
      user,
    ] = await Promise.all([
      Settings.findOne({ userId }).lean(),
      Vision.find({ userId }).lean(),
      Goal.find({ userId }).lean(),
      Milestone.find({ userId }).lean(),
      Action.find({ userId }).lean(),
      FocusSession.find({ userId }).lean(),
      VaultEntry.find({ userId }).lean(),
      User.findById(userId)
        .select(
          "username firstName lastName avatar identityTitle role"
        )
        .lean(),
    ]);

    if (!user) {
      return failure("User not found");
    }

    const backup = buildWorkspaceBackup({
      user: {
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        avatar: user.avatar,
        identityTitle: user.identityTitle,
        role: user.role,
      },
      settings: serializeUserSettings(settings),
      visions: visions as unknown as Record<string, unknown>[],
      goals: goals as unknown as Record<string, unknown>[],
      milestones: milestones as unknown as Record<string, unknown>[],
      actions: actions as unknown as Record<string, unknown>[],
      focusSessions: focusSessions as unknown as Record<string, unknown>[],
      vaultEntries: vaultEntries as unknown as Record<string, unknown>[],
    });

    void notifySecurityEvent(userId, {
      key: "data_export",
      title: "Data export",
      message: "A workspace backup was downloaded from your account.",
      actionUrl: "/dashboard/settings",
    }).catch(console.error);

    return success({
      json: serializeWorkspaceBackup(backup),
      filename: buildBackupFilename(backup.exportedAt),
    });
  } catch {
    return failure("Failed to export backup");
  }
}

export async function previewWorkspaceBackup(
  input: unknown
): Promise<ActionResult<BackupPreview>> {
  await requireSessionUserId();
  const parsed = importBackupSchema.safeParse(input);
  if (!parsed.success) return failure(parseZodError(parsed.error));

  try {
    const preview = inspectBackupPreview(parsed.data.backup);
    return success(preview);
  } catch (error) {
    return failure(
      error instanceof Error ? error.message : "Invalid backup file"
    );
  }
}

export async function importWorkspaceBackup(
  input: unknown
): Promise<ActionResult<ImportSummary>> {
  const userId = await requireSessionUserId();
  const parsed = importBackupSchema.safeParse(input);
  if (!parsed.success) return failure(parseZodError(parsed.error));

  try {
    await connectDB();
    const backup = parseAndPrepareBackup(parsed.data.backup);
    await applyWorkspaceBackup(userId, backup, parsed.data.mode);

    const summary = importSummaryFromCollections(
      collectionsFromPartialBackup(backup),
      backup.metadata,
      parsed.data.mode
    );

    revalidatePath("/dashboard", "layout");
    revalidatePath("/dashboard/settings");
    return success(summary);
  } catch (error) {
    return failure(
      error instanceof Error
        ? error.message
        : "Failed to import backup. Check the file format."
    );
  }
}

export async function getUserSettingsForClient() {
  const userId = await requireSessionUserId();
  await connectDB();
  const settings = await Settings.findOne({ userId }).lean();
  return serializeUserSettings(settings);
}
