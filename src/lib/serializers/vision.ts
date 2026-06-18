import { id, iso } from "@/lib/serializers";
import type { IVision } from "@/models/vision.model";
import type { VisionDTO } from "@/types/vision";

type VisionSource = Pick<
  IVision,
  | "_id"
  | "userId"
  | "title"
  | "description"
  | "area"
  | "targetDate"
  | "phase"
  | "successMetric"
  | "progress"
  | "status"
  | "createdAt"
  | "updatedAt"
>;

export function serializeVision(vision: VisionSource): VisionDTO {
  return {
    id: id(vision._id),
    userId: id(vision.userId),
    title: vision.title,
    description: vision.description,
    area: vision.area,
    targetDate: iso(vision.targetDate),
    phase: vision.phase,
    successMetric: vision.successMetric,
    progress: vision.progress,
    status: vision.status,
    createdAt: iso(vision.createdAt) ?? new Date().toISOString(),
    updatedAt: iso(vision.updatedAt) ?? new Date().toISOString(),
  };
}
