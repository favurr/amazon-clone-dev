"use server";

import prisma from "@/lib/prisma";

export type SearchResults = {
  products: {
    id: string;
    title: string;
    slug: string;
    description: string | null;
    mainImageUrl: string;
    titlePrice: number;
    discountedPrice: number | null;
    category: { name: string };
  }[];
  categories: {
    id: string;
    name: string;
    slug: string;
  }[];
  tags: {
    id: string;
    name: string;
    _count: { products: number };
  }[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalProducts: number;
    pageSize: number;
  };
};

export async function searchAll(
  query: string,
  options: {
    categorySlug?: string;
    page?: number;
    pageSize?: number;
  } = {}
): Promise<SearchResults> {
  const { categorySlug, page = 1, pageSize = 20 } = options;

  if (!query || query.trim().length === 0) {
    return {
      products: [],
      categories: [],
      tags: [],
      pagination: {
        currentPage: 1,
        totalPages: 0,
        totalProducts: 0,
        pageSize,
      },
    };
  }

  const searchTerm = query.trim();
  const skip = (page - 1) * pageSize;

  try {
    // Build product search filter
    const productWhere: any = {
      isArchived: false,
      OR: [
        { title: { contains: searchTerm, mode: "insensitive" } },
        { description: { contains: searchTerm, mode: "insensitive" } },
        {
          tags: {
            some: {
              name: { contains: searchTerm, mode: "insensitive" },
            },
          },
        },
      ],
    };

    // Add category filter if specified
    if (categorySlug && categorySlug !== "all") {
      const category = await prisma.category.findUnique({
        where: { slug: categorySlug },
        select: { id: true },
      });

      if (category) {
        productWhere.categoryId = category.id;
      }
    }

    // Execute searches in parallel
    const [productsRaw, totalProducts, categories, tags] = await Promise.all([
      // Products with pagination
      prisma.product.findMany({
        where: productWhere,
        include: {
          category: {
            select: { name: true },
          },
        },
        orderBy: [
          { isFeatured: "desc" },
          { createdAt: "desc" },
        ],
        skip,
        take: pageSize,
      }),

      // Total count for pagination
      prisma.product.count({
        where: productWhere,
      }),

      // Categories matching search (limit to 10)
      prisma.category.findMany({
        where: {
          isActive: true,
          name: { contains: searchTerm, mode: "insensitive" },
        },
        select: {
          id: true,
          name: true,
          slug: true,
        },
        take: 10,
        orderBy: { name: "asc" },
      }),

      // Tags matching search (limit to 20)
      prisma.tag.findMany({
        where: {
          name: { contains: searchTerm, mode: "insensitive" },
        },
        select: {
          id: true,
          name: true,
          _count: {
            select: { products: true },
          },
        },
        take: 20,
        orderBy: {
          products: {
            _count: "desc",
          },
        },
      }),
    ]);

    // Convert Decimal to number
    const products = productsRaw.map((product) => ({
      ...product,
      titlePrice: Number(product.titlePrice),
      discountedPrice: product.discountedPrice
        ? Number(product.discountedPrice)
        : null,
    }));

    const totalPages = Math.ceil(totalProducts / pageSize);

    return {
      products,
      categories,
      tags,
      pagination: {
        currentPage: page,
        totalPages,
        totalProducts,
        pageSize,
      },
    };
  } catch (error) {
    console.error("Search error:", error);
    return {
      products: [],
      categories: [],
      tags: [],
      pagination: {
        currentPage: 1,
        totalPages: 0,
        totalProducts: 0,
        pageSize,
      },
    };
  }
}

export type SearchSuggestion = {
  type: "product" | "category" | "tag";
  id: string;
  name: string;
  slug?: string;
  imageUrl?: string;
  price?: number;
};

export async function getSearchSuggestions(
  query: string
): Promise<SearchSuggestion[]> {
  if (!query || query.trim().length < 2) {
    return [];
  }

  const searchTerm = query.trim();

  try {
    const [products, categories, tags] = await Promise.all([
      // Top 5 products
      prisma.product.findMany({
        where: {
          isArchived: false,
          OR: [
            { title: { contains: searchTerm, mode: "insensitive" } },
            { description: { contains: searchTerm, mode: "insensitive" } },
          ],
        },
        select: {
          id: true,
          title: true,
          slug: true,
          mainImageUrl: true,
          titlePrice: true,
        },
        take: 5,
        orderBy: [
          { isFeatured: "desc" },
          { createdAt: "desc" },
        ],
      }),

      // Top 3 categories
      prisma.category.findMany({
        where: {
          isActive: true,
          name: { contains: searchTerm, mode: "insensitive" },
        },
        select: {
          id: true,
          name: true,
          slug: true,
        },
        take: 3,
        orderBy: { name: "asc" },
      }),

      // Top 5 tags
      prisma.tag.findMany({
        where: {
          name: { contains: searchTerm, mode: "insensitive" },
        },
        select: {
          id: true,
          name: true,
        },
        take: 5,
        orderBy: {
          products: {
            _count: "desc",
          },
        },
      }),
    ]);

    const suggestions: SearchSuggestion[] = [
      ...categories.map((cat) => ({
        type: "category" as const,
        id: cat.id,
        name: cat.name,
        slug: cat.slug,
      })),
      ...products.map((prod) => ({
        type: "product" as const,
        id: prod.id,
        name: prod.title,
        slug: prod.slug,
        imageUrl: prod.mainImageUrl,
        price: Number(prod.titlePrice),
      })),
      ...tags.map((tag) => ({
        type: "tag" as const,
        id: tag.id,
        name: tag.name,
      })),
    ];

    return suggestions;
  } catch (error) {
    console.error("Search suggestions error:", error);
    return [];
  }
}
