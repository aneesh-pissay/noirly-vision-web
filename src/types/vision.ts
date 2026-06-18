import type { VisionArea, VisionStage, VisionStatus } from "@/types";

export type VisionDTO = {
  id: string;
  userId: string;
  title: string;
  description?: string;
  area: VisionArea;
  targetDate?: string;
  phase?: VisionStage | string;
  successMetric?: string;
  progress: number;
  status: VisionStatus;
  createdAt: string;
  updatedAt: string;
};
