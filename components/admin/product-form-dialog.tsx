"use client";

import { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Package,
  ArrowRight,
  ArrowLeft,
  Eye,
  Plus,
  Trash2,
  ImageIcon,
  Info,
  Palette,
} from "lucide-react";

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { productSchema, type FormInput, type FormOutput } from "@/lib/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import { RichTextEditor } from "./rich-text-editor";
import { ProductPreviewDialog } from "./product-preview-dialog";
import { createProduct, updateProduct } from "@/actions/product";
import { useAlert } from "@/store/use-alert-store";
import { ImageUploadKit } from "./image-upload-kit";
import { CategorySelector } from "./category-selector";
import { ImageUploader } from "./image-uploader";
import { TagInput } from "./tag-input";
import { cn } from "@/lib/utils";

interface ProductFormDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  onSuccess: () => void;
  initialData?: any;
}

type Step = "details" | "variants" | "media";

export function ProductFormDialog({
  open,
  setOpen,
  onSuccess,
  initialData,
}: ProductFormDialogProps) {
  const [currentStep, setCurrentStep] = useState<Step>("details");
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const alert = useAlert();
  const isEditing = !!initialData;

  const form = useForm<FormInput, any, FormOutput>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      title: "",
      description: "",
      mainImageUrl: "",
      titlePrice: "",
      discountedPrice: "",
      categoryId: "",
      images: [],
      tags: [],
      colors: [],
      variants: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "variants",
  });

  // --- DATA NORMALIZATION EFFECT ---
  useEffect(() => {
    if (initialData && open) {
      // 1. Convert tags/colors from Objects (Prisma) to Strings (UI)
      const formattedTags =
        initialData.tags?.map((t: any) =>
          typeof t === "string" ? t : t.name
        ) || [];
      const formattedColors =
        initialData.colors?.map((c: any) =>
          typeof c === "string" ? c : c.name
        ) || [];

      // 2. Reset the form with sanitized numbers and string arrays
      form.reset({
        ...initialData,
        titlePrice: Number(initialData.titlePrice) || 0,
        discountedPrice: initialData.discountedPrice
          ? Number(initialData.discountedPrice)
          : null,
        tags: formattedTags,
        colors: formattedColors,
        images:
          initialData.images?.map((img: any) => ({
            url: img.url,
            fileId: img.fileId || img.key || img.id,
            order: img.order,
          })) || [],
        variants:
          initialData.variants?.map((v: any) => ({
            ...v,
            price: Number(v.price),
            stock: Number(v.stock),
          })) || [],
      });
      setCurrentStep("details");
    } else if (!open) {
      // Clear form when closed to prevent data ghosting
      form.reset({
        title: "",
        description: "",
        mainImageUrl: "",
        titlePrice: 0,
        tags: [],
        colors: [],
        variants: [],
      });
    }
  }, [initialData, open, form]);

  const steps: { id: Step; label: string; icon: any }[] = [
    { id: "details", label: "General Info", icon: Info },
    { id: "variants", label: "Specs & Colors", icon: Palette },
    { id: "media", label: "Media Assets", icon: ImageIcon },
  ];

  const handleNext = async () => {
    const fieldsByStep: Record<Step, any[]> = {
      details: ["title", "description", "titlePrice", "categoryId"],
      variants: ["variants", "colors", "tags"],
      media: ["mainImageUrl", "images"],
    };

    const isValid = await form.trigger(fieldsByStep[currentStep]);
    if (isValid) {
      if (currentStep === "details") setCurrentStep("variants");
      else if (currentStep === "variants") setCurrentStep("media");
      else setIsPreviewOpen(true);
    }
  };

  const onFinalSubmit = async (values: FormOutput) => {
    setLoading(true);
    try {
      const result = isEditing
        ? await updateProduct(initialData.id, values)
        : await createProduct(values);

      if (result.success) {
        alert.success(isEditing ? "Changes saved" : "Product published");
        setOpen(false);
        setIsPreviewOpen(false);
        onSuccess();
      } else {
        alert.error(result.error || "Failed to save product");
      }
    } catch (error) {
      alert.error("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="min-w-[1100px] h-[85vh] p-0 overflow-hidden flex flex-row gap-0 border-none shadow-2xl">
          {/* Accessibility: Screen reader title */}
          <DialogTitle className="sr-only">
            {isEditing ? `Edit ${initialData?.title}` : "Create New Product"}
          </DialogTitle>

          {/* Sidebar Navigation */}
          <aside className="w-64 bg-slate-50 border-r flex flex-col p-6 shrink-0">
            <div className="flex items-center gap-2 mb-10 px-2">
              <div className="h-8 w-8 bg-black rounded-lg flex items-center justify-center">
                <Package className="text-white h-4 w-4" />
              </div>
              <span className="font-bold text-sm tracking-tight">
                Inventory Hub
              </span>
            </div>

            <nav className="space-y-1">
              {steps.map((step) => {
                const Icon = step.icon;
                const isActive = currentStep === step.id;
                return (
                  <button
                    key={step.id}
                    disabled
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2 rounded-md text-xs font-medium transition-all",
                      isActive
                        ? "bg-white shadow-sm text-black border border-slate-200"
                        : "text-slate-400"
                    )}
                  >
                    <Icon
                      className={cn(
                        "h-4 w-4",
                        isActive ? "text-blue-600" : "text-slate-300"
                      )}
                    />
                    {step.label}
                  </button>
                );
              })}
            </nav>

            <div className="mt-auto border-t pt-6 px-2">
              <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-1">
                Status
              </p>
              <div className="flex items-center gap-2">
                <div
                  className={cn(
                    "h-2 w-2 rounded-full animate-pulse",
                    isEditing ? "bg-amber-500" : "bg-blue-500"
                  )}
                />
                <span className="text-[11px] font-medium">
                  {isEditing ? "Editing Asset" : "New Listing"}
                </span>
              </div>
            </div>
          </aside>

          {/* Main Content Area */}
          <Form {...form}>
            <div className="flex-1 flex flex-col bg-white overflow-hidden">
              <div className="flex-1 overflow-y-auto p-12 custom-scrollbar">
                <div className="max-w-2xl mx-auto">
                  {/* Step 1: Details */}
                  {currentStep === "details" && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                      <div>
                        <h2 className="text-xl font-semibold tracking-tight">
                          General Information
                        </h2>
                        <p className="text-xs text-slate-500 mt-1">
                          Core product identity and pricing.
                        </p>
                      </div>

                      <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                          <FormItem className="space-y-1">
                            <FormLabel className="text-[11px] font-bold uppercase text-slate-500 tracking-wider">
                              Product Title
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder="e.g. Premium Leather Sleeve"
                                className="h-10 text-sm focus-visible:ring-1"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage className="text-[10px]" />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="titlePrice"
                          render={({ field }) => (
                            <FormItem className="space-y-1">
                              <FormLabel className="text-[11px] font-bold uppercase text-slate-500 tracking-wider">
                                Base Price ($)
                              </FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  className="h-10 text-sm"
                                  {...field}
                                  value={Number(field.value) ?? ""}
                                  onChange={(e) =>
                                    field.onChange(Number(e.target.value))
                                  }
                                />
                              </FormControl>
                              <FormMessage className="text-[10px]" />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="categoryId"
                          render={({ field }) => (
                            <FormItem className="space-y-1">
                              <FormLabel className="text-[11px] font-bold uppercase text-slate-500 tracking-wider">
                                Category
                              </FormLabel>
                              <CategorySelector
                                value={field.value}
                                onChange={field.onChange}
                              />
                              <FormMessage className="text-[10px]" />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem className="space-y-1">
                            <FormLabel className="text-[11px] font-bold uppercase text-slate-500 tracking-wider">
                              Description
                            </FormLabel>
                            <RichTextEditor
                              value={field.value}
                              onChange={field.onChange}
                            />
                            <FormMessage className="text-[10px]" />
                          </FormItem>
                        )}
                      />
                    </div>
                  )}

                  {/* Step 2: Variants & Tags */}
                  {currentStep === "variants" && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                      <div>
                        <h2 className="text-xl font-semibold tracking-tight">
                          Attributes & Tags
                        </h2>
                        <p className="text-xs text-slate-500 mt-1">
                          Manage searchability and technical variants.
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="colors"
                          render={({ field }) => (
                            <FormItem className="space-y-1">
                              <FormLabel className="text-[11px] font-bold uppercase text-slate-500 tracking-wider">
                                Colors
                              </FormLabel>
                              <TagInput
                                value={field.value || []}
                                onChange={field.onChange}
                                placeholder="Red; Blue..."
                              />
                              <FormMessage className="text-[10px]" />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="tags"
                          render={({ field }) => (
                            <FormItem className="space-y-1">
                              <FormLabel className="text-[11px] font-bold uppercase text-slate-500 tracking-wider">
                                Search Tags
                              </FormLabel>
                              <TagInput
                                value={field.value || []}
                                onChange={field.onChange}
                                placeholder="Sale; New..."
                              />
                              <FormMessage className="text-[10px]" />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="space-y-4 pt-4">
                        <div className="flex items-center justify-between border-b pb-2">
                          <h3 className="text-xs font-bold uppercase tracking-widest text-slate-900">
                            SKU Variants
                          </h3>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="h-7 text-[10px]"
                            onClick={() =>
                              append({
                                type: "",
                                value: "",
                                stock: 0,
                                price: 0,
                              })
                            }
                          >
                            <Plus className="h-3 w-3 mr-1" /> Add Variant
                          </Button>
                        </div>

                        <div className="space-y-2">
                          {fields.map((field, index) => (
                            <div
                              key={field.id}
                              className="group flex items-center gap-2 p-2 rounded-lg bg-slate-50 border transition-all hover:border-slate-300"
                            >
                              <Input
                                placeholder="Size"
                                className="h-8 text-xs bg-white flex-1"
                                {...form.register(`variants.${index}.type`)}
                              />
                              <Input
                                placeholder="XL"
                                className="h-8 text-xs bg-white flex-1"
                                {...form.register(`variants.${index}.value`)}
                              />
                              <Input
                                type="number"
                                placeholder="Stock"
                                className="h-8 text-xs bg-white w-20"
                                {...form.register(`variants.${index}.stock`, {
                                  valueAsNumber: true,
                                })}
                              />
                              <Input
                                type="number"
                                step="0.01"
                                defaultValue=""
                                placeholder="Price"
                                className="h-8 text-xs bg-white w-24"
                                {...form.register(`variants.${index}.price`, {
                                  valueAsNumber: true,
                                })}
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-slate-400 hover:text-red-500"
                                onClick={() => remove(index)}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Step 3: Media */}
                  {currentStep === "media" && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                      <div>
                        <h2 className="text-xl font-semibold tracking-tight">
                          Media Gallery
                        </h2>
                        <p className="text-xs text-slate-500 mt-1">
                          High-quality assets for your product page.
                        </p>
                      </div>

                      <FormField
                        control={form.control}
                        name="mainImageUrl"
                        render={({ field }) => (
                          <FormItem className="space-y-3">
                            <FormLabel className="text-[11px] font-bold uppercase text-slate-500 tracking-wider">
                              Hero Image
                            </FormLabel>
                            <ImageUploader
                              value={field.value}
                              onSuccess={(imgs) => field.onChange(imgs[0].url)}
                              onRemove={() => field.onChange("")}
                            />
                            <FormMessage className="text-[10px]" />
                          </FormItem>
                        )}
                      />

                      <Separator />

                      <FormField
                        control={form.control}
                        name="images"
                        render={({ field }) => (
                          <FormItem className="space-y-3">
                            <FormLabel className="text-[11px] font-bold uppercase text-slate-500 tracking-wider">
                              Gallery
                            </FormLabel>
                            <ImageUploadKit
                              value={field.value || []}
                              onChange={field.onChange}
                            />
                            <FormMessage className="text-[10px]" />
                          </FormItem>
                        )}
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Footer Controls */}
              <footer className="p-4 border-t bg-white flex items-center justify-between shrink-0">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setOpen(false)}
                  className="text-slate-400 text-xs px-4"
                >
                  Cancel
                </Button>
                <div className="flex items-center gap-2">
                  {currentStep !== "details" && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (currentStep === "media") setCurrentStep("variants");
                        else setCurrentStep("details");
                      }}
                      className="h-9 px-4 text-xs font-semibold"
                    >
                      <ArrowLeft className="mr-2 h-3 w-3" /> Back
                    </Button>
                  )}
                  <Button
                    onClick={handleNext}
                    className="h-9 px-6 text-xs font-semibold bg-black hover:bg-slate-800 text-white shadow-lg"
                  >
                    {currentStep === "media" ? (
                      <span className="flex items-center">
                        Review Listing <Eye className="ml-2 h-3 w-3" />
                      </span>
                    ) : (
                      <span className="flex items-center">
                        Next Step <ArrowRight className="ml-2 h-3 w-3" />
                      </span>
                    )}
                  </Button>
                </div>
              </footer>
            </div>
          </Form>
        </DialogContent>
      </Dialog>

      <ProductPreviewDialog
        open={isPreviewOpen}
        setOpen={setIsPreviewOpen}
        data={form.getValues()}
        onConfirm={form.handleSubmit(onFinalSubmit)}
        loading={loading}
      />
    </>
  );
}
