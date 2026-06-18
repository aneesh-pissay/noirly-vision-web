import mongoose, { type Document, type Model, Schema } from "mongoose";
import { FOCUS_MODES, FOCUS_SESSION_STATUSES } from "@/lib/constants";

export interface IFocusSession extends Document {
  userId: mongoose.Types.ObjectId;
  actionId?: mongoose.Types.ObjectId;
  mode: (typeof FOCUS_MODES)[number];
  distractionBlocking: boolean;
  status: (typeof FOCUS_SESSION_STATUSES)[number];
  startedAt: Date;
  endedAt?: Date;
  completedAt?: Date;
  plannedMinutes: number;
  duration: number;
  quality: number;
  reflection?: string;
  pausedAt?: Date;
  totalPausedSeconds: number;
  createdAt: Date;
  updatedAt: Date;
}

const focusSessionSchema = new Schema<IFocusSession>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    actionId: { type: Schema.Types.ObjectId, ref: "Action" },
    mode: {
      type: String,
      enum: FOCUS_MODES,
      default: "deep_work",
    },
    distractionBlocking: { type: Boolean, default: true },
    status: {
      type: String,
      enum: FOCUS_SESSION_STATUSES,
      default: "active",
    },
    startedAt: { type: Date, default: Date.now },
    endedAt: { type: Date },
    completedAt: { type: Date },
    plannedMinutes: { type: Number, default: 90, min: 15, max: 480 },
    duration: { type: Number, default: 0, min: 0 },
    quality: { type: Number, default: 0, min: 0, max: 100 },
    reflection: { type: String, trim: true },
    pausedAt: { type: Date },
    totalPausedSeconds: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true }
);

focusSessionSchema.index({ userId: 1, startedAt: -1 });
focusSessionSchema.index({ userId: 1, endedAt: 1 });
focusSessionSchema.index({ userId: 1, status: 1 });
focusSessionSchema.index({ userId: 1, endedAt: 1, startedAt: -1 });
focusSessionSchema.index({ actionId: 1 });

const FocusSession: Model<IFocusSession> =
  mongoose.models.FocusSession ??
  mongoose.model<IFocusSession>("FocusSession", focusSessionSchema);

export default FocusSession;
