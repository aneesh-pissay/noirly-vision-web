import mongoose from "mongoose";
import Action from "@/models/action.model";

export async function resolveActionIdForUser(
  userId: string,
  actionId?: string | null
): Promise<mongoose.Types.ObjectId | undefined> {
  if (!actionId) return undefined;

  const action = await Action.findOne({ _id: actionId, userId }).select("_id").lean();
  if (!action) {
    throw new Error("Action not found");
  }

  return action._id;
}
