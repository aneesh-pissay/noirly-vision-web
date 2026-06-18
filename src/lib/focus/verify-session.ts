import mongoose from "mongoose";
import FocusSession from "@/models/focus-session.model";

export async function resolveFocusSessionIdForUser(
  userId: string,
  sessionId?: string | null
): Promise<mongoose.Types.ObjectId | undefined> {
  if (!sessionId) return undefined;

  const session = await FocusSession.findOne({ _id: sessionId, userId })
    .select("_id")
    .lean();

  if (!session) {
    throw new Error("Focus session not found");
  }

  return session._id;
}
