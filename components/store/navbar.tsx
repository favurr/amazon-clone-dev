import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { getActiveCategories } from "@/actions/category";
import { getCartItemCount } from "@/actions/cart";
import NavbarClient from "./navbar-client";

export default async function Navbar() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const user = session?.user;

  // Fetch categories and cart count in parallel
  const [categories, cartCount] = await Promise.all([
    getActiveCategories(),
    getCartItemCount(),
  ]);

  return (
    <NavbarClient
      categories={categories}
      user={user ? { firstName: user.firstName || "User", email: user.email } : null}
      cartCount={cartCount}
    />
  );
}
