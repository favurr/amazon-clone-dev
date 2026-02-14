"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { createNotification } from "@/actions/notifications";

interface ProductFilters {
  search?: string;
  categoryId?: string;
  tags?: string[];
  minPrice?: number;
  maxPrice?: number;
  sortBy?: "newest" | "price-asc" | "price-desc" | "popular";
  page?: number;
  pageSize?: number;
}

export async function getProducts(filters: ProductFilters = {}) {
  console.log("🔥 getProducts called with:", filters);
  try {
    const {
      search = "",
      categoryId,
      tags = [],
      minPrice,
      maxPrice,
      sortBy = "newest",
      page = 1,
      pageSize = 24,
    } = filters;

    const skip = (page - 1) * pageSize;

    // Build where clause
    const where: any = {
      isArchived: false,
    };

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" as const } },
        { description: { contains: search, mode: "insensitive" as const } },
      ];
    }

    if (categoryId) {
      // c-style CUIDs are 25 characters long and start with 'c'
      const isCuid = categoryId.length === 25 && categoryId.startsWith("c");

      if (isCuid) {
        where.categoryId = categoryId;
      } else {
        where.category = {
          slug: categoryId,
        };
      }
    }

    if (tags.length > 0) {
      where.tags = {
        some: {
          name: { in: tags },
        },
      };
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      where.titlePrice = {};
      if (minPrice !== undefined) where.titlePrice.gte = minPrice;
      if (maxPrice !== undefined) where.titlePrice.lte = maxPrice;
    }

    // Build orderBy
    let orderBy: any = { createdAt: "desc" };
    if (sortBy === "price-asc") orderBy = { titlePrice: "asc" };
    if (sortBy === "price-desc") orderBy = { titlePrice: "desc" };
    if (sortBy === "popular") orderBy = { reviews: { _count: "desc" } };

    const [products, totalCount] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: pageSize,
        orderBy,
        include: {
          category: { select: { name: true, slug: true } },
          images: { orderBy: { order: "asc" }, take: 1 },
          variants: { select: { stock: true, price: true } },
          tags: { select: { name: true } },
          _count: { select: { reviews: true } },
        },
      }),
      prisma.product.count({ where }),
    ]);

    const formatted = products.map((p) => ({
      ...p,
      titlePrice: Number(p.titlePrice),
      discountedPrice: p.discountedPrice ? Number(p.discountedPrice) : null,
      variants: p.variants.map((v) => ({
        ...v,
        price: Number(v.price),
      })),
      totalStock: p.variants.reduce((acc, v) => acc + v.stock, 0),
    }));

    return {
      products: formatted,
      totalCount,
      totalPages: Math.ceil(totalCount / pageSize),
      currentPage: page,
    };
  } catch (error) {
    console.error("GET_PRODUCTS_ERROR", error);
    return { products: [], totalCount: 0, totalPages: 0, currentPage: 1 };
  }
}

export async function getProductBySlug(slug: string) {
  try {
    const product = await prisma.product.findUnique({
      where: { slug, isArchived: false },
      include: {
        category: { select: { name: true, slug: true } },
        images: { orderBy: { order: "asc" } },
        variants: true,
        tags: { select: { name: true } },
        reviews: {
          include: {
            user: { select: { name: true, firstName: true, lastName: true } },
          },
          orderBy: { createdAt: "desc" },
          take: 10,
        },
      },
    });

    if (!product) return null;

    return {
      ...product,
      titlePrice: Number(product.titlePrice),
      discountedPrice: product.discountedPrice
        ? Number(product.discountedPrice)
        : null,
      variants: product.variants.map((v) => ({
        ...v,
        price: Number(v.price),
      })),
      totalStock: product.variants.reduce((acc, v) => acc + v.stock, 0),
    };
  } catch (error) {
    console.error("GET_PRODUCT_BY_SLUG_ERROR", error);
    return null;
  }
}

