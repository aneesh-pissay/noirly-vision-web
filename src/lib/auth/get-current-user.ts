import { connectDB } from "@/lib/db";
import { getTokenFromCookies } from "@/lib/auth/get-token";
import { verifyToken } from "@/lib/auth/jwt";
import User, {
  getUserDisplayName,
  type IUser,
} from "@/models/user.model";

export type CurrentUser = Pick<
  IUser,
  "username" | "email" | "avatar" | "firstName" | "lastName" | "role" | "createdAt"
> & { id: string; displayName: string };

export async function getCurrentUser(): Promise<CurrentUser | null> {
  const token = await getTokenFromCookies();
  if (!token) return null;

  const decoded = verifyToken(token);
  if (!decoded) return null;

  await connectDB();

  const user = await User.findById(decoded.userId).lean();
  if (!user || !user.isVerified) return null;
  if ((user.tokenVersion ?? 0) !== decoded.tokenVersion) return null;

  return {
    id: user._id.toString(),
    username: user.username,
    email: user.email,
    avatar: user.avatar,
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role,
    displayName: getUserDisplayName(user),
    createdAt: user.createdAt,
  };
}
