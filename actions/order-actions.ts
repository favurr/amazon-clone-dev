"use server";

import prisma from "@/lib/prisma";

export async function getOrdersData(query?: string) {
  try {
    const orders = await prisma.order.findMany({
      where: {
        OR: query
          ? [
              { id: { contains: query, mode: "insensitive" } },
              { tx_ref: { contains: query, mode: "insensitive" } },
              { user: { name: { contains: query, mode: "insensitive" } } },
            ]
          : undefined,
      },
      include: {
        user: {
          select: { name: true, email: true, firstName: true, lastName: true },
        },
        items: { include: { product: { select: { title: true } } } },
      },
      orderBy: { createdAt: "desc" },
    });

    const formatted = orders.map((order) => ({
      id: order.id,
      customerName:
        order.user.name || `${order.user.firstName} ${order.user.lastName}`,
      email: order.user.email,
      itemsCount: order.items.length,
      total: Math.floor(Number(order.totalPrice)), // Rule: No decimals
      status: order.status,
      paymentStatus: order.paymentStatus,
      txRef: order.tx_ref,
      date: order.createdAt,
    }));

    const stats = {
      pending: formatted.filter((o) => o.status === "PENDING").length,
      completed: formatted.filter((o) => o.status === "COMPLETED").length,
      totalRevenue: formatted
        .filter((o) => o.status === "COMPLETED")
        .reduce((sum, o) => sum + o.total, 0),
    };

    return { orders: formatted, stats };
  } catch (error) {
    console.error("ORDERS_FETCH_ERROR", error);
    return { orders: [], stats: { pending: 0, completed: 0, totalRevenue: 0 } };
  }
}

export async function getCustomerOrders(userId: string) {
  try {
    const orders = await prisma.order.findMany({
      where: { userId },
      include: {
        items: {
          include: {
            product: { select: { title: true, mainImageUrl: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return orders.map((order) => ({
      id: order.id,
      itemsCount: order.items.length,
      total: Math.floor(Number(order.totalPrice)),
      status: order.status,
      paymentStatus: order.paymentStatus,
      txRef: order.tx_ref,
      date: order.createdAt,
    }));
  } catch (error) {
    console.error("GET_CUSTOMER_ORDERS_ERROR", error);
    return [];
  }
}

export async function getOrderDetails(orderId: string, userId: string) {
  try {
    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        userId, // Ensure user can only access their own orders
      },
      include: {
        items: {
          include: {
            product: {
              select: {
                title: true,
                mainImageUrl: true,
              },
            },
          },
        },
        address: true,
      },
    });

    if (!order) return null;

    const subtotal = order.items.reduce(
      (sum, item) => sum + Number(item.price) * item.quantity,
      0,
    );

    return {
      id: order.id,
      status: order.status,
      paymentStatus: order.paymentStatus,
      txRef: order.tx_ref,
      flwId: order.flw_id,
      cardNetwork: order.card_network,
      cardLast4: order.card_last4,
      date: order.createdAt,
      updatedAt: order.updatedAt,
      total: Math.floor(Number(order.totalPrice)),
      subtotal: Math.floor(subtotal),
      shipping: 0, // Add shipping calculation if needed
      tax: 0, // Add tax calculation if needed
      items: order.items.map((item) => ({
        id: item.id,
        product: {
          title: item.product.title,
          mainImageUrl: item.product.mainImageUrl,
        },
        variant: null, // Add variant data if available
        quantity: item.quantity,
        price: Math.floor(Number(item.price)),
      })),
      address: {
        streetAddress: order.address.streetAddress,
        city: order.address.city,
        state: order.address.state,
        postalCode: order.address.postalCode,
        country: order.address.country,
      },
    };
  } catch (error) {
    console.error("GET_ORDER_DETAILS_ERROR", error);
    return null;
  }
}
