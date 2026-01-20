"use client";

import { useEffect, useState, useTransition, useCallback } from "react";
import {
  Plus,
  Edit2,
  Trash2,
  Search,
  ImageIcon,
  Filter,
  ChevronLeft,
  ChevronRight,
  Package,
  Tag,
  Calendar,
} from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAlert } from "@/store/use-alert-store";
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

export default function ProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const alert = useAlert();

  // Pagination & Search State
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 10;

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);

  // 1. Unified load function using the new Admin action
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

      setProducts(sanitized);
      setTotalPages(res.totalPages);
    } catch (err) {
      alert.error("Failed to fetch products");
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchQuery, pageSize, alert]);

  // 2. Debounced search effect: Waits 300ms after typing stops to fetch
  useEffect(() => {
    const handler = setTimeout(() => {
      loadProducts();
    }, 300);

    return () => clearTimeout(handler);
  }, [loadProducts]);

  // 3. Reset to page 1 when searching to avoid "no results found" on high page numbers
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
  // Remove the if (!confirm(...)) line entirely
  startTransition(async () => {
    const res = await deleteProduct(id);
    if (res.success) {
      alert.success("Product deleted");
      loadProducts();
    } else {
      alert.error(res.error || "Failed to delete product");
    }
  });
};

  return (
    <div className="min-h-screen space-y-4 font-sans text-[13px]">
      {/* HEADER SECTION */}
      <div className="flex items-center justify-between bg-white px-4 py-3 rounded border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 p-1.5 rounded text-primary">
            <Package size={18} />
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-900 leading-none">
              Inventory
            </h1>
            <p className="text-[11px] text-slate-500 mt-1 uppercase tracking-tight">
              Manage your store listings
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative w-64 mr-2">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <Input
              placeholder="Search by name or SKU..."
              className="pl-8 h-8 text-[12px] bg-slate-50 border-slate-200 focus-visible:ring-primary/20"
              value={searchQuery}
              onChange={handleSearchChange}
            />
          </div>
          <Button
            onClick={() => setIsAddOpen(true)}
            className="h-8 px-4 bg-primary hover:bg-primary/90 text-white font-bold text-[12px] rounded-sm border-b border-orange-700 shadow-sm transition-all active:translate-y-[1px]"
          >
            <Plus className="mr-1.5 h-4 w-4" /> Add Product
          </Button>
        </div>
      </div>

      {/* COMPACT TABLE */}
      <div className="bg-white rounded border border-slate-200 shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow className="hover:bg-transparent border-b">
              <TableHead className="w-[40px] pl-4">
                <input
                  type="checkbox"
                  className="h-3.5 w-3.5 rounded border-slate-300"
                />
              </TableHead>
              <TableHead className="h-9 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Product Info
              </TableHead>
              <TableHead className="h-9 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Category
              </TableHead>
              <TableHead className="h-9 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-right">
                Pricing
              </TableHead>
              <TableHead className="h-9 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-center">
                Status
              </TableHead>
              <TableHead className="h-9 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-right pr-4">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="h-32 text-center text-slate-400 animate-pulse"
                >
                  Loading listings...
                </TableCell>
              </TableRow>
            ) : products.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="h-32 text-center text-slate-400"
                >
                  No products found.
                </TableCell>
              </TableRow>
            ) : (
              products.map((product) => (
                <TableRow
                  key={product.id}
                  className="group hover:bg-slate-50 border-b last:border-0 transition-colors"
                >
                  <TableCell className="pl-4">
                    <input
                      type="checkbox"
                      className="h-3.5 w-3.5 rounded border-slate-300"
                    />
                  </TableCell>

                  <TableCell className="py-2.5">
                    <div className="flex items-center gap-3">
                      <div className="relative h-10 w-10 rounded bg-slate-100 border overflow-hidden shrink-0 shadow-xs">
                        {product.mainImageUrl ? (
                          <Image
                            src={product.mainImageUrl}
                            alt=""
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <ImageIcon className="h-4 w-4 m-auto absolute inset-0 text-slate-300" />
                        )}
                      </div>
                      <div className="flex flex-col min-w-0 max-w-[220px]">
                        <span className="font-bold text-slate-800 truncate leading-tight">
                          {product.title}
                        </span>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[10px] font-mono text-slate-400 uppercase">
                            ID: {product.id.slice(-6)}
                          </span>
                          <span className="text-[10px] text-slate-400 flex items-center gap-1">
                            <Calendar size={10} />{" "}
                            {format(new Date(product.createdAt), "MMM d")}
                          </span>
                        </div>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="flex items-center gap-1.5 text-slate-600">
                      <Tag size={12} className="text-slate-400" />
                      <span className="font-medium">
                        {product.category?.name || "Uncategorized"}
                      </span>
                    </div>
                  </TableCell>

                  <TableCell className="text-right">
                    <div className="flex flex-col items-end">
                      <span className="font-bold text-slate-900">
                        ${product.titlePrice.toFixed(2)}
                      </span>
                      {product.discountedPrice && (
                        <span className="text-[10px] text-red-500 font-medium line-through">
                          ${product.discountedPrice.toFixed(2)}
                        </span>
                      )}
                    </div>
                  </TableCell>

                  <TableCell className="text-center">
                    <div
                      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded border text-[10px] font-bold ${
                        product.isFeatured
                          ? "bg-amber-50 text-amber-700 border-amber-100"
                          : "bg-green-50 text-green-700 border-green-100"
                      }`}
                    >
                      <div
                        className={`h-1 w-1 rounded-full ${
                          product.isFeatured ? "bg-amber-500" : "bg-green-500"
                        }`}
                      />
                      {product.isFeatured ? "Featured" : "Active"}
                    </div>
                  </TableCell>
                  <TableCell className="pr-4">
                    <div className="flex items-center justify-end gap-1.5">
                      {/* Edit Button */}
                      <Button
                        size="sm"
                        onClick={() => onEditClick(product)}
                        className="h-7 px-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 font-bold text-[11px] shadow-sm"
                      >
                        <Edit2 size={12} className="mr-1" /> Edit
                      </Button>

                      {/* Delete Dialog */}
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 w-7 p-0 text-slate-400 hover:text-red-600 hover:bg-red-50"
                          >
                            <Trash2 size={14} />
                          </Button>
                        </AlertDialogTrigger>

                        <AlertDialogContent className="max-w-[400px] rounded-sm">
                          <AlertDialogHeader>
                            <AlertDialogTitle className="text-base font-bold">
                              Delete Product?
                            </AlertDialogTitle>
                            <AlertDialogDescription className="text-xs text-slate-500">
                              This will permanently remove{" "}
                              <span className="font-bold text-slate-900">
                                "{product.title}"
                              </span>
                              . This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter className="gap-2">
                            <AlertDialogCancel className="h-8 text-[12px] font-bold rounded-sm">
                              Cancel
                            </AlertDialogCancel>
                              <Button
                                variant="destructive"
                                className="h-8 text-[12px] font-bold rounded-sm px-4"
                                disabled={isPending}
                              onClick={() => handleDelete(product.id)}
                              >
                                {isPending ? "Deleting..." : "Delete Item"}
                              </Button>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {/* COMPACT PAGINATION */}
        <div className="px-4 py-2 bg-slate-50/50 border-t flex items-center justify-between text-slate-500 text-[11px]">
          <span>
            Showing{" "}
            <span className="font-bold text-slate-900">{products.length}</span>{" "}
            items on page {currentPage}
          </span>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              disabled={currentPage === 1 || loading}
              onClick={() => setCurrentPage((prev) => prev - 1)}
              className="h-7 px-2 border-slate-300 disabled:opacity-50"
            >
              <ChevronLeft size={14} className="mr-1" /> Previous
            </Button>

            <div className="flex items-center px-3 font-bold text-slate-700">
              {currentPage} / {totalPages || 1}
            </div>

            <Button
              variant="outline"
              disabled={currentPage === totalPages || loading}
              onClick={() => setCurrentPage((prev) => prev + 1)}
              className="h-7 px-2 border-slate-300 disabled:opacity-50"
            >
              Next <ChevronRight size={14} className="ml-1" />
            </Button>
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
