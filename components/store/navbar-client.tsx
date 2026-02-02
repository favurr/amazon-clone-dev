"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ChevronDown, Search, ShoppingCart, Tag, Package, FolderOpen } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatPrice } from "@/lib/formatters";
import { useCartCount } from "@/hooks/use-cart-count";

type Category = {
  id: string;
  name: string;
  slug: string;
};

type User = {
  firstName: string;
  email: string;
};

type SearchSuggestion = {
  type: "product" | "category" | "tag";
  id: string;
  name: string;
  slug?: string;
  imageUrl?: string;
  price?: number;
};

type NavbarClientProps = {
  categories: Category[];
  user: User | null;
  cartCount: number;
};

export default function NavbarClient({ categories, user, cartCount: initialCartCount }: NavbarClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Use dynamic cart count that updates on navigation
  const cartCount = useCartCount(initialCartCount);

  // Clear search query when navigating away from search page
  useEffect(() => {
    if (!pathname.includes('/search')) {
      setSearchQuery("");
      setSuggestions([]);
      setShowSuggestions(false);
      setSelectedCategory("all");
    }
  }, [pathname]);

  // Common class for the "Amazon-box" hover effect
  const navBoxClass = "flex flex-col justify-center px-2 py-1 border border-transparent hover:border-white cursor-pointer rounded-sm transition-all duration-100";

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch suggestions with debounce
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    if (searchQuery.trim().length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setIsLoadingSuggestions(true);

    debounceTimerRef.current = setTimeout(async () => {
      try {
        const response = await fetch(
          `/api/search/suggestions?q=${encodeURIComponent(searchQuery)}`
        );
        const data = await response.json();
        setSuggestions(data.suggestions || []);
        setShowSuggestions(true);
      } catch (error) {
        console.error("Failed to fetch suggestions:", error);
        setSuggestions([]);
      } finally {
        setIsLoadingSuggestions(false);
      }
    }, 300); // 300ms debounce

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [searchQuery]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setShowSuggestions(false);
    
    const params = new URLSearchParams();
    
    if (searchQuery.trim()) {
      params.set("q", searchQuery.trim());
    }
    
    if (selectedCategory !== "all") {
      params.set("category", selectedCategory);
    }

    router.push(`/search?${params.toString()}`);
  };

  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    setShowSuggestions(false);
    
    if (suggestion.type === "product" && suggestion.slug) {
      router.push(`/products/${suggestion.slug}`);
    } else if (suggestion.type === "category" && suggestion.slug) {
      router.push(`/search?q=${encodeURIComponent(suggestion.name)}&category=${suggestion.slug}`);
    } else {
      setSearchQuery(suggestion.name);
      const params = new URLSearchParams();
      params.set("q", suggestion.name);
      if (selectedCategory !== "all") {
        params.set("category", selectedCategory);
      }
      router.push(`/search?${params.toString()}`);
    }
  };

  const handleCategorySelect = (categorySlug: string) => {
    setSelectedCategory(categorySlug);
  };

  const selectedCategoryName = selectedCategory === "all" 
    ? "All Categories" 
    : categories.find(c => c.slug === selectedCategory)?.name || "All Categories";

  return (
    <nav className="flex items-center gap-4 px-4 bg-[#131921] h-[60px] text-white">
      {/* Amazon Logo */}
      <Link href="/" className="px-2 border border-transparent hover:border-white pt-1 rounded-sm">
        <Image
          src="/amazon-logo-white.png"
          alt="Amazon Logo"
          height={30}
          width={100}
          className="object-contain"
        />
      </Link>

      {/* Category Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <div className={`${navBoxClass} flex-row items-end gap-1 min-w-[120px]`}>
            <div className="flex flex-col">
              <span className="text-[12px] leading-none text-gray-300 font-light">Select</span>
              <span className="text-[14px] leading-none font-bold truncate max-w-[100px]">
                {selectedCategoryName}
              </span>
            </div>
            <ChevronDown size={14} className="text-gray-400 mb-0.5 flex-shrink-0" />
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-[200px] p-0">
          <ScrollArea className="h-[300px]">
            <DropdownMenuItem
              onClick={() => handleCategorySelect("all")}
              className={`cursor-pointer ${selectedCategory === "all" ? "bg-accent" : ""}`}
            >
              All Categories
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {categories.map((category) => (
              <DropdownMenuItem
                key={category.id}
                onClick={() => handleCategorySelect(category.slug)}
                className={`cursor-pointer ${selectedCategory === category.slug ? "bg-accent" : ""}`}
              >
                {category.name}
              </DropdownMenuItem>
            ))}
          </ScrollArea>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Search Bar */}
      <div ref={searchRef} className="flex flex-1 h-10 relative">
        <form onSubmit={handleSearch} className="flex flex-1">
          <input
            type="text"
            placeholder="Search Amazon"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => {
              if (suggestions.length > 0) {
                setShowSuggestions(true);
              }
            }}
            className="w-full rounded-l-md bg-white outline-none border-none px-4 text-gray-900 focus:ring-2 focus:ring-[#febd69]"
          />
          <Button 
            type="submit"
            className="h-full w-12 rounded-none rounded-r-md bg-[#febd69] hover:bg-[#f3a847] border-none flex justify-center items-center text-black"
          >
            <Search size={22} strokeWidth={2.5} />
          </Button>
        </form>

        {/* Search Suggestions Dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute top-full left-0 right-12 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-50 max-h-[500px] overflow-y-auto">
            {isLoadingSuggestions ? (
              <div className="p-4 text-center text-gray-500 text-sm">
                Loading suggestions...
              </div>
            ) : (
              <div className="py-2">
                {suggestions.map((suggestion) => (
                  <button
                    key={`${suggestion.type}-${suggestion.id}`}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="w-full px-4 py-2 hover:bg-gray-100 flex items-center gap-3 text-left transition-colors"
                  >
                    {suggestion.type === "product" && suggestion.imageUrl && (
                      <img
                        src={suggestion.imageUrl}
                        alt={suggestion.name}
                        className="w-10 h-10 object-cover rounded"
                      />
                    )}
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        {suggestion.type === "category" && (
                          <FolderOpen className="w-4 h-4 text-[#c45500] flex-shrink-0" />
                        )}
                        {suggestion.type === "tag" && (
                          <Tag className="w-4 h-4 text-blue-600 flex-shrink-0" />
                        )}
                        {suggestion.type === "product" && (
                          <Package className="w-4 h-4 text-green-600 flex-shrink-0" />
                        )}
                        
                        <span className="text-sm text-gray-900 truncate">
                          {suggestion.name}
                        </span>
                      </div>
                      
                      {suggestion.type === "product" && suggestion.price && (
                        <div className="text-xs text-gray-600 mt-0.5">
                          {formatPrice(suggestion.price)}
                        </div>
                      )}
                    </div>

                    <span className="text-xs text-gray-400 uppercase flex-shrink-0">
                      {suggestion.type}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Account & Lists */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <div className={`${navBoxClass} flex-row items-end gap-1`}>
            <div className="flex flex-col">
              <span className="text-[12px] leading-none text-gray-300 font-light">
                Hello, {user ? user.firstName : "sign in"}
              </span>
              <span className="text-[14px] leading-none font-bold">Account & Lists</span>
            </div>
            <ChevronDown size={14} className="text-gray-400 mb-0.5" />
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-[200px]">
          {user ? (
            <>
              <div className="px-2 py-1.5 text-sm font-semibold">
                Hello, {user.firstName}
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/orders" className="cursor-pointer">Your Orders</Link>
              </DropdownMenuItem>
              <DropdownMenuItem disabled className="cursor-not-allowed opacity-50">
                Your Reviews
              </DropdownMenuItem>
              <DropdownMenuItem disabled className="cursor-not-allowed opacity-50">
                Saved Items
              </DropdownMenuItem>
              <DropdownMenuItem disabled className="cursor-not-allowed opacity-50">
                Recently Viewed
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem disabled className="cursor-not-allowed opacity-50">
                Account Settings
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/api/auth/sign-out" className="cursor-pointer text-red-600">
                  Sign Out
                </Link>
              </DropdownMenuItem>
            </>
          ) : (
            <>
              <DropdownMenuItem asChild>
                <Link href="/auth/login" className="cursor-pointer font-semibold">
                  Sign In
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/auth/signup" className="cursor-pointer">
                  Create Account
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => router.push("/auth/login?redirect=/orders")}
                className="cursor-pointer opacity-70"
              >
                Your Orders (sign in required)
              </DropdownMenuItem>
              <DropdownMenuItem disabled className="cursor-not-allowed opacity-50">
                Your Reviews
              </DropdownMenuItem>
              <DropdownMenuItem disabled className="cursor-not-allowed opacity-50">
                Saved Items
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Returns & Orders */}
      <Link 
        href={user ? "/orders" : "/auth/login?redirect=/orders"}
        className={navBoxClass}
      >
        <span className="text-[12px] leading-none text-gray-300 font-light">Returns</span>
        <span className="text-[14px] leading-none font-bold">& Orders</span>
      </Link>

      {/* Cart */}
      <Link href="/cart" className="flex items-end px-2 py-1 border border-transparent hover:border-white rounded-sm relative cursor-pointer h-[44px]">
        <div className="relative flex items-center">
          {/* Cart Icon */}
          <Image src="/cart.png" alt="Cart" width={40} height={40} />
          
          {/* Item Count - Perfectly positioned in the basket notch */}
          <span className="absolute top-[-2px] left-[13px] w-5 text-center text-[#f08804] text-[16px] font-bold leading-none bg-transparent">
            {cartCount}
          </span>
        </div>
        
        {/* Cart Text */}
        <span className="text-[14px] font-bold pb-1 ml-1">Cart</span>
      </Link>
    </nav>
  );
}
