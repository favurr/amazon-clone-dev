"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { randomBytes } from "crypto";

/**
 * Generates a URL-friendly slug.
 * If a category ID is provided, it excludes that category from the uniqueness check
 * (essential for updating a category without changing its own name).
 */
export const generateUniqueSlug = async (name: string, currentId?: string) => {
  const baseSlug = name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "")
    .replace(/--+/g, "-");

  // If you JUST added the slug column, findFirst might fail
  // until the generate/migrate commands above are finished.
  const existing = await prisma.category.findFirst({
    where: {
      slug: baseSlug,
      // If currentId exists, we exclude it. If not, we don't apply the NOT filter.
      ...(currentId ? { NOT: { id: currentId } } : {}),
    },
  });

  if (existing) {
    const suffix = randomBytes(2).toString("hex");
    return `${baseSlug}-${suffix}`;
  }

  return baseSlug;
};

export async function createCategory(name: string) {
  try {
    // 1. First, check if the Name already exists (Case-insensitive check is safer)
    const existingName = await prisma.category.findFirst({
      where: {
        name: {
          equals: name.trim(),
          mode: "insensitive", // Prevents "Books" and "books" being created
        },
      },
    });

    if (existingName) {
      return {
        success: false,
        error: "A category with this name already exists.",
      };
    }

    // 2. If name is unique, generate the slug
    const slug = await generateUniqueSlug(name);

    const category = await prisma.category.create({
      data: {
        name: name.trim(),
        slug,
        isActive: true,
      },
    });

    revalidatePath("/admin/categories");
    return { success: true, data: category };
  } catch (error: any) {
    console.error("Create Error:", error);
    return {
      success: false,
      error: "An unexpected error occurred while saving.",
    };
  }
}

export async function updateCategory(
  id: string,
  name: string,
  isActive: boolean
) {
  try {
    // FIX: We must await the slug generation
    const slug = await generateUniqueSlug(name, id);

    await prisma.category.update({
      where: { id },
      data: {
        name,
        slug,
        isActive,
      },
    });

    revalidatePath("/admin/categories");
    return { success: true };
  } catch (error: any) {
    console.error("Update Error:", error);
    return {
      success: false,
      error: "Failed to update category. The name might be taken.",
    };
  }
}

export async function deleteCategory(id: string) {
  try {
    // 1. Check if category has products
    const category = await prisma.category.findUnique({
      where: { id },
      include: { _count: { select: { products: true } } },
    });

    if (category && category._count.products > 0) {
      return {
        success: false,
        error: `Cannot delete: ${category._count.products} products are still in this category.`,
      };
    }

    // 2. Perform delete
    await prisma.category.delete({ where: { id } });

    revalidatePath("/admin/categories");
    return { success: true };
  } catch (error: any) {
    return {
      success: false,
      error: "An error occurred while trying to delete.",
    };
  }
}

export async function getCategories() {
  try {
    return await prisma.category.findMany({
      include: {
        _count: {
          select: { products: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  } catch (error) {
    console.error("Fetch Error:", error);
    return [];
  }
}

export async function getProductsCategories() {
  return await prisma.category.findMany({
    orderBy: { name: 'asc' },
    select: { id: true, name: true }
  });
}