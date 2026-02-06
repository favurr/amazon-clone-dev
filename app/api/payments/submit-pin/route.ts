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
    const { pin, reference }: { pin: string; reference: string } = body;

    console.log("[Submit PIN] Received request:", {
      reference,
      pinLength: pin?.length,
    });

    if (!pin || !reference) {
      return NextResponse.json(
        { error: "PIN and reference are required" },
        { status: 400 }
      );
    }

    // Submit PIN for existing charge
    const response = await paystackRequest<ChargeResponse>(
      "/charge/submit_pin",
      "POST",
      {
        pin,
        reference,
      }
    );

    return NextResponse.json(response);
  } catch (error: any) {
    console.error("Submit PIN error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to submit PIN" },
      { status: 500 }
    );
  }
}
