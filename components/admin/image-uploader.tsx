"use client";

import { useRef, useState } from "react";
import { upload } from "@imagekit/next";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ImagePlus, Loader2, X } from "lucide-react";
import { useAlert } from "@/store/use-alert-store";

interface ImageUploaderProps {
  onSuccess: (images: { url: string; fileId: string }[]) => void;
  onRemove?: () => void;
  value?: string;
  multiple?: boolean;
}

export function ImageUploader({ onSuccess, onRemove, value, multiple = false }: ImageUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const alert = useAlert();

  const getAuth = async () => {
    const response = await fetch("/api/imagekit/auth");
    return await response.json();
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);

    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        // Unique auth per file to prevent batch failure
        const auth = await getAuth(); 

        const res = await upload({
          ...auth,
          file,
          fileName: file.name,
          folder: "/amazon/products",
          useUniqueFileName: true,
        });

        return { url: res.url!, fileId: String(res.fileId) };
      });

      const results = await Promise.all(uploadPromises);
      
      onSuccess(results);
      alert.success(`Successfully uploaded ${results.length} images`);
    } catch (error) {
      console.error("Upload Error:", error);
      alert.error("One or more images failed to upload");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  if (!multiple && value) {
    return (
      <div className="relative aspect-square w-40 rounded-lg overflow-hidden border group">
        <img src={value} alt="Main" className="object-cover w-full h-full" />
        <button
          type="button"
          onClick={onRemove}
          className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition shadow-md"
        >
          <X size={14} />
        </button>
      </div>
    );
  }

  return (
    <div className="w-full">
      <input 
        type="file" 
        className="hidden" 
        ref={fileInputRef} 
        onChange={handleUpload} 
        accept="image/*" 
        multiple={multiple} 
      />
      
      <Button
        type="button"
        variant="outline"
        disabled={isUploading}
        onClick={() => fileInputRef.current?.click()}
        className="w-full h-32 border-dashed border-2 flex flex-col gap-2 bg-slate-50/50 hover:bg-slate-100 transition-colors"
      >
        {isUploading ? (
          <Loader2 className="h-6 w-6 animate-spin text-orange-500" />
        ) : (
          <ImagePlus className="h-6 w-6 text-slate-400" />
        )}
        <span className="text-xs font-medium text-slate-500">
          {isUploading ? "Uploading batch..." : multiple ? "Add Gallery Images" : "Upload Hero Image"}
        </span>
      </Button>

      {isUploading && (
        <div className="mt-2 space-y-1">
          <Progress value={100} className="h-1 animate-pulse" />
          <p className="text-[10px] text-slate-400 text-center">Processing files...</p>
        </div>
      )}
    </div>
  );
}