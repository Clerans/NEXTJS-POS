import { NextResponse } from "next/server";
import { clearSessionCookie } from "@/server/auth";

export async function POST() {
  try {
    await clearSessionCookie();
    return NextResponse.json({
      success: true,
      message: "Logged out successfully.",
    });
  } catch {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "LOGOUT_FAILED",
          message: "Failed to clear session.",
        },
      },
      { status: 500 }
    );
  }
}
