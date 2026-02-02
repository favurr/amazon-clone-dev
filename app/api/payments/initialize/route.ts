import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

function generateTxRef() {
  return `tx_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, contactInfo, address, shippingMethod, products } = body as {
      userId: string;
      contactInfo: { email: string };
      address: {
        country: string;
        firstName: string;
        lastName: string;
        address: string;
        postalCode: string;
        city: string;
        phone: string;
      };
      shippingMethod: string;
      products: Array<{ product_id: string; quantity: number; price: number }>;
    };

    if (!userId || !products?.length) {
      return NextResponse.json(
        { error: "Missing user or products" },
        { status: 400 },
      );
    }

    // Compute totals
    const subtotal = products.reduce((s, p) => s + p.price * p.quantity, 0);
    const TAX_RATE = 0.00312; // same tax logic as checkout
    const roundTo2 = (value: number) => Math.round(value * 100) / 100;

    const tax = roundTo2(subtotal * TAX_RATE);
    const total = roundTo2(subtotal + tax);

    // Create or reuse a simple Address row for this order
    const addressRow = await prisma.address.create({
      data: {
        userId,
        streetAddress: address.address,
        city: address.city,
        state: "",
        postalCode: address.postalCode,
        country: address.country,
        isDefault: false,
      },
    });

    const tx_ref = generateTxRef();

    // Create order with pending payment
    const order = await prisma.order.create({
      data: {
        userId,
        addressId: addressRow.id,
        totalPrice: total,
        status: "PENDING",
        tx_ref,
        paymentStatus: "pending",
        items: {
          create: products.map((p) => ({
            productId: p.product_id,
            quantity: p.quantity,
            price: p.price,
          })),
        },
      },
    });

    // Call external Payments API (Flutterwave wrapper) - configurable
    const baseUrl = process.env.PAYMENTS_API_BASE_URL;
    const apiKey = process.env.PAYMENTS_API_KEY; // if needed

    if (!baseUrl) {
      // Development fallback: pretend we got a hosted payment link
      return NextResponse.json({
        orderId: order.id,
        txRef: tx_ref,
        redirectUrl: `/orders`,
      });
    }

    const payload = {
      amount: total,
      currency: "NGN", // adjust as needed
      email: contactInfo?.email,
      reference: tx_ref,
      meta: { userId },
      // If your API requires items breakdown, pass products too
      items: products,
      redirect_url: `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/api/payments/callback`,
    };

    const resp = await fetch(`${baseUrl}/initialize`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
      },
      body: JSON.stringify(payload),
      cache: "no-store",
    });

    const data = await resp.json();

    if (!resp.ok) {
      console.error("PAYMENT_INIT_ERROR", data);
      return NextResponse.json(
        { error: data?.message || "Payment init failed" },
        { status: 400 },
      );
    }

    return NextResponse.json({
      orderId: order.id,
      txRef: tx_ref,
      redirectUrl: data?.data?.link || data?.redirectUrl || data?.payment_url,
    });
  } catch (err: any) {
    console.error("PAYMENT_CHECKOUT_ERROR", err);
    return NextResponse.json(
      { error: err.message || "Internal error" },
      { status: 500 },
    );
  }
}
