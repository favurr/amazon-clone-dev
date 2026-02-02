import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const text = await req.text();
    const body = JSON.parse(text || "{}");

    // Log incoming webhook event for debugging/audit
    console.log("WEBHOOK_EVENT", body);

    // Optional verification if secret provided
    const secret = process.env.FLUTTERWAVE_WEBHOOK_SECRET;
    if (secret) {
      const sigHeader =
        (req as any).headers?.get("verif-hash") ||
        (req as any).headers?.get("x-flw-signature") ||
        (req as any).headers?.get("x-flutterwave-signature");
      if (!sigHeader) {
        console.warn("Webhook request missing signature header");
        return NextResponse.json({ ok: false }, { status: 400 });
      }

      if (sigHeader !== secret) {
        // Also attempt HMAC SHA256 of payload
        const hmac = crypto
          .createHmac("sha256", secret)
          .update(text)
          .digest("hex");
        if (hmac !== sigHeader) {
          console.warn("Webhook signature mismatch");
          return NextResponse.json({ ok: false }, { status: 400 });
        }
      }
    }

    const type = body?.type || body?.event;

    if (type === "charge.completed" || type === "charge.success") {
      const data = body?.data;
      const reference = data?.reference;
      const flwId = data?.id;

      if (!reference) {
        console.warn("charge.completed webhook missing reference", { body });
        return NextResponse.json({ ok: false }, { status: 400 });
      }

      // Find the order by tx_ref
      const order = await prisma.order.findUnique({
        where: { tx_ref: reference },
      });
      if (!order) {
        console.warn("Order not found for webhook reference", { reference });
        return NextResponse.json({ ok: true });
      }

      // Fulfill the order (decrement stock, mark completed)
      try {
        try {
          const { fulfillOrder } = await import("@/lib/order-utils");
          const updated = await fulfillOrder(order.id, flwId);

          // Clear the user's cart once fulfilled
          if (updated) {
            const cart = await prisma.cart.findUnique({
              where: { userId: updated.userId },
            });
            if (cart) {
              await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
            }
          }
        } catch (e) {
          console.error("Error fulfilling order (webhook)", e);
        }
      } catch (e) {
        console.error("Error updating order in webhook", e);
      }

      return NextResponse.json({ ok: true });
    } else if (type === "charge.failed") {
      const data = body?.data;
      const reference = data?.reference;
      if (!reference) {
        console.warn("charge.failed webhook missing reference", { body });
        return NextResponse.json({ ok: false }, { status: 400 });
      }

      const order = await prisma.order.findUnique({
        where: { tx_ref: reference },
      });
      if (!order) return NextResponse.json({ ok: true });

      await prisma.order.update({
        where: { id: order.id },
        data: { paymentStatus: "failed", status: "FAILED" },
      });

      return NextResponse.json({ ok: true });
    } else if (type === "charge.cancelled" || type === "charge.voided") {
      const data = body?.data;
      const reference = data?.reference;
      if (!reference) {
        console.warn("charge.cancelled webhook missing reference", { body });
        return NextResponse.json({ ok: false }, { status: 400 });
      }

      const order = await prisma.order.findUnique({
        where: { tx_ref: reference },
      });
      if (!order) return NextResponse.json({ ok: true });

      await prisma.order.update({
        where: { id: order.id },
        data: { paymentStatus: "cancelled", status: "CANCELLED" },
      });

      return NextResponse.json({ ok: true });
    }

    // For other events, acknowledge
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("WEBHOOK_ERROR", err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
