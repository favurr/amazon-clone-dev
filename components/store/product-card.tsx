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
  CardTitle,
} from "@/components/ui/card";
import { Currency, CurrencyValue } from "../currency";

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
        <Card className="relative mx-auto w-full gap-2 max-w-sm pt-0 ">
          <div className="inset-0">
            <img
              src={product.mainImageUrl}
              alt={product.title}
              className="relative z-20 aspect-video w-full object-cover rounded-t-lg"
            />
          </div>

          {discount > 0 && (
            <Badge
              variant="secondary"
              className="absolute top-1 z-25 left-1 bg-[#c7511f] text-white text-[10px] sm:text-xs font-bold px-1.5 sm:px-2 py-0.5 rounded"
            >
              -{discount}%
            </Badge>
          )}

          {!inStock && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className="bg-white text-[10px] sm:text-xs font-semibold px-2 py-1 rounded">
                Out of Stock
              </span>
            </div>
          )}

          <CardHeader className="p-2 sm:p-3 md:p-4">
            <CardAction></CardAction>
            <CardTitle className="text-xs sm:text-sm text-[#0F1111] line-clamp-2 mb-1">
              {product.title}
            </CardTitle>
            <CardDescription>
              {product._count && product._count.reviews > 0 && (
                <div className="flex z-50 items-center gap-0.5 sm:gap-1 mb-1">
                  <div className="flex">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={cn(
                          "h-2.5 w-2.5 sm:h-3 sm:w-3",
                          i < 4
                            ? "fill-[#ff9900] text-[#ff9900]"
                            : "text-slate-300",
                        )}
                      />
                    ))}
                  </div>
                  <span className="text-[10px] sm:text-xs text-[#007185]">
                    {product._count.reviews}
                  </span>
                </div>
              )}
            </CardDescription>
          </CardHeader>
          <CardFooter className="flex px-2 sm:px-3 flex-col">
            <div className="flex relative justify-between items-baseline w-full">
              {product.discountedPrice && (
                <span className="text-[10px] absolute -top-3 sm:-top-4 left-0.5 text-[#565959]">
                  <Currency>
                    <CurrencyValue
                      value={product.titlePrice}
                      className="line-through"
                    />
                  </Currency>
                </span>
              )}
              <span className="text-lg font-normal text-[#B12704]">
                <Currency>
                  <CurrencyValue value={finalPrice} />
                </Currency>
              </span>
            </div>
          </CardFooter>
        </Card>
      </Link>
    );
  }

  // Default (non-compact) card
  return (
    <Link href={`/products/${product.slug}`} className="group block">
      <Card className="relative overflow-hidden bg-white shadow-sm transition-shadow hover:shadow-md">
        {/* Image */}
        <div className="relative">
          <img
            src={product.mainImageUrl}
            alt={product.title}
            className="w-full aspect-square object-cover"
          />

          {discount > 0 && (
            <Badge
              variant="secondary"
              className="absolute top-2 left-2 z-10 bg-[#c7511f] text-white text-xs font-bold px-2 py-0.5 rounded"
            >
              -{discount}%
            </Badge>
          )}

          {!inStock && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <span className="bg-white text-xs font-semibold px-2 py-1 rounded">
                Out of Stock
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <CardHeader className="p-4">
          <CardAction></CardAction>
          <CardTitle className="text-sm md:text-base text-[#0F1111] line-clamp-2 mb-1">
            {product.title}
          </CardTitle>
          <CardDescription>
            {product._count && product._count.reviews > 0 && (
              <div className="flex items-center gap-1 mb-1">
                <div className="flex">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={cn(
                        "h-3.5 w-3.5",
                        i < 4 ? "fill-[#ff9900] text-[#ff9900]" : "text-slate-300",
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

        <CardFooter className="px-4 pb-4">
          <div className="flex items-baseline gap-2">
            {product.discountedPrice && (
              <span className="text-xs text-[#565959]">
                <Currency>
                  <CurrencyValue value={product.titlePrice} className="line-through" />
                </Currency>
              </span>
            )}
            <span className="text-lg font-medium text-[#B12704]">
              <Currency>
                <CurrencyValue value={finalPrice} />
              </Currency>
            </span>
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
}
