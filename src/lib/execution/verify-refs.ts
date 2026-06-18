import mongoose from "mongoose";
import Goal from "@/models/goal.model";
import Vision from "@/models/vision.model";

export async function resolveVisionIdForUser(
  userId: string,
  visionId?: string | null
): Promise<mongoose.Types.ObjectId | undefined> {
  if (!visionId) return undefined;

  const vision = await Vision.findOne({ _id: visionId, userId }).select("_id").lean();
  if (!vision) {
    throw new Error("Vision not found");
  }

  return vision._id;
}

export async function resolveGoalIdForUser(
  userId: string,
  goalId?: string | null
): Promise<mongoose.Types.ObjectId | undefined> {
  if (!goalId) return undefined;

  const goal = await Goal.findOne({ _id: goalId, userId }).select("_id").lean();
  if (!goal) {
    throw new Error("Goal not found");
  }

  return goal._id;
}
