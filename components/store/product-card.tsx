"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface ProductCardProps {
  product: {
    id: string;
    slug: string;
    title: string;
    titlePrice: number;
    discountedPrice?: number | null;
    mainImageUrl: string;
    isFeatured?: boolean;
    totalStock?: number;
    _count?: { reviews: number };
    category?: { name: string };
  };
  userId?: string;
  compact?: boolean; // New prop for compact grid display
}

export function ProductCard({
  product,
  userId,
  compact = false,
}: ProductCardProps) {
  const discount = product.discountedPrice
    ? Math.round(
        ((product.titlePrice - product.discountedPrice) / product.titlePrice) *
          100,
      )
    : 0;

  const finalPrice = product.discountedPrice || product.titlePrice;
  const inStock = (product.totalStock || 0) > 0;

  if (compact) {
    // Amazon-style compact card for grids
    return (
      <Link href={`/products/${product.slug}`} className="group block">
        <div className="bg-white border border-[#ddd] rounded hover:shadow-lg transition-shadow p-3">
          {/* Image */}
          <div className="relative aspect-square mb-3 bg-white">
            <Image
              src={product.mainImageUrl}
              alt={product.title}
              fill
              className="object-contain group-hover:scale-105 transition-transform"
            />

            {/* Badges */}
            {discount > 0 && (
              <div className="absolute top-1 left-1 bg-[#c7511f] text-white text-xs font-bold px-2 py-0.5 rounded">
                -{discount}%
              </div>
            )}

            {!inStock && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <span className="bg-white text-xs font-semibold px-2 py-1 rounded">
                  Out of Stock
                </span>
              </div>
            )}
          </div>

          {/* Title */}
          <h3 className="text-sm text-[#0F1111] line-clamp-2 mb-2 min-h-[2.5rem]">
            {product.title}
          </h3>

          {/* Reviews */}
          {product._count && product._count.reviews > 0 && (
            <div className="flex items-center gap-1 mb-2">
              <div className="flex">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={cn(
                      "h-3 w-3",
                      i < 4
                        ? "fill-[#ff9900] text-[#ff9900]"
                        : "text-slate-300",
                    )}
                  />
                ))}
              </div>
              <span className="text-xs text-[#007185]">
                {product._count.reviews}
              </span>
            </div>
          )}

          {/* Price */}
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-semibold text-[#B12704]">
              ${finalPrice.toFixed(2)}
            </span>
            {product.discountedPrice && (
              <span className="text-xs text-[#565959] line-through">
                ${product.titlePrice.toFixed(2)}
              </span>
            )}
          </div>

          {/* Prime/Free Shipping Badge */}
          {inStock && (
            <p className="text-xs text-[#007600] mt-1 font-semibold">
              FREE Delivery
            </p>
          )}
        </div>
      </Link>
    );
  }

  // Original full card for other uses
  return (
    <Link href={`/products/${product.slug}`}>
      <div className="relative mx-auto w-full max-w-sm bg-white border border-[#ddd] rounded hover:shadow-xl transition-shadow">
        <div className="relative aspect-video w-full bg-white p-4">
          <Image
            src={product.mainImageUrl}
            alt={product.title}
            fill
            className="object-contain"
          />
        </div>

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {product.isFeatured && (
            <Badge className="bg-amber-500 text-white border-none gap-1 shadow-lg">
              <Star className="h-3 w-3 fill-white" /> Featured
            </Badge>
          )}
          {discount > 0 && (
            <Badge className="bg-[#c7511f] text-white border-none shadow-lg">
              -{discount}%
            </Badge>
          )}
        </div>

        {/* Stock Status */}
        {!inStock && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <Badge
              variant="outline"
              className="bg-white text-slate-900 font-bold"
            >
              Out of Stock
            </Badge>
          </div>
        )}

        {/* Content */}
        <div className="p-4">
          {/* Category */}
          {product.category && (
            <p className="text-xs text-[#565959] mb-1">
              in {product.category.name}
            </p>
          )}

          {/* Title */}
          <h3 className="text-sm font-medium text-[#0F1111] line-clamp-2 mb-2">
            {product.title}
          </h3>

          {/* Reviews */}
          {product._count && product._count.reviews > 0 && (
            <div className="flex items-center gap-2 mb-2">
              <div className="flex">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={cn(
                      "h-3.5 w-3.5",
                      i < 4
                        ? "fill-[#ff9900] text-[#ff9900]"
                        : "text-slate-300",
                    )}
                  />
                ))}
              </div>
              <span className="text-sm text-[#007185]">
                {product._count.reviews}
              </span>
            </div>
          )}

          {/* Price */}
          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-2xl font-semibold text-[#B12704]">
              ${finalPrice.toFixed(2)}
            </span>
            {product.discountedPrice && (
              <span className="text-sm text-[#565959] line-through">
                ${product.titlePrice.toFixed(2)}
              </span>
            )}
          </div>

          {/* Shipping */}
          {inStock && (
            <p className="text-sm text-[#007600] font-semibold">
              FREE Delivery
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}
