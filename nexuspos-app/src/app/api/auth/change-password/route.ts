import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const { userId, newPassword } = await request.json();

    const user = db.users.find((u) => u.id === Number(userId));
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    if (!newPassword || newPassword.length < 6) {
      return NextResponse.json(
        { message: "New password must be at least 6 characters long." },
        { status: 400 }
      );
    }

    user.mustChangePassword = false;

    return NextResponse.json({
      message: "Password updated successfully!",
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        role: user.role,
        mustChangePassword: false,
      },
    });
  } catch (error) {
    return NextResponse.json({ message: "Failed to update password" }, { status: 500 });
  }
}
