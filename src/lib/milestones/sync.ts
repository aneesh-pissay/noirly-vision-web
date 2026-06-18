import { calculateGoalProgress } from "@/lib/goals/goal-progress";
import {
  checkGoalCompletionAfterProgress,
  checkMilestoneAchievement,
} from "@/services/achievement-checker";
import Action from "@/models/action.model";
import Goal from "@/models/goal.model";
import Milestone from "@/models/milestone.model";

export async function syncGoalProgressFromMilestones(
  userId: string,
  goalId: string
) {
  const milestones = await Milestone.find({ userId, goalId })
    .select("status")
    .lean();
  const progress = calculateGoalProgress(
    milestones.map((milestone) => ({
      completed: milestone.status === "completed",
    }))
  );

  await Goal.findOneAndUpdate({ _id: goalId, userId }, { progress });
}

export async function syncMilestoneCompletionForAction(
  userId: string,
  actionId: string
) {
  const action = await Action.findOne({ _id: actionId, userId })
    .select("milestoneId goalId status")
    .lean();

  if (!action?.milestoneId) {
    return;
  }

  const milestoneId = action.milestoneId.toString();
  const linkedActions = await Action.find({ userId, milestoneId })
    .select("status")
    .lean();

  if (linkedActions.length === 0) {
    return;
  }

  const allExecuted = linkedActions.every(
    (linkedAction) => linkedAction.status === "EXECUTED"
  );

  const milestone = await Milestone.findOne({ _id: milestoneId, userId }).lean();
  if (!milestone) {
    return;
  }

  if (allExecuted && milestone.status !== "completed") {
    await Milestone.findOneAndUpdate(
      { _id: milestoneId, userId },
      { status: "completed", completedAt: new Date() }
    );
    await syncGoalProgressFromMilestones(
      userId,
      milestone.goalId.toString()
    );

    void checkMilestoneAchievement(
      userId,
      milestoneId,
      milestone.title
    ).catch(console.error);
    void checkGoalCompletionAfterProgress(
      userId,
      milestone.goalId.toString()
    ).catch(console.error);
  }
}
