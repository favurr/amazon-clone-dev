"use client";

import { addToCart } from "@/actions/store";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { useAlert } from "@/store/use-alert-store";
import { useCartStore } from "@/store/use-cart-store";
import {
  Heart,
  Package,
  Share2,
  Shield,
  ShoppingCart,
  Star,
  Truck,
} from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { toast } from "sonner";
import { ReviewForm } from "@/components/store/review-form";
import { ReviewList } from "@/components/store/review-list";
import Link from "next/link";
import { Currency, CurrencyValue } from "../currency";
import { WishlistButton } from "@/components/store/wishlist-button";
import { useWishlistPopoverStore } from "@/store/use-wishlist-popover-store";

interface ProductDetailClientProps {
  product: any;
  userId?: string;
  reviews: any[];
  reviewEligibility: {
    status: "can_review" | "already_reviewed" | "not_purchased" | "error";
    review: {
      id: string;
      rating: number;
      comment: string | null;
      createdAt: Date;
    } | null;
  } | null;
  isInWishlist: boolean;
}

export function ProductDetailClient({
  product,
  userId,
  reviews,
  reviewEligibility,
  isInWishlist,
}: ProductDetailClientProps) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedVariants, setSelectedVariants] = useState<
    Record<string, string>
  >({});
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const alert = useAlert();
  const { increment, setCount } = useCartStore();
  const { triggerShow } = useWishlistPopoverStore();

  const handleWishlistAdd = () => {
    triggerShow();
  };

  const images =
    product.images.length > 0
      ? product.images
      : [{ url: product.mainImageUrl, altText: product.title }];

  // Group variants by type
  const variantTypes = product.variants.reduce((acc: any, variant: any) => {
    if (!acc[variant.type]) {
      acc[variant.type] = [];
    }
    acc[variant.type].push(variant);
    return acc;
  }, {});

  const hasVariants = Object.keys(variantTypes).length > 0;

  // Find matching variant based on selections
  const getMatchingVariant = () => {
    if (!hasVariants) return null;

    const selectedValues = Object.values(selectedVariants);
    if (selectedValues.length !== Object.keys(variantTypes).length) return null;

    return product.variants.find((v: any) => selectedValues.includes(v.value));
  };

  const matchingVariant = getMatchingVariant();
  const canAddToCart = !hasVariants || matchingVariant;
  const stockAvailable = matchingVariant
    ? matchingVariant.stock
    : product.totalStock;

  const finalPrice = matchingVariant
    ? matchingVariant.price
    : product.discountedPrice || product.titlePrice;

  const discount = product.discountedPrice
    ? Math.round(
        ((product.titlePrice - product.discountedPrice) / product.titlePrice) *
          100,
      )
    : 0;

  const handleAddToCart = async () => {
    if (!userId) {
      alert.error("Please login to add items to cart", "floating");
      return;
    }

    if (!canAddToCart) {
      alert.error("Please select all product options", "floating");
      return;
    }

    if (stockAvailable < quantity) {
      alert.error("Insufficient stock", "floating");
      return;
    }

    setIsAdding(true);
    const result = await addToCart(
      userId,
      product.id,
      matchingVariant?.id,
      quantity,
    );

    if (result.success) {
      if (result.isNewItem) {
        increment();
        toast.success("Added to cart!");
      } else {
        toast.success("Cart updated!");
      }
    } else {
      alert.error(result.error || "Failed to add to cart", "floating");
    }

    setIsAdding(false);
  };

  const averageRating =
    product.reviews.length > 0
      ? product.reviews.reduce((sum: number, r: any) => sum + r.rating, 0) /
        product.reviews.length
      : 0;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Left Column - Images */}
          <div>
            <div className="relative aspect-square rounded-xl overflow-hidden bg-white border border-slate-200 mb-4">
              <Image
                src={images[selectedImage]?.url || product.mainImageUrl}
                alt={images[selectedImage]?.altText || product.title}
                fill
                className="object-cover"
                priority
              />
              {discount > 0 && (
                <div className="absolute top-4 left-4 bg-red-500 text-white text-sm font-bold px-3 py-1 rounded-full">
                  -{discount}%
                </div>
              )}
            </div>

            {images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {images.map((image: any, index: number) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={cn(
                      "relative h-20 w-20 rounded-lg overflow-hidden border-2 shrink-0 transition-colors",
                      selectedImage === index
                        ? "border-orange-500"
                        : "border-slate-200 hover:border-slate-300",
                    )}
                  >
                    <Image
                      src={image.url}
                      alt={image.altText || `Product image ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column - Details & Buy Box */}
          <div>
            <div className="space-y-6">
              {/* Header */}
              <div>
                <h1 className="text-3xl font-bold text-slate-900 mb-2">
                  {product.title}
                </h1>
                <div className="flex items-center gap-4">
                  {product.reviews.length > 0 && (
                    <div className="flex items-center gap-2">
                      <div className="flex items-center">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={cn(
                              "h-4 w-4",
                              i < Math.round(averageRating)
                                ? "fill-amber-400 text-amber-400"
                                : "text-slate-300",
                            )}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-slate-600">
                        {averageRating.toFixed(1)} ({product.reviews.length}{" "}
                        reviews)
                      </span>
                    </div>
                  )}
                  {product.isFeatured && (
                    <Badge className="bg-amber-500 text-white">Featured</Badge>
                  )}
                </div>
              </div>

              <Separator />

              {/* Price */}
              <div className="space-y-2">
                <div className="flex items-baseline gap-3">
                  <span className="text-4xl font-bold text-slate-900">
                    <Currency><CurrencyValue value={finalPrice}/></Currency>
                  </span>
                  {product.discountedPrice && (
                    <span className="text-xl text-slate-400 line-through">
                      <Currency><CurrencyValue value={product.titlePrice} className="line-through"/></Currency>
                    </span>
                  )}
                  {discount > 0 && (
                    <Badge className="bg-red-100 text-red-700 hover:bg-red-100">
                      Save {discount}%
                    </Badge>
                  )}
                </div>
              </div>

              {/* Variants */}
              {hasVariants && (
                <div className="space-y-4">
                  {Object.entries(variantTypes).map(
                    ([type, variants]: [string, any]) => (
                      <div key={type} className="space-y-2">
                        <Label className="font-semibold text-slate-700">
                          {type}
                        </Label>
                        <div className="flex flex-wrap gap-2">
                          {variants.map((variant: any) => {
                            const isSelected =
                              selectedVariants[type] === variant.value;
                            const isAvailable = variant.stock > 0;

                            return (
                              <button
                                key={variant.id}
                                onClick={() => {
                                  if (isAvailable) {
                                    setSelectedVariants((prev) => ({
                                      ...prev,
                                      [type]: variant.value,
                                    }));
                                  }
                                }}
                                className={cn(
                                  "px-4 py-2 text-sm border-2 rounded-lg transition-colors font-medium",
                                  isSelected
                                    ? "border-orange-500 bg-orange-50 text-orange-700"
                                    : "border-slate-200 hover:border-slate-300 text-slate-700",
                                  !isAvailable &&
                                    "opacity-50 cursor-not-allowed line-through",
                                )}
                              >
                                {variant.value}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ),
                  )}
                </div>
              )}

              {/* Quantity Selector */}
              <div className="space-y-2">
                <Label className="font-semibold text-slate-700">Quantity</Label>
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                    disabled={quantity <= 1}
                  >
                    -
                  </Button>
                  <span className="w-12 text-center font-semibold">
                    {quantity}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setQuantity((prev) => Math.min(stockAvailable, prev + 1))
                    }
                    disabled={quantity >= stockAvailable}
                  >
                    +
                  </Button>
                  <span className="text-sm text-slate-600 ml-2">
                    {stockAvailable} available
                  </span>
                </div>
              </div>

              <Separator />

              {/* Sticky Buy Box */}
              <div className="lg:sticky lg:top-20 space-y-4 bg-slate-50 p-6 rounded-lg border border-slate-200">
                <Button
                  onClick={handleAddToCart}
                  disabled={isAdding || !canAddToCart || stockAvailable === 0}
                  className="w-full h-12 bg-orange-500 hover:bg-orange-600 text-white font-semibold text-lg"
                >
                  <ShoppingCart className="h-5 w-5 mr-2" />
                  {isAdding
                    ? "Adding..."
                    : stockAvailable === 0
                      ? "Out of Stock"
                      : !canAddToCart
                        ? "Select Options"
                        : "Add to Cart"}
                </Button>

                <div className="flex gap-2">
                  <WishlistButton
                    productId={product.id}
                    userId={userId}
                    isInWishlist={isInWishlist}
                    onWishlistAdd={handleWishlistAdd}
                    className="flex-1 h-11"
                  />
                  <Button variant="outline" className="flex-1">
                    <Share2 className="h-4 w-4 mr-2" />
                    Share
                  </Button>
                </div>

                {/* Trust Badges */}
                <div className="space-y-3 pt-4 border-t">
                  <div className="flex items-center gap-3 text-sm">
                    <div className="bg-emerald-100 p-2 rounded-lg">
                      <Truck className="h-5 w-5 text-emerald-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">
                        Free Shipping
                      </p>
                      <p className="text-slate-600">On orders over <Currency><CurrencyValue value={50}/></Currency></p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <div className="bg-blue-100 p-2 rounded-lg">
                      <Shield className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">
                        Secure Payment
                      </p>
                      <p className="text-slate-600">100% secure transactions</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <div className="bg-amber-100 p-2 rounded-lg">
                      <Package className="h-5 w-5 text-amber-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">
                        Easy Returns
                      </p>
                      <p className="text-slate-600">30-day return policy</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tags */}
              {product.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {product.tags.map((tag: any) => (
                    <Badge key={tag.name} variant="outline">
                      {tag.name}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Description & Reviews */}
        <div className="mt-16 space-y-12">
          {/* Description */}
          <div className="bg-white prose rounded-xl border border-slate-200 p-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">
              Product Description
            </h2>
            <p
              className="text-slate-600 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: product.description }}
            />
          </div>

          {/* Reviews Section */}
          <div className="bg-white rounded-xl border border-slate-200 p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-slate-900">
                Customer Reviews
              </h2>
              {reviews.length > 0 && (
                <div className="flex items-center gap-2">
                  <div className="flex items-center">
                    {Array.from({ length: 5 }).map((_, i) => {
                      const avgRating = reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length;
                      return (
                        <Star
                          key={i}
                          className={cn(
                            "h-4 w-4",
                            i < Math.round(avgRating)
                              ? "fill-amber-400 text-amber-400"
                              : "text-slate-300"
                          )}
                        />
                      );
                    })}
                  </div>
                  <span className="text-sm text-slate-600">
                    {(reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)} ({reviews.length} {reviews.length === 1 ? 'review' : 'reviews'})
                  </span>
                </div>
              )}
            </div>

            {/* Review Form */}
            {userId ? (
              <div className="mb-8">
                <ReviewForm
                  productId={product.id}
                  userId={userId}
                  eligibilityStatus={reviewEligibility?.status || "not_purchased"}
                  existingReview={reviewEligibility?.review || null}
                />
              </div>
            ) : (
              <div className="mb-8 bg-slate-50 border border-slate-200 rounded-lg p-6 text-center">
                <p className="text-slate-600 text-sm">
                  <Link href="/auth/login" className="text-blue-600 hover:underline font-semibold">
                    Log in
                  </Link>{" "}
                  to leave a review
                </p>
              </div>
            )}

            <Separator className="my-8" />

            {/* Reviews List */}
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">
                All Reviews
              </h3>
              <ReviewList reviews={reviews} currentUserId={userId} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Label({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <label className={cn("block text-sm", className)}>{children}</label>;
}
