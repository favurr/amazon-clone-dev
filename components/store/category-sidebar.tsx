"use client";

import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { ChevronDown, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface CategorySidebarProps {
  categories: { id: string; name: string; slug: string }[];
  tags: { id: string; name: string }[];
  minPrice: number;
  maxPrice: number;
  selectedCategories: string[];
  selectedTags: string[];
  priceRange: [number, number];
  onCategoryChange: (categoryId: string) => void;
  onTagChange: (tag: string) => void;
  onPriceChange: (range: [number, number]) => void;
  onClearFilters: () => void;
}

export function CategorySidebar({
  categories,
  tags,
  minPrice,
  maxPrice,
  selectedCategories,
  selectedTags,
  priceRange,
  onCategoryChange,
  onTagChange,
  onPriceChange,
  onClearFilters,
}: CategorySidebarProps) {
  const [expandedSections, setExpandedSections] = useState({
    categories: true,
    tags: true,
    price: true,
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const hasActiveFilters =
    selectedCategories.length > 0 ||
    selectedTags.length > 0 ||
    priceRange[0] !== minPrice ||
    priceRange[1] !== maxPrice;

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-4 sticky top-20 max-h-[calc(100vh-6rem)] overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 pb-4 border-b">
        <h3 className="font-bold text-lg text-slate-900">Filters</h3>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearFilters}
            className="text-orange-600 hover:text-orange-700 h-auto p-0"
          >
            <X className="h-4 w-4 mr-1" />
            Clear All
          </Button>
        )}
      </div>

      {/* Categories */}
      <div className="mb-6">
        <button
          onClick={() => toggleSection("categories")}
          className="flex items-center justify-between w-full mb-3 group"
        >
          <h4 className="font-semibold text-sm text-slate-700 group-hover:text-slate-900">
            Categories
          </h4>
          <ChevronDown
            className={cn(
              "h-4 w-4 text-slate-400 transition-transform",
              expandedSections.categories && "rotate-180",
            )}
          />
        </button>
        {expandedSections.categories && (
          <div className="space-y-2 pl-1">
            {categories.map((category) => (
              <div key={category.id} className="flex items-center space-x-2">
                <Checkbox
                  id={`cat-${category.id}`}
                  checked={selectedCategories.includes(category.id)}
                  onCheckedChange={() => onCategoryChange(category.id)}
                />
                <Label
                  htmlFor={`cat-${category.id}`}
                  className="text-sm text-slate-600 cursor-pointer hover:text-slate-900"
                >
                  {category.name}
                </Label>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Tags */}
      {tags.length > 0 && (
        <div className="mb-6">
          <button
            onClick={() => toggleSection("tags")}
            className="flex items-center justify-between w-full mb-3 group"
          >
            <h4 className="font-semibold text-sm text-slate-700 group-hover:text-slate-900">
              Tags
            </h4>
            <ChevronDown
              className={cn(
                "h-4 w-4 text-slate-400 transition-transform",
                expandedSections.tags && "rotate-180",
              )}
            />
          </button>
          {expandedSections.tags && (
            <div className="space-y-2 pl-1 max-h-48 overflow-y-auto">
              {tags.map((tag) => (
                <div key={tag.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`tag-${tag.id}`}
                    checked={selectedTags.includes(tag.name)}
                    onCheckedChange={() => onTagChange(tag.name)}
                  />
                  <Label
                    htmlFor={`tag-${tag.id}`}
                    className="text-sm text-slate-600 cursor-pointer hover:text-slate-900"
                  >
                    {tag.name}
                  </Label>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Price Range */}
      <div>
        <button
          onClick={() => toggleSection("price")}
          className="flex items-center justify-between w-full mb-3 group"
        >
          <h4 className="font-semibold text-sm text-slate-700 group-hover:text-slate-900">
            Price Range
          </h4>
          <ChevronDown
            className={cn(
              "h-4 w-4 text-slate-400 transition-transform",
              expandedSections.price && "rotate-180",
            )}
          />
        </button>
        {expandedSections.price && (
          <div className="space-y-4 pl-1">
            <Slider
              min={minPrice}
              max={maxPrice}
              step={10}
              value={priceRange}
              onValueChange={(value) =>
                onPriceChange(value as [number, number])
              }
              className="w-full"
            />
            <div className="flex items-center justify-between text-sm">
              <span className="font-semibold text-slate-700">
                ₦{priceRange[0].toLocaleString()}
              </span>
              <span className="text-slate-400">—</span>
              <span className="font-semibold text-slate-700">
                ₦{priceRange[1].toLocaleString()}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
