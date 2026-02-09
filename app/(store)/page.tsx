import { getLandingData } from "@/actions/store";
import { FeaturedCard } from "@/components/store/featured-card";
import { ProductCard } from "@/components/store/product-card";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";

export default async function HomePage() {
  const session = await auth.api.getSession({ headers: await headers() });
  const userId = session?.user?.id;

  return (
    <div className="min-h-screen bg-[#eaeded]">
      {/* Hero Banner - Responsive */}
      <section className="relative h-50 sm:h-100 md:h-150 lg:h-250 overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/home/Artboard-2.jpg"
            alt="Hero background"
            fill
            className="object-cover"
            priority
          />
        </div>

        {/* Fade to background color */}
        <div className="absolute bottom-0 left-0 right-0 h-12 sm:h-16 md:h-64 bg-linear-to-b from-transparent via-[#fbfcfc] to-[#eaeded]" />
      </section>

      {/* Main Content - Responsive negative margin */}
      <div className="relative -mt-24 sm:-mt-26 md:-mt-75 lg:-mt-125 pb-6 sm:pb-8 md:pb-12">
        <div className="max-w-375 lg:max-w-[100%] mx-auto px-3 sm:px-4 md:px-5 lg:px-8">
          {/* SECTION 1: Category Grid - Responsive */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 md:gap-5 mb-3 sm:mb-4 md:mb-5">
            <Suspense fallback={<CategoryBoxSkeleton />}>
              <CategoryBox
                title="Finds for Home"
                category="home"
                image="/home/homepod.png"
                linkText="Explore home essentials"
              />
            </Suspense>
            <Suspense fallback={<CategoryBoxSkeleton />}>
              <CategoryBox
                title="Home & Kitchen essentials"
                category="kitchen"
                image="/home/watch.png"
                linkText="Shop kitchen must-haves"
              />
            </Suspense>
            <Suspense fallback={<CategoryBoxSkeleton />}>
              <CategoryBox
                title="Level up your PC here"
                category="computing"
                image="/products/product1.png"
                linkText="See more computing"
              />
            </Suspense>
            <Suspense fallback={<CategoryBoxSkeleton />}>
              <CategoryBox
                title="Elevate your Electronics"
                category="electronics"
                image="/products/product2.webp"
                linkText="Discover electronics"
              />
            </Suspense>
          </div>

          {/* SECTION 2: Featured Products - 5 Columns x 2 Rows */}
          <Suspense
            fallback={<ProductGridSkeleton title="Featured Products" />}
          >
            <FeaturedProductsSection userId={userId} />
          </Suspense>

          {/* SECTION 3: Another Category Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-5">
            <Suspense fallback={<CategoryBoxSkeleton />}>
              <CategoryBox
                title="Gaming paradise"
                category="gaming"
                image="/products/product3.webp"
                linkText="Level up your game"
              />
            </Suspense>
            <Suspense fallback={<CategoryBoxSkeleton />}>
              <CategoryBox
                title="Best Sellers in Fashion"
                category="fashion"
                image="/home/farzi.jpg"
                linkText="Shop clothing & shoes"
              />
            </Suspense>
            <Suspense fallback={<CategoryBoxSkeleton />}>
              <CategoryBox
                title="Tech deals"
                category="electronics"
                image="/trust/trust1.png"
                linkText="See all tech deals"
              />
            </Suspense>
            <Suspense fallback={<CategoryBoxSkeleton />}>
              <CategoryBox
                title="Gift Cards"
                category="gifts"
                image="/home/gift-card.png"
                linkText="Shop gift cards"
              />
            </Suspense>
          </div>

          {/* SECTION 4: New Arrivals - 5 Columns x 2 Rows */}
          <Suspense fallback={<ProductGridSkeleton title="New Arrivals" />}>
            <NewArrivalsSection userId={userId} />
          </Suspense>

          {/* SECTION 5: Top Categories - 5 Columns x 2 Rows */}
          <Suspense fallback={<ProductGridSkeleton title="Shop by Category" />}>
            <TopCategoriesSection userId={userId} />
          </Suspense>

          {/* SECTION 6: Deals & Promotions - Responsive */}
          <div className="bg-white p-3 sm:p-4 md:p-6 mb-3 sm:mb-4 md:mb-5 rounded-md">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <h2 className="text-lg sm:text-xl font-bold">Today's Deals</h2>
              <Link
                href="/products"
                className="text-xs sm:text-sm text-[#007185] hover:text-[#c7511f] hover:underline"
              >
                See all deals
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3 md:gap-4">
              <Suspense
                fallback={
                  <div className="h-48 bg-slate-100 animate-pulse rounded" />
                }
              >
                <DealsSection userId={userId} />
              </Suspense>
            </div>
          </div>

          {/* SECTION 7: Another Full Width Product Grid */}
          <Suspense
            fallback={<ProductGridSkeleton title="Recommended for You" />}
          >
            <RecommendedSection userId={userId} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}

// Category Box Component (Amazon Style)
async function CategoryBox({
  title,
  category,
  image,
  linkText,
}: {
  title: string;
  category: string;
  image: string;
  linkText: string;
}) {
  return (
    <div className="bg-white p-5 rounded-md h-[420px] flex flex-col">
      <h2 className="text-xl font-bold mb-3 text-[#0F1111]">{title}</h2>
      <div className="flex-1 relative mb-4">
        <Image src={image} alt={title} fill className="object-cover rounded" />
      </div>
      <Link
        href={`/products?category=${category}`}
        className="text-sm text-[#007185] hover:text-[#c7511f] hover:underline"
      >
        {linkText}
      </Link>
    </div>
  );
}

// Featured Products - 5 Columns x 2 Rows
async function FeaturedProductsSection({ userId }: { userId?: string }) {
  const data = await getLandingData();

  if (data.featured.length === 0) return null;

  const displayProducts = data.featured.slice(0, 10); // 5x2 = 10 products

  return (
    <div className="bg-white p-3 sm:p-4 md:p-6 mb-3 sm:mb-4 md:mb-5 rounded-md">
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <h2 className="text-lg sm:text-xl font-bold">Featured Products</h2>
        <Link
          href="/products?featured=true"
          className="text-xs sm:text-sm text-[#007185] hover:text-[#c7511f] hover:underline"
        >
          See more
        </Link>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {displayProducts.map((product, index) => {
          // First product - hero card (2 columns)
          if (index === 0) {
            return (
              <FeaturedCard
                key={product.id}
                product={product}
                userId={userId}
                variant="hero"
              />
            );
          }
          // Next 2 products - overlay cards (1 column each)
          else if (index === 1 || index === 2) {
            return (
              <FeaturedCard
                key={product.id}
                product={product}
                userId={userId}
                variant="overlay"
              />
            );
          }
          // Rest - compact cards
          else {
            return (
              <FeaturedCard
                key={product.id}
                product={product}
                userId={userId}
                compact
              />
            );
          }
        })}
      </div>
    </div>
  );
}

// New Arrivals - 5 Columns x 2 Rows
async function NewArrivalsSection({ userId }: { userId?: string }) {
  const data = await getLandingData();

  if (data.latest.length === 0) return null;

  const displayProducts = data.latest.slice(0, 10);

  return (
    <div className="bg-white p-3 sm:p-4 md:p-6 mb-3 sm:mb-4 md:mb-5 rounded-md">
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <h2 className="text-lg sm:text-xl font-bold">New Arrivals</h2>
        <Link
          href="/products?sort=newest"
          className="text-xs sm:text-sm text-[#007185] hover:text-[#c7511f] hover:underline"
        >
          See more
        </Link>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3 md:gap-4">
        {displayProducts.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            userId={userId}
            compact
          />
        ))}
      </div>
    </div>
  );
}

