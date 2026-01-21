"use server";

import prisma from "@/lib/prisma";

export async function getOrdersData(query?: string) {
  try {
    const orders = await prisma.order.findMany({
      where: {
        OR: query ? [
          { id: { contains: query, mode: 'insensitive' } },
          { tx_ref: { contains: query, mode: 'insensitive' } },
          { user: { name: { contains: query, mode: 'insensitive' } } },
        ] : undefined,
      },
      include: {
        user: { select: { name: true, email: true, firstName: true, lastName: true } },
        items: { include: { product: { select: { title: true } } } },
      },
      orderBy: { createdAt: "desc" },
    });

    const formatted = orders.map((order) => ({
      id: order.id,
      customerName: order.user.name || `${order.user.firstName} ${order.user.lastName}`,
      email: order.user.email,
      itemsCount: order.items.length,
      total: Math.floor(Number(order.totalPrice)), // Rule: No decimals
      status: order.status,
      paymentStatus: order.paymentStatus,
      txRef: order.tx_ref,
      date: order.createdAt,
    }));

    const stats = {
      pending: formatted.filter(o => o.status === "PENDING").length,
      completed: formatted.filter(o => o.status === "COMPLETED").length,
      totalRevenue: formatted.filter(o => o.status === "COMPLETED").reduce((sum, o) => sum + o.total, 0),
    };

    return { orders: formatted, stats };
  } catch (error) {
    console.error("ORDERS_FETCH_ERROR", error);
    return { orders: [], stats: { pending: 0, completed: 0, totalRevenue: 0 } };
  }
}