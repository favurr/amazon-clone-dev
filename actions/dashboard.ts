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
    const lowStockVariants = await prisma.variant.findMany({
      where: {
        stock: { lt: 10 }, // Threshold
      },
      include: {
        product: {
          select: {
            title: true,
          }
        }
      },
      orderBy: {
        stock: "asc"
      },
      take: 10
    });

    return lowStockVariants.map(variant => ({
      name: variant.product.title,
      variant: `${variant.type}: ${variant.value}`, // e.g., "Storage: 1TB"
      stock: Math.floor(variant.stock), // No decimals
    }));
  } catch (error) {
    console.error("INVENTORY_STATUS_ERROR", error);
    return [];
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

export async function getCategoryDistribution() {
  try {
    const categories = await prisma.category.findMany({
      select: {
        id: true,
        name: true,
        products: {
          select: {
            variants: {
              select: { stock: true }
            }
          }
        }
      }
    });

    // Calculate total stock per category
    const distribution = categories.map(cat => {
      const totalStock = cat.products.reduce((acc, prod) => {
        return acc + prod.variants.reduce((vAcc, v) => vAcc + v.stock, 0);
      }, 0);

      return {
        id: cat.id,
        name: cat.name,
        count: totalStock
      };
    }).filter(c => c.count > 0) // Only show categories with items
      .sort((a, b) => b.count - a.count);

    if (distribution.length <= 6) return distribution;

    // "Others" Logic: Keep top 5, aggregate the rest
    const topFive = distribution.slice(0, 5);
    const othersCount = distribution.slice(5).reduce((acc, curr) => acc + curr.count, 0);

    return [
      ...topFive,
      { id: "others", name: "Others", count: othersCount }
    ];
  } catch (error) {
    console.error("CATEGORY_DISTRIBUTION_ERROR", error);
    return [];
  }
}

export async function getTopCustomers() {
  try {
    const vips = await prisma.user.findMany({
      take: 5,
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        firstName: true,
        lastName: true,
        orders: {
          where: {
            status: "COMPLETED", // Only count successful revenue
          },
          select: {
            totalPrice: true,
          },
        },
      },
    });

    const formattedVips = vips
      .map((user) => {
        const totalSpent = user.orders.reduce(
          (sum, order) => sum + Number(order.totalPrice),
          0
        );

        return {
          id: user.id,
          name: user.name || `${user.firstName} ${user.lastName}`,
          email: user.email,
          image: user.image,
          // Respecting the "No Decimals" rule
          spent: Math.floor(totalSpent),
          initials: `${user.firstName?.[0] || ""}${user.lastName?.[0] || ""}`.toUpperCase(),
        };
      })
      .sort((a, b) => b.spent - a.spent); // Sort highest spenders first

    return formattedVips;
  } catch (error) {
    console.error("GET_TOP_CUSTOMERS_ERROR", error);
    return [];
  }
}

export async function getUrgentReviews() {
  try {
    const reviews = await prisma.review.findMany({
      where: {
        rating: { lte: 3 }, // 1, 2, or 3 stars
      },
      include: {
        product: { select: { title: true } },
        user: { select: { firstName: true, lastName: true, name: true } }
      },
      orderBy: { createdAt: "desc" },
      take: 5
    });

    return reviews.map(r => ({
      id: r.id,
      user: r.user.name || `${r.user.firstName} ${r.user.lastName.slice(0, 1)}.`,
      rating: r.rating,
      comment: r.comment || "No comment provided.",
      product: r.product.title
    }));
  } catch (error) {
    console.error("GET_URGENT_REVIEWS_ERROR", error);
    return [];
  }
}