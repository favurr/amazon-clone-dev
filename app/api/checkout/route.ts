import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { createCustomer, findCustomer } from "@/actions/flutterwave/customer";
import { tokenizeCard } from "@/actions/flutterwave/tokenizeCard";
import { chargeCard } from "@/actions/flutterwave/charge";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { contactInfo, address, payment, totalPrice, userId } = body;

    if (!userId || typeof userId !== "string") {
      return NextResponse.json(
        { message: "Missing or invalid userId. Please sign in and try again." },
        { status: 400 },
      );
    }

    const traceId = `trace-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    let customer_id = user.flwCustomerId;

    if (!customer_id) {
      try {
        const res = await createCustomer({
          contactInfo,
          address,
          traceId,
        });

        customer_id = res.customer_id;

        await prisma.user.update({
          where: { id: user.id },
          data: {
            flwCustomerId: customer_id,
            flwCustomerEmail: contactInfo.email,
          },
        });
      } catch (err: any) {
        const raw = err?.raw;
        if (raw?.error?.code === "10409") {
          // Try to find existing customer on Flutterwave by email or phone and sync to local user
          const found = await findCustomer({
            email: contactInfo.email,
            phone: address.phone,
            traceId,
          });
          if (found?.customer_id) {
            customer_id = found.customer_id;

            // If some other local user already has this flwCustomerId, do not attempt to set it again
            const existingLocal = customer_id
              ? await prisma.user.findUnique({
                  where: { flwCustomerId: customer_id },
                })
              : null;
            if (existingLocal && existingLocal.id !== user.id) {
              console.warn(
                "Flutterwave customer already linked to another local user",
                {
                  customer_id,
                  existingUserId: existingLocal.id,
                },
              );

              // Still set the customer_id variable so charging can proceed, but avoid updating the unique field.
              // Update only the email for reference.
              await prisma.user.update({
                where: { id: user.id },
                data: { flwCustomerEmail: contactInfo.email },
              });
            } else {
              // Safe to update this user's Flutterwave customer id
              await prisma.user.update({
                where: { id: user.id },
                data: {
                  flwCustomerId: customer_id,
                  flwCustomerEmail: contactInfo.email,
                },
              });
              console.log(
                "Synced existing Flutterwave customer to local user",
                {
                  customer_id,
                },
              );
            }
          } else {
            throw new Error(
              "Flutterwave customer already exists but we could not find it via API. Manual sync required.",
            );
          }
        } else {
          throw err;
        }
      }
    }

    console.log("Customer created:", { customer_id });

    if (!customer_id) {
      throw new Error("Customer ID is required for payment processing");
    }

    // Create a short transaction reference (must be 6-42 alphanumeric chars per Flutterwave)
    const generateTxRef = (seed?: string) => {
      const seedClean = seed
        ? String(seed)
            .replace(/[^a-zA-Z0-9]/g, "")
            .slice(0, 8)
        : Math.random().toString(36).slice(2, 8);
      const timeChunk = Date.now().toString(36).slice(-6);
      let ref = `order_${seedClean}_${timeChunk}`;
      if (ref.length > 42) ref = ref.slice(0, 42);
      // Ensure minimum reasonable length
      if (ref.length < 6) ref = `ord_${Math.random().toString(36).slice(2, 6)}`;
      return ref;
    };

    let tx_ref = generateTxRef(user.id);

    // Create or reuse a simple Address row for this order
    const addressRow = await prisma.address.create({
      data: {
        userId: user.id,
        streetAddress: address.address,
        city: address.city,
        state: "",
        postalCode: address.postalCode,
        country: address.country,
        isDefault: false,
      },
    });

    // Expect products array from client (product_id, quantity, price)
    const products = Array.isArray((body as any).products)
      ? (body as any).products
      : [];

    const order = await prisma.order.create({
      data: {
        userId: user.id,
        addressId: addressRow.id,
        totalPrice: totalPrice,
        status: "PENDING",
        tx_ref,
        paymentStatus: "pending",
        items: {
          create: products.map((p: any) => ({
            productId: p.product_id,
            variantId: p.variant_id ?? p.variantId ?? undefined,
            quantity: p.quantity,
            price: p.price,
          })),
        },
      },
    });

    const nonce = Math.random().toString().slice(2, 14);

    const { payment_method_id, data: pmData } = await tokenizeCard({
      email: contactInfo.email,
      card_number: payment.cardNumber,
      cvv: payment.cvc,
      expiryDate: payment.expiryDate,
      nonce,
      traceId,
    });

    // Extract card network and last4 (defensive checks across possible response shapes)
    const cardNetwork =
      pmData?.data?.card?.network ??
      pmData?.data?.card?.brand ??
      pmData?.card?.brand ??
      pmData?.data?.authorization?.card?.brand ??
      null;
    const cardLast4 =
      pmData?.data?.card?.last4 ??
      pmData?.data?.card?.last_four ??
      pmData?.card?.last4 ??
      pmData?.data?.last4 ??
      null;

    // Persist card details on the order (only non-sensitive values)
    await prisma.order.update({
      where: { id: order.id },
      data: { card_network: cardNetwork, card_last4: cardLast4 },
    });

    // Attempt to charge; if Flutterwave rejects the reference for size, retry once with a shorter ref
    let chargeData: any = null;
    try {
      const result = await chargeCard({
        customer_id,
        payment_method_id,
        amount: totalPrice,
        currency: "NGN",
        reference: tx_ref,
        traceId,
      });
      chargeData = result.data;
    } catch (err: any) {
      // Inspect validation errors to detect reference length problems
      const raw = err?.raw;
      const validationErrors =
        raw?.error?.validation_errors ?? raw?.validation_errors;
      const refError =
        Array.isArray(validationErrors) &&
        validationErrors.some((ve: any) => {
          const field = (ve.field_name ?? ve.field ?? "")
            .toString()
            .toLowerCase();
          const msg = (ve.message ?? "").toString().toLowerCase();
          return field.includes("reference") || msg.includes("reference");
        });

      if (refError) {
        console.warn(
          "Charge failed due to reference validation; retrying with shorter tx_ref",
          { original: tx_ref },
        );
        const newRef = generateTxRef();
        tx_ref = newRef;
        // Update order record with new tx_ref
        await prisma.order.update({
          where: { id: order.id },
          data: { tx_ref: newRef },
        });

        const retry = await chargeCard({
          customer_id,
          payment_method_id,
          amount: totalPrice,
          currency: "NGN",
          reference: tx_ref,
          traceId,
        });
        chargeData = retry.data;
      } else {
        throw err;
      }
    }

    const nextAction = chargeData?.data?.next_action ?? chargeData?.next_action;
    console.log("FLW_CHARGE_RESPONSE", { traceId, nextAction, chargeData });

    if (nextAction?.redirect_url?.url) {
      return NextResponse.json({
        requiresAction: true,
        redirectUrl: nextAction.redirect_url.url,
        chargeData,
        orderId: order.id,
      });
    }

    const nextActionType = nextAction?.type;
    if (
      nextActionType === "requires_pin" ||
      nextActionType === "requires_otp"
    ) {
      return NextResponse.json({
        requiresAuth: true,
        authType: nextActionType === "requires_pin" ? "pin" : "otp",
        chargeId: chargeData?.data?.id ?? chargeData?.id,
        orderId: order.id,
        chargeData,
      });
    }

    // Fallback for older authorization formats
    const authType =
      chargeData?.data?.authorization?.type ?? chargeData?.authorization?.type;
    if (authType === "pin") {
      return NextResponse.json({
        requiresAuth: true,
        authType: "pin",
        chargeId: chargeData?.data?.id ?? chargeData?.id,
        orderId: order.id,
        chargeData,
      });
    }

    // Consider charge successful when status indicates success/succeeded
    const finalStatus = chargeData?.status ?? chargeData?.data?.status;
    if (finalStatus === "success" || finalStatus === "succeeded") {
      // persist flw_id, decrement stock, mark order completed and clear cart
      try {
        const flwId = chargeData?.data?.id ?? chargeData?.id;
        // Fulfill order: decrement stock and update order atomically
        try {
          const { fulfillOrder } = await import("@/lib/order-utils");
          await fulfillOrder(order.id, flwId);
        } catch (e) {
          console.error("Error fulfilling order (stock update)", e);
        }

        // clear user's cart
        const cart = await prisma.cart.findUnique({
          where: { userId: user.id },
        });
        if (cart) {
          await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
        }
      } catch (e) {
        console.error("Error updating order after successful charge", e);
      }

      return NextResponse.json({ success: true });
    }

    // Otherwise return the charge data for inspection (keep 200 so client can parse)
    return NextResponse.json({ success: false, chargeData, orderId: order.id });
  } catch (err: any) {
    console.error("CHECKOUT_ERROR", err);
    const message = err?.message ?? "Payment failed";
    if (err?.raw) {
      console.error("CHECKOUT_ERROR_RAW", err.raw);
    }
    return NextResponse.json({ message }, { status: 500 });
  }
}
