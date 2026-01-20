import { Suspense } from "react";
import { OverviewMetrics } from "@/components/admin/dashboard/overview-metrics";
import { RevenueStream } from "@/components/admin/dashboard/revenue-stream";
import { RecentOrders } from "@/components/admin/dashboard/recent-orders";
import { InventoryStatus } from "@/components/admin/dashboard/inventory-status";
import { CategorySnapshot } from "@/components/admin/dashboard/category-snapshot";
import { CustomerLeads } from "@/components/admin/dashboard/customer-leads";
import { ReviewFeed } from "@/components/admin/dashboard/review-feed";
import { Skeleton } from "@/components/ui/skeleton";

export default async function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* 1. PULSE HEADER */}
      <Suspense fallback={<MetricsSkeleton />}>
        <OverviewMetrics />
      </Suspense>

      {/* 2. COMMERCIAL SECTION (60/40 Split) */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3">
          <Suspense fallback={<DashboardCardSkeleton />}>
            <RevenueStream />
          </Suspense>
        </div>
        <div className="lg:col-span-2">
          <Suspense fallback={<DashboardCardSkeleton />}>
            <RecentOrders />
          </Suspense>
        </div>
      </div>

      {/* 3. INVENTORY & TAXONOMY (50/50 Split) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Suspense fallback={<DashboardCardSkeleton />}>
          <InventoryStatus />
        </Suspense>
        <Suspense fallback={<DashboardCardSkeleton />}>
          <CategorySnapshot />
        </Suspense>
      </div>

      {/* 4. SOCIAL & GROWTH (50/50 Split) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Suspense fallback={<DashboardCardSkeleton />}>
          <CustomerLeads />
        </Suspense>
        <Suspense fallback={<DashboardCardSkeleton />}>
          <ReviewFeed />
        </Suspense>
      </div>
    </div>
  );
}

function MetricsSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {[...Array(4)].map((_, i) => (
        <Skeleton key={i} className="h-32 animate-pulse rounded-xl" />
      ))}
    </div>
  );
}

function DashboardCardSkeleton() {
  return <Skeleton className="h-[400px] w-full animate-pulse rounded-xl" />;
}