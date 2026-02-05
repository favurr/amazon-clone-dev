import { NextRequest, NextResponse } from "next/server";
import { paystackRequest } from "@/lib/paystack";
import type { ChargeResponse } from "@/lib/paystack-types";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const reference = searchParams.get("reference");

    if (!reference) {
      return NextResponse.json(
        { error: "Reference is required" },
        { status: 400 }
      );
    }

    const response = await paystackRequest<ChargeResponse>(
      `/charge/${reference}`,
      "GET"
    );

    return NextResponse.json(response);
  } catch (error: any) {
    console.error("Check status error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to check status" },
      { status: 500 }
    );
  }
}
