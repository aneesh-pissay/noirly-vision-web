import mongoose, { type Document, type Model, Schema } from "mongoose";
import {
  NOTIFICATION_PRIORITIES,
  NOTIFICATION_TYPES,
} from "@/lib/notifications/constants";

export interface INotification extends Document {
  userId: mongoose.Types.ObjectId;
  type: (typeof NOTIFICATION_TYPES)[number];
  title: string;
  message: string;
  priority: (typeof NOTIFICATION_PRIORITIES)[number];
  channels: {
    inApp: boolean;
    push: boolean;
    email: boolean;
  };
  delivery: {
    pushSent: boolean;
    pushSentAt?: Date;
    emailSent: boolean;
    emailSentAt?: Date;
  };
  relatedEntity?: {
    type: string;
    id?: mongoose.Types.ObjectId;
  };
  actionUrl?: string;
  dedupeKey?: string;
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const notificationSchema = new Schema<INotification>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    type: { type: String, enum: NOTIFICATION_TYPES, required: true },
    title: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    priority: {
      type: String,
      enum: NOTIFICATION_PRIORITIES,
      default: "normal",
    },
    channels: {
      inApp: { type: Boolean, default: true },
      push: { type: Boolean, default: false },
      email: { type: Boolean, default: false },
    },
    delivery: {
      pushSent: { type: Boolean, default: false },
      pushSentAt: { type: Date },
      emailSent: { type: Boolean, default: false },
      emailSentAt: { type: Date },
    },
    relatedEntity: {
      type: { type: String },
      id: { type: Schema.Types.ObjectId },
    },
    actionUrl: { type: String, trim: true },
    dedupeKey: { type: String, trim: true },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

notificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ userId: 1, createdAt: -1 });
notificationSchema.index(
  { dedupeKey: 1 },
  { unique: true, sparse: true }
);

const Notification: Model<INotification> =
  mongoose.models.Notification ??
  mongoose.model<INotification>("Notification", notificationSchema);

export default Notification;
