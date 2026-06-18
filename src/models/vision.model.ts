import mongoose, { type Document, type Model, Schema } from "mongoose";
import { VISION_AREAS, VISION_STATUSES } from "@/lib/constants";

export interface IVision extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  area: (typeof VISION_AREAS)[number];
  targetDate?: Date;
  phase?: string;
  successMetric?: string;
  progress: number;
  status: (typeof VISION_STATUSES)[number];
  createdAt: Date;
  updatedAt: Date;
}

const visionSchema = new Schema<IVision>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    area: {
      type: String,
      enum: VISION_AREAS,
      default: "career",
    },
    targetDate: { type: Date },
    phase: { type: String, trim: true },
    successMetric: { type: String, trim: true },
    progress: { type: Number, default: 0, min: 0, max: 100 },
    status: {
      type: String,
      enum: VISION_STATUSES,
      default: "ACTIVE",
    },
  },
  { timestamps: true }
);

visionSchema.index({ userId: 1, status: 1 });
visionSchema.index({ userId: 1, createdAt: -1 });
visionSchema.index({ userId: 1, area: 1 });

const Vision: Model<IVision> =
  mongoose.models.Vision ?? mongoose.model<IVision>("Vision", visionSchema);

export default Vision;
