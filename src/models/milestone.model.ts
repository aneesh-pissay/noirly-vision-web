import mongoose, { type Document, type Model, Schema } from "mongoose";
import { MILESTONE_STATUSES } from "@/lib/constants";

export interface IMilestone extends Document {
  userId: mongoose.Types.ObjectId;
  goalId: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  successCriteria?: string;
  targetDate?: Date;
  status: (typeof MILESTONE_STATUSES)[number];
  order: number;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const milestoneSchema = new Schema<IMilestone>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    goalId: { type: Schema.Types.ObjectId, ref: "Goal", required: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    successCriteria: { type: String, trim: true },
    targetDate: { type: Date },
    status: {
      type: String,
      enum: MILESTONE_STATUSES,
      default: "active",
    },
    order: { type: Number, default: 0, min: 0 },
    completedAt: { type: Date },
  },
  { timestamps: true }
);

milestoneSchema.index({ userId: 1, goalId: 1, order: 1 });
milestoneSchema.index({ goalId: 1, status: 1 });
milestoneSchema.index({ userId: 1, goalId: 1 });

const Milestone: Model<IMilestone> =
  mongoose.models.Milestone ??
  mongoose.model<IMilestone>("Milestone", milestoneSchema);

export default Milestone;
