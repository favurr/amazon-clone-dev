import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { getCart } from "@/actions/store";
import CartPageWrapper from "@/components/store/cart-page-client";

export default async function CartPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session || !session.user) {
    redirect("/auth/login");
  }

  const cartData = await getCart(session.user.id);

  return <CartPageWrapper cartData={cartData} userId={session.user.id} />;
}
