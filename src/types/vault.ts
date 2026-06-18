import type { VaultType } from "@/types";

export type VaultEntryDTO = {
  id: string;
  userId: string;
  type: VaultType;
  title: string;
  content?: string;
  tags: string[];
  linkedVision?: string;
  linkedGoal?: string;
  linkedAction?: string;
  linkedFocusSession?: string;
  linkedVisionTitle?: string;
  linkedGoalTitle?: string;
  linkedActionTitle?: string;
  linkedFocusSessionTitle?: string;
  isLinked: boolean;
  createdAt: string;
  updatedAt: string;
};
