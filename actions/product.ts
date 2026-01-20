"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { productSchema, type ProductFormValues } from "@/lib/zod";
import { generateUniqueSlug } from "./category";

/**
 * Formats product data to ensure Decimal objects are converted to Numbers
 * before being sent to Client Components, avoiding the "Plain Object" error.
 */
const formatProduct = (product: any) => {
  if (!product) return null;
  return {
    ...product,
    titlePrice: product.titlePrice ? Number(product.titlePrice) : 0,
    discountedPrice: product.discountedPrice ? Number(product.discountedPrice) : null,
    // Convert variant prices to numbers
    variants: product.variants?.map((v: any) => ({
      ...v,
      price: Number(v.price)
    })) || [],
    totalStock: product.variants?.reduce((acc: number, curr: any) => acc + (curr.stock || 0), 0) || 0,
  };
};

export async function getProducts() {
  try {
    const products = await prisma.product.findMany({
      include: {
        category: { select: { name: true } },
        variants: true,
        tags: true,
        _count: { select: { reviews: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    return products.map(formatProduct);
  } catch (error) {
    console.error("GET_PRODUCTS_ERROR", error);
    return [];
  }
}

export async function getAdminProducts(params: {
  page?: number;
  pageSize?: number;
  search?: string;
}) {
  try {
    const { page = 1, pageSize = 10, search = "" } = params;
    const skip = (page - 1) * pageSize;

    const where = search 
      ? {
          OR: [
            { title: { contains: search, mode: 'insensitive' as const } },
            { id: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : {};

    const [products, totalCount] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: pageSize,
        include: {
          category: { select: { name: true } },
          variants: true,
          tags: true,
          _count: { select: { reviews: true } }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.product.count({ where })
    ]);

    return {
      data: products.map(formatProduct),
      totalCount,
      totalPages: Math.ceil(totalCount / pageSize),
    };
  } catch (error) {
    console.error("GET_ADMIN_PRODUCTS_ERROR", error);
    return { data: [], totalCount: 0, totalPages: 0 };
  }
}

export async function createProduct(values: ProductFormValues) {
  try {
    const validatedFields = productSchema.safeParse(values);
    if (!validatedFields.success) return { success: false, error: "Invalid fields" };

    const { images, variants, tags, colors, ...data } = validatedFields.data;
    const slug = data.slug || String(await generateUniqueSlug(data.title));

    const product = await prisma.product.create({
      include: { variants: true }, // Include variants for formatter
      data: {
        ...data,
        titlePrice: Number(data.titlePrice),
        discountedPrice: data.discountedPrice ? Number(data.discountedPrice) : null,
        slug,
        colors: colors || [],
        images: {
          create: images.map((img: any) => ({
            url: img.url,
            key: img.key,
            altText: img.altText || "",
            order: img.order,
          })),
        },
        tags: {
          connectOrCreate: tags?.map((tagName: any) => {
            const name = typeof tagName === 'string' ? tagName : tagName.name;
            return {
              where: { name },
              create: { name },
            };
          }),
        },
        variants: {
          create: variants.map((v: any) => ({
            type: v.type,
            value: v.value,
            price: Number(v.price),
            stock: v.stock,
          })),
        },
      },
    });

    revalidatePath("/admin/products");
    return { success: true, data: formatProduct(product) };
  } catch (error: any) {
    console.error("CREATE_PRODUCT_ERROR", error);
    return { success: false, error: "Failed to create product" };
  }
}

export async function updateProduct(id: string, values: ProductFormValues) {
  try {
    const validatedFields = productSchema.safeParse(values);
    if (!validatedFields.success) return { success: false, error: "Invalid input" };

    const { images, variants, tags, colors, ...data } = validatedFields.data;

    const updatedProduct = await prisma.$transaction(async (tx) => {
      // Clear existing relations to prevent orphans/duplicates
      await tx.productImage.deleteMany({ where: { productId: id } });
      await tx.variant.deleteMany({ where: { productId: id } });

      return await tx.product.update({
        where: { id },
        include: { variants: true }, // Important: Include variants for formatProduct
        data: {
          ...data,
          titlePrice: Number(data.titlePrice),
          discountedPrice: data.discountedPrice ? Number(data.discountedPrice) : null,
          colors,
          images: {
            create: images.map((img) => ({
              url: img.url,
              key: img.key,
              altText: img.altText || "",
              order: img.order,
            })),
          },
          tags: {
            set: [], 
            connectOrCreate: tags?.map((tagName: any) => {
              const name = typeof tagName === 'string' ? tagName : tagName.name;
              return {
                where: { name },
                create: { name },
              };
            }),
          },
          variants: {
            create: variants.map((v) => ({
              type: v.type,
              value: v.value,
              price: Number(v.price),
              stock: v.stock,
            })),
          },
        },
      });
    }, {
      maxWait: 10000,
      timeout: 20000
    });

    revalidatePath("/admin/products");
    revalidatePath(`/products/${updatedProduct.slug}`);
    
    return { success: true, data: formatProduct(updatedProduct) };
  } catch (error: any) {
    console.error("UPDATE_PRODUCT_ERROR:", error);
    return { success: false, error: "Failed to update product" };
  }
}

export async function deleteProduct(id: string) {
  try {
    await prisma.product.delete({ where: { id } });
    revalidatePath("/admin/products");
    return { success: true };
  } catch (error) {
    console.error("DELETE_PRODUCT_ERROR", error);
    return { success: false, error: "Failed to delete product." };
  }
}

export async function toggleProductArchive(id: string, isArchived: boolean) {
  try {
    await prisma.product.update({
      where: { id },
      data: { isArchived }
    });
    revalidatePath("/admin/products");
    return { success: true };
  } catch (error) {
    return { success: false };
  }
}

export async function getProductImages(productId: string) {
  try {
    const images = await prisma.productImage.findMany({
      where: { productId },
      orderBy: { order: "asc" },
    });
    return { success: true, data: images };
  } catch (error) {
    return { success: false, error: "Failed to fetch images" };
  }
}