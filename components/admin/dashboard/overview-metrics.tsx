import { DollarSign, Package, Users, Star } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getDashboardMetrics } from "@/actions/dashboard";
import { formatPrice } from "@/lib/formatters";

export async function OverviewMetrics() {
  const data = await getDashboardMetrics();

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <MetricCard
        title="Total Revenue"
        value={formatPrice(data.totalRevenue)}
        icon={DollarSign}
        trend="All-time earnings"
      />
      <MetricCard
        title="Total Customers"
        value={data.customerCount.toLocaleString()}
        icon={Users}
        trend="Registered users"
      />
      <MetricCard
        title="Active Listings"
        value={data.productCount.toLocaleString()}
        icon={Package}
        trend={`${data.lowStockCount} items low stock`}
        trendColor={data.lowStockCount > 0 ? "text-orange-600" : "text-emerald-600"}
      />
      <MetricCard
        title="Avg. Rating"
        value={data.averageRating.toFixed(1)}
        icon={Star}
        trend="From customer reviews"
      />
    </div>
  );
}

function MetricCard({ title, value, icon: Icon, trend, trendColor = "text-emerald-600" }: any) {
  return (
    <Card className="border-none shadow-sm gap-2 py-2 ring-1 ring-slate-200">
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-[11px] font-bold uppercase tracking-widest text-slate-500">
          {title}
        </CardTitle>
        <div className="p-2 bg-slate-50 rounded-lg">
          <Icon className="h-4 w-4 text-slate-600" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold tracking-tight text-slate-900">{value}</div>
        <p className={`text-[10px] font-semibold mt-1 flex items-center gap-1 ${trendColor}`}>
          {trend}
        </p>
      </CardContent>
    </Card>
  );
}