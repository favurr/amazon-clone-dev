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
  compact?: boolean;
}

export function FeaturedCard({
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
        <Card className="relative h-32 mx-auto w-full pt-0">


          {discount > 0 && (
            <Badge
              variant="secondary"
              className="absolute top-1 left-1 bg-[#c7511f] text-white text-xs font-bold px-2 py-0.5 rounded"
            >
              -{discount}% discount on first buy
            </Badge>
          )}

          <CardHeader>
            <CardAction></CardAction>
            <CardTitle className="text-sm text-[#0F1111] line-clamp-2 mb-2 min-h-10">
              {product.title}
            </CardTitle>
            <CardDescription>
              
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
}
