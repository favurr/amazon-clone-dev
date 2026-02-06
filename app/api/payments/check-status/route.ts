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

    // Use transaction verify endpoint for completed transactions
    const response = await paystackRequest<any>(
      `/transaction/verify/${reference}`,
      "GET"
    );

    // Transform Paystack transaction response to our ChargeResponse format
    const transformedResponse: ChargeResponse = {
      status: response.status,
      message: response.message,
      data: {
        status: response.data.status === "success" ? "success" : "failed",
        reference: response.data.reference,
        amount: response.data.amount,
        authorization: response.data.authorization,
        gateway_response: response.data.gateway_response,
        message: response.data.message,
      },
    };

    return NextResponse.json(transformedResponse);
  } catch (error: any) {
    console.error("Check status error:", error);
    
    // If transaction not found, return pending status instead of error
    if (error.message?.includes("Transaction reference not found")) {
      return NextResponse.json({
        status: true,
        message: "Transaction is being processed",
        data: {
          status: "pending",
          reference: reference,
          amount: 0,
        },
      });
    }
    
    return NextResponse.json(
      { error: error.message || "Failed to check status" },
      { status: 500 }
    );
  }
}