export async function getLandingData() {
  try {
    const [featuredProducts, latestProducts, categories] = await Promise.all([
      prisma.product.findMany({
        where: { isFeatured: true, isArchived: false },
        take: 12,
        select: {
          id: true,
          slug: true,
          title: true,
          description: true,
          titlePrice: true,
          discountedPrice: true,
          mainImageUrl: true,
          isFeatured: true,
          isArchived: true,
          createdAt: true,
          category: { select: { name: true } },
          images: { take: 1, orderBy: { order: "asc" } },
          variants: { select: { stock: true, price: true } },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.product.findMany({
        where: { isArchived: false },
        take: 12,
        include: {
          category: { select: { name: true } },
          images: { take: 1, orderBy: { order: "asc" } },
          variants: { select: { stock: true, price: true } },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.category.findMany({
        where: { isActive: true },
        include: {
          _count: { select: { products: true } },
        },
        orderBy: { name: "asc" },
      }),
    ]);

    const formatProducts = (products: any[]) =>
      products.map((p) => ({
        ...p,
        titlePrice: Number(p.titlePrice),
        discountedPrice: p.discountedPrice ? Number(p.discountedPrice) : null,
        variants: p.variants.map((v: any) => ({
          ...v,
          price: Number(v.price),
        })),
        totalStock: p.variants.reduce(
          (acc: number, v: any) => acc + v.stock,
          0,
        ),
      }));

    return {
      featured: formatProducts(featuredProducts),
      latest: formatProducts(latestProducts),
      categories,
      
    };
  } catch (error) {
    console.error("GET_LANDING_DATA_ERROR", error);
    return { featured: [], latest: [], categories: [], };
  }
}

export async function getFilterOptions() {
  try {
    const [categories, tags, priceRange] = await Promise.all([
      prisma.category.findMany({
        where: { isActive: true },
        select: { id: true, name: true, slug: true },
        orderBy: { name: "asc" },
      }),
      prisma.tag.findMany({
        select: { id: true, name: true },
        orderBy: { name: "asc" },
      }),
      prisma.product.aggregate({
        where: { isArchived: false },
        _min: { titlePrice: true },
        _max: { titlePrice: true },
      }),
    ]);

    return {
      categories,
      tags,
      minPrice: Number(priceRange._min.titlePrice) || 0,
      maxPrice: Number(priceRange._max.titlePrice) || 10000,
    };
  } catch (error) {
    console.error("GET_FILTER_OPTIONS_ERROR", error);
    return { categories: [], tags: [], minPrice: 0, maxPrice: 10000 };
  }
}

export async function syncCart(userId: string, items: any[]) {
  try {
    let cart = await prisma.cart.findUnique({
      where: { userId },
      include: { items: true },
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId },
        include: { items: true },
      });
    }

    // Clear existing items
    await prisma.cartItem.deleteMany({
      where: { cartId: cart.id },
    });

    // Add new items
    if (items.length > 0) {
      await prisma.cartItem.createMany({
        data: items.map((item) => ({
          cartId: cart.id,
          productId: item.productId,
          variantId: item.variantId || null,
          quantity: item.quantity,
        })),
      });
    }

    revalidatePath("/cart");
    return { success: true };
  } catch (error) {
    console.error("SYNC_CART_ERROR", error);
    return { success: false, error: "Failed to sync cart" };
  }
}

export async function getCart(userId: string) {
  try {
    const cart = await prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            product: {
              include: {
                images: { take: 1, orderBy: { order: "asc" } },
                variants: true,
              },
            },
          },
        },
      },
    });

    if (!cart) return { items: [], total: 0 };

    const items = cart.items.map((item) => {
      const variant = item.variantId
        ? item.product.variants.find((v) => v.id === item.variantId)
        : null;

      // Use discounted price when available and preserve decimals (no floor)
      const price = variant
        ? Number(variant.price)
        : Number(item.product.discountedPrice ?? item.product.titlePrice);

      return {
        id: item.id,
        productId: item.productId,
        variantId: item.variantId,
        title: item.product.title,
        slug: item.product.slug,
        image: item.product.images[0]?.url || item.product.mainImageUrl,
        price,
        quantity: item.quantity,
        variant: variant
          ? { type: variant.type, value: variant.value, stock: variant.stock }
          : null,
        subtotal: price * item.quantity,
      };
    });

    const total = items.reduce((sum, item) => sum + item.subtotal, 0);

    return { items, total };
  } catch (error) {
    console.error("GET_CART_ERROR", error);
    return { items: [], total: 0 };
  }
}

