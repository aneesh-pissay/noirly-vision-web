import type { MilestoneStatus } from "@/types";

export type MilestoneDTO = {
  id: string;
  goalId: string;
  title: string;
  description?: string;
  successCriteria?: string;
  targetDate?: string;
  status: MilestoneStatus;
  order: number;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
};
