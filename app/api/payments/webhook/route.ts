import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import crypto from "crypto";

export async function POST(request: NextRequest) {
  try {
    // Get webhook secret from environment
    const secret = process.env.PAYSTACK_SECRET_KEY;
    if (!secret) {
      console.error("[Webhook] PAYSTACK_SECRET_KEY not configured");
      return NextResponse.json({ error: "Webhook not configured" }, { status: 500 });
    }

    // Get the signature from headers
    const signature = request.headers.get("x-paystack-signature");
    if (!signature) {
      console.error("[Webhook] No signature provided");
      return NextResponse.json({ error: "No signature" }, { status: 401 });
    }

    // Get request body
    const body = await request.text();
    
    // Verify signature
    const hash = crypto
      .createHmac("sha512", secret)
      .update(body)
      .digest("hex");

    if (hash !== signature) {
      console.error("[Webhook] Invalid signature");
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    // Parse the verified payload
    const event = JSON.parse(body);

    console.log("[Webhook] Event received:", {
      event: event.event,
      reference: event.data?.reference,
      status: event.data?.status,
    });

    // Handle charge.success event
    if (event.event === "charge.success") {
      const { reference, status, amount, customer, metadata, authorization } = event.data;

      if (status === "success") {
        console.log("[Webhook] Payment successful:", reference);

        // Get order ID from metadata
        const orderId = metadata?.order_id;

        if (orderId) {
          // Extract card details from authorization
          const cardNetwork = authorization?.brand || authorization?.card_type?.split(' ')[0];
          const cardLast4 = authorization?.last4;

          // Update order status with card details
          const order = await prisma.order.update({
            where: { id: orderId },
            data: {
              status: "COMPLETED",
              paymentStatus: "success",
              paystack_id: reference,
              card_network: cardNetwork,
              card_last4: cardLast4,
            },
          });

          // Clear cart for the user
          if (order.userId) {
            await prisma.cartItem.deleteMany({
              where: {
                cart: {
                  userId: order.userId,
                },
              },
            });
          }

          console.log("[Webhook] Order completed:", orderId);
        } else {
          console.warn("[Webhook] No order_id in metadata");
        }
      }
    }

    // Handle other events if needed
    if (event.event === "charge.failed") {
      const { reference, metadata } = event.data;
      const orderId = metadata?.order_id;

      if (orderId) {
        await prisma.order.update({
          where: { id: orderId },
          data: {
            status: "FAILED",
            paymentStatus: "failed",
            paystack_id: reference,
          },
        });

        console.log("[Webhook] Order failed:", orderId);
      }
    }

    // Always return 200 to acknowledge receipt
    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error("[Webhook] Error:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}
