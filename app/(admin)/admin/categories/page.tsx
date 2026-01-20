"use client";

import { useEffect, useState, useTransition } from "react";
import {
  Plus,
  MoreHorizontal,
  Edit,
  Trash2,
  Loader2,
  Layers,
  ExternalLink,
  AlertCircle,
  Calendar,
} from "lucide-react";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useAlert } from "@/store/use-alert-store";
import {
  createCategory,
  getCategories,
  deleteCategory,
  updateCategory,
} from "@/actions/category";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { GlobalAlert } from "@/components/tools/global-alert";

export default function CategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const alert = useAlert();

  // Modal States
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  // Selection States
  const [selectedCategory, setSelectedCategory] = useState<any>(null);
  const [editMode, setEditMode] = useState(false);
  const [name, setName] = useState("");
  const [isActive, setIsActive] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    const data = await getCategories();
    setCategories(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const closeModal = () => {
    setIsFormOpen(false);
    setEditMode(false);
    setName("");
    setIsActive(true);
    setSelectedCategory(null);
  };

  const onEditClick = (cat: any) => {
    setSelectedCategory(cat);
    setName(cat.name);
    setIsActive(cat.isActive);
    setEditMode(true);
    setIsFormOpen(true);
  };

  const onDeleteClick = (cat: any) => {
    setSelectedCategory(cat);
    setIsDeleteOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  // Use startTransition to handle the loading state properly
  startTransition(async () => {
    try {
      const result = editMode 
        ? await updateCategory(selectedCategory.id, name, isActive)
        : await createCategory(name);
      
      console.log("Server Response:", result); // Debugging line

      if (result && result.success) {
        alert.success(`Category ${editMode ? 'updated' : 'created'}`, "floating");
        closeModal(); // This MUST be called here
        
        // Force a refresh of the local state
        await fetchData(); 
      } else {
        alert.error(result?.error || "Action failed", "floating");
      }
    } catch (err) {
      console.error("Client Error:", err);
      alert.error("A network error occurred.");
    }
  });
};

  const confirmDelete = async () => {
    if (!selectedCategory) return;

    startTransition(async () => {
      const result = await deleteCategory(selectedCategory.id);
      if (result.success) {
        alert.success("Category permanently removed");
        fetchData();
      } else {
        alert.error(result.error ?? "Action failed");
      }
      setIsDeleteOpen(false);
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Inventory Categories
          </h1>
          <p className="text-slate-500 text-sm">
            Organize and manage your marketplace product taxonomy.
          </p>
        </div>
        <Button
          onClick={() => setIsFormOpen(true)}
          className="bg-orange-500 hover:bg-orange-600 shadow-md"
        >
          <Plus className="mr-2 h-4 w-4" /> New Category
        </Button>
      </div>

      {/* --- FORM DIALOG --- */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
            <GlobalAlert />
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-xl">
              {editMode ? "Update Category" : "Add Category"}
            </DialogTitle>
            <DialogDescription>
              {editMode
                ? "Modify existing category details and visibility."
                : "Define a new product classification."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-6 pt-2">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">
                Display Name
              </label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Smart Home Electronics"
                className="focus-visible:ring-orange-500"
                required
              />
            </div>

            <div className="flex items-center space-x-3 p-3 bg-slate-50 rounded-lg border border-slate-100">
              <Checkbox
                id="active"
                checked={isActive}
                onCheckedChange={(checked) => setIsActive(checked as boolean)}
              />
              <div className="grid leading-none">
                <label
                  htmlFor="active"
                  className="text-sm font-bold cursor-pointer"
                >
                  Live on Storefront
                </label>
                <p className="text-xs text-slate-500">
                  Enable this to make category visible to customers.
                </p>
              </div>
            </div>

            <DialogFooter>
              <Button
                type="submit"
                disabled={isPending || !name}
                className="bg-orange-500 w-full hover:bg-orange-600 transition-all font-bold"
              >
                {isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : editMode ? (
                  "Save Changes"
                ) : (
                  "Create Category"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* --- DELETE CONFIRMATION --- */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="flex items-center gap-2 text-red-600 mb-2">
              <AlertCircle size={20} />
              <AlertDialogTitle>Dangerous Action</AlertDialogTitle>
            </div>
            <AlertDialogDescription>
              Are you sure you want to delete{" "}
              <span className="font-bold text-slate-900">
                "{selectedCategory?.name}"
              </span>
              ? This action will permanently purge the record from the database.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              {isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Confirm Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* --- DATA TABLE --- */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50/50">
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-[300px] font-bold text-slate-800">
                Category Entity
              </TableHead>
              <TableHead className="font-bold text-slate-800">
                Marketplace Slug
              </TableHead>
              <TableHead className="font-bold text-slate-800">Status</TableHead>
              <TableHead className="font-bold text-slate-800">
                Inventory
              </TableHead>
              <TableHead className="font-bold text-slate-800">
                Timestamp
              </TableHead>
              <TableHead className="text-right px-6">Management</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i} className="animate-pulse">
                  <TableCell colSpan={6} className="h-16 bg-slate-50/20" />
                </TableRow>
              ))
            ) : categories.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-[400px] text-center">
                  <div className="flex flex-col items-center justify-center space-y-4 animate-in fade-in zoom-in duration-300">
                    {/* Visual Icon */}
                    <div className="bg-slate-50 p-6 rounded-full border border-dashed border-slate-200">
                      <Layers className="h-12 w-12 text-slate-300" />
                    </div>

                    {/* Text Content */}
                    <div className="max-w-[280px] space-y-1">
                      <h3 className="text-lg font-bold text-slate-900">
                        No categories found
                      </h3>
                      <p className="text-sm text-slate-500">
                        Your marketplace needs categories before you can start
                        listing products.
                      </p>
                    </div>

                    {/* Primary Action */}
                    <Button
                      onClick={() => setIsFormOpen(true)}
                      variant="outline"
                      className="mt-2 border-orange-200 text-orange-600 hover:bg-orange-50 hover:text-orange-700"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Create your first category
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              categories.map((cat) => (
                <TableRow
                  key={cat.id}
                  className="group hover:bg-slate-50/80 transition-colors"
                >
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-bold text-slate-900">
                        {cat.name}
                      </span>
                      <span className="text-[10px] text-slate-400 uppercase font-medium tracking-tighter">
                        ID: {cat.id}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5 px-2 py-1 bg-slate-100 w-fit rounded border border-slate-200">
                      <span className="text-xs font-mono text-slate-600">
                        /{cat.slug}
                      </span>
                      <ExternalLink size={10} className="text-slate-400" />
                    </div>
                  </TableCell>
                  <TableCell>
                    <div
                      className={`flex items-center gap-1.5 w-fit px-2.5 py-0.5 rounded-full border ${
                        cat.isActive
                          ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                          : "bg-slate-100 border-slate-200 text-slate-500"
                      }`}
                    >
                      <div
                        className={`h-1.5 w-1.5 rounded-full ${
                          cat.isActive
                            ? "bg-emerald-500 animate-pulse"
                            : "bg-slate-400"
                        }`}
                      />
                      <span className="text-[11px] font-black uppercase tracking-wide">
                        {cat.isActive ? "Live" : "Draft"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm font-semibold text-slate-700">
                      {cat._count.products} SKU's
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-slate-500">
                      <Calendar size={13} />
                      <span className="text-xs">
                        {format(new Date(cat.createdAt), "MMM dd, yyyy")}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right px-6">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="hover:bg-slate-200 transition-colors"
                        >
                          <MoreHorizontal className="h-5 w-5 text-slate-500" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem
                          onClick={() => onEditClick(cat)}
                          className="cursor-pointer"
                        >
                          <Edit className="mr-2 h-4 w-4" /> Modify Details
                        </DropdownMenuItem>
                        <DropdownMenuItem className="cursor-pointer text-blue-600">
                          <ExternalLink className="mr-2 h-4 w-4" /> View in
                          Store
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => onDeleteClick(cat)}
                          className="text-red-600 cursor-pointer focus:bg-red-50"
                        >
                          <Trash2 className="mr-2 h-4 w-4" /> Delete Category
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
