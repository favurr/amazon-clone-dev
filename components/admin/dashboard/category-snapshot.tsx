"use client";

import { Pie, PieChart, Label, Cell } from "recharts";
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

/** * Logic: 
 * Even if the DB has 1000 items, our Server Action will return exactly 10.
 * Index 0-8: Top 9 items (mapped to --chart-1 through --chart-5, then repeating or using new vars)
 * Index 9: The "Others" aggregate (mapped to --chart-6 / gray)
 */
const rawData = [
  { id: "1", name: "Electronics", count: 450 },
  { id: "2", name: "Clothing", count: 320 },
  { id: "3", name: "Home & Garden", count: 210 },
  { id: "4", name: "Sports", count: 150 },
  { id: "5", name: "Books", count: 120 },
  { id: "6", name: "Others", count: 500 }, // Aggregated in DB
];

const chartConfig = {
  count: { label: "Stock" },
  // You can define labels here, but we'll use dynamic mapping for the fill
} satisfies ChartConfig;

export function CategorySnapshot() {
  const totalProducts = rawData.reduce((acc, curr) => acc + curr.count, 0);

  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="items-center pb-0">
        <CardTitle>Inventory Distribution</CardTitle>
        <CardDescription>Top Categories vs Others</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[250px]"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie
              data={rawData}
              dataKey="count"
              nameKey="name"
              innerRadius={60}
              strokeWidth={5}
            >
              {rawData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  // If it's the last item (Others), use chart-6 (Gray), 
                  // otherwise cycle through chart-1 to chart-5
                  fill={index === rawData.length - 1 
                    ? "var(--chart-5)" 
                    : `var(--chart-${(index % 4) + 1})`
                  } 
                />
              ))}
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle" dominantBaseline="middle">
                        <tspan x={viewBox.cx} y={viewBox.cy} className="fill-foreground text-3xl font-bold">
                          {totalProducts.toLocaleString()}
                        </tspan>
                        <tspan x={viewBox.cx} y={(viewBox.cy || 0) + 24} className="fill-muted-foreground">
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
      
      {/* Visual Legend to match the chart colors */}
      <div className="p-6 pt-0 grid grid-cols-2 gap-x-4 gap-y-2">
        {rawData.map((item, index) => (
          <div key={item.id} className="flex items-center gap-2 text-[11px]">
            <div 
              className="h-2 w-2 rounded-full" 
              style={{ 
                backgroundColor: index === rawData.length - 1 
                  ? "var(--chart-5)" 
                  : `var(--chart-${(index % 4) + 1})` 
              }} 
            />
            <span className="truncate text-slate-600 font-medium">{item.name}</span>
            <span className="ml-auto text-slate-400">{item.count}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}