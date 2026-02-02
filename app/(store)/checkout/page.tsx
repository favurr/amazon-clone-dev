import { getCartItems } from "@/actions/cartItems";
import Checkout from "@/components/checkout";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function CheckoutPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    redirect("/auth/login");
  }

  const id = await session.user.id;

  const cartItems = await getCartItems(id);

  return (
    <div className="bg-background">
      <div className="mx-auto max-w-5xl">
        <Checkout cartItems={cartItems} userId={id} />
      </div>
    </div>
  );
}
