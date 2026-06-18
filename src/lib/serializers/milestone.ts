import { iso } from "@/lib/serializers";
import type { IMilestone } from "@/models/milestone.model";
import type { MilestoneDTO } from "@/types/milestone";

type MilestoneSource = {
  _id: { toString(): string };
  goalId: { toString(): string };
  title: string;
  description?: string;
  successCriteria?: string;
  targetDate?: Date;
  status: IMilestone["status"];
  order: number;
  completedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
};

export function serializeMilestone(milestone: MilestoneSource): MilestoneDTO {
  return {
    id: milestone._id.toString(),
    goalId: milestone.goalId.toString(),
    title: milestone.title,
    description: milestone.description,
    successCriteria: milestone.successCriteria,
    targetDate: iso(milestone.targetDate),
    status: milestone.status,
    order: milestone.order,
    completedAt: iso(milestone.completedAt),
    createdAt: iso(milestone.createdAt) ?? new Date().toISOString(),
    updatedAt: iso(milestone.updatedAt) ?? new Date().toISOString(),
  };
}
