import { getCustomerOrders } from "@/actions/order-actions";
import { Currency, CurrencyValue } from "@/components/currency";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { auth } from "@/lib/auth";
import { Calendar, Package, ShoppingBag } from "lucide-react";
import { headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";

const statusStyles: Record<
  string,
  { bg: string; text: string; border: string }
> = {
  PENDING: {
    bg: "bg-amber-50",
    text: "text-amber-700",
    border: "border-amber-200",
  },
  COMPLETED: {
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    border: "border-emerald-200",
  },
  FAILED: { bg: "bg-red-50", text: "text-red-700", border: "border-red-200" },
  CANCELLED: {
    bg: "bg-slate-100",
    text: "text-slate-700",
    border: "border-slate-200",
  },
};

export default async function OrdersPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/auth/login");
  }

  const orders = await getCustomerOrders(session.user.id);

  return (
    <div className="min-h-screen py-8 px-4 md:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
              My Orders
            </h1>
            <p className="text-slate-600 mt-1">
              Track and manage your order history
            </p>
          </div>
        </div>

        {/* Orders Table */}
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="pb-0">
            <div className="">
              <div className="flex flex-row gap-8">
                <div className="flex flex-col">
                  <CardTitle className="text-sm font-normal text-slate-400">
                    Orders
                  </CardTitle>
                  <CardDescription>
                    <div className="text-xl font-bold text-slate-900">
                      {orders.length}
                    </div>
                  </CardDescription>
                </div>
                <div className="flex flex-col">
                  <CardTitle className="text-sm font-normal text-slate-400">
                    Total Spent
                  </CardTitle>
                  <CardDescription>
                    <div className="text-xl font-bold text-slate-900">
                      <Currency>
                        <CurrencyValue
                          value={orders
                            .filter((o) => o.status === "COMPLETED")
                            .reduce((sum, o) => sum + o.total, 0)}
                        />
                      </Currency>
                    </div>
                  </CardDescription>
                </div>
              </div>
              {/* TODO: add search bar and filters */}
            </div>
          </CardHeader>
          <CardContent className="px-2 p-0">
            {orders.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 px-4">
                <div className="bg-slate-100 p-6 rounded-full mb-4">
                  <ShoppingBag className="h-12 w-12 text-slate-400" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">
                  No orders yet
                </h3>
                <p className="text-slate-600 text-center mb-6 max-w-sm">
                  Start shopping to see your orders here. Browse our collection
                  and find something you love!
                </p>
                <Link href="/">
                  <Button className="bg-orange-500 hover:bg-orange-600">
                    Continue Shopping
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto px-2">
                <Table>
                  <TableHeader className="bg-slate-50">
                    <TableRow className="hover:bg-slate-50">
                      <TableHead className="font-semibold text-slate-700">
                        Order ID
                      </TableHead>
                      <TableHead className="font-semibold text-slate-700">
                        Date
                      </TableHead>
                      <TableHead className="font-semibold text-slate-700">
                        Items
                      </TableHead>
                      <TableHead className="font-semibold text-slate-700">
                        Total
                      </TableHead>
                      <TableHead className="font-semibold text-slate-700">
                        Status
                      </TableHead>
                      <TableHead className="font-semibold text-slate-700">
                        Payment
                      </TableHead>
                      <TableHead className="text-right font-semibold text-slate-700">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.map((order) => (
                      <TableRow
                        key={order.id}
                        className="hover:bg-slate-50/50 transition-colors"
                      >
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-mono text-xs font-medium text-slate-900">
                              ORD_{order.id.slice(0, 8).toUpperCase()}
                            </span>
                            <span className="text-[10px] text-slate-400 uppercase mt-0.5">
                              {order.txRef}
                            </span>
                          </div>
                        </TableCell>

                        <TableCell>
                          <div className="flex items-center gap-2 text-sm text-slate-600">
                            <Calendar className="h-3.5 w-3.5 text-slate-400" />
                            {new Date(order.date).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </div>
                        </TableCell>

                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Package className="h-4 w-4 text-slate-400" />
                            <span className="text-sm font-medium text-slate-700">
                              {order.itemsCount}{" "}
                              {order.itemsCount === 1 ? "item" : "items"}
                            </span>
                          </div>
                        </TableCell>

                        <TableCell>
                          <span className="text-sm font-bold text-slate-900">
                            <Currency>
                              <CurrencyValue value={order.total} />
                            </Currency>
                          </span>
                        </TableCell>

                        <TableCell>
                          <Badge
                            className={`${statusStyles[order.status].bg} ${statusStyles[order.status].text} ${statusStyles[order.status].border} border font-semibold shadow-none px-2.5 py-1 text-xs`}
                          >
                            {order.status}
                          </Badge>
                        </TableCell>

                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div
                              className={`h-2 w-2 rounded-full ${
                                order.paymentStatus === "paid"
                                  ? "bg-emerald-500"
                                  : order.paymentStatus === "pending"
                                    ? "bg-amber-400"
                                    : "bg-red-500"
                              }`}
                            />
                            <span className="text-xs capitalize text-slate-600">
                              {order.paymentStatus}
                            </span>
                          </div>
                        </TableCell>

                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Link href={`/orders/${order.id}`}>
                              <Button
                                variant="link"
                                size="sm"
                                className="h-8 hover:text-orange-600 text-black"
                              >
                                View Details
                              </Button>
                            </Link>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
