"use server";

import prisma from "@/lib/prisma";

export async function getCartItems(userId: string) {
  const cart = await prisma.cart.findUnique({
    where: { userId },
    include: {
      items: {
        include: {
          product: {
            include: {
              variants: true,
            },
          },
        },
      },
    },
  });

  if (!cart) return [];

  return cart.items.map((item) => {
    const product = item.product;

    const variant = product.variants.find((v) => v.id === item.variantId);

    return {
      id: item.id,
      product_id: product.id,
      variant_id: variant?.id ?? null,
      link: `/products/${product.slug}`,
      name: product.title,
      image: product.mainImageUrl, // ✅ correct source
      price: {
        // regular = original title price, sale = discounted price when present
        regular: Number(product.titlePrice),
        sale: product.discountedPrice
          ? Number(product.discountedPrice)
          : undefined,
        currency: "NGN",
      },
      quantity: item.quantity,
      details: [
        ...(variant
          ? [
              {
                label: variant.type,
                value: variant.value,
              },
            ]
          : []),
        ...(product.colors.length
          ? [
              {
                label: "Color",
                value: product.colors.join(", "),
              },
            ]
          : []),
      ],
    };
  });
}
