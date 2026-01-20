"use server";

import prisma from "@/lib/prisma";

export async function getDashboardMetrics() {
  try {
    // If you still get connection errors, change these back to separate 'await' calls
    const [
      revenueData,
      customerCount,
      productCount,
      reviewStats,
      lowStockCount,
    ] = await Promise.all([
      prisma.order.aggregate({
        _sum: { totalPrice: true },
        where: { paymentStatus: "success" },
      }),
      prisma.user.count({
        where: { role: "USER" },
      }),
      prisma.product.count({
        where: { isArchived: false },
      }),
      prisma.review.aggregate({
        _avg: { rating: true },
      }),
      prisma.variant.count({
        where: { stock: { lt: 5 } },
      }),
    ]);

    return {
      totalRevenue: Number(revenueData._sum.totalPrice) || 0,
      customerCount: customerCount || 0,
      productCount: productCount || 0,
      averageRating: Number(reviewStats._avg.rating) || 0,
      lowStockCount: lowStockCount || 0,
    };
  } catch (error) {
    console.error("[DASHBOARD_METRICS_ACTION_ERROR]", error);
    return {
      totalRevenue: 0,
      customerCount: 0,
      productCount: 0,
      averageRating: 0,
      lowStockCount: 0,
    };
  }
}

export async function getRevenueDashboardData() {
  try {
    const now = new Date();
    const formatDate = (date: Date) => date.toISOString().split("T")[0];

    const fetchRange = async (days: number) => {
      const startDate = new Date(now);
      startDate.setDate(now.getDate() - days);
      startDate.setHours(0, 0, 0, 0);

      const orders = await prisma.order.findMany({
        where: { paymentStatus: "success", createdAt: { gte: startDate } },
        select: { totalPrice: true, createdAt: true },
      });

      const map: Record<string, number> = {};
      for (let i = days; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(now.getDate() - i);
        map[formatDate(d)] = 0;
      }

      orders.forEach((o) => {
        const d = formatDate(o.createdAt);
        if (map.hasOwnProperty(d)) map[d] += Number(o.totalPrice);
      });

      return Object.entries(map).map(([date, revenue]) => ({
        date,
        revenue: Math.floor(revenue), // No decimals
      }));
    };

    const dayData = await fetchRange(0);
    const weekData = await fetchRange(7);
    const monthData = await fetchRange(30);
    const yearData = await fetchRange(365);

    return {
      charts: { today: dayData, week: weekData, month: monthData, year: yearData },
      summary: {
        today: dayData.reduce((acc, curr) => acc + curr.revenue, 0),
        week: weekData.reduce((acc, curr) => acc + curr.revenue, 0),
        month: monthData.reduce((acc, curr) => acc + curr.revenue, 0),
        year: yearData.reduce((acc, curr) => acc + curr.revenue, 0),
      }
    };
  } catch (error) {
    console.error("DASHBOARD_ERROR", error);
    return null;
  }
}

// actions/dashboard.ts
export async function getRecentOrders() {
  try {
    const orders = await prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        totalPrice: true,
        status: true, // e.g., "PENDING", "PROCESSING"
        user: {
          select: { name: true }
        }
      }
    });

    return orders.map(order => ({
      id: order.id.slice(-7).toUpperCase(), // Clean ID for display
      customer: order.user?.name || "Guest Customer",
      // Math.floor to strictly avoid decimals
      amount: Math.floor(Number(order.totalPrice)),
      status: order.status
    }));
  } catch (error) {
    console.error("RECENT_ORDERS_ERROR", error);
    return [];
  }
}

export async function getLowStockItems() {
  try {
    const items = await prisma.product.findMany({
      where: {
        stock: { lt: 10 }, // Items with less than 10 units
      },
      orderBy: { stock: "asc" },
      take: 10,
      select: {
        name: true,
        stock: true,
        // Assuming you have a category or variant field
        category: { select: { name: true } } 
      }
    });

    return items.map(item => ({
      name: item.name,
      variant: item.category?.name || "Standard",
      stock: Math.floor(item.stock), // No decimals
    }));
  } catch (error) {
    console.error("INVENTORY_STATUS_ERROR", error);
    return [];
  }
}