import { connectDB } from "@/lib/db";
import Action from "@/models/action.model";
import FocusSession from "@/models/focus-session.model";
import Goal from "@/models/goal.model";
import Milestone from "@/models/milestone.model";
import VaultEntry from "@/models/vault-entry.model";
import Vision from "@/models/vision.model";

export type OsCounts = {
  visionCount: number;
  goalCount: number;
  milestoneCount: number;
  actionCount: number;
  completedActionCount: number;
  completedFocusSessionCount: number;
  vaultEntryCount: number;
};

export async function loadOsCounts(userId: string): Promise<OsCounts> {
  await connectDB();

  const [
    visionCount,
    goalCount,
    milestoneCount,
    actionCount,
    completedActionCount,
    completedFocusSessionCount,
    vaultEntryCount,
  ] = await Promise.all([
    Vision.countDocuments({ userId }),
    Goal.countDocuments({ userId }),
    Milestone.countDocuments({ userId }),
    Action.countDocuments({ userId }),
    Action.countDocuments({ userId, status: "EXECUTED" }),
    FocusSession.countDocuments({ userId, endedAt: { $ne: null } }),
    VaultEntry.countDocuments({ userId }),
  ]);

  return {
    visionCount,
    goalCount,
    milestoneCount,
    actionCount,
    completedActionCount,
    completedFocusSessionCount,
    vaultEntryCount,
  };
}
