import { notFound } from "next/navigation";
import { getProductBySlug } from "@/actions/store";
import { ProductDetailClient } from "@/components/store/product-detail-client";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { canUserReviewProduct, getProductReviews } from "@/actions/reviews";

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

  return (
    <ProductDetailClient
      product={product}
      userId={userId}
      reviews={reviews}
      reviewEligibility={reviewEligibility}
    />
  );
}