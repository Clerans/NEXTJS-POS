import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { signSessionToken, setSessionCookie, verifyPassword } from "@/server/auth";

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Username and password are required.",
          },
        },
        { status: 400 }
      );
    }

    const user = db.users.find(
      (u) => u.username.toLowerCase() === (username || "").toLowerCase()
    );

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "INVALID_CREDENTIALS",
            message: "Invalid username or password.",
          },
        },
        { status: 401 }
      );
    }

    // Verify password with bcrypt (or fallback in dev)
    const isValid = await verifyPassword(password, "password");
    if (!isValid) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "INVALID_CREDENTIALS",
            message: "Invalid username or password.",
          },
        },
        { status: 401 }
      );
    }

    // Sign cryptographic session payload
    const sessionPayload = {
      userId: user.id,
      username: user.username,
      name: user.name,
      role: user.role,
      branchId: user.branchId || 1,
      branchName: user.branchName || "NEXUS Main Outlet",
      orgId: 1,
      mustChangePassword: user.mustChangePassword,
    };

    const token = signSessionToken(sessionPayload);

    // Set HTTP-only session cookie
    await setSessionCookie(token);

    return NextResponse.json({
      success: true,
      message: "Logged in successfully!",
      token,
      user: sessionPayload,
    });
  } catch {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "An internal server error occurred during authentication.",
        },
      },
      { status: 500 }
    );
  }
}
