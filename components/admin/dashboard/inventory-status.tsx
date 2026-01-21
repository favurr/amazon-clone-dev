// components/admin/dashboard/inventory-status.tsx
import Link from "next/link";
import { AlertTriangle, PackageSearch } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { getLowStockItems } from "@/actions/dashboard";

export async function InventoryStatus() {
  const lowStockItems = await getLowStockItems();

  return (
    <Card className="h-full flex flex-col border-none shadow-sm ring-1 ring-slate-200 border-l-4 border-l-orange-500 overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between border-b bg-white px-6">
        <div className="">
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <AlertTriangle className="h-4 w-4 text-orange-500" />
            Stock Alerts
          </CardTitle>
          <CardDescription>Variant levels requiring restock</CardDescription>
        </div>
        <Button asChild variant="ghost" size="sm" className="h-8 text-slate-600 hover:bg-slate-100">
          <Link href="/admin/products">Manage</Link>
        </Button>
      </CardHeader>

      <CardContent className="p-0 flex-1 overflow-hidden">
        <ScrollArea className="h-60">
          <div className="divide-y divide-slate-100">
            {lowStockItems.map((item, i) => {
              const isOut = item.stock === 0;
              // visual bar logic
              const stockLevel = Math.min((item.stock / 10) * 100, 100);

              return (
                <div key={i} className="px-6 py-4 hover:bg-slate-50 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <div className="max-w-[70%]">
                      <p className="font-medium text-sm text-slate-900 truncate">
                        {item.name}
                      </p>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-tight">
                        {item.variant}
                      </p>
                    </div>
                    <div className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                      isOut ? "bg-red-100 text-red-600" : "bg-orange-100 text-orange-600"
                    }`}>
                      {isOut ? "Out" : `${item.stock} left`}
                    </div>
                  </div>
                  
                  <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-500 ${isOut ? "bg-red-500" : "bg-orange-500"}`}
                      style={{ width: `${stockLevel}%` }}
                    />
                  </div>
                </div>
              );
            })}

            {lowStockItems.length === 0 && (
              <div className="flex flex-col items-center justify-center p-12 text-center text-muted-foreground">
                <PackageSearch className="h-8 w-8 mb-2 opacity-20" />
                <p className="text-sm">All variants are well stocked.</p>
              </div>
            )}
          </div>
          <ScrollBar />
        </ScrollArea>
      </CardContent>
    </Card>
  );
}