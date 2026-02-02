import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const tx_ref = searchParams.get("tx_ref") || searchParams.get("reference") || "";
    const status = searchParams.get("status") || "";

    if (!tx_ref) return NextResponse.redirect(new URL("/orders", req.url));

    // Update order by tx_ref
    await prisma.order.update({
      where: { tx_ref },
      data: {
        status: status === "successful" || status === "success" ? "COMPLETED" : "FAILED",
        paymentStatus: status || "unknown",
      },
    });

    return NextResponse.redirect(new URL("/orders", req.url));
  } catch (err) {
    console.error("PAYMENT_CALLBACK_ERROR", err);
    return NextResponse.redirect(new URL("/orders", req.url));
  }
}
