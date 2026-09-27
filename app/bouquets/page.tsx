"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Leaf, Loader2, HeartHandshake, ShieldCheck } from "lucide-react";
import ProductCard, { ProductItem } from "@/components/ProductCard";
import AtelierRadialBackdrop from "@/components/AtelierRadialBackdrop";

const BOUQUET_FALLBACKS: ProductItem[] = [
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
];

export default function BouquetsPage() {
  const [sortOption, setSortOption] = useState("views");

  const { data: bouquets = [], isLoading } = useQuery<ProductItem[]>({
    queryKey: ["bouquets", { sort: sortOption }],
    queryFn: async () => {
      const res = await fetch(`/api/products?type=bouquets&sort=${sortOption}`);
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      if (data.data && data.data.length > 0) {
        return data.data;
      }
      return BOUQUET_FALLBACKS;
    },
    initialData: BOUQUET_FALLBACKS,
  });

  return (
    <main className="min-h-screen pb-20 pt-8">
      {/* Header Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
        <AtelierRadialBackdrop
          variant="rose-velvet"
          placement="top-right"
          intensity={1.15}
          className="p-8 sm:p-12 text-center max-w-4xl mx-auto shadow-2xl border border-rose-500/20 text-white"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-400/25 text-rose-300 text-xs tracking-wider uppercase font-medium mb-4 backdrop-blur-xs">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-400"></span>
            </span>
            <span>Hand-Tied Botanical Art</span>
          </div>
          <h1 className="font-serif text-4xl sm:text-5xl text-white tracking-tight">
            Artisanal Seasonal Bouquets
          </h1>
          <p className="mt-3 text-sm sm:text-base text-stone-300 font-light max-w-xl mx-auto leading-relaxed">
            Crafted stem-by-stem using fresh cuts harvested within 24 hours. Finished with raw French silk ribbon and bespoke handwritten botanical care cards.
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-3 sm:gap-4 text-xs text-stone-200">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 backdrop-blur-xs">
              <Leaf size={14} className="text-rose-400" /> 100% Regenerative Stems
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 backdrop-blur-xs">
              <HeartHandshake size={14} className="text-rose-400" /> Hand-Wrapped with Silk Ribbon
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 backdrop-blur-xs">
              <ShieldCheck size={14} className="text-rose-400" /> 7-Day Bloom Freshness Guarantee
            </span>
          </div>
        </AtelierRadialBackdrop>

        {/* Sort Bar */}
        <div className="mt-8 flex items-center justify-between border-b border-stone-200/80 pb-4">
          <span className="text-xs font-medium text-neutral-500">
            Displaying {bouquets.length} artisanal bouquet designs
          </span>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-stone-400">Sort by:</span>
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
              className="rounded-full border border-stone-200 bg-white px-3 py-1 text-xs font-medium text-neutral-800 focus:outline-none cursor-pointer"
            >
              <option value="views">Most Loved</option>
              <option value="newest">Latest Season</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* Bouquets Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {isLoading ? (
          <div className="py-24 flex flex-col items-center justify-center text-neutral-400">
            <Loader2 className="size-8 animate-spin text-stone-600 mb-3" />
            <p className="text-sm">Harvesting fresh bouquets...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {bouquets.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
