import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { getTokenFromRequest } from "@/lib/auth/get-token";
import { verifyToken } from "@/lib/auth/jwt";
import { serializeNotification } from "@/lib/notifications/utils";
import Notification from "@/models/notification.model";
import User from "@/models/user.model";

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

export async function GET(request: Request) {
  try {
    await connectDB();
    const userId = await getUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = Math.min(Number(searchParams.get("limit") ?? 50), 100);

    const notifications = await Notification.find({ userId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    const unreadCount = await Notification.countDocuments({
      userId,
      isRead: false,
    });

    return NextResponse.json({
      notifications: notifications.map(serializeNotification),
      unreadCount,
    });
  } catch (error) {
    console.error("[Notifications] List failed:", error);
    return NextResponse.json({ error: "Failed to load notifications" }, { status: 500 });
  }
}