export async function addToCart(
  userId: string,
  productId: string,
  variantId?: string,
  quantity: number = 1,
) {
  try {
    let cart = await prisma.cart.findUnique({
      where: { userId },
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId },
      });
    }

    // Build where clause to properly match null/undefined variantId
    const whereClause: any = {
      cartId: cart.id,
      productId,
    };

    // Handle variantId - must explicitly handle null vs undefined for Prisma
    if (variantId) {
      whereClause.variantId = variantId;
    } else {
      whereClause.variantId = null;
    }

    const existingItem = await prisma.cartItem.findFirst({
      where: whereClause,
    });

    let isNewItem = false;

    if (existingItem) {
      // Update existing item quantity
      await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: existingItem.quantity + quantity },
      });
      isNewItem = false;
    } else {
      // Create new cart item
      await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId,
          variantId: variantId || null,
          quantity,
        },
      });
      isNewItem = true;
    }

    // Check for low stock after adding to cart
    if (variantId) {
      const variant = await prisma.variant.findUnique({
        where: { id: variantId },
        include: {
          product: {
            select: {
              title: true,
            },
          },
        },
      });

      if (variant && variant.stock <= 5) {
        await createNotification(
          "LOW_STOCK",
          "Low Stock Alert",
          `${variant.product.title} (${variant.type}: ${variant.value}) has only ${variant.stock} units left`,
          `/admin/products`
        );
      }
    }

    revalidatePath("/cart");
    revalidatePath("/", "layout"); // Revalidate layout to update navbar
    return { success: true, isNewItem };
  } catch (error) {
    console.error("ADD_TO_CART_ERROR", error);
    return { success: false, error: "Failed to add to cart" };
  }
}

export async function updateCartItem(itemId: string, quantity: number) {
  try {
    if (quantity <= 0) {
      await prisma.cartItem.delete({ where: { id: itemId } });
    } else {
      await prisma.cartItem.update({
        where: { id: itemId },
        data: { quantity },
      });
    }

    revalidatePath("/cart");
    revalidatePath("/", "layout"); // Revalidate layout to update navbar
    return { success: true };
  } catch (error) {
    console.error("UPDATE_CART_ITEM_ERROR", error);
    return { success: false, error: "Failed to update cart" };
  }
}

export async function removeCartItem(itemId: string) {
  try {
    await prisma.cartItem.delete({ where: { id: itemId } });
    revalidatePath("/cart");
    revalidatePath("/", "layout"); // Revalidate layout to update navbar
    return { success: true };
  } catch (error) {
    console.error("REMOVE_CART_ITEM_ERROR", error);
    return { success: false, error: "Failed to remove item" };
  }
}

export async function getProductsByCategoryName(
  categoryName: string,
  limit: number = 15,
) {
  try {
    const products = await prisma.product.findMany({
      where: {
        category: { name: { contains: categoryName, mode: "insensitive" } },
        isArchived: false,
      },
      take: limit,
      include: {
        category: { select: { name: true, id: true } },
        images: { take: 1, orderBy: { order: "asc" } },
        variants: { select: { stock: true, price: true } },
        _count: { select: { reviews: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return products.map((p) => ({
      ...p,
      titlePrice: Math.floor(Number(p.titlePrice)),
      discountedPrice: p.discountedPrice
        ? Math.floor(Number(p.discountedPrice))
        : null,
    }));
  } catch (error) {
    return [];
  }
}
