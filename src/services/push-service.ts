import { connectDB } from "@/lib/db";
import { getFirebaseAdmin } from "@/lib/firebase/firebase-admin";
import NotificationDevice from "@/models/notification-device.model";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export async function sendPushNotification(
  userId: string,
  payload: { title: string; body: string; url?: string }
): Promise<boolean> {
  const admin = getFirebaseAdmin();
  if (!admin) return false;

  await connectDB();

  const devices = await NotificationDevice.find({
    userId,
    enabled: true,
  }).lean();

  if (devices.length === 0) return false;

  const tokens = devices.map((device) => device.fcmToken);
  const url = payload.url?.startsWith("http")
    ? payload.url
    : `${APP_URL}${payload.url ?? "/dashboard"}`;

  try {
    const response = await admin.messaging.sendEachForMulticast({
      tokens,
      notification: {
        title: payload.title,
        body: payload.body,
      },
      data: {
        url,
        title: payload.title,
        body: payload.body,
      },
      webpush: {
        fcmOptions: { link: url },
      },
    });

    const invalidTokens = response.responses
      .map((result: { error?: { code?: string } }, index: number) =>
        result.error?.code === "messaging/registration-token-not-registered"
          ? tokens[index]
          : null
      )
      .filter(Boolean) as string[];

    if (invalidTokens.length > 0) {
      await NotificationDevice.deleteMany({ fcmToken: { $in: invalidTokens } });
    }

    return response.successCount > 0;
  } catch (error) {
    console.error("[FCM] Push delivery failed:", error);
    return false;
  }
}
