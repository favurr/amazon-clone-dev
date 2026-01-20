import { getRevenueDashboardData } from "@/actions/dashboard";
import { RevenueStreamClient } from "./revenue-stream-client";

export async function RevenueStream() {
  const data = await getRevenueDashboardData();

  if (!data)
    return (
      <div className="h-[400px] border rounded-xl bg-slate-50 flex items-center justify-center">
        No data
      </div>
    );

  return <RevenueStreamClient allCharts={data.charts} summary={data.summary} />;
}
