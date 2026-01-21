import { getOrdersData } from "@/actions/orders";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search, Package, Clock, CheckCircle2, MoreVertical, CreditCard } from "lucide-react";
import { formatPrice } from "@/lib/formatters";
import { Button } from "@/components/ui/button";

const statusStyles: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-700 border-amber-200",
  COMPLETED: "bg-emerald-100 text-emerald-700 border-emerald-200",
  FAILED: "bg-red-100 text-red-700 border-red-200",
  CANCELLED: "bg-slate-100 text-slate-700 border-slate-200",
};

export default async function OrdersPage({ searchParams }: { searchParams: { q?: string } }) {
  const { orders, stats } = await getOrdersData(searchParams.q);

  return (
    <div className="flex-1 space-y-8 p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight text-slate-900">Orders</h2>
        <Button variant="outline" className="gap-2">
          <CreditCard className="h-4 w-4" /> Reconciliation
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-none shadow-sm ring-1 ring-slate-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pending Shipment</CardTitle>
            <Clock className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pending}</div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm ring-1 ring-slate-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Completed Orders</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completed}</div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm ring-1 ring-slate-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Net Revenue</CardTitle>
            <div className="text-xs font-bold text-emerald-600">NGN</div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPrice(stats.totalRevenue)}</div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <form className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input placeholder="Search Order ID or Ref..." name="q" defaultValue={searchParams.q} className="pl-10" />
        </form>

        <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id} className="hover:bg-slate-50/50">
                  <TableCell className="font-mono text-[10px] text-slate-500">
                    {order.id.split('-')[0]}...
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium text-sm">{order.customerName}</span>
                      <span className="text-[10px] text-slate-400 uppercase">{order.txRef}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={`${statusStyles[order.status]} border shadow-none px-2 py-0 text-[10px] font-bold`}>
                      {order.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5">
                      <div className={`h-1.5 w-1.5 rounded-full ${order.paymentStatus === 'success' ? 'bg-emerald-500' : 'bg-amber-400'}`} />
                      <span className="text-xs capitalize text-slate-600">{order.paymentStatus}</span>
                    </div>
                  </TableCell>
                  <TableCell className="font-bold text-slate-900">{formatPrice(order.total)}</TableCell>
                  <TableCell className="text-xs text-slate-500">
                    {new Date(order.date).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}