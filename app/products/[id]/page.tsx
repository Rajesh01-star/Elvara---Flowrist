"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { 
  ArrowLeft, 
  ShoppingBag, 
  Eye, 
  ShieldCheck, 
  Truck, 
  Droplet, 
  Sun, 
  Scissors, 
  ExternalLink,
  ChevronDown,
  Loader2,
  Calendar
} from "lucide-react";
import { formatPrice, getMediaUrl, formatViews } from "@/lib/utils";
import { useRazorpay, CustomerInfo } from "@/lib/useRazorpay";
import { ProductItem } from "@/components/ProductCard";
import RelaxingLoader from "@/components/RelaxingLoader";
import CheckoutModal from "@/components/CheckoutModal";

const DEMO_PRODUCTS: Record<string, ProductItem> = {
  "peony-symphony-01": {
    id: "peony-symphony-01",
    title: "Ethereal Peony & Garden Rose Arrangement",
    description: "An architectural composition of pale blush herbaceous peonies, garden roses, and silver dollar eucalyptus housed in a hand-fluted ceramic vessel. Designed to evolve dramatically in your home as each blossom unfurls over 7 to 10 days.",
    price: "115.00",
    assetType: "bouquets",
    tags: ["peonies", "luxury", "bestseller", "fragrant"],
    views: 890,
    imageUrl: "/images/hero_flower.png",
    thumbnails: [
      "/images/hero_flower.png",
      "/images/bouquet_artisan.jpg",
      "/images/botanical_arrangement.jpg"
    ],
    activeThumbnailIndex: 0,
  },
  "bouquet-artisan-02": {
    id: "bouquet-artisan-02",
    title: "Artisanal Silk Tied Garden Bouquet",
    description: "Hand-tied dusty rose blossoms, wild ranunculus, and dried lavender wrapped in unbleached kraft paper and tied with frayed French silk ribbon.",
    price: "85.00",
    assetType: "bouquets",
    tags: ["hand-tied", "roses", "signature"],
    views: 640,
    imageUrl: "/images/bouquet_artisan.jpg",
    thumbnails: [
      "/images/bouquet_artisan.jpg",
      "/images/hero_flower.png"
    ],
    activeThumbnailIndex: 0,
  },
  "botanical-orchid-03": {
    id: "botanical-orchid-03",
    title: "Travertine & Orchid Sculptural Centerpiece",
    description: "Blush moth orchids with bleached botanical ferns nestled in a handcrafted wabi-sabi ceramic vessel. Perfect for low dining tables and credenzas.",
    price: "145.00",
    assetType: "collections",
    tags: ["sculptural", "orchids", "home"],
    views: 420,
    imageUrl: "/images/botanical_arrangement.jpg",
    thumbnails: [
      "/images/botanical_arrangement.jpg",
      "/images/hero_flower.png"
    ],
    activeThumbnailIndex: 0,
  },
  "workshop-botanical-04": {
    id: "workshop-botanical-04",
    title: "Seasonal Floral Design Masterclass",
    description: "An intimate 2.5-hour workshop in our sunlit greenhouse covering foam-free floral mechanics and color theory. Includes all stems, ceramic vessel, and refreshments.",
    price: "160.00",
    assetType: "workshops",
    tags: ["workshop", "masterclass", "experience"],
    views: 950,
    imageUrl: "/images/floral_workshop.jpg",
    thumbnails: [
      "/images/floral_workshop.jpg",
      "/images/hero_flower.png"
    ],
    activeThumbnailIndex: 0,
  },
};

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params?.id as string;

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [openAccordion, setOpenAccordion] = useState<"care" | "delivery" | "specs" | null>("care");

  // Fetch product from API
  const { data: product, isLoading } = useQuery<ProductItem | null>({
    queryKey: ["product", productId],
    queryFn: async () => {
      if (!productId) return null;
      try {
        const res = await fetch(`/api/products`);
        const data = await res.json();
        if (data.success && Array.isArray(data.data)) {
          const match = data.data.find((p: any) => p.id === productId);
          if (match) return match;
        }
      } catch (err) {
        console.warn("Could not fetch product from API, checking demo fallback:", err);
      }
      return DEMO_PRODUCTS[productId] || DEMO_PRODUCTS["peony-symphony-01"];
    },
  });

  // Increment views counter via POST /api/products/views
  useEffect(() => {
    if (product?.id) {
      fetch("/api/products/views", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: product.id }),
      }).catch((e) => console.debug("View increment ping:", e));
    }
  }, [product?.id]);

  const [checkoutOpen, setCheckoutOpen] = useState(false);

  // Razorpay payment hook
  const { initiatePurchase, getStatus } = useRazorpay({
    brandName: "Elvara Florist",
    themeColor: "#1c1917",
    onSuccess: () => {
      setCheckoutOpen(false);
    },
  });

  const paymentStatus = product ? getStatus(product.id) : "idle";
  const isPurchasing = paymentStatus === "processing";

  const images = (product?.thumbnails && product.thumbnails.length > 0)
    ? product.thumbnails.map((t) => getMediaUrl(t))
    : [product?.imageUrl ? getMediaUrl(product.imageUrl) : "/images/hero_flower.png"];

  const currentImage = images[activeImageIndex] || images[0] || "/images/hero_flower.png";

  const isWorkshop = product?.assetType === "workshops";

  if (isLoading) {
    return (
      <div className="min-h-screen py-32 flex items-center justify-center">
        <RelaxingLoader label="Unfolding botanical creation..." size={160} />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen py-32 text-center max-w-md mx-auto px-4">
        <h2 className="font-serif text-2xl text-neutral-800">Design Not Found</h2>
        <p className="mt-2 text-xs text-neutral-500">
          This floral arrangement may have been retired or is currently out of season.
        </p>
        <Link
          href="/collections"
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-neutral-900 px-5 py-2.5 text-xs font-medium text-white"
        >
          <ArrowLeft size={14} /> Back to Collections
        </Link>
      </div>
    );
  }

  return (
    <main className="min-h-screen pb-24 pt-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Navigation Breadcrumb */}
        <div className="mb-6 flex items-center gap-2 text-xs text-stone-500">
          <Link href="/" className="hover:text-neutral-900 transition-colors">
            Home
          </Link>
          <span>/</span>
          <Link href="/collections" className="hover:text-neutral-900 transition-colors">
            Collections
          </Link>
          <span>/</span>
          <span className="text-neutral-800 font-medium truncate max-w-[200px]">
            {product.title}
          </span>
        </div>

        {/* Product Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14">
          {/* Left: Gallery */}
          <div className="lg:col-span-7 space-y-4">
            {/* Main Stage Image */}
            <div className="relative aspect-[4/5] w-full rounded-3xl overflow-hidden bg-stone-100 shadow-xl border border-stone-200/80">
              <Image
                src={currentImage}
                alt={product.title}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 55vw"
                className="object-cover transition-all duration-500"
              />

              {product.views !== undefined && (
                <div className="absolute top-4 right-4 backdrop-blur-md bg-black/50 text-white text-xs px-3 py-1 rounded-full flex items-center gap-1.5 shadow-sm">
                  <Eye size={13} />
                  <span>{formatViews(product.views)} views</span>
                </div>
              )}
            </div>

            {/* Thumbnails row */}
            {images.length > 1 && (
              <div className="flex items-center gap-3 overflow-x-auto pb-2">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`relative size-20 sm:size-24 rounded-2xl overflow-hidden border-2 transition-all shrink-0 ${
                      activeImageIndex === idx
                        ? "border-neutral-900 ring-2 ring-neutral-900/20 shadow-md"
                        : "border-stone-200 opacity-70 hover:opacity-100"
                    }`}
                  >
                    <Image
                      src={img}
                      alt={`Thumbnail ${idx + 1}`}
                      fill
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Info, Price, Purchase, Details */}
          <div className="lg:col-span-5 flex flex-col justify-start space-y-6">
            <div>
              {/* Asset Type badge */}
              {product.assetType && (
                <span className="inline-block px-3 py-1 rounded-full bg-stone-100 text-stone-700 text-xs uppercase tracking-wider font-semibold mb-3">
                  {product.assetType}
                </span>
              )}

              <h1 className="font-serif text-3xl sm:text-4xl text-neutral-900 leading-tight">
                {product.title}
              </h1>

              {/* Price */}
              <div className="mt-4 flex items-baseline gap-3">
                <span className="font-serif text-3xl font-medium text-neutral-900">
                  {formatPrice(product.price)}
                </span>
                <span className="text-xs text-neutral-400">
                  {isWorkshop ? "Includes all supplies & tea" : "Includes luxury ceramic vessel"}
                </span>
              </div>
            </div>

            {/* Description */}
            {product.description && (
              <div className="text-sm text-neutral-600 leading-relaxed font-light border-y border-stone-200/80 py-4">
                {product.description}
              </div>
            )}

            {/* Tags */}
            {product.tags && product.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {product.tags.map((tag, i) => (
                  <span
                    key={i}
                    className="rounded-full bg-stone-100 px-3 py-1 text-xs text-stone-700 font-medium"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* Checkout CTA */}
            <div className="pt-2 space-y-3">
              <button
                onClick={() => setCheckoutOpen(true)}
                disabled={isPurchasing}
                className="w-full inline-flex items-center justify-center gap-2.5 rounded-full bg-neutral-900 py-4 text-sm font-medium text-white hover:bg-neutral-800 disabled:opacity-50 transition-all shadow-md group cursor-pointer"
              >
                {isPurchasing ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    <span>Securing Order...</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag size={18} />
                    <span>
                      {isWorkshop
                        ? `Book Masterclass Seat — ${formatPrice(product.price)}`
                        : `Purchase Arrangement — ${formatPrice(product.price)}`}
                    </span>
                  </>
                )}
              </button>

              <p className="text-center text-[11px] text-neutral-400">
                Encrypted checkout • Satisfaction Guaranteed • Fast Courier Delivery
              </p>
            </div>

            <CheckoutModal
              isOpen={checkoutOpen}
              onClose={() => setCheckoutOpen(false)}
              product={product}
              onConfirmPurchase={(customerInfo) =>
                initiatePurchase(
                  {
                    id: product.id,
                    title: product.title,
                    price: product.price || null,
                  },
                  customerInfo
                )
              }
              isProcessing={isPurchasing}
            />

            {/* Accordions: Care, Delivery, Specs */}
            <div className="border-t border-stone-200/80 pt-4 space-y-3">
              {/* Care Accordion */}
              <div className="rounded-2xl border border-stone-200/80 bg-white overflow-hidden">
                <button
                  onClick={() => setOpenAccordion(openAccordion === "care" ? null : "care")}
                  className="w-full flex items-center justify-between p-4 text-xs font-semibold uppercase tracking-wider text-neutral-800"
                >
                  <span className="flex items-center gap-2">
                    <Droplet size={15} className="text-amber-700" />
                    Botanical Care Guide
                  </span>
                  <ChevronDown
                    size={15}
                    className={`transition-transform duration-200 ${
                      openAccordion === "care" ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {openAccordion === "care" && (
                  <div className="p-4 pt-0 text-xs text-neutral-600 space-y-2 border-t border-stone-100">
                    <p className="flex items-center gap-2">
                      <Droplet size={13} className="text-stone-400 shrink-0" />
                      Keep water clean: Refresh cold water and rinse stems every 2 days.
                    </p>
                    <p className="flex items-center gap-2">
                      <Scissors size={13} className="text-stone-400 shrink-0" />
                      Trim stems at a 45-degree angle with clean, sharp floral shears.
                    </p>
                    <p className="flex items-center gap-2">
                      <Sun size={13} className="text-stone-400 shrink-0" />
                      Display away from direct harsh sunlight, heating vents, and ripe fruit.
                    </p>
                  </div>
                )}
              </div>

              {/* Delivery Accordion */}
              <div className="rounded-2xl border border-stone-200/80 bg-white overflow-hidden">
                <button
                  onClick={() =>
                    setOpenAccordion(openAccordion === "delivery" ? null : "delivery")
                  }
                  className="w-full flex items-center justify-between p-4 text-xs font-semibold uppercase tracking-wider text-neutral-800"
                >
                  <span className="flex items-center gap-2">
                    <Truck size={15} className="text-amber-700" />
                    White-Glove Delivery Details
                  </span>
                  <ChevronDown
                    size={15}
                    className={`transition-transform duration-200 ${
                      openAccordion === "delivery" ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {openAccordion === "delivery" && (
                  <div className="p-4 pt-0 text-xs text-neutral-600 space-y-1.5 border-t border-stone-100">
                    <p>
                      Delivered by hand in temperature-controlled couriers throughout Hyderabad (Madhapur, Hitec City, Jubilee Hills, Banjara Hills, Gachibowli).
                    </p>
                    <p>
                      Same-day delivery available for orders placed before 1:00 PM IST. Each arrangement includes a handwritten botanical gift card.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
