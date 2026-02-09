"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Star,
  ShoppingCart,
  Heart,
  Share2,
  Check,
  Package,
  Shield,
  Truck,
} from "lucide-react";
import { addToCart } from "@/actions/store";
import { useAlert } from "@/store/use-alert-store";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface ProductDetailClientProps {
  product: any;
  userId?: string;
}

export function ProductDetailClient({
  product,
  userId,
}: ProductDetailClientProps) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedVariants, setSelectedVariants] = useState<
    Record<string, string>
  >({});
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const alert = useAlert();

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
        toast.success("Added to cart!", {
          description: `${quantity} ${quantity === 1 ? "item" : "items"} added`,
        });
      } else {
        toast.success("Cart updated!", {
          description: `Quantity increased by ${quantity}`,
        });
      }
      setQuantity(1);
    } else {
      toast.error("Failed to add to cart", {
        description: result.error || "Please try again",
      });
    }

    setIsAdding(false);
  };

  const averageRating =
    product.reviews.length > 0
      ? product.reviews.reduce((sum: number, r: any) => sum + r.rating, 0) /
        product.reviews.length
      : 0;

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-slate-600 mb-6">
          <Link href="/" className="hover:text-orange-600">
            Home
          </Link>
          <span>/</span>
          <Link href="/products" className="hover:text-orange-600">
            Products
          </Link>
          <span>/</span>
          <Link
            href={`/products?category=${product.category.id}`}
            className="hover:text-orange-600"
          >
            {product.category.name}
          </Link>
          <span>/</span>
          <span className="text-slate-900 font-medium">{product.title}</span>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Left Column - Images */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="relative aspect-square bg-slate-100 rounded-lg overflow-hidden">
              <Image
                src={images[selectedImage].url}
                alt={images[selectedImage].altText || product.title}
                fill
                className="object-cover"
                priority
              />
              {discount > 0 && (
                <Badge className="absolute top-4 left-4 bg-red-500 text-white border-none text-lg px-3 py-1">
                  -{discount}%
                </Badge>
              )}
            </div>

            {/* Thumbnail Gallery */}
            {images.length > 1 && (
              <div className="grid grid-cols-5 gap-2">
                {images.map((image: any, index: number) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={cn(
                      "relative aspect-square rounded-lg overflow-hidden border-2 transition-all",
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
                    ${finalPrice.toFixed(2)}
                  </span>
                  {product.discountedPrice && (
                    <span className="text-xl text-slate-400 line-through">
                      ${product.titlePrice.toFixed(2)}
                    </span>
                  )}
                </div>
                {product.discountedPrice && (
                  <p className="text-emerald-600 font-semibold">
                    Save $
                    {(product.titlePrice - product.discountedPrice).toFixed(2)}{" "}
                    ({discount}% off)
                  </p>
                )}
              </div>

              <Separator />

              {/* Variant Selection */}
              {hasVariants && (
                <div className="space-y-4">
                  {Object.entries(variantTypes).map(
                    ([type, variants]: [string, any]) => (
                      <div key={type} className="space-y-2">
                        <Label className="font-semibold text-slate-700">
                          {type}:
                          {selectedVariants[type] && (
                            <span className="ml-2 font-normal text-slate-600">
                              {selectedVariants[type]}
                            </span>
                          )}
                        </Label>
                        <div className="flex flex-wrap gap-2">
                          {variants.map((variant: any) => {
                            const isSelected =
                              selectedVariants[type] === variant.value;
                            const isAvailable = variant.stock > 0;

                            return (
                              <button
                                key={variant.id}
                                onClick={() =>
                                  setSelectedVariants((prev) => ({
                                    ...prev,
                                    [type]: variant.value,
                                  }))
                                }
                                disabled={!isAvailable}
                                className={cn(
                                  "px-4 py-2 rounded-lg border-2 font-medium transition-all",
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
                  <Button variant="outline" className="flex-1">
                    <Heart className="h-4 w-4 mr-2" />
                    Wishlist
                  </Button>
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
                      <p className="text-slate-600">On orders over $50</p>
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

        {/* Description & Reviews Section */}
        <div className="mt-16 space-y-8">
          {/* Description */}
          <div>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">
              Product Description
            </h2>
            <div className="max-w-none">
              <article className="prose mx-auto prose-headings:font-sans prose-headings:font-bold prose-headings:text-[var(--color-primary)] prose-a:text-[var(--color-primary)] prose-a:no-underline hover:prose-a:text-[var(--color-primary-foreground)] prose-blockquote:border-l-[4px] prose-blockquote:border-[var(--color-accent)] prose-blockquote:pl-4 prose-code:bg-[var(--color-muted)] prose-code:text-[var(--color-destructive)] prose-pre:bg-[var(--color-card)] prose-pre:text-[var(--color-card-foreground)] prose-img:rounded-md" dangerouslySetInnerHTML={{ __html: product.description }} />
            </div>
          </div>

          <Separator />

          {/* Reviews */}
          <div>
            <h2 className="text-2xl font-bold text-slate-900 mb-6">
              Customer Reviews
            </h2>
            {product.reviews.length === 0 ? (
              <p className="text-slate-600">
                No reviews yet. Be the first to review!
              </p>
            ) : (
              <div className="space-y-6">
                {product.reviews.map((review: any) => (
                  <div key={review.id} className="border-b pb-6">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-semibold text-slate-900">
                          {review.user.name ||
                            `${review.user.firstName} ${review.user.lastName}`}
                        </p>
                        <div className="flex items-center gap-1 mt-1">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={cn(
                                "h-4 w-4",
                                i < review.rating
                                  ? "fill-amber-400 text-amber-400"
                                  : "text-slate-300",
                              )}
                            />
                          ))}
                        </div>
                      </div>
                      <span className="text-sm text-slate-500">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    {review.comment && (
                      <p className="text-slate-700 mt-2">{review.comment}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
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
