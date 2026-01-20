import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const vips = [
  { name: "Alice Freeman", email: "alice@example.com", spent: "$1,200", initials: "AF" },
  { name: "Bob Smith", email: "bob@test.com", spent: "$980", initials: "BS" },
  { name: "Charlie Day", email: "charlie@day.com", spent: "$850", initials: "CD" },
];

export function CustomerLeads() {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Top Customers (VIP)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {vips.map((vip, i) => (
            <div key={i} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="h-9 w-9">
                  <AvatarImage src={`/avatars/${i}.png`} />
                  <AvatarFallback>{vip.initials}</AvatarFallback>
                </Avatar>
                <div className="space-y-1">
                  <p className="text-sm font-medium leading-none">{vip.name}</p>
                  <p className="text-xs text-muted-foreground">{vip.email}</p>
                </div>
              </div>
              <div className="font-bold text-sm text-green-600">{vip.spent}</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}