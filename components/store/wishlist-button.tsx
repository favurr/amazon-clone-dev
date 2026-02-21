"use client";

import { useState } from "react";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { addToWishlist, removeFromWishlist } from "@/actions/wishlist";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface WishlistButtonProps {
  productId: string;
  userId?: string;
  isInWishlist: boolean;
  onWishlistAdd?: () => void;
  className?: string;
}

export function WishlistButton({
  productId,
  userId,
  isInWishlist: initialIsInWishlist,
  onWishlistAdd,
  className,
}: WishlistButtonProps) {
  const router = useRouter();
  const [isInWishlist, setIsInWishlist] = useState(initialIsInWishlist);
  const [isLoading, setIsLoading] = useState(false);

  const handleToggleWishlist = async () => {
    if (!userId) {
      router.push("/auth/login?redirect=/products");
      return;
    }

    setIsLoading(true);

    try {
      if (isInWishlist) {
        const result = await removeFromWishlist(userId, productId);
        if (result.success) {
          setIsInWishlist(false);
          router.refresh();
        }
      } else {
        const result = await addToWishlist(userId, productId);
        if (result.success) {
          setIsInWishlist(true);
          router.refresh();
          // Trigger popover notification
          if (onWishlistAdd) {
            onWishlistAdd();
          }
        }
      }
    } catch (error) {
      console.error("Wishlist error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant="outline"
      onClick={handleToggleWishlist}
      disabled={isLoading}
      className={cn(
        "transition-all cursor-pointer",
        isInWishlist && "bg-red-50 border-red-300 hover:bg-red-100",
        className
      )}
      title={isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
    >
      <Heart
        className={cn(
          "h-4 w-4 mr-2 transition-colors",
          isInWishlist ? "fill-red-500 text-red-500" : "text-slate-600"
        )}
      />
      {isInWishlist ? "Saved" : "Save"}
    </Button>
  );
}
