import React from "react";
import { Filter, SlidersHorizontal } from "lucide-react";
import { Button } from "../ui/button";
import { useUIStore } from "../../stores/uiStore";

const categories = [
  "all",
  "chatgpt",
  "midjourney",
  "dalle",
  "claude",
  "writing",
  "coding",
  "marketing",
  "education",
  "business",
];

const sortOptions = [
  { value: "latest", label: "Latest" },
  { value: "popular", label: "Most Popular" },
  { value: "trending", label: "Trending" },
  { value: "price-low", label: "Price: Low to High" },
  { value: "price-high", label: "Price: High to Low" },
];

const priceRanges = [
  { value: "all", label: "All Prices" },
  { value: "free", label: "Free Only" },
  { value: "paid", label: "Paid Only" },
  { value: "0-10", label: "$0 - $10" },
  { value: "10-50", label: "$10 - $50" },
  { value: "50+", label: "$50+" },
];

export default function PromptFilters() {
  const { filters, setFilters, resetFilters } = useUIStore();
  const [showFilters, setShowFilters] = React.useState(false);

  const handleFilterChange = (key, value) => {
    setFilters({ [key]: value });
  };

  const activeFiltersCount = Object.values(filters).filter((value, index) => {
    const keys = Object.keys(filters);
    const defaults = ["all", "all", "latest"];
    return value !== defaults[index];
  }).length;

  return (
    <div className="space-y-4">
      {/* Filter Toggle */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Explore Prompts</h2>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowFilters(!showFilters)}
          className="relative"
        >
          <SlidersHorizontal className="h-4 w-4 mr-2" />
          Filters
          {activeFiltersCount > 0 && (
            <span className="absolute -top-1 -right-1 h-5 w-5 bg-blue-500 text-white text-xs rounded-full flex items-center justify-center">
              {activeFiltersCount}
            </span>
          )}
        </Button>
      </div>

      {/* Category Pills (Always Visible) */}
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => handleFilterChange("category", category)}
            className={`px-3 py-2 rounded-full text-sm font-medium transition-colors ${
              filters.category === category
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
            }`}
          >
            {category === "all"
              ? "All Categories"
              : category.charAt(0).toUpperCase() + category.slice(1)}
          </button>
        ))}
      </div>

      {/* Advanced Filters */}
      {showFilters && (
        <div className="bg-white dark:bg-slate-950 border rounded-lg p-4 space-y-4">
          {/* Sort By */}
          <div>
            <label className="block text-sm font-medium mb-2">Sort By</label>
            <select
              value={filters.sortBy}
              onChange={(e) => handleFilterChange("sortBy", e.target.value)}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-900 dark:border-slate-700"
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Price Range */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Price Range
            </label>
            <select
              value={filters.priceRange}
              onChange={(e) => handleFilterChange("priceRange", e.target.value)}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-900 dark:border-slate-700"
            >
              {priceRanges.map((range) => (
                <option key={range.value} value={range.value}>
                  {range.label}
                </option>
              ))}
            </select>
          </div>

          {/* Reset Filters */}
          <div className="flex justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={resetFilters}
              disabled={activeFiltersCount === 0}
            >
              Reset Filters
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
