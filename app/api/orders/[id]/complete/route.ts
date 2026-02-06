import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: orderId } = await params;
    
    // Get request body which may contain card details
    const body = await request.json().catch(() => ({}));
    const { cardNetwork, cardLast4, paystackId } = body;

    // Update order status with optional card details
    const updateData: any = {
      status: "COMPLETED",
      paymentStatus: "success",
    };
    
    if (paystackId) updateData.paystack_id = paystackId;
    if (cardNetwork) updateData.card_network = cardNetwork;
    if (cardLast4) updateData.card_last4 = cardLast4;

    await prisma.order.update({
      where: { id: orderId },
      data: updateData,
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
