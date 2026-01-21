"use client";

import { useEffect, useState, useTransition, useCallback } from "react";
import {
  Plus,
  Edit2,
  Trash2,
  Search,
  Image as ImageIcon,
  Filter,
  ChevronLeft,
  ChevronRight,
  Package,
  Tag,
  Calendar,
  DollarSign,
  Archive,
  Star,
  MoreVertical,
  Eye,
  Copy,
  RefreshCw,
  Download,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { deleteProduct, getAdminProducts } from "@/actions/product";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ProductFormDialog } from "@/components/admin/product-form-dialog";
import { EditProductDialog } from "@/components/admin/edit-product-dialog";
import { format } from "date-fns";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function ProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  // Pagination & Search State
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<"all" | "featured" | "archived">("all");

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);

  // Stats
  const [stats, setStats] = useState({
    total: 0,
    featured: 0,
    archived: 0,
    lowStock: 0,
  });

  const loadProducts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getAdminProducts({
        page: currentPage,
        pageSize,
        search: searchQuery,
      });

      const sanitized = res.data.map((p: any) => ({
        ...p,
        titlePrice: Number(p.titlePrice),
        discountedPrice: p.discountedPrice ? Number(p.discountedPrice) : null,
      }));

      // Filter based on view mode
      let filtered = sanitized;
      if (viewMode === "featured") {
        filtered = sanitized.filter((p: any) => p.isFeatured);
      } else if (viewMode === "archived") {
        filtered = sanitized.filter((p: any) => p.isArchived);
      }

      setProducts(filtered);
      setTotalPages(res.totalPages);

      // Calculate stats
      setStats({
        total: res.totalCount,
        featured: sanitized.filter((p: any) => p.isFeatured).length,
        archived: sanitized.filter((p: any) => p.isArchived).length,
        lowStock: sanitized.filter((p: any) => (p.totalStock || 0) < 10).length,
      });
    } catch (err) {
      toast.error("Failed to fetch products");
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchQuery, pageSize, viewMode, toast]);

  useEffect(() => {
    const handler = setTimeout(() => {
      loadProducts();
    }, 300);

    return () => clearTimeout(handler);
  }, [loadProducts]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const onEditClick = (product: any) => {
    setSelectedProduct({
      ...product,
      tags:
        product.tags?.map((t: any) => (typeof t === "string" ? t : t.name)) ||
        [],
    });
    setIsEditOpen(true);
  };

  const handleDelete = async (id: string) => {
    startTransition(async () => {
      const res = await deleteProduct(id);
      if (res.success) {
        toast.success("Product deleted");
        loadProducts();
      } else {
        toast.error(res.error || "Failed to delete product");
      }
    });
  };

  const toggleSelectProduct = (id: string) => {
    setSelectedProducts((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedProducts.length === products.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(products.map((p) => p.id));
    }
  };

  const getDiscountPercentage = (original: number, discounted: number) => {
    return Math.round(((original - discounted) / original) * 100);
  };

  return (
    <div className="min-h-screen space-y-6 font-sans">
      {/* ENHANCED HEADER WITH STATS */}
      <div className="bg-gradient-to-br from-slate-50 to-slate-100/50 border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="p-6">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-3 rounded-xl shadow-lg shadow-orange-500/20">
                <Package className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                  Product Inventory
                </h1>
                <p className="text-sm text-slate-600 mt-1">
                  Manage and organize your product catalog
                </p>
              </div>
            </div>

            <Button
              onClick={() => setIsAddOpen(true)}
              className="h-10 px-6 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold shadow-lg shadow-orange-500/30 transition-all hover:shadow-xl hover:shadow-orange-500/40 hover:-translate-y-0.5"
            >
              <Plus className="mr-2 h-4 w-4" /> Add Product
            </Button>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg p-4 border border-slate-200 hover:border-blue-300 transition-colors group">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Total Products
                  </p>
                  <p className="text-2xl font-bold text-slate-900 mt-1">
                    {stats.total}
                  </p>
                </div>
                <div className="bg-blue-50 p-3 rounded-lg group-hover:bg-blue-100 transition-colors">
                  <Package className="h-5 w-5 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-4 border border-slate-200 hover:border-amber-300 transition-colors group">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Featured
                  </p>
                  <p className="text-2xl font-bold text-slate-900 mt-1">
                    {stats.featured}
                  </p>
                </div>
                <div className="bg-amber-50 p-3 rounded-lg group-hover:bg-amber-100 transition-colors">
                  <Star className="h-5 w-5 text-amber-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-4 border border-slate-200 hover:border-red-300 transition-colors group">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Low Stock
                  </p>
                  <p className="text-2xl font-bold text-slate-900 mt-1">
                    {stats.lowStock}
                  </p>
                </div>
                <div className="bg-red-50 p-3 rounded-lg group-hover:bg-red-100 transition-colors">
                  <AlertCircle className="h-5 w-5 text-red-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-4 border border-slate-200 hover:border-slate-400 transition-colors group">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Archived
                  </p>
                  <p className="text-2xl font-bold text-slate-900 mt-1">
                    {stats.archived}
                  </p>
                </div>
                <div className="bg-slate-100 p-3 rounded-lg group-hover:bg-slate-200 transition-colors">
                  <Archive className="h-5 w-5 text-slate-600" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Toolbar */}
        <div className="bg-white border-t border-slate-200 px-6 py-4">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex items-center gap-3 w-full md:w-auto">
              {/* Search */}
              <div className="relative flex-1 md:w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search products by name, SKU, or category..."
                  className="pl-10 h-10 bg-slate-50 border-slate-200 focus-visible:ring-orange-500/20 focus-visible:border-orange-500"
                  value={searchQuery}
                  onChange={handleSearchChange}
                />
              </div>

              {/* View Mode Filter */}
              <Select value={viewMode} onValueChange={(value: any) => setViewMode(value)}>
                <SelectTrigger className="w-[140px] h-10 bg-slate-50 border-slate-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Products</SelectItem>
                  <SelectItem value="featured">Featured</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              {selectedProducts.length > 0 && (
                <Badge variant="secondary" className="h-10 px-4">
                  {selectedProducts.length} selected
                </Badge>
              )}
              
              <Button
                variant="outline"
                size="sm"
                className="h-10 gap-2"
                onClick={loadProducts}
              >
                <RefreshCw className="h-4 w-4" />
                Refresh
              </Button>

              <Button variant="outline" size="sm" className="h-10 gap-2">
                <Download className="h-4 w-4" />
                Export
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* ENHANCED TABLE */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-gradient-to-r from-slate-50 to-slate-100/50">
            <TableRow className="hover:bg-transparent border-b border-slate-200">
              <TableHead className="w-[40px] pl-6">
                <Checkbox
                  checked={
                    products.length > 0 &&
                    selectedProducts.length === products.length
                  }
                  onCheckedChange={toggleSelectAll}
                  className="border-slate-400"
                />
              </TableHead>
              <TableHead className="font-bold text-slate-700 text-xs uppercase tracking-wider">
                Product
              </TableHead>
              <TableHead className="font-bold text-slate-700 text-xs uppercase tracking-wider">
                Category
              </TableHead>
              <TableHead className="font-bold text-slate-700 text-xs uppercase tracking-wider text-right">
                Pricing
              </TableHead>
              <TableHead className="font-bold text-slate-700 text-xs uppercase tracking-wider text-center">
                Stock
              </TableHead>
              <TableHead className="font-bold text-slate-700 text-xs uppercase tracking-wider text-center">
                Status
              </TableHead>
              <TableHead className="font-bold text-slate-700 text-xs uppercase tracking-wider text-right pr-6">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="h-64 text-center"
                >
                  <div className="flex flex-col items-center justify-center gap-3">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-500"></div>
                    <p className="text-sm text-slate-500">Loading products...</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : products.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="h-64 text-center"
                >
                  <div className="flex flex-col items-center justify-center gap-3">
                    <div className="bg-slate-100 p-4 rounded-full">
                      <Package className="h-10 w-10 text-slate-400" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">No products found</p>
                      <p className="text-sm text-slate-500 mt-1">
                        {searchQuery
                          ? "Try adjusting your search terms"
                          : "Get started by adding your first product"}
                      </p>
                    </div>
                    {!searchQuery && (
                      <Button
                        onClick={() => setIsAddOpen(true)}
                        className="mt-2"
                      >
                        <Plus className="mr-2 h-4 w-4" /> Add Product
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              products.map((product) => (
                <TableRow
                  key={product.id}
                  className={cn(
                    "group hover:bg-slate-50/50 border-b transition-all",
                    selectedProducts.includes(product.id) && "bg-orange-50/30"
                  )}
                >
                  <TableCell className="pl-6">
                    <Checkbox
                      checked={selectedProducts.includes(product.id)}
                      onCheckedChange={() => toggleSelectProduct(product.id)}
                      className="border-slate-400"
                    />
                  </TableCell>

                  <TableCell className="py-3">
                    <div className="flex items-center gap-4">
                      <div className="relative h-14 w-14 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden shrink-0 shadow-sm group-hover:shadow-md transition-shadow">
                        {product.mainImageUrl ? (
                          <Image
                            src={product.mainImageUrl}
                            alt={product.title}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <ImageIcon className="h-6 w-6 m-auto absolute inset-0 text-slate-300" />
                        )}
                      </div>
                      <div className="flex flex-col min-w-0 max-w-[280px]">
                        <span className="font-semibold text-slate-900 truncate leading-tight hover:text-orange-600 transition-colors cursor-pointer">
                          {product.title}
                        </span>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wide">
                            #{product.id.slice(-8)}
                          </span>
                          <span className="text-slate-300">•</span>
                          <span className="text-[10px] text-slate-500 flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {format(new Date(product.createdAt), "MMM d, yyyy")}
                          </span>
                        </div>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell>
                    <Badge
                      variant="outline"
                      className="font-medium border-slate-300 bg-slate-50"
                    >
                      <Tag className="h-3 w-3 mr-1 text-slate-500" />
                      {product.category?.name || "Uncategorized"}
                    </Badge>
                  </TableCell>

                  <TableCell className="text-right">
                    <div className="flex flex-col items-end gap-1">
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-3.5 w-3.5 text-slate-400" />
                        <span className="font-bold text-slate-900 text-base">
                          {product.titlePrice.toFixed(2)}
                        </span>
                      </div>
                      {product.discountedPrice && (
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-slate-400 line-through">
                            ${product.discountedPrice.toFixed(2)}
                          </span>
                          <Badge className="bg-red-500 text-white text-[9px] px-1.5 py-0">
                            -{getDiscountPercentage(product.titlePrice, product.discountedPrice)}%
                          </Badge>
                        </div>
                      )}
                    </div>
                  </TableCell>

                  <TableCell className="text-center">
                    <Badge
                      variant="outline"
                      className={cn(
                        "font-semibold",
                        (product.totalStock || 0) < 10
                          ? "bg-red-50 text-red-700 border-red-200"
                          : (product.totalStock || 0) < 50
                          ? "bg-amber-50 text-amber-700 border-amber-200"
                          : "bg-green-50 text-green-700 border-green-200"
                      )}
                    >
                      {product.totalStock || 0} units
                    </Badge>
                  </TableCell>

                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-2">
                      {product.isFeatured && (
                        <Badge className="bg-amber-500 text-white border-none gap-1">
                          <Star className="h-3 w-3 fill-white" />
                          Featured
                        </Badge>
                      )}
                      {product.isArchived ? (
                        <Badge variant="outline" className="bg-slate-100 text-slate-600 border-slate-300">
                          <Archive className="h-3 w-3 mr-1" />
                          Archived
                        </Badge>
                      ) : (
                        <Badge className="bg-green-500 text-white border-none gap-1">
                          <CheckCircle2 className="h-3 w-3" />
                          Active
                        </Badge>
                      )}
                    </div>
                  </TableCell>

                  <TableCell className="pr-6">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onEditClick(product)}
                        className="h-8 px-3 bg-white hover:bg-orange-50 hover:text-orange-600 hover:border-orange-300 border-slate-300 font-semibold text-xs shadow-sm transition-all"
                      >
                        <Edit2 className="h-3 w-3 mr-1.5" /> Edit
                      </Button>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 hover:bg-slate-100"
                          >
                            <MoreVertical className="h-4 w-4 text-slate-600" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuLabel className="text-xs font-semibold text-slate-500">
                            Quick Actions
                          </DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="gap-2 cursor-pointer">
                            <Eye className="h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem className="gap-2 cursor-pointer">
                            <Copy className="h-4 w-4" />
                            Duplicate
                          </DropdownMenuItem>
                          <DropdownMenuItem className="gap-2 cursor-pointer">
                            <Archive className="h-4 w-4" />
                            {product.isArchived ? "Unarchive" : "Archive"}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <DropdownMenuItem
                                className="gap-2 cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50"
                                onSelect={(e) => e.preventDefault()}
                              >
                                <Trash2 className="h-4 w-4" />
                                Delete Product
                              </DropdownMenuItem>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Product?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This will permanently remove{" "}
                                  <span className="font-bold text-slate-900">
                                    "{product.title}"
                                  </span>{" "}
                                  from your inventory. This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  className="bg-red-600 hover:bg-red-700"
                                  disabled={isPending}
                                  onClick={() => handleDelete(product.id)}
                                >
                                  {isPending ? "Deleting..." : "Delete Product"}
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {/* Enhanced Pagination */}
        <div className="bg-gradient-to-r from-slate-50 to-slate-100/50 border-t border-slate-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <p className="text-sm text-slate-600">
                Showing{" "}
                <span className="font-semibold text-slate-900">
                  {(currentPage - 1) * pageSize + 1}
                </span>{" "}
                to{" "}
                <span className="font-semibold text-slate-900">
                  {Math.min(currentPage * pageSize, stats.total)}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-slate-900">
                  {stats.total}
                </span>{" "}
                products
              </p>
              
              <Select
                value={pageSize.toString()}
                onValueChange={(value) => setPageSize(Number(value))}
              >
                <SelectTrigger className="w-[120px] h-9 bg-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10 per page</SelectItem>
                  <SelectItem value="25">25 per page</SelectItem>
                  <SelectItem value="50">50 per page</SelectItem>
                  <SelectItem value="100">100 per page</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === 1 || loading}
                onClick={() => setCurrentPage((prev) => prev - 1)}
                className="h-9 px-4 bg-white hover:bg-slate-50 border-slate-300 disabled:opacity-50"
              >
                <ChevronLeft className="h-4 w-4 mr-1" /> Previous
              </Button>

              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }

                  return (
                    <Button
                      key={pageNum}
                      variant={currentPage === pageNum ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(pageNum)}
                      className={cn(
                        "h-9 w-9",
                        currentPage === pageNum
                          ? "bg-orange-500 hover:bg-orange-600 text-white shadow-md"
                          : "bg-white hover:bg-slate-50 border-slate-300"
                      )}
                    >
                      {pageNum}
                    </Button>
                  );
                })}
              </div>

              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === totalPages || loading}
                onClick={() => setCurrentPage((prev) => prev + 1)}
                className="h-9 px-4 bg-white hover:bg-slate-50 border-slate-300 disabled:opacity-50"
              >
                Next <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <ProductFormDialog
        open={isAddOpen}
        setOpen={setIsAddOpen}
        onSuccess={loadProducts}
      />
      {selectedProduct && (
        <EditProductDialog
          open={isEditOpen}
          setOpen={setIsEditOpen}
          product={selectedProduct}
          onSuccess={loadProducts}
        />
      )}
    </div>
  );
}