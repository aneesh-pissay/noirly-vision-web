"use server";

import { runMutation, runQuery } from "@/lib/actions/run-action";
import { serializeVision } from "@/lib/serializers/vision";
import {
  createVisionSchema,
  deleteVisionSchema,
  getVisionSchema,
  updateVisionSchema,
  type CreateVisionInput,
  type DeleteVisionInput,
  type GetVisionInput,
  type UpdateVisionInput,
} from "@/lib/validations/vision";
import Vision from "@/models/vision.model";
import type { ActionResult } from "@/types";
import type { VisionDTO } from "@/types/vision";

function parseTargetDate(value?: string | null) {
  if (!value) return undefined;
  return new Date(value);
}

export async function createVision(
  input: CreateVisionInput
): Promise<ActionResult<VisionDTO>> {
  return runMutation({
    schema: createVisionSchema,
    input,
    errorMessage: "Failed to create vision",
    revalidatePaths: ["/dashboard/vision", "/dashboard"],
    handler: async ({ userId, input: data }) => {
      await Vision.updateMany(
        { userId, status: "ACTIVE" },
        { status: "ARCHIVED" }
      );

      const vision = await Vision.create({
        userId,
        title: data.title,
        description: data.description,
        area: data.area,
        phase: data.phase,
        successMetric: data.successMetric,
        progress: data.progress ?? 0,
        targetDate: parseTargetDate(data.targetDate),
        status: "ACTIVE",
      });

      return serializeVision(vision);
    },
  });
}

export async function getVision(
  input: GetVisionInput = {}
): Promise<ActionResult<VisionDTO | null>> {
  return runQuery({
    schema: getVisionSchema,
    input,
    errorMessage: "Failed to get vision",
    handler: async ({ userId, input: data }) => {
      const filter: Record<string, unknown> = { userId };

      if (data.id) {
        filter._id = data.id;
      } else {
        filter.status = data.status ?? "ACTIVE";
      }

      const vision = await Vision.findOne(filter).lean();
      return vision ? serializeVision(vision) : null;
    },
  });
}

export async function updateVision(
  input: UpdateVisionInput
): Promise<ActionResult<VisionDTO>> {
  return runMutation({
    schema: updateVisionSchema,
    input,
    errorMessage: "Failed to update vision",
    revalidatePaths: ["/dashboard/vision", "/dashboard"],
    handler: async ({ userId, input: data }) => {
      const { id: visionId, targetDate, ...fields } = data;

      if (fields.status === "ACTIVE") {
        await Vision.updateMany(
          { userId, status: "ACTIVE", _id: { $ne: visionId } },
          { status: "ARCHIVED" }
        );
      }

      const vision = await Vision.findOneAndUpdate(
        { _id: visionId, userId },
        {
          ...fields,
          ...(targetDate !== undefined
            ? { targetDate: targetDate ? new Date(targetDate) : null }
            : {}),
        },
        { new: true }
      ).lean();

      if (!vision) {
        throw new Error("Vision not found");
      }

      return serializeVision(vision);
    },
  });
}

export async function deleteVision(
  input: DeleteVisionInput
): Promise<ActionResult<{ id: string }>> {
  return runMutation({
    schema: deleteVisionSchema,
    input,
    errorMessage: "Failed to delete vision",
    revalidatePaths: ["/dashboard/vision", "/dashboard"],
    handler: async ({ userId, input: data }) => {
      const vision = await Vision.findOneAndDelete({
        _id: data.id,
        userId,
      });

      if (!vision) {
        throw new Error("Vision not found");
      }

      return { id: data.id };
    },
  });
}
