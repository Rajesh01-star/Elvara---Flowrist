import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Heart, ShieldCheck, Truck, Clock, Award, Star, Compass, Sparkles } from "lucide-react";
import ProductCard, { ProductItem } from "@/components/ProductCard";
import AtelierRadialBackdrop from "@/components/AtelierRadialBackdrop";
import { getPublicProductsAction } from "@/app/admin/actions";

const FALLBACK_PRODUCTS: ProductItem[] = [
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

export const revalidate = 60;

export default async function HomePage() {
  let products: ProductItem[] = [];

  try {
    const dbProducts = await getPublicProductsAction("views");
    if (dbProducts && dbProducts.length > 0) {
      products = dbProducts.map((p) => ({
        id: p.id,
        title: p.title,
        description: p.description,
        price: p.price,
        aspect: p.aspect,
        imageUrl: p.imageUrl,
        thumbnails: p.thumbnails || [],
        activeThumbnailIndex: p.activeThumbnailIndex || 0,
        assetType: p.assetType,
        tags: p.tags || [],
        views: p.views || 0,
        createdAt: p.createdAt,
      }));
    }
  } catch (err) {
    console.error("Could not load products from database, using curated items:", err);
  }

  // Merge DB products with fallbacks if DB has few items
  const displayProducts = products.length >= 4 ? products.slice(0, 4) : [...products, ...FALLBACK_PRODUCTS.slice(products.length)];

  return (
    <main className="min-h-screen bg-stone-50">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden pt-8 pb-16 md:pt-14 md:pb-24 border-b border-stone-200/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Left Column: Typography & CTAs */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center px-3.5 py-1.5 rounded-full bg-stone-200/60 text-stone-800 text-xs tracking-wider uppercase font-medium">
                <span>Bespoke Floral Atelier — Est. 2026</span>
              </div>

              <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl text-neutral-900 leading-[1.12] tracking-tight">
                Poetic floral expressions, handcrafted for life’s quiet & grand moments.
              </h1>

              <p className="text-base sm:text-lg text-neutral-600 max-w-xl font-light leading-relaxed">
                Step into a world of rare seasonal stems, architectural arrangements, and meditative botanical workshops designed with mindful organic aesthetics.
              </p>

              <div className="pt-2 flex flex-wrap items-center gap-4">
                <Link
                  href="/collections"
                  className="inline-flex items-center gap-2 rounded-full bg-neutral-900 px-7 py-3.5 text-sm font-medium text-white hover:bg-neutral-800 transition-all shadow-md group"
                >
                  <span>Explore Collections</span>
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </Link>

                <Link
                  href="/workshops"
                  className="inline-flex items-center gap-2 rounded-full border border-stone-300 bg-white/80 backdrop-blur-xs px-6 py-3.5 text-sm font-medium text-neutral-800 hover:bg-stone-100 hover:border-stone-400 transition-all"
                >
                  <Compass size={16} className="text-stone-500" />
                  <span>Floral Workshops</span>
                </Link>
              </div>

              {/* Badges / Micro Proof */}
              <div className="pt-6 grid grid-cols-3 gap-4 border-t border-stone-200/80 max-w-lg text-xs text-neutral-600">
                <div className="flex items-center gap-2">
                  <Truck size={16} className="text-stone-500 shrink-0" />
                  <span>White-glove courier</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock size={16} className="text-stone-500 shrink-0" />
                  <span>Fresh daily harvest</span>
                </div>
                <div className="flex items-center gap-2">
                  <Award size={16} className="text-stone-500 shrink-0" />
                  <span>Artisan florists</span>
                </div>
              </div>
            </div>

            {/* Right Column: Hero Visual Showcase */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md lg:max-w-none">
                <div className="relative aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl border border-white/60">
                  <Image
                    src="/images/hero_flower.png"
                    alt="Artisanal Peony Floral Arrangement"
                    fill
                    priority
                    sizes="(max-width: 1024px) 100vw, 45vw"
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

                  {/* Floating Luxury Card */}
                  <div className="absolute bottom-5 left-5 right-5 rounded-2xl bg-white/90 backdrop-blur-md p-4 border border-white/80 shadow-lg flex items-center justify-between">
                    <div>
                      <p className="text-[11px] uppercase tracking-wider text-stone-500 font-medium">
                        Featured Atelier Design
                      </p>
                      <h4 className="font-serif text-sm font-semibold text-neutral-900">
                        Ethereal Garden Peony
                      </h4>
                    </div>
                    <Link
                      href="/collections"
                      className="size-8 rounded-full bg-neutral-900 text-white flex items-center justify-center hover:bg-neutral-800 transition-colors"
                      aria-label="View arrangement"
                    >
                      <ArrowRight size={14} />
                    </Link>
                  </div>
                </div>

                {/* Decorative background glow */}
                <div className="absolute -inset-4 -z-10 rounded-3xl bg-amber-100/40 filter blur-2xl opacity-60 pointer-events-none" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. FEATURED CREATIONS CAROUSEL/GRID */}
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
            <div>
              <span className="text-xs font-semibold uppercase tracking-widest text-amber-800/80">
                Current Season Curation
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl text-neutral-900 mt-1">
                Handcrafted Bouquets & Sculptures
              </h2>
            </div>
            <Link
              href="/collections"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-neutral-900 hover:text-neutral-600 transition-colors group"
            >
              <span>View complete catalog</span>
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {displayProducts.map((product, idx) => (
              <ProductCard key={product.id} product={product} priority={idx === 0} />
            ))}
          </div>
        </div>
      </section>

      {/* 3. ATELIER PHILOSOPHY & CRAFTSMANSHIP */}
      <section className="py-16 bg-white border-y border-stone-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-5 relative">
              <div className="relative aspect-[3/4] rounded-3xl overflow-hidden shadow-xl border border-stone-100">
                <Image
                  src="/images/bouquet_artisan.jpg"
                  alt="Floral Designer Crafting Bouquet"
                  fill
                  sizes="(max-width: 1024px) 100vw, 40vw"
                  className="object-cover"
                />
              </div>
            </div>

            <div className="lg:col-span-7 space-y-6">
              <span className="text-xs font-semibold uppercase tracking-widest text-stone-500">
                Mindful Botanical Design
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl text-neutral-900 leading-snug">
                We believe flowers are living poetry, meant to transform space and evoke memory.
              </h2>
              <p className="text-neutral-600 text-sm sm:text-base leading-relaxed font-light">
                Every stem at Elvara is personally sourced from regenerative grower cooperatives across the Hudson Valley and sustainable Dutch micro-farms. We honor the natural curve, texture, and wild imperfection of each petal — never forcing rigid symmetry, always celebrating organic beauty.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-4">
                <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/70">
                  <h4 className="font-serif text-base font-semibold text-neutral-900 mb-1">
                    100% Floral Foam Free
                  </h4>
                  <p className="text-xs text-neutral-600 leading-relaxed">
                    We use reusable kenzan frogs, chicken wire armature, and clean water mechanics to eliminate microplastics.
                  </p>
                </div>
                <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/70">
                  <h4 className="font-serif text-base font-semibold text-neutral-900 mb-1">
                    Zero Synthetic Preservatives
                  </h4>
                  <p className="text-xs text-neutral-600 leading-relaxed">
                    Our cold-chain transport ensures stems arrive brimming with natural vitality and delicate botanical perfume.
                  </p>
                </div>
              </div>

              <div className="pt-2">
                <Link
                  href="/about"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-neutral-900 hover:text-neutral-700 underline underline-offset-4"
                >
                  <span>Learn more about our studio ethos</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. WORKSHOPS & MASTERCLASSES HIGHLIGHT */}
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AtelierRadialBackdrop
            variant="golden-hour"
            intensity={1.15}
            withGrain={true}
            className="shadow-2xl border border-amber-500/20 text-white"
          >
            <div className="grid grid-cols-1 lg:grid-cols-12 items-center">
              <div className="p-8 sm:p-12 lg:p-16 lg:col-span-7 space-y-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/25 text-amber-300 text-xs font-semibold uppercase tracking-widest backdrop-blur-xs">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-400"></span>
                  </span>
                  <span>Interactive Studio Experiences</span>
                </div>

                <h3 className="font-serif text-3xl sm:text-4xl leading-tight">
                  Learn the art of artisanal floral design in our sun-drenched atelier.
                </h3>
                <p className="text-stone-300 text-sm sm:text-base font-light leading-relaxed max-w-lg">
                  Join our resident master florists for weekend tea, botanical color harmony, and hands-on flower sculpting. Walk away with your own bespoke centerpiece in a handcrafted ceramic vase.
                </p>

                {/* Thoughtful atelier inclusions */}
                <div className="flex flex-wrap gap-2 pt-1 text-xs text-stone-300">
                  <span className="px-2.5 py-1 rounded-md bg-white/5 border border-white/10 backdrop-blur-xs">
                    🌿 Foam-Free Mechanics
                  </span>
                  <span className="px-2.5 py-1 rounded-md bg-white/5 border border-white/10 backdrop-blur-xs">
                    🏺 Handcrafted Ceramic Urn Included
                  </span>
                  <span className="px-2.5 py-1 rounded-md bg-white/5 border border-white/10 backdrop-blur-xs">
                    🍵 Botanical Tea Pairing
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-4 pt-2">
                  <Link
                    href="/workshops"
                    className="rounded-full bg-white text-neutral-950 px-6 py-3 text-sm font-medium hover:bg-amber-50 hover:shadow-lg hover:shadow-amber-500/10 transition-all inline-flex items-center gap-2 group"
                  >
                    <span>Reserve Your Seat</span>
                    <ArrowRight size={15} className="group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                  <Link
                    href="/contact"
                    className="rounded-full border border-stone-700/80 bg-white/5 backdrop-blur-xs text-white px-6 py-3 text-sm font-medium hover:bg-white/10 hover:border-stone-500 transition-all"
                  >
                    Private Group Inquiries
                  </Link>
                </div>
              </div>

              <div className="lg:col-span-5 relative h-72 lg:h-full min-h-[380px] overflow-hidden">
                <Image
                  src="/images/floral_workshop.jpg"
                  alt="Floral workshop participant"
                  fill
                  className="object-cover opacity-95 transition-transform duration-700 hover:scale-105"
                />
                {/* Seamless ambient vignette blending into the glowing room */}
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t lg:bg-gradient-to-r from-[#141210] via-transparent to-transparent opacity-80" />
                <div className="absolute bottom-4 right-4 z-10 hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/50 backdrop-blur-md border border-white/15 text-[11px] text-stone-200 shadow-sm">
                  <Sparkles size={12} className="text-amber-300" />
                  <span>Atelier Session · Madhapur, Hyderabad</span>
                </div>
              </div>
            </div>
          </AtelierRadialBackdrop>
        </div>
      </section>

      {/* 5. CLIENT EXPERIENCES & REVIEWS */}
      <section className="py-16 bg-stone-100/60 border-t border-stone-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-semibold uppercase tracking-widest text-stone-500">
              Kind Words From Our Patrons
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl text-neutral-900 mt-1">
              Treasured Stories & Celebrations
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                quote:
                  "Elvara provided the florals for our wedding celebration. Guests are still talking about the scent of the garden roses and the sculptural tablescape. Truly unforgettable.",
                author: "Elena & Marcus",
                location: "Jubilee Hills, Hyderabad",
              },
              {
                quote:
                  "The Saturday floral masterclass was peaceful, inspiring, and so thorough. Learning foam-free mechanics at the Madhapur atelier was the highlight of my month.",
                author: "Claire D.",
                location: "Madhapur, Hyderabad",
              },
              {
                quote:
                  "I ordered the Autumn Peony bouquet for my anniversary. The white-glove delivery arrived precisely on time in flawless condition. The blooms lasted almost two weeks!",
                author: "Julian Hayes",
                location: "Banjara Hills, Hyderabad",
              },
            ].map((review, i) => (
              <div
                key={i}
                className="rounded-3xl bg-white p-7 border border-stone-200/70 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex gap-1 text-amber-500 mb-4">
                    {[...Array(5)].map((_, s) => (
                      <Star key={s} size={15} fill="currentColor" />
                    ))}
                  </div>
                  <p className="text-sm text-neutral-700 italic leading-relaxed">
                    &ldquo;{review.quote}&rdquo;
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-stone-100">
                  <h4 className="font-serif text-sm font-semibold text-neutral-900">
                    {review.author}
                  </h4>
                  <p className="text-xs text-neutral-500">{review.location}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
