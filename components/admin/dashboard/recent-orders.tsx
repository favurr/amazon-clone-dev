import Link from "next/link";
import { ArrowUpRight, User } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { getRecentOrders } from "@/actions/dashboard";
import { formatPrice } from "@/lib/formatters";

export async function RecentOrders() {
  const orders = await getRecentOrders();

  const getStatusStyles = (status: string) => {
    switch (status.toUpperCase()) {
      case "COMPLETED":
      case "SUCCESS":
        return "border-emerald-200 bg-emerald-50 text-emerald-700";
      case "PENDING":
      case "PROCESSING":
        return "border-amber-200 bg-amber-50 text-amber-700";
      case "FAILED":
      case "ERROR":
        return "border-red-200 bg-red-50 text-red-700";
      case "CANCELED":
      case "CANCELLED":
        return "border-slate-200 bg-slate-100 text-slate-600";
      default:
        return "border-slate-200 bg-slate-50 text-slate-700";
    }
  };

  return (
    <Card className="h-full flex flex-col border-none shadow-sm ring-1 ring-slate-200 overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between border-b bg-white z-10">
        <div className="space-y-1">
          <CardTitle className="text-base font-semibold">Recent Orders</CardTitle>
          <CardDescription>
            {orders.length > 0 ? "Latest customer activity" : "No recent orders"}
          </CardDescription>
        </div>
        <Button asChild variant="ghost" size="sm" className="h-8 text-slate-600 hover:bg-slate-100">
          <Link href="/admin/orders" className="flex items-center gap-1">
            View All <ArrowUpRight className="h-4 w-4" />
          </Link>
        </Button>
      </CardHeader>

      <CardContent className="p-0 flex-1 overflow-hidden">
        <ScrollArea className="h-60">
          <div className="">
            {orders.map((order) => (
              <div 
                key={order.id} 
                className="flex items-center justify-between px-6 py-4 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 ring-1 ring-slate-200">
                    <User className="h-4 w-4" />
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-sm font-medium leading-none text-slate-900">
                      {order.customer}
                    </p>
                    <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">
                      #{order.id}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <Badge 
                    variant="outline" 
                    className={`text-[10px] uppercase px-2 py-0 h-5 font-bold whitespace-nowrap ${getStatusStyles(order.status)}`}
                  >
                    {order.status}
                  </Badge>
                  <div className="text-sm font-bold text-slate-900 min-w-[70px] text-right">
                    {formatPrice(order.amount)}
                  </div>
                </div>
              </div>
            ))}

            {orders.length === 0 && (
              <div className="p-8 text-center text-sm text-muted-foreground">
                No orders found.
              </div>
            )}
          </div>
          <ScrollBar />
        </ScrollArea>
      </CardContent>
    </Card>
  );
}