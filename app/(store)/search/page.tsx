import Link from "next/link";
import { searchAll } from "@/actions/search";
import { ProductCard } from "@/components/store/product-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tag, FolderOpen, Package } from "lucide-react";

type SearchPageProps = {
  searchParams: Promise<{
    q?: string;
    category?: string;
    page?: string;
  }>;
};

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const query = params.q || "";
  const categorySlug = params.category;
  const page = parseInt(params.page || "1", 10);

  const results = await searchAll(query, {
    categorySlug,
    page,
    pageSize: 20,
  });

  const { products, categories, tags, pagination } = results;

  const hasResults = products.length > 0 || categories.length > 0 || tags.length > 0;

  // Build pagination URLs
  const buildPageUrl = (newPage: number) => {
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (categorySlug) params.set("category", categorySlug);
    params.set("page", newPage.toString());
    return `/search?${params.toString()}`;
  };

  return (
    <div className="min-h-screen bg-[#eaeded]">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Search Results Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-semibold mb-2">
            {query ? (
              <>
                Search results for <span className="text-[#c45500]">&quot;{query}&quot;</span>
              </>
            ) : (
              "Search Amazon"
            )}
          </h1>
          {categorySlug && categorySlug !== "all" && (
            <p className="text-sm text-gray-600">
              Filtered by category: <span className="font-semibold capitalize">{categorySlug}</span>
            </p>
          )}
        </div>

        {!query ? (
          <div className="bg-white rounded-lg p-8 text-center">
            <h2 className="text-xl font-semibold mb-2">Start your search</h2>
            <p className="text-gray-600">
              Enter a search term to find products, categories, and tags
            </p>
          </div>
        ) : !hasResults ? (
          <div className="bg-white rounded-lg p-8 text-center">
            <h2 className="text-xl font-semibold mb-2">No results found</h2>
            <p className="text-gray-600">
              Try different keywords or check your spelling
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Categories Section */}
            {categories.length > 0 && (
              <div className="bg-white rounded-lg p-6">
                <div className="flex items-center gap-2 mb-4">
                  <FolderOpen className="w-5 h-5 text-[#c45500]" />
                  <h2 className="text-xl font-semibold">
                    Categories ({categories.length})
                  </h2>
                </div>
                <div className="flex flex-wrap gap-2">
                  {categories.map((category) => (
                    <Link
                      key={category.id}
                      href={`/search?q=${encodeURIComponent(query)}&category=${category.slug}`}
                      className="hover:opacity-80"
                    >
                      <Badge
                        variant="outline"
                        className="px-4 py-2 text-sm cursor-pointer hover:bg-gray-100"
                      >
                        {category.name}
                      </Badge>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Tags Section */}
            {tags.length > 0 && (
              <div className="bg-white rounded-lg p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Tag className="w-5 h-5 text-[#c45500]" />
                  <h2 className="text-xl font-semibold">
                    Related Tags ({tags.length})
                  </h2>
                </div>
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <Link
                      key={tag.id}
                      href={`/search?q=${encodeURIComponent(tag.name)}`}
                      className="hover:opacity-80"
                    >
                      <Badge
                        variant="secondary"
                        className="px-3 py-1.5 text-sm cursor-pointer hover:bg-gray-200"
                      >
                        {tag.name} ({tag._count.products})
                      </Badge>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Products Section */}
            {products.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Package className="w-5 h-5 text-[#c45500]" />
                  <h2 className="text-xl font-semibold">
                    Products ({pagination.totalProducts} results)
                  </h2>
                  <span className="text-sm text-gray-600">
                    Page {pagination.currentPage} of {pagination.totalPages}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 mb-6">
                  {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                  <div className="flex justify-center items-center gap-2 mt-6">
                    {pagination.currentPage > 1 && (
                      <Button
                        variant="outline"
                        asChild
                      >
                        <Link href={buildPageUrl(pagination.currentPage - 1)}>
                          Previous
                        </Link>
                      </Button>
                    )}

                    <div className="flex gap-2">
                      {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                        let pageNum: number;
                        if (pagination.totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (pagination.currentPage <= 3) {
                          pageNum = i + 1;
                        } else if (pagination.currentPage >= pagination.totalPages - 2) {
                          pageNum = pagination.totalPages - 4 + i;
                        } else {
                          pageNum = pagination.currentPage - 2 + i;
                        }

                        return (
                          <Button
                            key={pageNum}
                            variant={pageNum === pagination.currentPage ? "default" : "outline"}
                            asChild
                            size="sm"
                          >
                            <Link href={buildPageUrl(pageNum)}>
                              {pageNum}
                            </Link>
                          </Button>
                        );
                      })}
                    </div>

                    {pagination.currentPage < pagination.totalPages && (
                      <Button
                        variant="outline"
                        asChild
                      >
                        <Link href={buildPageUrl(pagination.currentPage + 1)}>
                          Next
                        </Link>
                      </Button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
