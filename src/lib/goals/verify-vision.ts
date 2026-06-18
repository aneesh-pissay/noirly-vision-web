import mongoose from "mongoose";
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
