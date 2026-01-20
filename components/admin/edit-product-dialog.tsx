"use client";

import { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import slugify from "slugify";
import Image from "next/image";
import {
  X,
  Image as ImageIcon,
  Tag as TagIcon,
  Layers,
  Plus,
  Trash2,
  ImageIcon as MainImgIcon,
} from "lucide-react";

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

import { RichTextEditor } from "@/components/admin/rich-text-editor";
import { ImageUploadKit } from "./image-upload-kit";
import { updateProduct } from "@/actions/product";
import { getCategories } from "@/actions/category";
import { getProductTags } from "@/actions/tags";
import { toast } from "sonner";

interface EditProductDialogProps {
  product: any;
  open: boolean;
  setOpen: (open: boolean) => void;
  onSuccess: () => void;
}

export function EditProductDialog({
  product,
  open,
  setOpen,
  onSuccess,
}: EditProductDialogProps) {
  const [isPending, setIsPending] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [colorInput, setColorInput] = useState("");
  const [tagInput, setTagInput] = useState("");

  const form = useForm({
    defaultValues: {
      title: "",
      slug: "",
      description: "",
      mainImageUrl: "",
      images: [] as Array<{
        url: string;
        key: string;
        altText?: string;
        order: number;
      }>, // ✅ Proper type
      titlePrice: 0,
      discountedPrice: 0,
      categoryId: "",
      colors: [] as string[],
      tags: [] as string[], // ✅ Changed from objects to strings
      variants: [] as {
        type: string;
        value: string;
        price: number;
        stock: number;
      }[],
      isFeatured: false,
      isArchived: false,
    },
  });

  const {
    fields: variantFields,
    append: appendVariant,
    remove: removeVariant,
  } = useFieldArray({
    control: form.control,
    name: "variants",
  });

  // Initialize data and fetch external tags/categories
  useEffect(() => {
    const initData = async () => {
      if (!open || !product) return;

      try {
        const [fetchedCategories, fetchedTags] = await Promise.all([
          getCategories(),
          getProductTags(product.id),
        ]);

        setCategories(fetchedCategories);

        form.reset({
          title: product.title ?? "",
          slug: product.slug ?? "",
          description: product.description ?? "",
          mainImageUrl: product.mainImageUrl ?? "",
          // ✅ FIX: Transform images properly
          images: (product.images ?? []).map((img: any) => ({
            url: img.url,
            key: img.key || img.id,
            altText: img.altText || "",
            order: img.order || 0,
          })),
          titlePrice: product.titlePrice ? Number(product.titlePrice) : 0,
          discountedPrice: product.discountedPrice
            ? Number(product.discountedPrice)
            : 0,
          categoryId: product.categoryId ?? "",
          colors: product.colors ?? [],
          isFeatured: product.isFeatured ?? false,
          isArchived: product.isArchived ?? false,
          variants: (product.variants ?? []).map((v: any) => ({
            type: v.type,
            value: v.value,
            price: Number(v.price),
            stock: Number(v.stock),
          })),
          // ✅ FIX: Keep tags as simple strings
          tags: fetchedTags.map((t: any) => t.name),
        });
      } catch (error) {
        console.error("Failed to load dialog data", error);
      }
    };

    initData();
  }, [product, open, form]);

  // Auto-slugify title
  const watchTitle = form.watch("title");
  useEffect(() => {
    if (watchTitle) {
      form.setValue("slug", slugify(watchTitle, { lower: true, strict: true }));
    }
  }, [watchTitle, form]);

  const onSubmit = async (values: any) => {
  setIsPending(true);
  
  try {
    // No need to transform tags - they're already strings
    const res = await updateProduct(product.id, values);
    
    if (res.success) {
      toast.success("Product updated successfully");
      onSuccess();
      setOpen(false);
    } else {
      toast.error(res.error || "Failed to update");
    }
  } catch (error) {
    toast.error("Something went wrong");
  } finally {
    setIsPending(false);
  }
};

  const removeTag = (index: number) => {
    const currentTags = form.getValues("tags");
    form.setValue(
      "tags",
      currentTags.filter((_, i) => i !== index)
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="min-w-[95vw] md:min-w-[1200px] h-[90vh] p-0 overflow-hidden border-none bg-slate-50 shadow-2xl">
        {/* HEADER */}
        <div className="bg-white border-b px-6 py-4 flex items-center justify-between shrink-0">
          <div>
            <DialogTitle className="text-xl font-bold text-slate-900">
              Product Management
            </DialogTitle>
            <p className="text-[10px] text-blue-600 font-mono">
              ID: {product?.id} | /{form.getValues("slug")}
            </p>
          </div>
          <Badge className="bg-orange-500 hover:bg-orange-600 text-white">
            Live Edit Mode
          </Badge>
        </div>

        <Form {...form}>
          <form
            id="edit-product-form"
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col h-[calc(90vh-140px)]"
          >
            <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8">
              <div className="grid grid-cols-12 gap-8">
                {/* LEFT COLUMN: Media & Status */}
                <div className="col-span-12 lg:col-span-4 space-y-6">
                  {/* Main Image */}
                  <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                    <h3 className="text-sm font-bold mb-4 flex items-center gap-2">
                      <MainImgIcon size={16} /> Main Image
                    </h3>
                    <FormField
                      control={form.control}
                      name="mainImageUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <div className="space-y-4">
                              <div className="relative aspect-square w-full rounded-lg border-2 border-dashed border-slate-200 bg-slate-50 flex items-center justify-center overflow-hidden">
                                {field.value ? (
                                  <Image
                                    src={field.value}
                                    fill
                                    className="object-contain p-2"
                                    alt="Preview"
                                    unoptimized
                                  />
                                ) : (
                                  <ImageIcon className="h-10 w-10 text-slate-300" />
                                )}
                              </div>
                              <Input
                                placeholder="Paste main image URL..."
                                className="h-9 text-xs"
                                {...field}
                                value={field.value ?? ""}
                              />
                            </div>
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Gallery */}
                  <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                    <h3 className="text-sm font-bold mb-4 flex items-center gap-2">
                      <ImageIcon size={16} /> Gallery
                    </h3>
                    <FormField
                      control={form.control}
                      name="images"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <ImageUploadKit
                              productId={product?.id}
                              value={field.value ?? []}
                              onChange={(urls) => field.onChange(urls)}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Visibility Controls */}
                  <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
                    <h3 className="text-sm font-bold">Visibility</h3>
                    <FormField
                      control={form.control}
                      name="isFeatured"
                      render={({ field }) => (
                        <FormItem className="flex items-center justify-between rounded-lg border p-3">
                          <FormLabel className="text-xs font-semibold">
                            Featured
                          </FormLabel>
                          <FormControl>
                            <Switch
                              checked={!!field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="isArchived"
                      render={({ field }) => (
                        <FormItem className="flex items-center justify-between rounded-lg border p-3 bg-red-50/50">
                          <FormLabel className="text-xs font-semibold text-red-700">
                            Archived
                          </FormLabel>
                          <FormControl>
                            <Switch
                              checked={!!field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* RIGHT COLUMN: Details & Variants */}
                <div className="col-span-12 lg:col-span-8 space-y-6">
                  {/* Basic Info */}
                  <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                          <FormItem className="col-span-2">
                            <FormLabel className="text-xs font-bold uppercase text-slate-500">
                              Product Name
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Title..."
                                className="h-10 text-base"
                                {...field}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="categoryId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs font-bold uppercase text-slate-500">
                              Category
                            </FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              value={field.value ?? ""}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select Category" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {categories.map((c) => (
                                  <SelectItem key={c.id} value={c.id}>
                                    {c.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </FormItem>
                        )}
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <FormField
                          control={form.control}
                          name="titlePrice"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs font-bold uppercase text-slate-500">
                                Base Price
                              </FormLabel>
                              <FormControl>
                                <Input type="number" step="0.01" {...field} />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="discountedPrice"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs font-bold uppercase text-slate-500">
                                Sale Price
                              </FormLabel>
                              <FormControl>
                                <Input type="number" step="0.01" {...field} />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-bold uppercase text-slate-500">
                            Description
                          </FormLabel>
                          <FormControl>
                            <RichTextEditor
                              value={field.value ?? ""}
                              onChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Variants Management */}
                  <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex justify-between items-center mb-4 border-b pb-2">
                      <h3 className="text-sm font-bold flex items-center gap-2">
                        <Layers size={16} /> Variants
                      </h3>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="h-7 text-[10px]"
                        onClick={() =>
                          appendVariant({
                            type: "",
                            value: "",
                            price: 0,
                            stock: 0,
                          })
                        }
                      >
                        <Plus size={12} className="mr-1" /> Add Option
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {variantFields.map((field, index) => (
                        <div
                          key={field.id}
                          className="flex gap-2 items-center bg-slate-50 p-2 rounded-lg border border-slate-100"
                        >
                          <Input
                            className="h-8 text-xs flex-1"
                            placeholder="Type (e.g. Size)"
                            {...form.register(`variants.${index}.type`)}
                          />
                          <Input
                            className="h-8 text-xs flex-1"
                            placeholder="Value (e.g. XL)"
                            {...form.register(`variants.${index}.value`)}
                          />
                          <Input
                            className="h-8 text-xs w-20"
                            type="number"
                            placeholder="Price"
                            {...form.register(`variants.${index}.price`, {
                              valueAsNumber: true,
                            })}
                          />
                          <Input
                            className="h-8 text-xs w-16"
                            type="number"
                            placeholder="Qty"
                            {...form.register(`variants.${index}.stock`, {
                              valueAsNumber: true,
                            })}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 text-slate-400 hover:text-red-500"
                            onClick={() => removeVariant(index)}
                          >
                            <Trash2 size={14} />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Colors & Tags */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Colors Input */}
                    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
                      <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
                        Active Colors
                      </h4>
                      <div className="flex flex-wrap gap-1.5 min-h-[30px]">
                        {(form.watch("colors") ?? []).map((c, i) => (
                          <div
                            key={i}
                            className="bg-slate-100 text-slate-800 text-[10px] px-2 py-0.5 rounded-md flex items-center gap-1 border border-slate-200"
                          >
                            <span>{c}</span>
                            <X
                              size={12}
                              className="cursor-pointer hover:text-red-500"
                              onClick={() => {
                                const current = form.getValues("colors");
                                form.setValue(
                                  "colors",
                                  current.filter((_, idx) => idx !== i)
                                );
                              }}
                            />
                          </div>
                        ))}
                      </div>
                      <div className="flex gap-1">
                        <Input
                          className="h-8 text-xs"
                          value={colorInput}
                          onChange={(e) => setColorInput(e.target.value)}
                          placeholder="Hex or Name..."
                        />
                        <Button
                          type="button"
                          size="sm"
                          className="h-8"
                          onClick={() => {
                            if (colorInput.trim()) {
                              form.setValue("colors", [
                                ...form.getValues("colors"),
                                colorInput.trim(),
                              ]);
                              setColorInput("");
                            }
                          }}
                        >
                          Add
                        </Button>
                      </div>
                    </div>

                    {/* Tags Input */}
                    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
                      <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
                        Search Tags
                      </h4>
                      <div className="flex flex-wrap gap-1.5 min-h-[30px]">
                        {(form.watch("tags") ?? []).map(
                          (tagName: string, i: number) => (
                            <div
                              key={i}
                              className="bg-blue-600 text-white text-[10px] px-2 py-0.5 rounded-md flex items-center gap-1 shadow-sm"
                            >
                              <TagIcon size={10} className="opacity-70" />
                              <span>{tagName}</span>
                              <button
                                type="button"
                                onClick={() => {
                                  const current = form.getValues("tags");
                                  form.setValue(
                                    "tags",
                                    current.filter((_, idx) => idx !== i)
                                  );
                                }}
                                className="hover:bg-blue-700 rounded-full p-0.5"
                              >
                                <X size={12} />
                              </button>
                            </div>
                          )
                        )}
                      </div>
                      <div className="flex gap-1">
                        <Input
                          className="h-8 text-xs"
                          value={tagInput}
                          onChange={(e) => setTagInput(e.target.value)}
                          placeholder="Add tag..."
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              if (tagInput.trim()) {
                                form.setValue("tags", [
                                  ...form.getValues("tags"),
                                  tagInput.trim(),
                                ]);
                                setTagInput("");
                              }
                            }
                          }}
                        />
                        <Button
                          type="button"
                          size="sm"
                          className="h-8"
                          onClick={() => {
                            if (tagInput.trim()) {
                              form.setValue("tags", [
                                ...form.getValues("tags"),
                                tagInput.trim(),
                              ]);
                              setTagInput("");
                            }
                          }}
                        >
                          Add
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ACTION FOOTER */}
            <div className="bg-white border-t px-8 py-4 flex justify-between items-center shrink-0">
              <span className="text-[10px] text-slate-400 italic">
                Slug and metadata update automatically on save.
              </span>
              <div className="flex gap-3">
                <Button
                  variant="ghost"
                  onClick={() => setOpen(false)}
                  type="button"
                  className="text-xs font-bold"
                >
                  Discard
                </Button>
                <Button
                  form="edit-product-form"
                  type="submit"
                  disabled={isPending}
                  className="px-8 bg-slate-900 text-white text-xs font-bold rounded-md hover:bg-slate-800"
                >
                  {isPending ? "Saving..." : "Update Product"}
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
