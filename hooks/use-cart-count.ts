"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export function useCartCount(initialCount: number) {
  const [cartCount, setCartCount] = useState(initialCount);
  const pathname = usePathname();

  useEffect(() => {
    // Fetch cart count whenever the pathname changes
    const fetchCartCount = async () => {
      try {
        const response = await fetch("/api/cart/count", {
          cache: "no-store",
        });
        const data = await response.json();
        setCartCount(data.count || 0);
      } catch (error) {
        console.error("Failed to fetch cart count:", error);
      }
    };

    fetchCartCount();
  }, [pathname]);

  return cartCount;
}
