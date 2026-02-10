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
    description?: string;
    titlePrice: number;
    discountedPrice?: number | null;
    mainImageUrl: string;
    isFeatured?: boolean;
    totalStock?: number;
    _count?: { reviews: number };
    category?: { name: string };
  };
  userId?: string;
  compact?: boolean;
  variant?: "default" | "hero" | "overlay";
  className?: string;
}

export function FeaturedCard({
  product,
  userId,
  compact = false,
  variant = "default",
  className = "",
}: ProductCardProps) {
  const discount = product.discountedPrice
    ? Math.round(
        ((product.titlePrice - product.discountedPrice) / product.titlePrice) *
          100,
      )
    : 0;

  const finalPrice = product.discountedPrice || product.titlePrice;
  const inStock = (product.totalStock || 0) > 0;

  // Hero variant - large card (takes 2 columns) - Responsive
  if (variant === "hero") {
    return (
      <Link href={`/products/${product.slug}`} className={cn("group block sm:col-span-2", className)}>
        <Card className="relative h-auto sm:h-70 py-0 overflow-hidden bg-white shadow-sm transition-shadow">
          {discount > 0 && (
            <Badge className="absolute top-2 left-2 sm:top-4 sm:left-4 z-10 bg-[#c7511f] text-white text-xs sm:text-sm">
              -{discount}%
            </Badge>
          )}
          
          <div className="flex flex-col sm:flex-row h-full">
            
            {/* Content Section */}
            <div className="flex-1 px-3 py-4 sm:px-4 sm:py-auto flex flex-col justify-center items-center">
              <div>
                <h3 className="text-base sm:text-lg md:text-xl font-bold text-[#0F1111] mb-2 sm:mb-3 line-clamp-2">
                  {product.title}
                </h3>
                <div className="text-xs sm:text-sm text-[#565959] mb-2 sm:mb-4 line-clamp-2 sm:line-clamp-3" dangerouslySetInnerHTML={{ __html: product.description || "Discover amazing features and quality with this premium product." }} />
              </div>
            </div>

            {/* Image Section */}
            <div className="flex-1 relative min-h-[200px] sm:min-h-full">
              <img
                src={product.mainImageUrl}
                alt={product.title}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </Card>
      </Link>
    );
  }

  // Overlay variant - background image with text overlay - Responsive
  if (variant === "overlay") {
    return (
      <Link href={`/products/${product.slug}`} className={cn("group block", className)}>
        <Card className="relative h-48 sm:h-60 md:h-70 overflow-hidden bg-gray-900">
          {/* Background Image */}
          <div className="absolute inset-0">
            <img
              src={product.mainImageUrl}
              alt={product.title}
              className="w-full h-full object-cover transition-transform duration-300"
            />
            {/* Dark blur overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent" />
          </div>
          
          {/* Content Overlay - Bottom Left */}
          <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 md:p-6 text-white z-10">
            <div className="space-y-1 sm:space-y-2">
              <h3 className="text-sm sm:text-base md:text-lg font-bold line-clamp-2">
                {product.title}
              </h3>
              <span className="text-[10px] sm:text-xs text-gray-200 line-clamp-1 sm:line-clamp-2" dangerouslySetInnerHTML={{ __html: product.description || "Experience the perfect blend of style and functionality with this top-rated product." }} />
            </div>
          </div>
        </Card>
      </Link>
    );
  }

  // Default/compact variant
  if (compact) {
    return (
      <Link href={`/products/${product.slug}`} className={cn("group block", className)}>
        <Card className="relative h-32 mx-auto w-full pt-0">
          {discount > 0 && (
            <Badge
              variant="secondary"
              className="absolute top-1 left-1 bg-[#c7511f] text-white text-xs font-bold px-2 py-0.5 rounded z-10"
            >
              -{discount}%
            </Badge>
          )}

          <CardHeader>
            <CardAction></CardAction>
            <CardTitle className="text-sm text-[#0F1111] line-clamp-2 mb-2 min-h-10">
              {product.title}
            </CardTitle>
            <CardDescription>
              ${finalPrice.toFixed(2)}
            </CardDescription>
          </CardHeader>
          <img
            src={product.mainImageUrl}
            alt={product.title}
            className="relative z-2 aspect-video w-full object-contain"
          />
        </Card>
      </Link>
    );
  }

  return null;
}
