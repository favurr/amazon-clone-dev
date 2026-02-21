"use client";

import { useState } from "react";
import { Heart, ShoppingCart, Trash2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { removeFromWishlist } from "@/actions/wishlist";
import { addToCart } from "@/actions/store";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Currency, CurrencyValue } from "@/components/currency";

interface WishlistItem {
  id: string;
  createdAt: Date;
  product: {
    id: string;
    title: string;
    slug: string;
    mainImageUrl: string;
    titlePrice: number;
    discountedPrice: number | null;
    isFeatured: boolean;
    isArchived: boolean;
    category: string;
    variants: any[];
    _count: { reviews: number };
  };
}

interface SavedItemsClientProps {
  wishlistItems: WishlistItem[];
  userId: string;
}

export function SavedItemsClient({ wishlistItems: initialItems, userId }: SavedItemsClientProps) {
  const router = useRouter();
  const [items, setItems] = useState(initialItems);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [addingToCartId, setAddingToCartId] = useState<string | null>(null);

  const handleRemove = async (productId: string, itemId: string) => {
    setRemovingId(itemId);
    const result = await removeFromWishlist(userId, productId);
    if (result.success) {
      setItems(items.filter((item) => item.id !== itemId));
      toast.success("Removed from saved items");
    } else {
      toast.error("Failed to remove item");
    }
    setRemovingId(null);
  };

  const handleAddToCart = async (productId: string, itemId: string) => {
    setAddingToCartId(itemId);
    const result = await addToCart(userId, productId);
    if (result.success) {
      toast.success("Added to cart");
      router.refresh();
    } else {
      toast.error("Failed to add to cart");
    }
    setAddingToCartId(null);
  };

  const finalPrice = (item: WishlistItem) => {
    return item.product.discountedPrice || item.product.titlePrice;
  };

  return (
    <div className="container max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Saved Items</h1>
        <p className="text-slate-600 mt-2">
          {items.length} {items.length === 1 ? "item" : "items"} saved
        </p>
      </div>

      {items.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="h-16 w-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
              <Heart className="h-8 w-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              No saved items yet
            </h3>
            <p className="text-slate-600 text-sm mb-6 text-center max-w-md">
              Save products you love to easily find them later
            </p>
            <Button asChild>
              <Link href="/products">Browse Products</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {items.map((item) => (
            <Card key={item.id} className="overflow-hidden group">
              <Link href={`/products/${item.product.slug}`}>
                <div className="relative aspect-square bg-slate-100">
                  <Image
                    src={item.product.mainImageUrl}
                    alt={item.product.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform"
                  />
                  {item.product.discountedPrice && (
                    <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                      {Math.round(
                        ((item.product.titlePrice - item.product.discountedPrice) /
                          item.product.titlePrice) *
                          100
                      )}
                      % OFF
                    </div>
                  )}
                  {item.product.isArchived && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <span className="bg-white text-xs font-semibold px-2 py-1 rounded">
                        Out of Stock
                      </span>
                    </div>
                  )}
                </div>
              </Link>

              <CardContent className="p-4">
                <Link href={`/products/${item.product.slug}`}>
                  <h3 className="font-semibold text-slate-900 line-clamp-2 mb-2 hover:text-blue-600">
                    {item.product.title}
                  </h3>
                </Link>

                <div className="text-sm text-slate-500 mb-2">{item.product.category}</div>

                <div className="flex items-baseline gap-2 mb-4">
                  {item.product.discountedPrice && (
                    <span className="text-sm text-slate-500 line-through">
                      <Currency>
                        <CurrencyValue value={item.product.titlePrice} />
                      </Currency>
                    </span>
                  )}
                  <span className="text-lg font-semibold text-slate-900">
                    <Currency>
                      <CurrencyValue value={finalPrice(item)} />
                    </Currency>
                  </span>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={() => handleAddToCart(item.product.id, item.id)}
                    disabled={item.product.isArchived || addingToCartId === item.id}
                    className="flex-1"
                    size="sm"
                  >
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    {addingToCartId === item.id ? "Adding..." : "Add to Cart"}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleRemove(item.product.id, item.id)}
                    disabled={removingId === item.id}
                  >
                    <Trash2 className="h-4 w-4 text-red-600" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
