import mongoose, { type Document, type Model, Schema } from "mongoose";
import {
  DATE_FORMATS,
  DENSITIES,
  FOCUS_DURATIONS,
  SIDEBAR_MODES,
  STARTUP_PAGES,
  THEMES,
  WEEK_START_DAYS,
} from "@/lib/settings/constants";

export interface ISettings extends Document {
  userId: mongoose.Types.ObjectId;
  workspaceName: string;
  startupPage: (typeof STARTUP_PAGES)[number];
  dateFormat: (typeof DATE_FORMATS)[number];
  timezone: string;
  weekStartDay: (typeof WEEK_START_DAYS)[number];
  theme: (typeof THEMES)[number];
  accentColor: string;
  density: (typeof DENSITIES)[number];
  sidebarMode: (typeof SIDEBAR_MODES)[number];
  animationsEnabled: boolean;
  focusDuration: (typeof FOCUS_DURATIONS)[number];
  breakReminder: boolean;
  autoStartNextSession: boolean;
  dailyFocusTargetHours: number;
  bestFocusWindow: string;
  notificationsEnabled: boolean;
  dailyPlanningReminder: boolean;
  goalReviewReminder: boolean;
  focusReminder: boolean;
  weeklyReview: boolean;
  morningCheckInTime: string;
  eveningReviewTime: string;
  createdAt: Date;
  updatedAt: Date;
}

const settingsSchema = new Schema<ISettings>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    workspaceName: { type: String, default: "Personal OS", trim: true },
    startupPage: {
      type: String,
      enum: STARTUP_PAGES,
      default: "dashboard",
    },
    dateFormat: { type: String, enum: DATE_FORMATS, default: "mdy" },
    timezone: { type: String, default: "UTC" },
    weekStartDay: { type: Number, enum: WEEK_START_DAYS, default: 1 },
    theme: { type: String, enum: THEMES, default: "dark" },
    accentColor: { type: String, default: "#38bdf8" },
    density: { type: String, enum: DENSITIES, default: "comfortable" },
    sidebarMode: { type: String, enum: SIDEBAR_MODES, default: "expanded" },
    animationsEnabled: { type: Boolean, default: true },
    focusDuration: { type: Number, enum: FOCUS_DURATIONS, default: 50 },
    breakReminder: { type: Boolean, default: true },
    autoStartNextSession: { type: Boolean, default: false },
    dailyFocusTargetHours: { type: Number, default: 2, min: 1, max: 12 },
    bestFocusWindow: { type: String, default: "09:00" },
    notificationsEnabled: { type: Boolean, default: true },
    dailyPlanningReminder: { type: Boolean, default: true },
    goalReviewReminder: { type: Boolean, default: true },
    focusReminder: { type: Boolean, default: true },
    weeklyReview: { type: Boolean, default: true },
    morningCheckInTime: { type: String, default: "08:00" },
    eveningReviewTime: { type: String, default: "20:00" },
  },
  { timestamps: true }
);

settingsSchema.index({ userId: 1 }, { unique: true });

const Settings: Model<ISettings> =
  mongoose.models.Settings ??
  mongoose.model<ISettings>("Settings", settingsSchema);

export default Settings;
