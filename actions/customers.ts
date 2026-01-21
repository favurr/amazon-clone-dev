"use server";

import prisma from "@/lib/prisma";

export async function getCustomersData(searchQuery?: string) {
  try {
    const customers = await prisma.user.findMany({
      where: {
        role: "USER", // Filter out admins
        OR: searchQuery ? [
          { name: { contains: searchQuery, mode: 'insensitive' } },
          { email: { contains: searchQuery, mode: 'insensitive' } },
          { firstName: { contains: searchQuery, mode: 'insensitive' } },
          { lastName: { contains: searchQuery, mode: 'insensitive' } },
        ] : undefined,
      },
      include: {
        orders: {
          where: { status: "COMPLETED" },
          select: { totalPrice: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const formatted = customers.map((user) => {
      const totalSpent = user.orders.reduce((sum, o) => sum + Number(o.totalPrice), 0);
      return {
        id: user.id,
        name: user.name || `${user.firstName} ${user.lastName}`,
        email: user.email,
        image: user.image,
        totalOrders: user.orders.length,
        totalSpent: Math.floor(totalSpent), // Rule: No decimals
        joinedAt: user.createdAt,
        isVIP: user.orders.length > 15 || totalSpent > 1000,
      };
    });

    // Quick Stats for the header
    const stats = {
      totalCount: formatted.length,
      vipCount: formatted.filter(c => c.isVIP).length,
      totalRevenue: Math.floor(formatted.reduce((sum, c) => sum + c.totalSpent, 0)),
    };

    return { customers: formatted, stats };
  } catch (error) {
    console.error("CUSTOMERS_FETCH_ERROR", error);
    return { customers: [], stats: { totalCount: 0, vipCount: 0, totalRevenue: 0 } };
  }
}