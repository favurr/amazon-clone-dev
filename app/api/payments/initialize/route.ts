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
    }: {
      email: string;
      address: string;
      amount: number;
      card: CardDetails;
      metadata: PaymentMetadata;
    } = body;

    // Validate inputs
    if (!email || !amount || !card) {
      return NextResponse.json(
        { error: "Missing required fields" },
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

    // Make initial charge request
    const response = await paystackRequest<ChargeResponse>("/charge", "POST", {
      email,
      amount, // Should already be in kobo
      card: {
        number: card.number.replace(/\s/g, ""),
        cvv: card.cvv,
        expiry_month: card.expiry_month,
        expiry_year: card.expiry_year,
      },
      metadata: enrichedMetadata,
    });

    return NextResponse.json(response);
  } catch (error: any) {
    console.error("Initialize charge error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to initialize payment" },
      { status: 500 }
    );
  }
}
