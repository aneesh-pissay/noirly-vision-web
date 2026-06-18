import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret-key";

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export async function comparePassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

export function generateToken(
  userId: string,
  tokenVersion = 0,
  expiresIn: string | number = "7d"
): string {
  return jwt.sign({ userId, tokenVersion }, JWT_SECRET, {
    expiresIn,
  } as jwt.SignOptions);
}

export function verifyToken(
  token: string
): { userId: string; tokenVersion: number } | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as {
      userId: string;
      tokenVersion?: number;
    };
    return {
      userId: decoded.userId,
      tokenVersion: decoded.tokenVersion ?? 0,
    };
  } catch {
    return null;
  }
}

export function generateRandomToken(): string {
  return (
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15) +
    Date.now().toString(36)
  );
}
