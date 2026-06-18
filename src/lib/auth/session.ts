import { verifyToken } from "@/lib/auth/jwt";
import { getTokenFromCookies } from "@/lib/auth/get-token";
import { connectDB } from "@/lib/db";
import User from "@/models/user.model";

export async function getSessionUserId(): Promise<string | null> {
  const token = await getTokenFromCookies();
  if (!token) return null;

  const decoded = verifyToken(token);
  if (!decoded) return null;

  await connectDB();
  const user = await User.findById(decoded.userId)
    .select("tokenVersion isVerified")
    .lean();

  if (!user?.isVerified) return null;
  if ((user.tokenVersion ?? 0) !== decoded.tokenVersion) return null;

  return decoded.userId;
}
export async function requireSessionUserId(): Promise<string> {
  const userId = await getSessionUserId();
  if (!userId) {
    throw new Error("Unauthorized");
  }
  return userId;
}
