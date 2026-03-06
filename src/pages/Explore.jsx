import React, {
  useState,
  useMemo,
  useEffect,
  useRef,
  useCallback,
} from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { Search, SlidersHorizontal, X, Filter, Tag } from "lucide-react";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import PromptCard from "../components/prompts/PromptCard";
import { promptAPI } from "../services/prompts";
import { useDebounce } from "../hooks/useDebounce";

const CATEGORIES = [
  "All Categories",
  "ChatGPT",
  "Midjourney",
  "Dalle",
  "Claude",
  "Writing",
  "Coding",
  "Marketing",
  "Education",
  "Business",
];

const SORT_OPTIONS = [
  { label: "Latest", value: "latest" },
  { label: "Most Popular", value: "popular" },
  { label: "Most Liked", value: "liked" },
  { label: "Trending", value: "trending" },
];

const PRICE_FILTERS = [
  { label: "All", value: "all" },
  { label: "Free", value: "free" },
  { label: "Paid", value: "paid" },
];

export default function Explore() {
  const [searchParams, setSearchParams] = useSearchParams();

  // Initialize state from URL params
  const [searchQuery, setSearchQuery] = useState(
    searchParams.get("search") || ""
  );
  const [selectedCategory, setSelectedCategory] = useState(
    searchParams.get("category") || "All Categories"
  );
  const [priceFilter, setPriceFilter] = useState(
    searchParams.get("price") || "all"
  );
  const [sortBy, setSortBy] = useState(searchParams.get("sort") || "latest");
  const [showFilters, setShowFilters] = useState(false);
  const [priceRange, setPriceRange] = useState([0, 1000]);

  // Debounce search query
  const debouncedSearch = useDebounce(searchQuery, 300);

  // Sync filters with URL params
  useEffect(() => {
    const params = {};
    if (searchQuery) params.search = searchQuery;
    if (selectedCategory !== "All Categories")
      params.category = selectedCategory;
    if (priceFilter !== "all") params.price = priceFilter;
    if (sortBy !== "latest") params.sort = sortBy;

    setSearchParams(params, { replace: true });
  }, [searchQuery, selectedCategory, priceFilter, sortBy]);

  // Fetch prompts with infinite scroll
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
  } = useInfiniteQuery({
    queryKey: [
      "explore-prompts",
      debouncedSearch,
      selectedCategory,
      priceFilter,
      sortBy,
    ],
    queryFn: ({ pageParam = 1 }) =>
      promptAPI.getAllPrompts({
        search: debouncedSearch,
        category: selectedCategory === "All Categories" ? "" : selectedCategory,
        priceType: priceFilter,
        sort: sortBy,
        page: pageParam,
        limit: 12,
      }),
    getNextPageParam: (lastPage, pages) => {
      if (lastPage.hasMore) return pages.length + 1;
      return undefined;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Flatten all pages into single array
  const prompts = useMemo(() => {
    return data?.pages.flatMap((page) => page.data || page.prompts || []) || [];
  }, [data]);

  // Filter by price range if paid
  const filteredPrompts = useMemo(() => {
    if (priceFilter === "paid") {
      return prompts.filter(
        (p) => p.price >= priceRange[0] && p.price <= priceRange[1]
      );
    }
    return prompts;
  }, [prompts, priceFilter, priceRange]);

  // Check if any filters are active
  const hasActiveFilters =
    searchQuery ||
    selectedCategory !== "All Categories" ||
    priceFilter !== "all" ||
    sortBy !== "latest";

  // Get active filter chips
  const activeFilters = useMemo(() => {
    const filters = [];
    if (searchQuery)
      filters.push({ type: "search", label: `Search: "${searchQuery}"` });
    if (selectedCategory !== "All Categories")
      filters.push({ type: "category", label: selectedCategory });
    if (priceFilter !== "all")
      filters.push({
        type: "price",
        label: priceFilter === "free" ? "Free" : "Paid",
      });
    if (sortBy !== "latest")
      filters.push({
        type: "sort",
        label: SORT_OPTIONS.find((s) => s.value === sortBy)?.label,
      });
    return filters;
  }, [searchQuery, selectedCategory, priceFilter, sortBy]);

  const handleClearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("All Categories");
    setPriceFilter("all");
    setSortBy("latest");
    setPriceRange([0, 1000]);
    setSearchParams({}, { replace: true });
  };

  const handleRemoveFilter = (filterType) => {
    switch (filterType) {
      case "search":
        setSearchQuery("");
        break;
      case "category":
        setSelectedCategory("All Categories");
        break;
      case "price":
        setPriceFilter("all");
        break;
      case "sort":
        setSortBy("latest");
        break;
    }
  };

  // Infinite scroll observer
  const observerTarget = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => {
      if (observerTarget.current) {
        observer.unobserve(observerTarget.current);
      }
    };
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  return (
    <div className="min-h-screen px-6 py-6">
      {/* Header Section */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
          Explore Prompts
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Discover amazing AI prompts from our community
        </p>
      </div>

      {/* Search and Filters Bar */}
      <div className="mb-6 space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <Input
            type="text"
            placeholder="Search prompts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 h-12 text-lg"
          />
        </div>

        {/* Filters Toggle Button (Mobile) */}
        <div className="flex items-center gap-3 lg:hidden">
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="flex-1"
          >
            <SlidersHorizontal className="h-4 w-4 mr-2" />
            Filters
            {hasActiveFilters && (
              <span className="ml-2 px-2 py-0.5 text-xs bg-blue-600 text-white rounded-full">
                {activeFilters.length}
              </span>
            )}
          </Button>
        </div>

        {/* Active Filter Chips */}
        {hasActiveFilters && (
          <div className="flex items-center gap-2 flex-wrap p-3 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-200 dark:border-blue-800">
            <Filter className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
              Active Filters:
            </span>
            {activeFilters.map((filter, index) => (
              <button
                key={index}
                onClick={() => handleRemoveFilter(filter.type)}
                className="flex items-center gap-1 px-3 py-1 bg-blue-600 text-white text-sm rounded-full hover:bg-blue-700 transition-colors"
              >
                <Tag className="h-3 w-3" />
                {filter.label}
                <X className="h-3 w-3" />
              </button>
            ))}
            <button
              onClick={handleClearFilters}
              className="ml-auto text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline"
            >
              Clear all
            </button>
          </div>
        )}

        {/* Filters Section */}
        <div
          className={`${
            showFilters ? "block" : "hidden"
          } lg:block space-y-4 lg:space-y-0 lg:flex lg:items-center lg:gap-4 lg:flex-wrap p-4 lg:p-0 bg-gray-50 dark:bg-slate-900/50 lg:bg-transparent rounded-lg`}
        >
          {/* Category Filter */}
          <div className="space-y-2 lg:space-y-0">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 lg:hidden">
              Category
            </label>
            <div className="flex gap-2 overflow-x-auto pb-2 lg:pb-0">
              {CATEGORIES.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-full whitespace-nowrap text-sm font-medium transition-all ${
                    selectedCategory === category
                      ? "bg-blue-600 text-white shadow-md"
                      : "bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-700"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* Price Filter */}
          <div className="space-y-2 lg:space-y-0">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 lg:hidden">
              Price
            </label>
            <div className="flex gap-2">
              {PRICE_FILTERS.map((filter) => (
                <button
                  key={filter.value}
                  onClick={() => setPriceFilter(filter.value)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    priceFilter === filter.value
                      ? "bg-blue-600 text-white shadow-md"
                      : "bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-700"
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>

          {/* Sort By */}
          <div className="space-y-2 lg:space-y-0">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 lg:hidden">
              Sort By
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full lg:w-auto px-4 py-2 rounded-lg bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 text-sm font-medium border-0 cursor-pointer hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors"
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Results Count */}
      {!isLoading && (
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            <span className="font-semibold">{filteredPrompts.length}</span>{" "}
            {filteredPrompts.length === 1 ? "prompt" : "prompts"} found
          </p>
          {hasActiveFilters && (
            <button
              onClick={handleClearFilters}
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
            >
              <X className="h-4 w-4" />
              Reset filters
            </button>
          )}
        </div>
      )}

      {/* Prompts Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="bg-white dark:bg-slate-950 rounded-lg border animate-pulse"
            >
              <div className="aspect-video bg-gray-200 dark:bg-slate-800 rounded-t-lg" />
              <div className="p-4 space-y-3">
                <div className="h-4 bg-gray-200 dark:bg-slate-800 rounded w-3/4" />
                <div className="h-3 bg-gray-200 dark:bg-slate-800 rounded w-full" />
                <div className="h-3 bg-gray-200 dark:bg-slate-800 rounded w-5/6" />
                <div className="flex gap-2 mt-4">
                  <div className="h-8 bg-gray-200 dark:bg-slate-800 rounded w-20" />
                  <div className="h-8 bg-gray-200 dark:bg-slate-800 rounded w-20" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : isError ? (
        <div className="text-center py-12">
          <p className="text-red-600 dark:text-red-400 mb-4">
            Failed to load prompts. Please try again.
          </p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      ) : filteredPrompts.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-slate-950 rounded-lg border">
          <div className="max-w-md mx-auto">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No prompts found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Try adjusting your filters or search query
            </p>
            <Button onClick={handleClearFilters} variant="outline">
              Clear all filters
            </Button>
          </div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredPrompts.map((prompt) => (
              <PromptCard key={prompt._id || prompt.id} prompt={prompt} />
            ))}
          </div>

          {/* Infinite Scroll Trigger & Loading Indicator */}
          {hasNextPage && (
            <div ref={observerTarget} className="mt-8 text-center py-8">
              {isFetchingNextPage && (
                <div className="flex items-center justify-center gap-2 text-gray-600 dark:text-gray-400">
                  <div className="h-6 w-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                  <span className="text-sm">Loading more prompts...</span>
                </div>
              )}
            </div>
          )}

          {/* End of results message */}
          {!hasNextPage && filteredPrompts.length > 0 && (
            <div className="mt-8 text-center py-8">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                🎉 You've seen all prompts
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
