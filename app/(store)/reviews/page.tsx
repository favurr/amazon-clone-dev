import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getUserReviews } from "@/actions/reviews";
import { UserReviewsClient } from "@/components/store/user-reviews-client";

export default async function UserReviewsPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  
  if (!session?.user) {
    redirect("/auth/login?redirect=/reviews");
  }

  const reviews = await getUserReviews(session.user.id);

  return <UserReviewsClient reviews={reviews} userId={session.user.id} />;
}
