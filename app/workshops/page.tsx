"use client";

import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import Link from "next/link";
import { Calendar, Users, Clock, MapPin, CheckCircle2, ArrowRight } from "lucide-react";
import ProductCard, { ProductItem } from "@/components/ProductCard";

const WORKSHOP_FALLBACKS: ProductItem[] = [
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

export default function WorkshopsPage() {
  const { data: workshops = [] } = useQuery<ProductItem[]>({
    queryKey: ["workshops"],
    queryFn: async () => {
      const res = await fetch("/api/products?type=workshops");
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      if (data.data && data.data.length > 0) {
        return data.data;
      }
      return WORKSHOP_FALLBACKS;
    },
    initialData: WORKSHOP_FALLBACKS,
  });

  return (
    <main className="min-h-screen pb-20 pt-8">
      {/* Hero Showcase */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        <div className="relative rounded-3xl overflow-hidden bg-neutral-900 text-white shadow-2xl">
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 items-center p-8 sm:p-14 lg:p-16">
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 text-xs tracking-wider uppercase font-medium">
                <span>Hands-on Atelier Experience</span>
              </div>
              <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl leading-tight">
                The Botanical Studio Masterclasses
              </h1>
              <p className="text-neutral-300 text-base sm:text-lg font-light leading-relaxed max-w-xl">
                Slow down, step inside our sunlit conservatory, and learn time-honored artisanal floral mechanics from master botanical sculptors.
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-4 border-t border-neutral-800 text-xs text-neutral-300">
                <div className="flex items-center gap-2">
                  <Users size={16} className="text-amber-400" />
                  <span>Small cohorts (8 max)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock size={16} className="text-amber-400" />
                  <span>2.5 hours hands-on</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin size={16} className="text-amber-400" />
                  <span>Mulberry St Atelier</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 mt-8 lg:mt-0 relative aspect-[4/3] rounded-2xl overflow-hidden shadow-xl border border-neutral-800">
              <Image
                src="/images/floral_workshop.jpg"
                alt="Floral workshop"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Workshop Offerings Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-20">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 pb-4 border-b border-stone-200">
          <div>
            <span className="text-xs font-semibold uppercase tracking-widest text-amber-800">
              Upcoming Sessions
            </span>
            <h2 className="font-serif text-3xl text-neutral-900 mt-1">
              Select Your Class & Reserve
            </h2>
          </div>
          <p className="text-xs text-neutral-500 mt-2 sm:mt-0">
            All premium botanicals, tools, refreshments, and take-home ceramic vases are included.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {workshops.map((workshop) => (
            <ProductCard key={workshop.id} product={workshop} />
          ))}
        </div>
      </div>

      {/* What is Included Section */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-stone-100/70 p-8 sm:p-12 border border-stone-200/80">
          <h3 className="font-serif text-2xl sm:text-3xl text-neutral-900 text-center mb-8">
            Every Workshop Seat Includes
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-sm text-neutral-700">
            <div className="flex items-start gap-3 bg-white p-4 rounded-2xl border border-stone-200/60 shadow-2xs">
              <CheckCircle2 size={18} className="text-emerald-700 mt-0.5 shrink-0" />
              <div>
                <strong className="block text-neutral-900 font-medium">Lush Seasonal Florals</strong>
                <span className="text-xs text-neutral-500">
                  Full bucket of rare stems, peonies, garden roses, and wild textural greenery.
                </span>
              </div>
            </div>

            <div className="flex items-start gap-3 bg-white p-4 rounded-2xl border border-stone-200/60 shadow-2xs">
              <CheckCircle2 size={18} className="text-emerald-700 mt-0.5 shrink-0" />
              <div>
                <strong className="block text-neutral-900 font-medium">Handmade Ceramic Vessel</strong>
                <span className="text-xs text-neutral-500">
                  Keep your custom stone vase and heavy brass kenzan frog for future arranging at home.
                </span>
              </div>
            </div>

            <div className="flex items-start gap-3 bg-white p-4 rounded-2xl border border-stone-200/60 shadow-2xs">
              <CheckCircle2 size={18} className="text-emerald-700 mt-0.5 shrink-0" />
              <div>
                <strong className="block text-neutral-900 font-medium">Foam-Free Mechanics Masterclass</strong>
                <span className="text-xs text-neutral-500">
                  Learn armatures, negative space, stem conditioning, and long-lasting bloom preservation.
                </span>
              </div>
            </div>

            <div className="flex items-start gap-3 bg-white p-4 rounded-2xl border border-stone-200/60 shadow-2xs">
              <CheckCircle2 size={18} className="text-emerald-700 mt-0.5 shrink-0" />
              <div>
                <strong className="block text-neutral-900 font-medium">Artisanal Tea & Botanical Treats</strong>
                <span className="text-xs text-neutral-500">
                  Enjoy herbal infusions, sparkling cider, and French pastries throughout the session.
                </span>
              </div>
            </div>
          </div>

          <div className="mt-8 text-center pt-4 border-t border-stone-200">
            <p className="text-xs text-neutral-600">
              Looking for a private bridal shower, corporate retreat, or team gathering?
            </p>
            <Link
              href="/contact"
              className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-900 hover:text-neutral-600 underline underline-offset-4"
            >
              <span>Contact us for custom private studio reservations</span>
              <ArrowRight size={13} />
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
