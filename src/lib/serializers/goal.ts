import { scoreToMatrixLevel } from "@/lib/goals/priority-matrix";
import { id, iso } from "@/lib/serializers";
import type { IGoal, IGoalMilestone } from "@/models/goal.model";
import type { GoalDTO, GoalMilestoneDTO } from "@/types/goal";

type GoalMilestoneSource = Pick<IGoalMilestone, "_id" | "title" | "completed">;

type GoalSource = Pick<
  IGoal,
  | "_id"
  | "userId"
  | "visionId"
  | "title"
  | "description"
  | "category"
  | "priority"
  | "impactScore"
  | "effortScore"
  | "targetDate"
  | "progress"
  | "status"
  | "milestones"
  | "createdAt"
  | "updatedAt"
>;

export function serializeGoalMilestone(
  milestone: GoalMilestoneSource
): GoalMilestoneDTO {
  return {
    id: id(milestone._id),
    title: milestone.title,
    completed: milestone.completed,
  };
}

export function serializeGoal(goal: GoalSource): GoalDTO {
  return {
    id: id(goal._id),
    userId: id(goal.userId),
    visionId: goal.visionId ? id(goal.visionId) : undefined,
    title: goal.title,
    description: goal.description,
    category: goal.category,
    priority: goal.priority,
    impactScore: goal.impactScore,
    effortScore: goal.effortScore,
    targetDate: iso(goal.targetDate),
    impact: scoreToMatrixLevel(goal.impactScore),
    effort: scoreToMatrixLevel(goal.effortScore),
    progress: goal.progress ?? 0,
    status: goal.status,
    milestones: [],
    createdAt: iso(goal.createdAt) ?? new Date().toISOString(),
    updatedAt: iso(goal.updatedAt) ?? new Date().toISOString(),
  };
}

export function toEmbeddedMilestones(
  milestones: { title: string; completed?: boolean }[]
) {
  return milestones.map((milestone) => ({
    title: milestone.title,
    completed: milestone.completed ?? false,
  }));
}
