import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { formatAmount } from "@/lib/paystack";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      contactInfo,
      address,
      payment,
      totalPrice,
      userId,
      products,
    } = body;

    if (!userId || !contactInfo || !address || !payment || !products) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Create address record
    const addressRecord = await prisma.address.create({
      data: {
        userId,
        streetAddress: address.address,
        city: address.city,
        state: address.country, // Using country as state for now
        postalCode: address.postalCode,
        country: address.country,
        isDefault: false,
      },
    });

    // Generate unique transaction reference
    const tx_ref = `PS_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    // Create order
    const order = await prisma.order.create({
      data: {
        userId,
        addressId: addressRecord.id,
        totalPrice,
        status: "PENDING",
        tx_ref,
        paymentStatus: "pending",
        items: {
          create: products.map((p: any) => ({
            productId: p.product_id,
            quantity: p.quantity,
            price: p.price,
            variantId: p.variantId || null,
          })),
        },
      },
      include: {
        items: true,
      },
    });

    // Initialize Paystack charge using our API
    const [expiryMonth, expiryYear] = payment.expiryDate.split("/");
    const customerName = `${address.firstName} ${address.lastName}`;
    const customerPhone = contactInfo.phone || "";
    
    const amountInKobo = formatAmount(totalPrice);
    
    console.log("[Checkout] Payment details:", {
      email: contactInfo.email,
      amount: amountInKobo,
      cardLast4: payment.cardNumber.slice(-4),
      expiryMonth: expiryMonth?.trim(),
      expiryYear: expiryYear?.trim(),
      customerName,
      customerPhone,
    });
    
    const initializeUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/payments/initialize`;
    console.log("[Checkout] Calling initialize URL:", initializeUrl);
    
    const chargeResponse = await fetch(
      initializeUrl,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: contactInfo.email,
          address: address.address,
          amount: amountInKobo, // Already converted to kobo
          card: {
            number: payment.cardNumber.replace(/\s/g, ""),
            cvv: payment.cvc,
            expiry_month: expiryMonth?.trim(),
            expiry_year: `20${expiryYear?.trim()}`,
          },
          first_name: address.firstName,
          last_name: address.lastName,
          phone: customerPhone,
          metadata: {
            custom_fields: [
              {
                display_name: "Order ID",
                variable_name: "order_id",
                value: order.id,
              },
              {
                display_name: "Customer Name",
                variable_name: "customer_name",
                value: customerName,
              },
              {
                display_name: "Phone Number",
                variable_name: "phone",
                value: customerPhone,
              },
            ],
            order_id: order.id,
          },
        }),
      }
    );

    console.log("[Checkout] Initialize response status:", chargeResponse.status);

    if (!chargeResponse.ok) {
      let errorMessage = "Payment initialization failed";
      try {
        const error = await chargeResponse.json();
        errorMessage = error.error || error.message || errorMessage;
      } catch (parseError) {
        // If response is not JSON (HTML error page), get text
        const errorText = await chargeResponse.text();
        console.error("Non-JSON error response:", errorText.substring(0, 200));
        errorMessage = `Payment service error (${chargeResponse.status})`;
      }
      
      // Update order to failed
      await prisma.order.update({
        where: { id: order.id },
        data: { status: "FAILED", paymentStatus: "failed" },
      });
      
      return NextResponse.json(
        { error: errorMessage },
        { status: 500 }
      );
    }

    const chargeData = await chargeResponse.json();

    // Update order with Paystack reference
    await prisma.order.update({
      where: { id: order.id },
      data: {
        paystack_id: chargeData.data.reference,
      },
    });

    const { status, display_text, url } = chargeData.data;

    // Handle different response statuses
    switch (status) {
      case "success":
        // Payment successful immediately
        await prisma.order.update({
          where: { id: order.id },
          data: {
            status: "COMPLETED",
            paymentStatus: "success",
          },
        });

        // Clear cart
        await prisma.cartItem.deleteMany({
          where: {
            cart: {
              userId,
            },
          },
        });

        return NextResponse.json({
          success: true,
          orderId: order.id,
          message: "Payment successful",
        });

      case "send_pin":
        return NextResponse.json({
          requiresAuth: true,
          authType: "pin",
          orderId: order.id,
          reference: chargeData.data.reference,
          displayText: display_text,
        });

      case "send_otp":
        return NextResponse.json({
          requiresAuth: true,
          authType: "otp",
          orderId: order.id,
          reference: chargeData.data.reference,
          displayText: display_text,
        });

      case "send_birthday":
        return NextResponse.json({
          requiresAuth: true,
          authType: "birthday",
          orderId: order.id,
          reference: chargeData.data.reference,
          displayText: display_text,
        });

      case "open_url":
        // 3D Secure authentication required
        console.log("[Checkout] 3DS redirect required:", {
          url,
          orderId: order.id,
          reference: chargeData.data.reference,
        });
        
        return NextResponse.json({
          requiresAction: true,
          redirectUrl: url,
          orderId: order.id,
          reference: chargeData.data.reference,
        });

      case "pending":
        return NextResponse.json({
          error: "Transaction is pending. Please try again.",
        }, { status: 400 });

      case "failed":
        await prisma.order.update({
          where: { id: order.id },
          data: {
            status: "FAILED",
            paymentStatus: "failed",
          },
        });
        return NextResponse.json({
          error: chargeData.message || "Payment failed",
        }, { status: 400 });

      default:
        return NextResponse.json({
          error: "Unknown payment status",
        }, { status: 400 });
    }
  } catch (error: any) {
    console.error("Checkout error:", error);
    return NextResponse.json(
      { error: error.message || "Checkout failed" },
      { status: 500 }
    );
  }
}
