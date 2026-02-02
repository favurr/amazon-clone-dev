import { NextResponse } from "next/server";
import { getCartItemCount } from "@/actions/cart";

export async function GET() {
  try {
    const count = await getCartItemCount();
    return NextResponse.json({ count });
  } catch (error) {
    console.error("Cart count API error:", error);
    return NextResponse.json({ count: 0 });
  }
}

// Disable caching for this route
export const dynamic = "force-dynamic";
