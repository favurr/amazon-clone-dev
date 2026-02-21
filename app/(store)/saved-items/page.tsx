import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getUserWishlist } from "@/actions/wishlist";
import { SavedItemsClient } from "@/components/store/saved-items-client";

export default async function SavedItemsPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  
  if (!session?.user) {
    redirect("/auth/login?redirect=/saved-items");
  }

  const wishlistItems = await getUserWishlist(session.user.id);

  return <SavedItemsClient wishlistItems={wishlistItems} userId={session.user.id} />;
}
