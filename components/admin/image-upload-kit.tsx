"use client"

import { useEffect, useState, useRef } from "react";
import { ImageUploader } from "./image-uploader";
import { X } from "lucide-react";
import { getProductImages } from "@/actions/product";

interface ImageUploadKitProps {
  productId?: string;
  value: any[]; 
  onChange: (value: any[]) => void;
}

export function ImageUploadKit({ productId, value, onChange }: ImageUploadKitProps) {
  const [images, setImages] = useState<any[]>([]);
  const isFetched = useRef(false);

  useEffect(() => {
    // Only fetch if we have a productId and haven't fetched for this instance yet
    const fetchImages = async () => {
      if (!productId || isFetched.current) return;
      
      const result = await getProductImages(productId);
      if (result.success && result.data) {
        const dbData = result.data; // Matches your Prisma return type
        setImages(dbData);
        onChange(dbData);
        isFetched.current = true;
      }
    };

    fetchImages();
  }, [productId]);

  const handleBatchUpload = (newImages: { url: string; fileId: string }[]) => {
    const formatted = newImages.map((img, index) => ({
      url: img.url,
      key: img.fileId,
      order: images.length + index,
    }));
    
    const newList = [...images, ...formatted];
    setImages(newList);
    onChange(newList);
  };

  const onRemove = (idToRemove: string) => {
    const filtered = images.filter((img) => (img.id || img.key) !== idToRemove);
    setImages(filtered);
    onChange(filtered);
  };

  return (
    <div className="space-y-4 border p-4 rounded-lg bg-slate-50/30">
      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {images.map((img, index) => (
            <div key={img.id || img.key} className="relative aspect-square rounded-md overflow-hidden border-2 border-white shadow-sm">
              <img src={img.url} className="object-cover w-full h-full" alt="Asset" />
              <button
                type="button"
                onClick={() => onRemove(img.id || img.key)}
                className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:scale-110 transition"
              >
                <X size={12} />
              </button>
            </div>
          ))}
        </div>
      )}
      <ImageUploader multiple onSuccess={handleBatchUpload} />
    </div>
  );
}