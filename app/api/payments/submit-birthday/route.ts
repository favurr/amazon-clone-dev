import { NextRequest, NextResponse } from "next/server";
import { paystackRequest } from "@/lib/paystack";
import type { ChargeResponse } from "@/lib/paystack-types";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { birthday, reference }: { birthday: string; reference: string } =
      body;

    if (!birthday || !reference) {
      return NextResponse.json(
        { error: "Birthday and reference are required" },
        { status: 400 }
      );
    }

    const response = await paystackRequest<ChargeResponse>(
      "/charge/submit_birthday",
      "POST",
      { birthday, reference }
    );

    return NextResponse.json(response);
  } catch (error: any) {
    console.error("Submit birthday error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to submit birthday" },
      { status: 500 }
    );
  }
}
