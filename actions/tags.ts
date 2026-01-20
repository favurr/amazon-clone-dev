"use server";

import prisma from "@/lib/prisma";

export const getProductTags = async (productId: string) => {
  try {
    const tags = await prisma.tag.findMany({
      where: {
        products: {
          some: { id: productId }
        }
      }
    });
    return tags; 
  } catch (error) {
    console.error("[GET_TAGS_ERROR]", error);
    return [];
  }
};

export const syncProductTags = async (productId: string, tags: { name: string }[]) => {
  try {
    await prisma.product.update({
      where: { id: productId },
      data: {
        tags: {
          set: [],
          connectOrCreate: tags.map((tag) => ({
            where: { name: tag.name },
            create: { name: tag.name },
          })),
        },
      },
    });
    return { success: true };
  } catch (error) {
    console.error("[SYNC_TAGS_ERROR]", error);
    return { success: false };
  }
};