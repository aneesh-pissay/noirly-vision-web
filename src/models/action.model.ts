import mongoose, { type Document, type Model, Schema } from "mongoose";
import { ACTION_PRIORITIES, ACTION_STATUSES, ACTION_TYPES } from "@/lib/constants";

export interface IAction extends Document {
  userId: mongoose.Types.ObjectId;
  visionId?: mongoose.Types.ObjectId;
  goalId?: mongoose.Types.ObjectId;
  milestoneId?: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  type: (typeof ACTION_TYPES)[number];
  status: (typeof ACTION_STATUSES)[number];
  priority: (typeof ACTION_PRIORITIES)[number];
  estimatedMinutes: number;
  completedMinutes: number;
  progress: number;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const actionSchema = new Schema<IAction>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    visionId: { type: Schema.Types.ObjectId, ref: "Vision" },
    goalId: { type: Schema.Types.ObjectId, ref: "Goal" },
    milestoneId: { type: Schema.Types.ObjectId, ref: "Milestone" },
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    type: {
      type: String,
      enum: ACTION_TYPES,
      default: "build",
    },
    status: {
      type: String,
      enum: ACTION_STATUSES,
      default: "PLANNED",
    },
    priority: {
      type: String,
      enum: ACTION_PRIORITIES,
      default: "medium",
    },
    estimatedMinutes: { type: Number, default: 60, min: 1 },
    completedMinutes: { type: Number, default: 0, min: 0 },
    progress: { type: Number, default: 0, min: 0, max: 100 },
    completedAt: { type: Date },
  },
  { timestamps: true }
);

actionSchema.index({ userId: 1, status: 1 });
actionSchema.index({ userId: 1, goalId: 1 });
actionSchema.index({ userId: 1, visionId: 1 });
actionSchema.index({ userId: 1, priority: 1 });
actionSchema.index({ userId: 1, createdAt: -1 });
actionSchema.index({ goalId: 1, status: 1 });
actionSchema.index({ milestoneId: 1, status: 1 });

const Action: Model<IAction> =
  mongoose.models.Action ?? mongoose.model<IAction>("Action", actionSchema);

export default Action;
