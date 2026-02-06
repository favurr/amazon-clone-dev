import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: orderId } = await params;

    // Update order status
    await prisma.order.update({
      where: { id: orderId },
      data: {
        status: "COMPLETED",
        paymentStatus: "success",
      },
    });

    // Clear cart for the user
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: { userId: true },
    });

    if (order?.userId) {
      await prisma.cartItem.deleteMany({
        where: {
          cart: {
            userId: order.userId,
          },
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Complete order error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to complete order" },
      { status: 500 }
    );
  }
}
