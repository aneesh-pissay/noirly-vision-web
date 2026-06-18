import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { getTokenFromRequest } from "@/lib/auth/get-token";
import { verifyToken } from "@/lib/auth/jwt";
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

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const userId = await getUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = (await request.json()) as { isRead?: boolean };

    const notification = await Notification.findOneAndUpdate(
      { _id: id, userId },
      { $set: { isRead: body.isRead ?? true } },
      { new: true }
    ).lean();

    if (!notification) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[Notifications] Mark read failed:", error);
    return NextResponse.json({ error: "Failed to update notification" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const userId = await getUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const result = await Notification.deleteOne({ _id: id, userId });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[Notifications] Delete failed:", error);
    return NextResponse.json({ error: "Failed to delete notification" }, { status: 500 });
  }
}
