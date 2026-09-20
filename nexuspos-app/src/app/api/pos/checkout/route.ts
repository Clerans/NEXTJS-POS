import { NextResponse } from "next/server";
import { getServerSession } from "@/server/auth";
import { processSalesCheckout } from "@/server/services/sales";

export async function POST(request: Request) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json(
        {
          success: false,
          error: { code: "UNAUTHORIZED", message: "Authentication required to checkout." },
        },
        { status: 401 }
      );
    }

    const payload = await request.json();

    const result = await processSalesCheckout(
      payload,
      session.userId,
      session.name || session.username
    );

    return NextResponse.json({
      success: true,
      message: "Order placed and settled successfully!",
      order: result.order,
      receiptNumber: result.receiptNumber,
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Failed to process checkout transaction.";
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "CHECKOUT_FAILED",
          message: errorMessage,
        },
      },
      { status: 400 }
    );
  }
}
