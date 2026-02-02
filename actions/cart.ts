"use server";

import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function getCartItemCount() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return 0;
    }

    const cart = await prisma.cart.findUnique({
      where: { userId: session.user.id },
      include: {
        items: {
          select: { quantity: true }
        }
      }
    });

    if (!cart) {
      return 0;
    }

    return cart.items.length;
  } catch (error) {
    console.error("Error fetching cart count:", error);
    return 0;
  }
}
