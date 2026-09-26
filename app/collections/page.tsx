"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, SlidersHorizontal, Loader2, Filter } from "lucide-react";
import ProductCard, { ProductItem } from "@/components/ProductCard";

const CATEGORIES = [
  { id: "all", label: "All Offerings" },
  { id: "bouquets", label: "Hand-Tied Bouquets" },
  { id: "collections", label: "Vessel Arrangements" },
  { id: "workshops", label: "Floral Workshops" },
  { id: "gifts", label: "Botanical Gifts" },
];

const POPULAR_TAGS = [
  "roses",
  "peonies",
  "luxury",
  "wedding",
  "dried",
  "sculptural",
  "orchids",
  "masterclass",
];

const FALLBACK_COLLECTION_ITEMS: ProductItem[] = [
  {
    id: "peony-symphony-01",
    title: "Ethereal Peony & Garden Rose Arrangement",
    description: "Lush blush peonies, fragrant garden roses, and silver dollar eucalyptus in a fluted ceramic urn.",
    price: "115.00",
    assetType: "bouquets",
    tags: ["peonies", "luxury", "bestseller"],
    views: 890,
    imageUrl: "/images/hero_flower.png",
    thumbnails: ["/images/hero_flower.png"],
    activeThumbnailIndex: 0,
  },
  {
    id: "bouquet-artisan-02",
    title: "Artisanal Silk Tied Garden Bouquet",
    description: "Hand-tied dusty rose blossoms, wild ranunculus, and dried lavender wrapped in unbleached kraft paper.",
    price: "85.00",
    assetType: "bouquets",
    tags: ["hand-tied", "roses", "signature"],
    views: 640,
    imageUrl: "/images/bouquet_artisan.jpg",
    thumbnails: ["/images/bouquet_artisan.jpg"],
    activeThumbnailIndex: 0,
  },
  {
    id: "botanical-orchid-03",
    title: "Travertine & Orchid Sculptural Centerpiece",
    description: "Blush moth orchids with bleached botanical ferns nestled in a handcrafted wabi-sabi ceramic vessel.",
    price: "145.00",
    assetType: "collections",
    tags: ["sculptural", "orchids", "home"],
    views: 420,
    imageUrl: "/images/botanical_arrangement.jpg",
    thumbnails: ["/images/botanical_arrangement.jpg"],
    activeThumbnailIndex: 0,
  },
  {
    id: "workshop-botanical-04",
    title: "Seasonal Floral Design Masterclass",
    description: "An intimate 2.5-hour workshop in our sunlit greenhouse covering foam-free floral mechanics and color theory.",
    price: "160.00",
    assetType: "workshops",
    tags: ["workshop", "masterclass", "experience"],
    views: 950,
    imageUrl: "/images/floral_workshop.jpg",
    thumbnails: ["/images/floral_workshop.jpg"],
    activeThumbnailIndex: 0,
  },
];

