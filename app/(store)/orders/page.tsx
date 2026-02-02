import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { formatPrice } from "@/lib/formatters";

export default async function OrdersPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/auth/login?redirect=/orders");
  }

  const ordersRaw = await prisma.order.findMany({
    where: { userId: session.user.id },
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
    orderBy: { createdAt: "desc" },
  });

  // Convert Decimal to number for client components
  const orders = ordersRaw.map((order) => ({
    ...order,
    totalPrice: Number(order.totalPrice),
    items: order.items.map((item) => ({
      ...item,
      price: Number(item.price),
    })),
  }));

  return (
    <div className="min-h-screen bg-[#eaeded]">
      <div className="max-w-6xl mx-auto px-4 py-6">
        <h1 className="text-3xl font-bold mb-6">Your Orders</h1>

        {orders.length === 0 ? (
          <div className="bg-white rounded-lg p-8 text-center">
            <h2 className="text-xl font-semibold mb-2">No orders yet</h2>
            <p className="text-gray-600 mb-4">
              Start shopping and your orders will appear here
            </p>
            <Link
              href="/"
              className="inline-block bg-[#ffd814] hover:bg-[#f7ca00] px-6 py-2 rounded-md font-semibold"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order.id}
                className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition"
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">
                      Order placed:{" "}
                      {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-gray-600">
                      Order ID: {order.id.slice(0, 8)}
                    </p>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-3">
                      {(() => {
                        const ps = (order.paymentStatus || "").toLowerCase();
                        let displayStatus = order.status ?? "PENDING";
                        if (ps === "paid" || ps === "success")
                          displayStatus = "COMPLETED";
                        else if (ps === "pending") displayStatus = "PENDING";
                        else if (ps === "cancelled" || ps === "canceled")
                          displayStatus = "CANCELLED";
                        else if (ps === "failed" || ps === "error")
                          displayStatus = "FAILED";

                        const statusClass =
                          displayStatus === "COMPLETED"
                            ? "bg-green-100 text-green-800"
                            : displayStatus === "PENDING"
                              ? "bg-yellow-100 text-yellow-800"
                              : displayStatus === "CANCELLED"
                                ? "bg-red-100 text-red-800"
                                : "bg-gray-100 text-gray-800";

                        return (
                          <span
                            className={`px-3 py-2 rounded-full text-sm font-semibold ${statusClass}`}
                          >
                            {displayStatus}
                          </span>
                        );
                      })()}

                      <div className="text-right">
                        <p className="text-sm text-gray-600">Total</p>
                        <p className="text-lg font-bold">
                          {formatPrice(order.totalPrice)}
                        </p>
                      </div>
                    </div>

                    <Link
                      href={`/orders/${order.id}`}
                      className="inline-block bg-[#f3f4f6] hover:bg-[#e5e7eb] px-4 py-2 rounded-md text-sm font-semibold"
                    >
                      View Order
                    </Link>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="flex items-center gap-3 mb-4 overflow-x-auto">
                    {order.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center gap-3 bg-gray-50 rounded p-2 min-w-55"
                      >
                        <img
                          src={item.product.mainImageUrl}
                          alt={item.product.title}
                          className="w-14 h-14 object-cover rounded"
                        />
                        <div className="flex-1">
                          <h3 className="font-semibold text-sm truncate">
                            {item.product.title}
                          </h3>
                          <p className="text-xs text-gray-600">
                            Qty: {item.quantity} • {formatPrice(item.price)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 pt-4 border-t md:flex md:items-start md:gap-6">
                    <div className="md:flex-1">
                      <h4 className="font-semibold mb-2">Shipping Address</h4>
                      <p className="text-sm text-gray-600">
                        {order.address.streetAddress}
                        <br />
                        {order.address.city}, {order.address.state}{" "}
                        {order.address.postalCode}
                        <br />
                        {order.address.country}
                      </p>
                    </div>

                    <div className="mt-4 md:mt-0">
                      <p className="text-sm text-gray-600">
                        Payment: {order.paymentStatus}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
