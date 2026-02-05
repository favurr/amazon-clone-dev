import { NextRequest, NextResponse } from "next/server";
import { paystackRequest } from "@/lib/paystack";
import type { ChargeResponse } from "@/lib/paystack-types";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { otp, reference }: { otp: string; reference: string } = body;

    if (!otp || !reference) {
      return NextResponse.json(
        { error: "OTP and reference are required" },
        { status: 400 }
      );
    }

    const response = await paystackRequest<ChargeResponse>(
      "/charge/submit_otp",
      "POST",
      { otp, reference }
    );

    return NextResponse.json(response);
  } catch (error: any) {
    console.error("Submit OTP error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to submit OTP" },
      { status: 500 }
    );
  }
}
