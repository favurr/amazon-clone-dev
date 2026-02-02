import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { submitChargeAuth } from "@/actions/flutterwave/charge";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { chargeId, type, pin, otp, orderId, nonce } = body as {
      chargeId: string;
      type: "pin" | "otp";
      pin?: string;
      otp?: string;
      orderId?: string;
      nonce?: string;
    };

    if (
      !chargeId ||
      !type ||
      (type === "pin" && !pin) ||
      (type === "otp" && !otp)
    ) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 },
      );
    }

    // If noop nonce provided, or not, create one server-side to be safe
    const useNonce = nonce || Math.random().toString().slice(2, 14);

    const { data: updateData } = await submitChargeAuth({
      chargeId,
      type,
      pin,
      otp,
      nonce: useNonce,
    });

    // Log the submit auth response
    console.log("SUBMIT_AUTH_RESPONSE", { type, chargeId, updateData });

    // If Flutterwave requires further action (3DS), forward that to client
    const nextAction = updateData?.data?.next_action ?? updateData?.next_action;
    if (nextAction?.redirect_url?.url) {
      return NextResponse.json({
        requiresAction: true,
        redirectUrl: nextAction.redirect_url.url,
        updateData,
      });
    }

    const finalStatus = updateData?.status ?? updateData?.data?.status;

    if (finalStatus === "success" || finalStatus === "succeeded") {
      // If orderId was provided, fulfill the order (decrement stock) and clear cart
      if (orderId) {
        try {
          const flwId = updateData?.data?.id ?? updateData?.id;

          try {
            const { fulfillOrder } = await import("@/lib/order-utils");
            const order = await fulfillOrder(orderId, flwId);

            // Clear cart for the user
            if (order) {
              const cart = await prisma.cart.findUnique({
                where: { userId: order.userId },
              });
              if (cart) {
                await prisma.cartItem.deleteMany({
                  where: { cartId: cart.id },
                });
              }
            }
          } catch (e) {
            console.error("Error fulfilling order (stock update)", e);
          }
        } catch (e) {
          console.error("Error updating order after auth submit", e);
        }
      }

      return NextResponse.json({ success: true, updateData });
    }

    return NextResponse.json({ success: false, updateData });
  } catch (err: any) {
    console.error("SUBMIT_AUTH_ERROR", err);
    return NextResponse.json(
      { message: err?.message ?? "Failed to submit auth" },
      { status: 500 },
    );
  }
}
