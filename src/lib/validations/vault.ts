import { z } from "zod";
import { VAULT_TYPES } from "@/lib/constants";
import { normalizeTags } from "@/lib/vault/metrics";

const tagsSchema = z
  .array(z.string().min(1).max(50))
  .max(20)
  .transform(normalizeTags);

export const createVaultEntrySchema = z.object({
  type: z.enum(VAULT_TYPES).default("NOTE"),
  title: z.string().min(1, "Title is required").max(200),
  content: z.string().max(100_000).optional(),
  tags: tagsSchema.optional().default([]),
  linkedVision: z.string().min(1).optional(),
  linkedGoal: z.string().min(1).optional(),
  linkedAction: z.string().min(1).optional(),
  linkedFocusSession: z.string().min(1).optional(),
});

export const getVaultEntrySchema = z.object({
  id: z.string().min(1).optional(),
  tag: z.string().min(1).optional(),
  type: z.enum(VAULT_TYPES).optional(),
});

export const updateVaultEntrySchema = z.object({
  id: z.string().min(1, "Entry id is required"),
  type: z.enum(VAULT_TYPES).optional(),
  title: z.string().min(1).max(200).optional(),
  content: z.string().max(100_000).optional().nullable(),
  tags: tagsSchema.optional(),
  linkedVision: z.string().min(1).optional().nullable(),
  linkedGoal: z.string().min(1).optional().nullable(),
  linkedAction: z.string().min(1).optional().nullable(),
  linkedFocusSession: z.string().min(1).optional().nullable(),
});

export const deleteVaultEntrySchema = z.object({
  id: z.string().min(1, "Entry id is required"),
});

export type CreateVaultEntryInput = z.infer<typeof createVaultEntrySchema>;
export type GetVaultEntryInput = z.infer<typeof getVaultEntrySchema>;
export type UpdateVaultEntryInput = z.infer<typeof updateVaultEntrySchema>;
export type DeleteVaultEntryInput = z.infer<typeof deleteVaultEntrySchema>;
