import { NextResponse } from "next/server";
import { getServerSession } from "@/server/auth";
import { db } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json(
        {
          success: false,
          error: { code: "UNAUTHORIZED", message: "Authentication required." },
        },
        { status: 401 }
      );
    }

    const { pin, action } = await request.json();

    if (!pin) {
      return NextResponse.json(
        {
          success: false,
          error: { code: "VALIDATION_ERROR", message: "Manager PIN is required." },
        },
        { status: 400 }
      );
    }

    // Check manager or admin PIN (default demo PIN: 1234 or 0000)
    const isValidPin = pin === "1234" || pin === "0000";
    if (!isValidPin) {
      return NextResponse.json(
        {
          success: false,
          error: { code: "INVALID_PIN", message: "Invalid Manager Authorization PIN." },
        },
        { status: 403 }
      );
    }

    // Find authorized manager
    const manager = db.users.find(
      (u) => u.role === "ADMINISTRATOR" || u.role === "MANAGER"
    );

    return NextResponse.json({
      success: true,
      message: "Manager authorization granted.",
      authorizedBy: manager ? `${manager.name} (${manager.role})` : "Manager",
      action: action || "OVERRIDE",
    });
  } catch {
    return NextResponse.json(
      {
        success: false,
        error: { code: "INTERNAL_ERROR", message: "Failed to verify PIN." },
      },
      { status: 500 }
    );
  }
}
