import { NextRequest, NextResponse } from "next/server";
import { getTokenFromRequest } from "@/lib/auth/get-token";
import { verifyToken } from "@/lib/auth/jwt";
import { connectDB } from "@/lib/db";
import User, { serializeUser } from "@/models/user.model";

const noStoreHeaders = {
  "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
  Pragma: "no-cache",
  Expires: "0",
};

export async function GET(request: NextRequest) {
  try {
    const token = getTokenFromRequest(request);

    if (!token) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401, headers: noStoreHeaders }
      );
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json(
        { error: "Invalid token" },
        { status: 401, headers: noStoreHeaders }
      );
    }

    await connectDB();

    const user = await User.findById(decoded.userId).select(
      "-password -verificationToken -verificationTokenExpiry -resetPasswordToken -resetPasswordExpiry"
    );

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404, headers: noStoreHeaders }
      );
    }

    if (!user.isVerified) {
      return NextResponse.json(
        {
          error:
            "Email not verified. Please verify your email before logging in.",
        },
        { status: 403, headers: noStoreHeaders }
      );
    }

    return NextResponse.json(
      { user: serializeUser(user) },
      { headers: noStoreHeaders }
    );
  } catch (error) {
    console.error("[/api/auth/me] Error:", error);
    return NextResponse.json({ error: "Failed to get user" }, { status: 500 });
  }
}
