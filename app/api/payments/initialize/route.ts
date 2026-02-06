import { NextRequest, NextResponse } from "next/server";
import { paystackRequest } from "@/lib/paystack";
import type {
  ChargeResponse,
  CardDetails,
  PaymentMetadata,
} from "@/lib/paystack-types";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      email,
      address,
      amount,
      card,
      metadata,
      first_name,
      last_name,
      phone,
    }: {
      email: string;
      address: string;
      amount: number;
      card: CardDetails;
      metadata: PaymentMetadata;
      first_name?: string;
      last_name?: string;
      phone?: string;
    } = body;

    console.log("[Initialize] Received payment request:", {
      email,
      address,
      amount,
      cardLast4: card?.number?.slice(-4),
      expiryMonth: card?.expiry_month,
      expiryYear: card?.expiry_year,
      cvvLength: card?.cvv?.length,
    });

    // Validate inputs
    if (!email || !amount || !card) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate card details
    if (!card.number || !card.cvv || !card.expiry_month || !card.expiry_year) {
      return NextResponse.json(
        { error: "Incomplete card details" },
        { status: 400 }
      );
    }

    // Validate expiry format
    const expiryMonth = String(card.expiry_month).padStart(2, "0");
    const expiryYear = String(card.expiry_year);
    
    if (!/^\d{2}$/.test(expiryMonth) || !/^\d{4}$/.test(expiryYear)) {
      return NextResponse.json(
        { error: "Invalid expiry format. Expected MM and YYYY" },
        { status: 400 }
      );
    }

    // Build metadata with address
    const enrichedMetadata: PaymentMetadata = {
      ...metadata,
      custom_fields: [
        ...(metadata.custom_fields || []),
        {
          display_name: "Customer Address",
          variable_name: "customer_address",
          value: address,
        },
      ],
    };

    // Build charge request payload
    const chargePayload: any = {
      email,
      amount, // Should already be in kobo
      card: {
        number: card.number.replace(/\s/g, ""),
        cvv: card.cvv,
        expiry_month: expiryMonth,
        expiry_year: expiryYear,
      },
      metadata: enrichedMetadata,
    };

    // Add customer details if provided
    if (first_name) chargePayload.first_name = first_name;
    if (last_name) chargePayload.last_name = last_name;
    if (phone) chargePayload.phone = phone;
    
    console.log("[Initialize] Charge payload prepared:", {
      email,
      amount,
      hasFirstName: !!first_name,
      hasLastName: !!last_name,
      hasPhone: !!phone,
    });

    // Make initial charge request
    const response = await paystackRequest<ChargeResponse>(
      "/charge",
      "POST",
      chargePayload
    );

    return NextResponse.json(response);
  } catch (error: any) {
    console.error("Initialize charge error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to initialize payment" },
      { status: 500 }
    );
  }
}
