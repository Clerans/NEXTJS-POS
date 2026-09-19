import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    const user = db.users.find((u) => u.username.toLowerCase() === (username || "").toLowerCase());
    if (!user) {
      return NextResponse.json({ message: "Invalid username or password" }, { status: 401 });
    }

    // Baseline validation: accept 'password' or any demo password in development
    const isValid = password === "password" || password.length >= 4;
    if (!isValid) {
      return NextResponse.json({ message: "Invalid username or password" }, { status: 401 });
    }

    const token = `nexuspos_jwt_${user.id}_${Date.now()}`;

    return NextResponse.json({
      message: "Logged in successfully!",
      token,
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        role: user.role,
        mustChangePassword: user.mustChangePassword,
        branchId: user.branchId,
        branchName: user.branchName,
      },
    });
  } catch (error) {
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
