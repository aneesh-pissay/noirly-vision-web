import { NextRequest, NextResponse } from "next/server";
import { bootstrapUserData } from "@/lib/auth/bootstrap-user";
import { setAuthCookie } from "@/lib/auth/cookies";
import { comparePassword, generateToken } from "@/lib/auth/jwt";
import { connectDB } from "@/lib/db";
import User, { serializeUser } from "@/models/user.model";

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const emailOrUsername =
      typeof body.emailOrUsername === "string"
        ? body.emailOrUsername.trim()
        : "";
    const password = typeof body.password === "string" ? body.password : "";

    if (!emailOrUsername || !password) {
      return NextResponse.json(
        { error: "Email/username and password are required" },
        { status: 400 }
      );
    }

    const emailCandidate = emailOrUsername.toLowerCase();
    const user = await User.findOne({
      $or: [{ email: emailCandidate }, { username: emailOrUsername }],
    }).select("+password");

    if (!user?.password) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    if (!user.isVerified) {
      return NextResponse.json(
        {
          error:
            "Please verify your email before logging in. Check your inbox for the verification link.",
        },
        { status: 403 }
      );
    }

    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    try {
      await bootstrapUserData(user._id.toString());
    } catch (initError) {
      console.error("bootstrapUserData failed during login:", initError);
    }

    const token = generateToken(user._id.toString(), user.tokenVersion ?? 0);
    const response = NextResponse.json(
      {
        message: "Login successful",
        token,
        user: serializeUser(user),
      },
      { status: 200 }
    );

    setAuthCookie(response, token);
    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Login failed. Please try again." },
      { status: 500 }
    );
  }
}
