import { getCustomersData } from "@/actions/customers";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, UserCheck, Users, DollarSign, MoreHorizontal, Mail } from "lucide-react";
import { formatPrice } from "@/lib/formatters";
import { Button } from "@/components/ui/button";

export default async function CustomersPage({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  const query = searchParams.q || "";
  const { customers, stats } = await getCustomersData(query);

  return (
    <div className="flex-1 space-y-3 px-4">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight text-slate-900">Customers</h2>
        <div className="flex items-center space-x-2">
          <Button>Export CSV</Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-none shadow-sm gap-3 py-4 px-4 ring-1 ring-slate-200">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
            <Users className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCount}</div>
            <p className="text-xs text-muted-foreground">Registered users (excluding admins)</p>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm gap-3 py-4 px-4 ring-1 ring-slate-200">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium">VIP Members</CardTitle>
            <UserCheck className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{stats.vipCount}</div>
            <p className="text-xs text-muted-foreground">More than 5 orders or $1,000 spent</p>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm gap-3 py-4 px-4 ring-1 ring-slate-200">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium">Total Customer LTV</CardTitle>
            <DollarSign className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">{formatPrice(stats.totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">Cumulative value across database</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Table */}
      <div className="space-y-4">
        <form className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input 
            placeholder="Search name or email..." 
            name="q"
            defaultValue={query}
            className="pl-10 border-slate-200 focus-visible:ring-blue-500" 
          />
        </form>

        <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead className="py-4">Customer</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Purchases</TableHead>
                <TableHead>Lifetime Value</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="text-right">Manage</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customers.map((customer) => (
                <TableRow key={customer.id} className="group hover:bg-slate-50/50">
                  <TableCell className="py-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9 ring-1 ring-slate-200">
                        <AvatarImage src={customer.image || ""} />
                        <AvatarFallback className="text-[10px] font-bold">
                          {customer.name.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="font-semibold text-slate-900">{customer.name}</span>
                        <span className="text-xs text-slate-500">{customer.email}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {customer.isVIP ? (
                      <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-100 border-none px-2 font-bold text-[10px]">VIP</Badge>
                    ) : (
                      <Badge variant="outline" className="text-slate-500 border-slate-200 text-[10px]">REGULAR</Badge>
                    )}
                  </TableCell>
                  <TableCell className="font-medium">{customer.totalOrders} orders</TableCell>
                  <TableCell className="font-bold text-slate-900">{formatPrice(customer.totalSpent)}</TableCell>
                  <TableCell className="text-xs text-slate-500">
                    {new Date(customer.joinedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Mail className="h-4 w-4 text-slate-400" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4 text-slate-400" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {customers.length === 0 && (
            <div className="p-20 text-center text-slate-500 italic">
              No customers found matching your search.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}