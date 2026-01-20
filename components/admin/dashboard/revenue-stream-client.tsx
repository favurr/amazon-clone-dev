"use client";

import * as React from "react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

// Force a strong Blue or Emerald for that "Crypto Profit" look
const chartConfig = {
  revenue: { 
    label: "Revenue", 
    color: "#2563eb" // High-contrast Blue
  },
} satisfies ChartConfig;

type TimeFrame = "today" | "week" | "month" | "year";

export function RevenueStreamClient({ allCharts }: { allCharts: any; summary: any }) {
  const [activeTab, setActiveTab] = React.useState<TimeFrame>("month");

  return (
    <Card className="flex flex-col h-full border-none shadow-sm ring-1 ring-slate-200">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 px-6 py-0 border-b">
        <div className="flex flex-col gap-1">
          <CardTitle className="text-base font-semibold">Revenue Trend</CardTitle>
          <CardDescription>Visualizing cash flow performance</CardDescription>
        </div>

        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg border border-slate-200">
          {(["today", "week", "month", "year"] as TimeFrame[]).map((key) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md capitalize transition-all ${
                activeTab === key
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              {key}
            </button>
          ))}
        </div>
      </CardHeader>

      <CardContent className="px-2 pt-2 sm:px-6 sm:pt-2">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-60 w-full"
        >
          <AreaChart data={allCharts[activeTab]} margin={{ left: 12, right: 12, top: 10 }}>
            <defs>
              <linearGradient id="fillRevenue" x1="0" y1="0" x2="0" y2="1">
                {/* We use the hex color directly to ensure visibility */}
                <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                const date = new Date(value);
                return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
              }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(v) => `$${v}`}
            />
            {/* cursor={true} adds that vertical line when hovering like crypto apps */}
            <ChartTooltip cursor={{ stroke: '#cbd5e1', strokeWidth: 1 }} content={<ChartTooltipContent />} />
            <Area
              dataKey="revenue"
              type="monotone"
              stroke="#2563eb" 
              strokeWidth={3} // Thick visible line
              fillOpacity={1}
              fill="url(#fillRevenue)"
              activeDot={{ r: 6, style: { fill: "#2563eb", strokeOpacity: 0.5 } }}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}