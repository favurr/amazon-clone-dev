import Link from "next/link";
import { AlertTriangle, ArrowUpRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const lowStockItems = [
  { name: "Wireless Headphones", variant: "Black", stock: 0 },
  { name: "Running Shoes", variant: "Size 10", stock: 2 },
  { name: "Mechanical Keyboard", variant: "Blue Switch", stock: 4 },
  { name: "Gaming Mouse", variant: "White", stock: 1 },
];

export function InventoryStatus() {
  return (
    <Card className="h-full border-l-4 border-l-orange-500">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-orange-500" />
          Low Stock Alert
        </CardTitle>
        <Button asChild variant="ghost" size="sm">
            <Link href="/admin/products">Manage Inventory</Link>
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {lowStockItems.map((item, i) => (
            <div key={i} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
              <div>
                <p className="font-medium text-sm">{item.name}</p>
                <p className="text-xs text-muted-foreground">Variant: {item.variant}</p>
              </div>
              <div className={`px-2 py-1 rounded text-xs font-bold ${item.stock === 0 ? "bg-red-100 text-red-600" : "bg-orange-100 text-orange-600"}`}>
                {item.stock} left
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}