export default function CollectionsPage() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [sortOption, setSortOption] = useState("views");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: products = [], isLoading } = useQuery<ProductItem[]>({
    queryKey: ["products", { sort: sortOption, type: selectedCategory, tag: selectedTag }],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (sortOption) params.set("sort", sortOption);
      if (selectedCategory && selectedCategory !== "all") {
        params.set("type", selectedCategory);
      }
      if (selectedTag) params.set("tags", selectedTag);

      const res = await fetch(`/api/products?${params.toString()}`);
      const data = await res.json();
      if (!data.success) throw new Error(data.error);

      // If DB has returned items, use them; if empty, fallback
      if (data.data && data.data.length > 0) {
        return data.data;
      }
      return FALLBACK_COLLECTION_ITEMS;
    },
    initialData: FALLBACK_COLLECTION_ITEMS,
  });

  // Client-side search filter
  const filteredProducts = products.filter((p) => {
    const matchesCategory =
      selectedCategory === "all" || p.assetType === selectedCategory;
    const matchesTag = !selectedTag || p.tags?.includes(selectedTag);
    const matchesSearch =
      !searchQuery.trim() ||
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesTag && matchesSearch;
  });

  return (
    <main className="min-h-screen pb-20 pt-8">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
        <div className="border-b border-stone-200/80 pb-8 text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-stone-100 text-stone-700 text-xs tracking-wider uppercase font-medium mb-3">
            <span>Botanical Portfolio</span>
          </div>
          <h1 className="font-serif text-4xl sm:text-5xl text-neutral-900 tracking-tight">
            The Atelier Collection
          </h1>
          <p className="mt-3 text-sm sm:text-base text-neutral-600 font-light">
            Explore our curated arrangements, limited edition seasonal bouquets, botanical design workshops, and handcrafted vessel gifts.
          </p>
        </div>

        {/* Search & Filter Bar */}
        <div className="mt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-none">
            {CATEGORIES.map((cat) => {
              const isActive = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`rounded-full px-4 py-2 text-xs font-medium whitespace-nowrap transition-all duration-200 ${
                    isActive
                      ? "bg-neutral-900 text-white shadow-xs"
                      : "bg-white border border-stone-200 text-neutral-700 hover:border-neutral-400 hover:text-neutral-950"
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>

          {/* Right: Search & Sort controls */}
          <div className="flex items-center gap-3 w-full md:w-auto">
            {/* Search Input */}
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 size-3.5" />
              <input
                type="text"
                placeholder="Search blooms or style..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-full border border-stone-200 bg-white pl-9 pr-4 py-1.5 text-xs text-neutral-900 placeholder:text-stone-400 focus:border-neutral-900 focus:outline-none"
              />
            </div>

            {/* Sort Dropdown */}
            <div className="relative shrink-0">
              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
                className="appearance-none rounded-full border border-stone-200 bg-white pl-3.5 pr-8 py-1.5 text-xs font-medium text-neutral-800 focus:border-neutral-900 focus:outline-none cursor-pointer"
              >
                <option value="views">Most Popular</option>
                <option value="newest">Newest Arrivals</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
              <SlidersHorizontal className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 size-3 text-stone-400" />
            </div>
          </div>
        </div>

        {/* Tag Filters */}
        <div className="mt-4 flex items-center gap-2 flex-wrap text-xs">
          <span className="text-stone-400 flex items-center gap-1 font-medium mr-1">
            <Filter size={11} /> Filter:
          </span>
          <button
            onClick={() => setSelectedTag(null)}
            className={`rounded-full px-2.5 py-1 text-[11px] font-medium transition-colors ${
              selectedTag === null
                ? "bg-stone-200 text-stone-900"
                : "text-stone-600 hover:text-stone-950"
            }`}
          >
            All tags
          </button>
          {POPULAR_TAGS.map((tag) => (
            <button
              key={tag}
              onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
              className={`rounded-full px-2.5 py-1 text-[11px] font-medium transition-colors ${
                selectedTag === tag
                  ? "bg-amber-100 text-amber-900 border border-amber-300"
                  : "bg-stone-100 text-stone-600 hover:bg-stone-200 hover:text-neutral-900"
              }`}
            >
              #{tag}
            </button>
          ))}
        </div>
      </div>

      {/* Product Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {isLoading ? (
          <div className="py-24 flex flex-col items-center justify-center text-neutral-400">
            <Loader2 className="size-8 animate-spin text-stone-600 mb-3" />
            <p className="text-sm">Curating botanical items...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="py-20 text-center rounded-3xl border border-dashed border-stone-300 bg-white/50 p-8 max-w-lg mx-auto">
            <p className="font-serif text-xl text-neutral-800">No arrangements found</p>
            <p className="mt-2 text-xs text-neutral-500">
              Try adjusting your search criteria, category selection, or tag filters.
            </p>
            <button
              onClick={() => {
                setSelectedCategory("all");
                setSelectedTag(null);
                setSearchQuery("");
              }}
              className="mt-4 inline-flex items-center rounded-full bg-neutral-900 px-4 py-2 text-xs font-medium text-white hover:bg-neutral-800 transition-colors"
            >
              Reset all filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
