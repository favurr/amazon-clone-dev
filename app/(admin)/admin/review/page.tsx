import { getAllReviews } from "@/actions/reviews";
import { ReviewsPageClient } from "@/components/admin/reviews-page-client";

export default async function ReviewsPage() {
  const reviews = await getAllReviews();

  return <ReviewsPageClient reviews={reviews} />;
}