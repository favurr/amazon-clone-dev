import { getCart } from "@/actions/store";
import Checkout from "@/components/checkout";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function CheckoutPage() {
  const session = await auth.api.getSession({ headers: await headers() });

if (!session || !session.user) {
    redirect("/auth/login");
  }

  const id = await session.user.id;

  const cartData = await getCart(session.user.id);

  return (
    <div className="bg-background">
      <div className="mx-auto max-w-5xl">
        <Checkout cartItemData={cartData} userId={id} />
      </div>
    </div>
  );
}
