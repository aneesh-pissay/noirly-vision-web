import { NextResponse } from "next/server";
import { z } from "zod";
import { connectDB } from "@/lib/db";
import { getTokenFromRequest } from "@/lib/auth/get-token";
import { verifyToken } from "@/lib/auth/jwt";
import NotificationDevice from "@/models/notification-device.model";
import User from "@/models/user.model";

const registerDeviceSchema = z.object({
  fcmToken: z.string().min(10),
  deviceName: z.string().optional(),
  browser: z.string().optional(),
});

async function getUserIdFromRequest(request: Request): Promise<string | null> {
  const token = getTokenFromRequest(request as import("next/server").NextRequest);
  if (!token) return null;

  const decoded = verifyToken(token);
  if (!decoded) return null;

  const user = await User.findById(decoded.userId)
    .select("isVerified tokenVersion")
    .lean();

  if (!user?.isVerified) return null;
  if (user.tokenVersion !== decoded.tokenVersion) return null;

  return decoded.userId;
}

export async function POST(request: Request) {
  try {
    await connectDB();
    const userId = await getUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = registerDeviceSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const { fcmToken, deviceName, browser } = parsed.data;

    await NotificationDevice.findOneAndUpdate(
      { fcmToken },
      {
        $set: {
          userId,
          deviceName,
          browser,
          enabled: true,
          lastActive: new Date(),
        },
      },
      { upsert: true, new: true }
    );

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[Notifications] Device registration failed:", error);
    return NextResponse.json({ error: "Failed to register device" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    await connectDB();
    const userId = await getUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = registerDeviceSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    await NotificationDevice.deleteOne({
      userId,
      fcmToken: parsed.data.fcmToken,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[Notifications] Device unregister failed:", error);
    return NextResponse.json(
      { error: "Failed to unregister device" },
      { status: 500 }
    );
  }
}
