import { notFound } from "next/navigation";
import { getProductBySlug } from "@/actions/store";
import { ProductDetailClient } from "@/components/store/product-detail-client";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { canUserReviewProduct, getProductReviews } from "@/actions/reviews";
import { isInWishlist } from "@/actions/wishlist";

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const session = await auth.api.getSession({ headers: await headers() });
  const userId = session?.user?.id;

  // Fetch review data
  const reviews = await getProductReviews(product.id);
  
  // Check if user can review (only if logged in)
  let reviewEligibility = null;
  if (userId) {
    reviewEligibility = await canUserReviewProduct(userId, product.id);
  }

  // Check if product is in wishlist
  const inWishlist = userId ? await isInWishlist(userId, product.id) : false;

  return (
    <ProductDetailClient
      product={product}
      userId={userId}
      reviews={reviews}
      reviewEligibility={reviewEligibility}
      isInWishlist={inWishlist}
    />
  );
}