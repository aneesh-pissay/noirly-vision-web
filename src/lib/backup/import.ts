import mongoose, { type Model } from "mongoose";
import type { ImportMode } from "@/lib/backup/constants";
import { BACKUP_COLLECTION_KEYS } from "@/lib/backup/constants";
import type { WorkspaceBackup } from "@/lib/backup/types";
import { sanitizeDocumentsForImport } from "@/lib/backup/utils";
import Action from "@/models/action.model";
import FocusSession from "@/models/focus-session.model";
import Goal from "@/models/goal.model";
import Milestone from "@/models/milestone.model";
import VaultEntry from "@/models/vault-entry.model";
import Vision from "@/models/vision.model";
import Settings from "@/models/settings.model";
import { DEFAULT_SETTINGS } from "@/lib/settings/defaults";

const collectionModels: Record<
  (typeof BACKUP_COLLECTION_KEYS)[number],
  Model<unknown>
> = {
  visions: Vision as Model<unknown>,
  goals: Goal as Model<unknown>,
  milestones: Milestone as Model<unknown>,
  actions: Action as Model<unknown>,
  focusSessions: FocusSession as Model<unknown>,
  vaultEntries: VaultEntry as Model<unknown>,
};

type IdMap = Map<string, mongoose.Types.ObjectId>;

function getOldId(doc: Record<string, unknown>): string | null {
  if (doc._id == null) return null;
  return String(doc._id);
}

function prepareDocument(doc: Record<string, unknown>): Record<string, unknown> {
  const next = { ...doc };
  delete next._id;
  return next;
}

function assignMappedId(
  doc: Record<string, unknown>,
  field: string,
  map: IdMap
) {
  if (doc[field] == null) return;
  const mapped = map.get(String(doc[field]));
  if (mapped) {
    doc[field] = mapped;
  } else {
    delete doc[field];
  }
}

async function insertCollectionWithIdMap(
  model: Model<unknown>,
  documents: Record<string, unknown>[],
  userId: string,
  idMap: IdMap,
  remap?: (doc: Record<string, unknown>) => void
) {
  for (const raw of documents) {
    const oldId = getOldId(raw);
    const doc = prepareDocument(raw);
    remap?.(doc);
    const created = await model.create({ ...doc, userId });
    if (oldId) {
      idMap.set(oldId, created._id as mongoose.Types.ObjectId);
    }
  }
}

export async function clearWorkspaceData(userId: string) {
  await Promise.all([
    Vision.deleteMany({ userId }),
    Goal.deleteMany({ userId }),
    Milestone.deleteMany({ userId }),
    Action.deleteMany({ userId }),
    FocusSession.deleteMany({ userId }),
    VaultEntry.deleteMany({ userId }),
  ]);
}

async function upsertSettingsFromBackup(
  userId: string,
  settings: WorkspaceBackup["settings"]
) {
  await Settings.findOneAndUpdate(
    { userId },
    { $set: { ...DEFAULT_SETTINGS, ...settings } },
    { upsert: true, new: true }
  );
}

export async function restoreWorkspaceBackup(
  userId: string,
  backup: WorkspaceBackup
) {
  await clearWorkspaceData(userId);

  for (const key of BACKUP_COLLECTION_KEYS) {
    const documents = sanitizeDocumentsForImport(backup[key]);
    if (documents.length === 0) continue;

    await collectionModels[key].insertMany(
      documents.map((document) => ({ ...document, userId }))
    );
  }

  await upsertSettingsFromBackup(userId, backup.settings);
}

export async function mergeWorkspaceBackup(
  userId: string,
  backup: WorkspaceBackup
) {
  const visionMap: IdMap = new Map();
  const goalMap: IdMap = new Map();
  const milestoneMap: IdMap = new Map();
  const actionMap: IdMap = new Map();
  const focusSessionMap: IdMap = new Map();

  await insertCollectionWithIdMap(
    Vision,
    sanitizeDocumentsForImport(backup.visions),
    userId,
    visionMap
  );

  await insertCollectionWithIdMap(
    Goal,
    sanitizeDocumentsForImport(backup.goals),
    userId,
    goalMap,
    (doc) => assignMappedId(doc, "visionId", visionMap)
  );

  await insertCollectionWithIdMap(
    Milestone,
    sanitizeDocumentsForImport(backup.milestones),
    userId,
    milestoneMap,
    (doc) => assignMappedId(doc, "goalId", goalMap)
  );

  await insertCollectionWithIdMap(
    Action,
    sanitizeDocumentsForImport(backup.actions),
    userId,
    actionMap,
    (doc) => {
      assignMappedId(doc, "visionId", visionMap);
      assignMappedId(doc, "goalId", goalMap);
      assignMappedId(doc, "milestoneId", milestoneMap);
    }
  );

  await insertCollectionWithIdMap(
    FocusSession,
    sanitizeDocumentsForImport(backup.focusSessions),
    userId,
    focusSessionMap,
    (doc) => assignMappedId(doc, "actionId", actionMap)
  );

  await insertCollectionWithIdMap(
    VaultEntry,
    sanitizeDocumentsForImport(backup.vaultEntries),
    userId,
    new Map(),
    (doc) => {
      assignMappedId(doc, "linkedVision", visionMap);
      assignMappedId(doc, "linkedGoal", goalMap);
      assignMappedId(doc, "linkedAction", actionMap);
      assignMappedId(doc, "linkedFocusSession", focusSessionMap);
    }
  );
}

export async function applyWorkspaceBackup(
  userId: string,
  backup: WorkspaceBackup,
  mode: ImportMode
) {
  if (mode === "replace") {
    await restoreWorkspaceBackup(userId, backup);
    return;
  }

  await mergeWorkspaceBackup(userId, backup);
}
