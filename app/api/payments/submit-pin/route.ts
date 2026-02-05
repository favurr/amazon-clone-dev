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
      pin,
      reference,
      metadata,
    }: {
      email: string;
      address: string;
      amount: number;
      card: CardDetails;
      pin: string;
      reference: string;
      metadata: PaymentMetadata;
    } = body;

    if (!pin || !reference) {
      return NextResponse.json(
        { error: "PIN and reference are required" },
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

    // Resubmit charge with PIN
    const response = await paystackRequest<ChargeResponse>("/charge", "POST", {
      email,
      amount,
      card: {
        number: card.number.replace(/\s/g, ""),
        cvv: card.cvv,
        expiry_month: card.expiry_month,
        expiry_year: card.expiry_year,
      },
      pin,
      reference, // Important: use same reference
      metadata: enrichedMetadata,
    });

    return NextResponse.json(response);
  } catch (error: any) {
    console.error("Submit PIN error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to submit PIN" },
      { status: 500 }
    );
  }
}
