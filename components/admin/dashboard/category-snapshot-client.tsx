"use client";

import { Pie, PieChart, Label, Cell } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

const chartConfig = {
  count: { label: "Units" },
} satisfies ChartConfig;

export function CategorySnapshotClient({ data }: { data: any[] }) {
  const totalProducts = data.reduce((acc, curr) => acc + curr.count, 0);

  return (
    <Card className="flex flex-col h-full border-none shadow-sm ring-1 ring-slate-200">
      <CardHeader className="flex flex-row items-center justify-between border-b bg-white px-6">
        <div className="">
        <CardTitle className="text-base font-semibold">Inventory Distribution</CardTitle>
        <CardDescription>Stock units by Category</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[250px]"
        >
          <PieChart>
            <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
            <Pie
              data={data}
              dataKey="count"
              nameKey="name"
              innerRadius={65}
              strokeWidth={8}
              stroke="white"
            >
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  // If it's the last item (and named Others), use a neutral slate
                  fill={entry.name === "Others" 
                    ? "#94a3b8" 
                    : `var(--chart-${(index % 5) + 1})`
                  } 
                />
              ))}
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle" dominantBaseline="middle">
                        <tspan x={viewBox.cx} y={viewBox.cy} className="fill-slate-900 text-3xl font-bold">
                          {totalProducts.toLocaleString()}
                        </tspan>
                        <tspan x={viewBox.cx} y={(viewBox.cy || 0) + 24} className="fill-slate-500 text-xs font-medium uppercase tracking-wider">
                          Total Units
                        </tspan>
                      </text>
                    );
                  }
                }}
              />
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>
      
      {/* Legend Grid */}
      <div className="p-6 pt-2 grid grid-cols-2 gap-x-4 gap-y-3">
        {data.map((item, index) => (
          <div key={item.id} className="flex items-center gap-2 text-[11px]">
            <div 
              className="h-2 w-2 rounded-full shrink-0" 
              style={{ 
                backgroundColor: item.name === "Others" 
                  ? "#94a3b8" 
                  : `var(--chart-${(index % 5) + 1})` 
              }} 
            />
            <span className="truncate text-slate-600 font-medium capitalize">{item.name}</span>
            <span className="ml-auto text-slate-400 font-mono">{item.count}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}