"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

/**
 * Add a product to user's wishlist
 */
export async function addToWishlist(userId: string, productId: string) {
  try {
    // Check if already in wishlist
    const existing = await prisma.wishlist.findUnique({
      where: {
        userId_productId: {
          userId,
          productId,
        },
      },
    });

    if (existing) {
      return {
        success: false,
        error: "Product already in your wishlist",
      };
    }

    // Add to wishlist
    await prisma.wishlist.create({
      data: {
        userId,
        productId,
      },
    });

    revalidatePath("/saved-items");
    revalidatePath(`/products/${productId}`);

    return {
      success: true,
    };
  } catch (error) {
    console.error("[ADD_TO_WISHLIST_ERROR]", error);
    return {
      success: false,
      error: "Failed to add to wishlist",
    };
  }
}

/**
 * Remove a product from user's wishlist
 */
export async function removeFromWishlist(userId: string, productId: string) {
  try {
    await prisma.wishlist.delete({
      where: {
        userId_productId: {
          userId,
          productId,
        },
      },
    });

    revalidatePath("/saved-items");
    revalidatePath(`/products/${productId}`);

    return {
      success: true,
    };
  } catch (error) {
    console.error("[REMOVE_FROM_WISHLIST_ERROR]", error);
    return {
      success: false,
      error: "Failed to remove from wishlist",
    };
  }
}

/**
 * Check if a product is in user's wishlist
 */
export async function isInWishlist(userId: string, productId: string) {
  try {
    const wishlistItem = await prisma.wishlist.findUnique({
      where: {
        userId_productId: {
          userId,
          productId,
        },
      },
    });

    return !!wishlistItem;
  } catch (error) {
    console.error("[IS_IN_WISHLIST_ERROR]", error);
    return false;
  }
}

/**
 * Get all wishlist items for a user
 */
export async function getUserWishlist(userId: string) {
  try {
    const wishlistItems = await prisma.wishlist.findMany({
      where: { userId },
      include: {
        product: {
          include: {
            category: {
              select: {
                name: true,
              },
            },
            variants: true,
            _count: {
              select: {
                reviews: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return wishlistItems.map((item) => ({
      id: item.id,
      createdAt: item.createdAt,
      product: {
        id: item.product.id,
        title: item.product.title,
        slug: item.product.slug,
        mainImageUrl: item.product.mainImageUrl,
        titlePrice: Number(item.product.titlePrice),
        discountedPrice: item.product.discountedPrice ? Number(item.product.discountedPrice) : null,
        isFeatured: item.product.isFeatured,
        isArchived: item.product.isArchived,
        category: item.product.category.name,
        variants: item.product.variants,
        _count: item.product._count,
      },
    }));
  } catch (error) {
    console.error("[GET_USER_WISHLIST_ERROR]", error);
    return [];
  }
}

/**
 * Get wishlist count for a user
 */
export async function getWishlistCount(userId: string) {
  try {
    const count = await prisma.wishlist.count({
      where: { userId },
    });

    return count;
  } catch (error) {
    console.error("[GET_WISHLIST_COUNT_ERROR]", error);
    return 0;
  }
}
