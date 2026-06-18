import mongoose, { type Document, type Model, Schema } from "mongoose";
import {
  ACTION_PRIORITIES,
  GOAL_CATEGORIES,
  GOAL_STATUSES,
} from "@/lib/constants";

export interface IGoalMilestone {
  _id: mongoose.Types.ObjectId;
  title: string;
  completed: boolean;
}

export interface IGoal extends Document {
  userId: mongoose.Types.ObjectId;
  visionId?: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  category: (typeof GOAL_CATEGORIES)[number];
  priority: (typeof ACTION_PRIORITIES)[number];
  impactScore: number;
  effortScore: number;
  targetDate?: Date;
  progress: number;
  status: (typeof GOAL_STATUSES)[number];
  milestones: IGoalMilestone[];
  createdAt: Date;
  updatedAt: Date;
}

const goalMilestoneSchema = new Schema<IGoalMilestone>(
  {
    title: { type: String, required: true, trim: true },
    completed: { type: Boolean, default: false },
  },
  { _id: true }
);

const goalSchema = new Schema<IGoal>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    visionId: { type: Schema.Types.ObjectId, ref: "Vision" },
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    category: {
      type: String,
      enum: GOAL_CATEGORIES,
      default: "career",
    },
    priority: {
      type: String,
      enum: ACTION_PRIORITIES,
      default: "medium",
    },
    impactScore: { type: Number, default: 50, min: 0, max: 100 },
    effortScore: { type: Number, default: 50, min: 0, max: 100 },
    targetDate: { type: Date },
    progress: { type: Number, default: 0, min: 0, max: 100 },
    status: {
      type: String,
      enum: GOAL_STATUSES,
      default: "ACTIVE",
    },
    milestones: {
      type: [goalMilestoneSchema],
      default: [],
    },
  },
  { timestamps: true }
);

goalSchema.index({ userId: 1, status: 1 });
goalSchema.index({ userId: 1, category: 1 });
goalSchema.index({ visionId: 1 });
goalSchema.index({ userId: 1, progress: -1 });
goalSchema.index({ userId: 1, visionId: 1, status: 1 });

const Goal: Model<IGoal> =
  mongoose.models.Goal ?? mongoose.model<IGoal>("Goal", goalSchema);

export default Goal;
