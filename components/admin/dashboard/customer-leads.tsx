import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { getTopCustomers } from "@/actions/dashboard";
import { formatPrice } from "@/lib/formatters"; // Assuming you have a formatter

export async function CustomerLeads() {
  const vips = await getTopCustomers();

  return (
    <Card className="h-full flex flex-col border-none shadow-sm ring-1 ring-slate-200 overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between border-b bg-white px-6">
        <div className="">
          <CardTitle className="text-base font-semibold">Top Customers</CardTitle>
          <CardDescription>Highest revenue contributors (VIP)</CardDescription>
        </div>
      </CardHeader>
      
      <CardContent className="p-0 flex-1 overflow-hidden">
        <ScrollArea className="h-60">
          <div className="divide-y divide-slate-100">
            {vips.map((vip) => (
              <div 
                key={vip.id} 
                className="flex items-center justify-between px-6 py-4 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Avatar className="h-9 w-9 border border-slate-200">
                    <AvatarImage src={vip.image || ""} alt={vip.name} />
                    <AvatarFallback className="bg-slate-100 text-slate-600 text-xs font-bold">
                      {vip.initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="space-y-0.5">
                    <p className="text-sm font-medium leading-none text-slate-900">
                      {vip.name}
                    </p>
                    <p className="text-[11px] text-muted-foreground truncate max-w-[150px]">
                      {vip.email}
                    </p>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-sm font-bold text-emerald-600">
                    {formatPrice(vip.spent)}
                  </div>
                  <p className="text-[10px] text-slate-400 uppercase font-medium">
                    Total Spent
                  </p>
                </div>
              </div>
            ))}

            {vips.length === 0 && (
              <div className="p-12 text-center text-sm text-muted-foreground">
                No customer data available yet.
              </div>
            )}
          </div>
          <ScrollBar />
        </ScrollArea>
      </CardContent>
    </Card>
  );
}