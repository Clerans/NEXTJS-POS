import { NextResponse } from "next/server";
import { getServerSession } from "@/server/auth";

export async function GET() {
  const session = await getServerSession();
  if (!session) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "UNAUTHORIZED",
          message: "No active session found.",
        },
      },
      { status: 401 }
    );
  }

  return NextResponse.json({
    success: true,
    user: session,
  });
}