// Top Categories Section
async function TopCategoriesSection({ userId }: { userId?: string }) {
  const data = await getLandingData();

  if (data.categories.length === 0) return null;

  return (
    <div className="bg-white p-3 sm:p-4 md:p-6 mb-3 sm:mb-4 md:mb-5 rounded-md">
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <h2 className="text-lg sm:text-xl font-bold">Shop by Category</h2>
        <Link
          href="/products"
          className="text-xs sm:text-sm text-[#007185] hover:text-[#c7511f] hover:underline"
        >
          See all categories
        </Link>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3 md:gap-4">
        {data.categories.slice(0, 10).map((category) => (
          <Link
            key={category.id}
            href={`/products?category=${category.id}`}
            className="group border border-[#ddd] rounded p-4 hover:shadow-md transition-shadow bg-white"
          >
            <div className="aspect-square bg-slate-100 rounded mb-3 relative overflow-hidden">
              <div className="absolute inset-0 flex items-center justify-center text-4xl font-bold text-slate-300">
                {category.name.charAt(0)}
              </div>
            </div>
            <h3 className="font-semibold text-sm text-[#0F1111] mb-1 line-clamp-2">
              {category.name}
            </h3>
            <p className="text-xs text-[#565959]">
              {category._count.products} items
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}

// Deals Section
async function DealsSection({ userId }: { userId?: string }) {
  const data = await getLandingData();

  const dealsProducts = data.featured
    .filter((p) => p.discountedPrice)
    .slice(0, 5);

  if (dealsProducts.length === 0) return null;

  return (
    <>
      {dealsProducts.map((product) => (
        <Link
          key={product.id}
          href={`/products/${product.slug}`}
          className="group"
        >
          <div className="aspect-square bg-slate-100 rounded mb-2 relative overflow-hidden">
            <Image
              src={product.mainImageUrl}
              alt={product.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform"
            />
            {product.discountedPrice && (
              <div className="absolute top-2 left-2 bg-[#c7511f] text-white text-xs font-bold px-2 py-1 rounded">
                -
                {Math.round(
                  ((product.titlePrice - product.discountedPrice) /
                    product.titlePrice) *
                    100,
                )}
                %
              </div>
            )}
          </div>
          <p className="text-sm font-semibold text-[#c7511f] mb-1">
            ${(product.discountedPrice ?? product.titlePrice).toFixed(2)}
          </p>
          <p className="text-xs text-[#0F1111] line-clamp-2">{product.title}</p>
        </Link>
      ))}
    </>
  );
}

// Recommended Section
async function RecommendedSection({ userId }: { userId?: string }) {
  const data = await getLandingData();

  const recommended = [...data.featured, ...data.latest]
    .sort(() => Math.random() - 0.5)
    .slice(0, 10);

  if (recommended.length === 0) return null;

  return (
    <div className="bg-white p-6 mb-5 rounded-md">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">Recommended for You</h2>
        <Link
          href="/products"
          className="text-sm text-[#007185] hover:text-[#c7511f] hover:underline"
        >
          See more
        </Link>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {recommended.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            userId={userId}
            compact
          />
        ))}
      </div>
    </div>
  );
}

// Skeletons
function CategoryBoxSkeleton() {
  return (
    <div className="bg-white p-5 rounded-md h-[420px] animate-pulse">
      <div className="h-6 bg-slate-200 rounded w-3/4 mb-3" />
      <div className="flex-1 bg-slate-200 rounded mb-4" />
      <div className="h-4 bg-slate-200 rounded w-1/2" />
    </div>
  );
}

function ProductGridSkeleton({ title }: { title: string }) {
  return (
    <div className="bg-white p-3 sm:p-4 md:p-6 mb-3 sm:mb-4 md:mb-5 rounded-md">
      <h2 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">{title}</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3 md:gap-4">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="aspect-square bg-slate-200 rounded mb-2" />
            <div className="h-4 bg-slate-200 rounded mb-2" />
            <div className="h-4 bg-slate-200 rounded w-2/3" />
          </div>
        ))}
      </div>
    </div>
  );
}
