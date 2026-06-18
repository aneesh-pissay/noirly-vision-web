import mongoose from "mongoose";
import { resolveActionIdForUser } from "@/lib/focus/verify-action";
import { resolveFocusSessionIdForUser } from "@/lib/focus/verify-session";
import {
  resolveGoalIdForUser,
  resolveVisionIdForUser,
} from "@/lib/execution/verify-refs";

type VaultLinkInput = {
  linkedVision?: string | null;
  linkedGoal?: string | null;
  linkedAction?: string | null;
  linkedFocusSession?: string | null;
};

export async function resolveVaultLinksForUser(
  userId: string,
  links: VaultLinkInput
) {
  const [linkedVision, linkedGoal, linkedAction, linkedFocusSession] =
    await Promise.all([
      resolveVisionIdForUser(userId, links.linkedVision),
      resolveGoalIdForUser(userId, links.linkedGoal),
      resolveActionIdForUser(userId, links.linkedAction),
      resolveFocusSessionIdForUser(userId, links.linkedFocusSession),
    ]);

  return { linkedVision, linkedGoal, linkedAction, linkedFocusSession };
}

export async function applyVaultLinkUpdates(
  userId: string,
  links: VaultLinkInput
) {
  const update: Record<string, mongoose.Types.ObjectId | null | undefined> = {};

  if (links.linkedVision !== undefined) {
    update.linkedVision = links.linkedVision
      ? await resolveVisionIdForUser(userId, links.linkedVision)
      : null;
  }

  if (links.linkedGoal !== undefined) {
    update.linkedGoal = links.linkedGoal
      ? await resolveGoalIdForUser(userId, links.linkedGoal)
      : null;
  }

  if (links.linkedAction !== undefined) {
    update.linkedAction = links.linkedAction
      ? await resolveActionIdForUser(userId, links.linkedAction)
      : null;
  }

  if (links.linkedFocusSession !== undefined) {
    update.linkedFocusSession = links.linkedFocusSession
      ? await resolveFocusSessionIdForUser(userId, links.linkedFocusSession)
      : null;
  }

  return update;
}
