import { getOrderDetails } from "@/actions/order-actions";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect, notFound } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  Package,
  MapPin,
  CreditCard,
  Calendar,
  Download,
  Truck,
  CheckCircle2,
  BoxIcon,
  Clock,
} from "lucide-react";
import { formatPrice } from "@/lib/formatters";
import Link from "next/link";
import Image from "next/image";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Currency, CurrencyValue } from "@/components/currency";

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

export default async function OrderDetailsPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/auth/login");
  }

  const order = await getOrderDetails(params.id, session.user.id);

  if (!order) {
    notFound();
  }

  // Calculate delivery timeline dates
  const orderDate = new Date(order.date);
  const paymentDate = new Date(order.updatedAt);
  const currentDate = new Date();

  // Add 2 days for "Out for Delivery" from payment date
  const outForDeliveryDate = new Date(paymentDate);
  outForDeliveryDate.setDate(paymentDate.getDate() + 2);

  // Add 5 days for "Delivered" from payment date
  const deliveryDate = new Date(paymentDate);
  deliveryDate.setDate(paymentDate.getDate() + 5);

  // Check delivery status
  const isOutForDelivery = currentDate >= outForDeliveryDate;
  const isDelivered = currentDate >= deliveryDate;

  return (
    <div className="min-h-screen py-8 px-4 md:px-8">
      <div className="max-w-6xl mx-auto space-y-3">
        <div className="flex items-center gap-4">
          <Link href="/orders">
            <Button variant="link" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Orders
            </Button>
          </Link>
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
              Order Details
            </h1>
            <p className="text-slate-600 mt-1">
              An email with your order invoice has been sent to{" "}
              <span className="font-semibold">{session.user.email}</span>.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              Download Invoice
            </Button>
            {order.status === "COMPLETED" && (
              <Button className="bg-orange-500 hover:bg-orange-600 gap-2">
                <Package className="h-4 w-4" />
                Track Shipment
              </Button>
            )}
          </div>
        </div>

        <Card className="p-6">
          <div className="flex flex-row justify-between items-center">
            <div className="flex flex-row gap-6">
              <div>
                <CardTitle className="text-sm font-normal text-slate-400">
                  Order Number
                </CardTitle>
                <CardDescription className="text-sm font-bold text-slate-900">
                  ORD_{order.id.slice(0, 8).toUpperCase()}
                </CardDescription>
              </div>
              <div>
                <CardTitle className="text-sm font-normal text-slate-400">
                  Order Date
                </CardTitle>
                <CardDescription className="text-sm font-bold text-slate-900">
                  {new Date(order.date).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </CardDescription>
              </div>
            </div>
            <div>
              <Badge
                className={`px-4 py-2 font-semibold rounded-full border ${statusStyles[order.status].bg} ${statusStyles[order.status].text} ${statusStyles[order.status].border}`}
              >
                ORDER {order.status}
              </Badge>
            </div>
          </div>
        </Card>

        <div className="flex flex-col lg:flex-row gap-6">
          <div className="lg:flex-1">
            <Card className="lg:col-span-2 border-slate-200 shadow-sm">
              <CardHeader>
                <CardTitle className="flex flex-row items-center gap-2">
                  <BoxIcon className="h-5 w-5 text-slate-600" /> Items Ordered
                </CardTitle>
              </CardHeader>
              <CardContent className="p-2 pt-0">
                <Table>
                  <TableBody>
                    {order.items.map((item) => (
                      <TableRow key={item.id} className="hover:bg-slate-50/50">
                        <TableCell>
                          <div className="flex items-center gap-4">
                            <div className="relative h-16 w-16 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden shrink-0">
                              {item.product.mainImageUrl ? (
                                <Image
                                  src={item.product.mainImageUrl}
                                  alt={item.product.title}
                                  fill
                                  className="object-cover"
                                />
                              ) : (
                                <Package className="h-6 w-6 m-auto absolute inset-0 text-slate-300" />
                              )}
                            </div>
                            <div className="flex flex-col">
                              <span className="font-semibold text-slate-900 leading-tight">
                                {item.product.title}
                              </span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant="outline" className="font-semibold">
                            {item.quantity}{" "}
                            {item.quantity === 1 ? "item" : "items"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-medium text-slate-700">
                          <Currency>
                            <CurrencyValue value={item.price} />
                          </Currency>
                        </TableCell>
                        <TableCell className="text-right font-bold text-slate-900">
                          <Currency>
                            <CurrencyValue value={item.price * item.quantity} />
                          </Currency>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                <div className="p-6 bg-slate-50 border-t border-slate-200">
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Subtotal</span>
                      <span className="font-medium text-slate-900">
                        <Currency>
                          <CurrencyValue value={order.subtotal} />
                        </Currency>
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Shipping</span>
                      <span className="font-medium text-slate-900">Free</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Tax</span>
                      <span className="font-medium text-slate-900">
                        <Currency>
                          <CurrencyValue value={order.subtotal * 0.00312} />
                        </Currency>
                      </span>
                    </div>
                    <Separator className="my-2" />
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-bold text-slate-900">
                        Total
                      </span>
                      <span className="text-2xl font-bold text-orange-600">
                        <Currency>
                          <CurrencyValue value={order.total} />
                        </Currency>
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Delivery & Payment Info */}
          <div className="lg:w-96 space-y-6">
            {/* Shipping Address */}
            <Card className="border-slate-200 shadow-sm">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-slate-600" />
                  Shipping Address
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm text-slate-700">
                  <p className="font-semibold text-slate-900">
                    {order.address.streetAddress}
                  </p>
                  <p>
                    {order.address.city}, {order.address.state}
                  </p>
                  <p>{order.address.postalCode}</p>
                  <p className="font-medium">{order.address.country}</p>
                </div>
                <Separator className="my-4" />
                <div className="flex items-center gap-3 text-sm text-slate-700">
                  <Calendar className="h-4 w-4 text-slate-400" />
                  <span>
                    Ordered on{" "}
                    {new Date(order.date).toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                </div>
                <div className="flex items-center pt-2 gap-3 text-sm text-slate-700">
                  <Truck className="h-4 w-4 text-slate-400" />
                  <span>
                    Estimated delivery:{" "}
                    {new Date(
                      new Date(order.date).getTime() + 5 * 24 * 60 * 60 * 1000,
                    ).toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Payment Information */}
            <Card className="border-slate-200 shadow-sm">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-slate-600" />
                  Payment Method
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    {order.cardNetwork?.toLowerCase() === "visa" && (
                      <Image
                        src="/cards/Viv.png"
                        alt="Visa"
                        width={32}
                        height={20}
                        className="rounded-sm"
                      />
                    )}
                    {order.cardNetwork?.toLowerCase() === "mastercard" && (
                      <Image
                        src="/cards/mc.png"
                        alt="Mastercard"
                        width={32}
                        height={10}
                        className="rounded-sm"
                      />
                    )}
                    <span className="font-mono text-xs font-medium text-slate-900">
                      {order.cardNetwork?.toUpperCase() ?? "CARD"} ending in{" "}
                      {order.cardLast4}
                    </span>
                  </div>
                  {order.flwId && (
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Paystack ID</span>
                      <span className="font-mono text-xs font-medium text-slate-900">
                        {order.flwId}
                      </span>
                    </div>
                  )}
                  <Separator />
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600 text-sm">Status</span>
                    <div className="flex items-center gap-2">
                      {order.paymentStatus === "success" && (
                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                      )}
                      <span className="font-semibold capitalize text-slate-900">
                        {order.paymentStatus}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Order Timeline (if status is completed) */}
            {order.status === "COMPLETED" && (
              <Card className="border-slate-200 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Truck className="h-5 w-5 text-slate-600" />
                    Order Timeline
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Order Confirmed */}
                    <div className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div className="h-2 w-2 rounded-full bg-emerald-500" />
                        <div className="w-0.5 h-full bg-emerald-200 mt-1" />
                      </div>
                      <div className="pb-4">
                        <p className="text-sm font-semibold text-slate-900">
                          Order Confirmed
                        </p>
                        <p className="text-xs text-slate-500 mt-1">
                          {orderDate.toLocaleString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                            hour: "numeric",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>

                    {/* Payment Received */}
                    <div className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div className="h-2 w-2 rounded-full bg-emerald-500" />
                        {(isOutForDelivery || !isDelivered) && (
                          <div className="w-0.5 h-full bg-emerald-200 mt-1" />
                        )}
                      </div>
                      <div className="pb-4">
                        <p className="text-sm font-semibold text-slate-900">
                          Payment Received
                        </p>
                        <p className="text-xs text-slate-500 mt-1">
                          {paymentDate.toLocaleString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                            hour: "numeric",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>

                    {/* Out for Delivery - Shows after 2 days */}
                    {isOutForDelivery && (
                      <div className="flex gap-3">
                        <div className="flex flex-col items-center">
                          <div
                            className={`h-2 w-2 rounded-full ${
                              isDelivered ? "bg-emerald-500" : "bg-amber-400"
                            }`}
                          />
                          {!isDelivered && (
                            <div className="w-0.5 h-full bg-amber-200 mt-1" />
                          )}
                        </div>
                        <div className="pb-4">
                          <div className="flex items-center gap-2">
                            <p
                              className={`text-sm font-semibold ${
                                isDelivered
                                  ? "text-slate-900"
                                  : "text-amber-700"
                              }`}
                            >
                              Out for Delivery
                            </p>
                            {!isDelivered && (
                              <Clock className="h-3.5 w-3.5 text-amber-500" />
                            )}
                          </div>
                          <p className="text-xs text-slate-500 mt-1">
                            {outForDeliveryDate.toLocaleString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                              hour: "numeric",
                              minute: "2-digit",
                            })}
                          </p>
                          {!isDelivered && (
                            <p className="text-xs text-amber-600 mt-1 font-medium">
                              In Transit
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Delivered - Shows after 5 days */}
                    {isDelivered && (
                      <div className="flex gap-3">
                        <div className="flex flex-col items-center">
                          <div className="h-2 w-2 rounded-full bg-emerald-500" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-semibold text-slate-900">
                              Delivered
                            </p>
                            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                          </div>
                          <p className="text-xs text-slate-500 mt-1">
                            {deliveryDate.toLocaleString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                              hour: "numeric",
                              minute: "2-digit",
                            })}
                          </p>
                          <p className="text-xs text-emerald-600 mt-1 font-medium">
                            Successfully Delivered
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Expected Delivery - Shows if not yet delivered */}
                    {!isDelivered && (
                      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="flex items-start gap-2">
                          <Package className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
                          <div>
                            <p className="text-xs font-semibold text-blue-900">
                              Expected Delivery
                            </p>
                            <p className="text-xs text-blue-700 mt-1">
                              {deliveryDate.toLocaleDateString("en-US", {
                                month: "long",
                                day: "numeric",
                                year: "numeric",
                              })}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
