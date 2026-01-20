"use client";

import Image from "next/image";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  CheckCircle2, 
  Loader2, 
  Tag, 
  Package, 
  Layers, 
  DollarSign, 
  ChevronRight 
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

interface ProductPreviewDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  data: any; 
  onConfirm: () => void;
  loading: boolean;
}

export function ProductPreviewDialog({
  open,
  setOpen,
  data,
  onConfirm,
  loading,
}: ProductPreviewDialogProps) {
  const galleryImages = [...(data.images || [])].sort((a, b) => a.order - b.order);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="min-w-5xl h-[85vh] flex flex-col p-0 overflow-hidden border-none shadow-2xl bg-slate-50">
        
        {/* Header: Subtle & Modern */}
        <DialogHeader className="px-6 py-4 bg-white border-b shrink-0 flex-row items-center justify-between space-y-0">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-50 p-2 rounded-full">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            </div>
            <div>
              <DialogTitle className="text-sm font-bold tracking-tight text-slate-900">
                Final Review
              </DialogTitle>
              <p className="text-[11px] text-slate-500">Inspect the listing details before publishing</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">
            Preview Mode <ChevronRight className="h-3 w-3" />
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-full w-full">
            <div className="max-w-4xl mx-auto p-8">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
                
                {/* Left: Imagery Section */}
                <div className="md:col-span-5 space-y-6">
                  <div className="group relative aspect-[4/5] rounded-2xl overflow-hidden bg-white border shadow-sm transition-all hover:shadow-md">
                    {data.mainImageUrl ? (
                      <Image
                        src={data.mainImageUrl}
                        alt="Main"
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full text-slate-300 gap-2">
                        <Package className="h-10 w-10 stroke-1" />
                        <span className="text-[11px] font-medium uppercase tracking-tighter">No Media Uploaded</span>
                      </div>
                    )}
                  </div>
                  
                  {galleryImages.length > 0 && (
                    <div className="grid grid-cols-4 gap-3">
                      {galleryImages.map((img: any, i: number) => (
                        <div key={i} className="aspect-square relative rounded-lg overflow-hidden border bg-white shadow-xs">
                          <Image src={img.url} alt="Gallery" fill className="object-cover" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Right: Information Canvas */}
                <div className="md:col-span-7 space-y-8">
                  {/* Brand & Identity */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border-none px-2 py-0 text-[10px] font-bold uppercase">
                        {data.categoryId || "General"}
                      </Badge>
                      {data.isFeatured && (
                        <Badge className="bg-amber-500 text-white border-none text-[10px] font-bold uppercase">Featured</Badge>
                      )}
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 tracking-tight leading-none">
                      {data.title || "Untitled Product"}
                    </h2>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-black text-slate-900">
                        ${Number(data.titlePrice || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </span>
                      {data.discountedPrice && (
                        <span className="text-sm text-slate-400 line-through font-medium">
                          ${Number(data.discountedPrice).toFixed(2)}
                        </span>
                      )}
                    </div>
                  </div>

                  <Separator className="opacity-50" />

                  {/* Description Box */}
                  <div className="space-y-3">
                    <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      <Layers className="h-3 w-3" /> Narrative & Context
                    </h4>
                    <div 
                      className="text-[13px] leading-relaxed text-slate-600 prose prose-sm max-w-none"
                      dangerouslySetInnerHTML={{ __html: data.description || "No description provided." }}
                    />
                  </div>

                  {/* Technical Specs Grid */}
                  {(data.variants?.length > 0 || data.colors?.length > 0) && (
                    <div className="bg-white rounded-xl border p-5 space-y-4 shadow-sm">
                      <h4 className="text-[10px] font-bold text-slate-900 uppercase tracking-wider border-b pb-2">Technical Specifications</h4>
                      
                      <div className="grid grid-cols-2 gap-y-4 gap-x-8">
                        {data.colors?.length > 0 && (
                          <div className="space-y-1">
                            <span className="text-[10px] text-slate-400 uppercase font-bold">Available Palette</span>
                            <div className="flex flex-wrap gap-1">
                              {data.colors.map((c: string) => (
                                <span key={c} className="text-[11px] font-medium text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                                  {c}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {data.variants?.map((v: any, i: number) => (
                          <div key={i} className="space-y-0.5">
                            <span className="text-[10px] text-slate-400 uppercase font-bold">{v.type || "Spec"}</span>
                            <p className="text-[12px] font-semibold text-slate-900">
                              {v.value} 
                              {v.price > 0 && <span className="text-emerald-600 ml-1">(+${v.price})</span>}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Metadata Tags */}
                  {data.tags && data.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-2">
                      {data.tags.map((tag: string) => (
                        <div key={tag} className="flex items-center gap-1 px-2 py-1 rounded-md bg-white border text-[10px] font-medium text-slate-500 uppercase tracking-tighter">
                          <Tag className="h-2.5 w-2.5" /> {tag}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </ScrollArea>
        </div>

        {/* Footer: Prominent Action */}
        <DialogFooter className="p-4 border-t bg-white shrink-0 flex items-center justify-between px-6">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => setOpen(false)} 
            disabled={loading}
            className="text-slate-500 text-xs hover:bg-slate-50"
          >
            Go back and edit
          </Button>
          <div className="flex items-center gap-3">
            <Button 
              onClick={onConfirm} 
              disabled={loading}
              className="bg-black hover:bg-slate-800 text-white px-8 h-9 text-xs font-bold transition-all active:scale-95 shadow-lg shadow-slate-200"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                  Publishing Listing...
                </>
              ) : (
                <>Complete & Publish</>
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}