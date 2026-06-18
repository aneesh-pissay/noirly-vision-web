import mongoose, { type Document, type Model, Schema } from "mongoose";

export interface INotificationDevice extends Document {
  userId: mongoose.Types.ObjectId;
  fcmToken: string;
  deviceName?: string;
  browser?: string;
  enabled: boolean;
  lastActive: Date;
  createdAt: Date;
  updatedAt: Date;
}

const notificationDeviceSchema = new Schema<INotificationDevice>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    fcmToken: { type: String, required: true, trim: true },
    deviceName: { type: String, trim: true },
    browser: { type: String, trim: true },
    enabled: { type: Boolean, default: true },
    lastActive: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

notificationDeviceSchema.index({ fcmToken: 1 }, { unique: true });
notificationDeviceSchema.index({ userId: 1, enabled: 1 });

const NotificationDevice: Model<INotificationDevice> =
  mongoose.models.NotificationDevice ??
  mongoose.model<INotificationDevice>(
    "NotificationDevice",
    notificationDeviceSchema
  );

export default NotificationDevice;
