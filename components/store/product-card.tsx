"use client";

import { Star } from "lucide-react";
import Link from "next/link";

import { cn } from "@/lib/utils";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";

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
    return (
      <Link href={`/products/${product.slug}`} className="group block">
        <Card className="relative mx-auto w-full max-w-sm pt-0">
          <img
            src={product.mainImageUrl}
            alt={product.title}
            className="relative z-20 aspect-video w-full object-contain"
          />

          {discount > 0 && (
            <Badge
              variant="secondary"
              className="absolute top-1 left-1 bg-[#c7511f] text-white text-xs font-bold px-2 py-0.5 rounded"
            >
              -{discount}%
            </Badge>
          )}

          {!inStock && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className="bg-white text-xs font-semibold px-2 py-1 rounded">
                Out of Stock
              </span>
            </div>
          )}

          <CardHeader>
            <CardAction></CardAction>
            <CardTitle className="text-sm text-[#0F1111] line-clamp-2 mb-2 min-h-10">
              {product.title}
            </CardTitle>
            <CardDescription>
              {product._count && product._count.reviews > 0 && (
                <div className="flex z-50 items-center gap-1 mb-2">
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
            </CardDescription>
          </CardHeader>
          <CardFooter className="flex px-3 flex-col">
          
            <div className="flex relative justify-between items-baseline w-full">
              {product.discountedPrice && (
            <span className="text-xs absolute -top-4 left-0.5 text-[#565959] line-through">
              ${product.titlePrice.toFixed(2)}
            </span>
          )}
              <span className="text-xl font-semibold text-[#B12704]">
                ${finalPrice.toFixed(2)}
              </span>
              {inStock && (
                <p className="text-xs text-[#007600] mt-1 font-light">
                  FREE Delivery
                </p>
              )}
            </div>
          </CardFooter>
        </Card>
      </Link>
    );
  }
}
