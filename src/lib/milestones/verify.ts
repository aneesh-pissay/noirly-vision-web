import Milestone from "@/models/milestone.model";

export async function resolveMilestoneIdForUser(
  userId: string,
  milestoneId: string,
  goalId?: string
) {
  const milestone = await Milestone.findOne({ _id: milestoneId, userId }).lean();
  if (!milestone) {
    return null;
  }

  if (goalId && milestone.goalId.toString() !== goalId) {
    return null;
  }

  return milestone._id;
}
