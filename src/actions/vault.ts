"use server";

import { runMutation, runQuery } from "@/lib/actions/run-action";
import { loadOsCounts } from "@/lib/progress/load-os-counts";
import {
  assertVaultUnlocked,
  resolveOsPermissions,
} from "@/lib/progress/permissions";
import { applyVaultLinkUpdates, resolveVaultLinksForUser } from "@/lib/vault/verify-refs";
import { serializeVaultEntry } from "@/lib/serializers/vault";
import {
  createVaultEntrySchema,
  deleteVaultEntrySchema,
  getVaultEntrySchema,
  updateVaultEntrySchema,
  type CreateVaultEntryInput,
  type DeleteVaultEntryInput,
  type GetVaultEntryInput,
  type UpdateVaultEntryInput,
} from "@/lib/validations/vault";
import VaultEntry from "@/models/vault-entry.model";
import type { ActionResult } from "@/types";
import type { VaultEntryDTO } from "@/types/vault";

const VAULT_PATHS = ["/dashboard/vault", "/dashboard"];

export async function createVaultEntry(
  input: CreateVaultEntryInput
): Promise<ActionResult<VaultEntryDTO>> {
  return runMutation({
    schema: createVaultEntrySchema,
    input,
    errorMessage: "Failed to create knowledge entry",
    revalidatePaths: VAULT_PATHS,
    handler: async ({ userId, input: data }) => {
      const permissions = resolveOsPermissions(await loadOsCounts(userId));
      assertVaultUnlocked(permissions);

      const links = await resolveVaultLinksForUser(userId, data);

      const entry = await VaultEntry.create({
        userId,
        type: data.type,
        title: data.title,
        content: data.content,
        tags: data.tags,
        ...links,
      });

      return serializeVaultEntry(entry);
    },
  });
}

export async function getVaultEntry(
  input: GetVaultEntryInput
): Promise<ActionResult<VaultEntryDTO | null>> {
  return runQuery({
    schema: getVaultEntrySchema,
    input,
    errorMessage: "Failed to get knowledge entry",
    handler: async ({ userId, input: data }) => {
      const filter: Record<string, unknown> = { userId };
      if (data.id) filter._id = data.id;
      if (data.type) filter.type = data.type;
      if (data.tag) filter.tags = data.tag;

      const entry = await VaultEntry.findOne(filter).sort({ updatedAt: -1 }).lean();
      return entry ? serializeVaultEntry(entry) : null;
    },
  });
}

export async function updateVaultEntry(
  input: UpdateVaultEntryInput
): Promise<ActionResult<VaultEntryDTO>> {
  return runMutation({
    schema: updateVaultEntrySchema,
    input,
    errorMessage: "Failed to update knowledge entry",
    revalidatePaths: VAULT_PATHS,
    handler: async ({ userId, input: data }) => {
      const { id: entryId, linkedVision, linkedGoal, linkedAction, linkedFocusSession, ...fields } =
        data;

      const update: Record<string, unknown> = { ...fields };
      Object.assign(
        update,
        await applyVaultLinkUpdates(userId, {
          linkedVision,
          linkedGoal,
          linkedAction,
          linkedFocusSession,
        })
      );

      const entry = await VaultEntry.findOneAndUpdate(
        { _id: entryId, userId },
        update,
        { new: true }
      ).lean();

      if (!entry) {
        throw new Error("Knowledge entry not found");
      }

      return serializeVaultEntry(entry);
    },
  });
}

export async function deleteVaultEntry(
  input: DeleteVaultEntryInput
): Promise<ActionResult<{ id: string }>> {
  return runMutation({
    schema: deleteVaultEntrySchema,
    input,
    errorMessage: "Failed to delete knowledge entry",
    revalidatePaths: VAULT_PATHS,
    handler: async ({ userId, input: data }) => {
      const entry = await VaultEntry.findOneAndDelete({
        _id: data.id,
        userId,
      });

      if (!entry) {
        throw new Error("Knowledge entry not found");
      }

      return { id: data.id };
    },
  });
}
