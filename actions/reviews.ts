"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { createNotification } from "@/actions/notifications";

/**
 * Check if a user can review a product
 * Returns the eligibility status and existing review if any
 */
export async function canUserReviewProduct(userId: string, productId: string) {
  try {
    // Check if user already reviewed this product
    const existingReview = await prisma.review.findUnique({
      where: {
        userId_productId: {
          userId,
          productId,
        },
      },
    });

    if (existingReview) {
      return {
        status: "already_reviewed" as const,
        review: {
          id: existingReview.id,
          rating: existingReview.rating,
          comment: existingReview.comment,
          createdAt: existingReview.createdAt,
        },
      };
    }

    // Check if user has a completed order containing this product
    const completedOrder = await prisma.order.findFirst({
      where: {
        userId,
        status: "COMPLETED",
        items: {
          some: {
            productId,
          },
        },
      },
    });

    if (!completedOrder) {
      return {
        status: "not_purchased" as const,
        review: null,
      };
    }

    return {
      status: "can_review" as const,
      review: null,
    };
  } catch (error) {
    console.error("[CAN_USER_REVIEW_PRODUCT_ERROR]", error);
    return {
      status: "error" as const,
      review: null,
    };
  }
}

/**
 * Get all reviews for a product
 */
export async function getProductReviews(productId: string) {
  try {
    const reviews = await prisma.review.findMany({
      where: { productId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            firstName: true,
            lastName: true,
            image: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return reviews.map((review) => ({
      id: review.id,
      rating: review.rating,
      comment: review.comment,
      createdAt: review.createdAt,
      user: {
        id: review.user.id,
        name: review.user.name || `${review.user.firstName} ${review.user.lastName}`,
        image: review.user.image,
        initials: `${review.user.firstName?.[0] || ""}${review.user.lastName?.[0] || ""}`.toUpperCase(),
      },
    }));
  } catch (error) {
    console.error("[GET_PRODUCT_REVIEWS_ERROR]", error);
    return [];
  }
}

/**
 * Submit a new review
 */
export async function submitReview(
  userId: string,
  productId: string,
  rating: number,
  comment?: string
) {
  try {
    // Validate rating
    if (rating < 1 || rating > 5) {
      return {
        success: false,
        error: "Rating must be between 1 and 5",
      };
    }

    // Re-check eligibility server-side to prevent bypassing
    const eligibility = await canUserReviewProduct(userId, productId);

    if (eligibility.status === "already_reviewed") {
      return {
        success: false,
        error: "You have already reviewed this product",
      };
    }

    if (eligibility.status === "not_purchased") {
      return {
        success: false,
        error: "You must purchase this product before reviewing it",
      };
    }

    if (eligibility.status === "error") {
      return {
        success: false,
        error: "An error occurred while checking eligibility",
      };
    }

    // Create the review
    const review = await prisma.review.create({
      data: {
        userId,
        productId,
        rating,
        comment: comment || null,
      },
      include: {
        product: {
          select: {
            title: true,
            slug: true,
          },
        },
        user: {
          select: {
            name: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    // Create notification for bad reviews (rating <= 3)
    if (rating <= 3) {
      const userName = review.user?.name || `${review.user?.firstName} ${review.user?.lastName}`;
      await createNotification(
        "BAD_REVIEW",
        "Low Rating Received",
        `${userName} gave ${rating} star${rating !== 1 ? 's' : ''} to ${review.product.title}`,
        `/admin/review`
      );
    }

    // Revalidate the product page and admin dashboard
    revalidatePath(`/products/${productId}`);
    revalidatePath("/admin/dashboard");
    revalidatePath("/admin/review");

    return {
      success: true,
      reviewId: review.id,
    };
  } catch (error) {
    console.error("[SUBMIT_REVIEW_ERROR]", error);
    return {
      success: false,
      error: "Failed to submit review. Please try again.",
    };
  }
}

/**
 * Update an existing review (user can edit their own review)
 */
export async function updateReview(
  reviewId: string,
  userId: string,
  rating: number,
  comment?: string
) {
  try {
    // Validate rating
    if (rating < 1 || rating > 5) {
      return {
        success: false,
        error: "Rating must be between 1 and 5",
      };
    }

    // Check ownership
    const existingReview = await prisma.review.findUnique({
      where: { id: reviewId },
    });

    if (!existingReview) {
      return {
        success: false,
        error: "Review not found",
      };
    }

    if (existingReview.userId !== userId) {
      return {
        success: false,
        error: "You can only edit your own reviews",
      };
    }

    // Update the review
    await prisma.review.update({
      where: { id: reviewId },
      data: {
        rating,
        comment: comment || null,
      },
    });

    // Revalidate pages
    revalidatePath(`/products/${existingReview.productId}`);
    revalidatePath("/admin/dashboard");
    revalidatePath("/admin/review");

    return {
      success: true,
    };
  } catch (error) {
    console.error("[UPDATE_REVIEW_ERROR]", error);
    return {
      success: false,
      error: "Failed to update review. Please try again.",
    };
  }
}

/**
 * Delete a review (user can delete their own, admin can delete any)
 */
export async function deleteReview(
  reviewId: string,
  userId: string,
  isAdmin: boolean = false
) {
  try {
    // Check ownership unless admin
    const existingReview = await prisma.review.findUnique({
      where: { id: reviewId },
    });

    if (!existingReview) {
      return {
        success: false,
        error: "Review not found",
      };
    }

    if (!isAdmin && existingReview.userId !== userId) {
      return {
        success: false,
        error: "You can only delete your own reviews",
      };
    }

    // Delete the review
    await prisma.review.delete({
      where: { id: reviewId },
    });

    // Revalidate pages
    revalidatePath(`/products/${existingReview.productId}`);
    revalidatePath("/admin/dashboard");
    revalidatePath("/admin/review");

    return {
      success: true,
    };
  } catch (error) {
    console.error("[DELETE_REVIEW_ERROR]", error);
    return {
      success: false,
      error: "Failed to delete review. Please try again.",
    };
  }
}

/**
 * Get all reviews by a specific user
 */
export async function getUserReviews(userId: string) {
  try {
    const reviews = await prisma.review.findMany({
      where: { userId },
      include: {
        product: {
          select: {
            id: true,
            title: true,
            slug: true,
            imageUrl: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return reviews.map((review) => ({
      id: review.id,
      rating: review.rating,
      comment: review.comment,
      createdAt: review.createdAt,
      product: {
        id: review.product.id,
        title: review.product.title,
        slug: review.product.slug,
        imageUrl: review.product.imageUrl,
      },
    }));
  } catch (error) {
    console.error("[GET_USER_REVIEWS_ERROR]", error);
    return [];
  }
}

/**
 * Get all reviews for admin panel (with filtering)
 */
export async function getAllReviews(filter?: {
  rating?: number;
  productId?: string;
}) {
  try {
    const reviews = await prisma.review.findMany({
      where: {
        ...(filter?.rating && { rating: filter.rating }),
        ...(filter?.productId && { productId: filter.productId }),
      },
      include: {
        product: {
          select: {
            id: true,
            title: true,
            slug: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return reviews.map((review) => ({
      id: review.id,
      rating: review.rating,
      comment: review.comment,
      createdAt: review.createdAt,
      product: {
        id: review.product.id,
        title: review.product.title,
        slug: review.product.slug,
      },
      user: {
        id: review.user.id,
        name: review.user.name || `${review.user.firstName} ${review.user.lastName}`,
        email: review.user.email,
      },
    }));
  } catch (error) {
    console.error("[GET_ALL_REVIEWS_ERROR]", error);
    return [];
  }
}
