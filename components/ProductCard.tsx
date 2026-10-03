"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "motion/react";
import { ShoppingBag, Eye, ArrowUpRight, Loader2 } from "lucide-react";
import { formatPrice, getActiveThumbnail, formatViews } from "@/lib/utils";
import { useRazorpay, CustomerInfo } from "@/lib/useRazorpay";
import { useState } from "react";
import CheckoutModal from "@/components/CheckoutModal";

export interface ProductItem {
  id: string;
  title: string;
  description?: string | null;
  price?: string | null;
  aspect?: "horizontal" | "vertical";
  imageUrl?: string | null;
  thumbnails?: string[];
  activeThumbnailIndex?: number;
  assetType?: string;
  tags?: string[];
  views?: number;
  createdAt?: string | Date;
}

interface ProductCardProps {
  product: ProductItem;
  priority?: boolean;
}

export default function ProductCard({ product, priority = false }: ProductCardProps) {
  const [imageError, setImageError] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  const { initiatePurchase, getStatus } = useRazorpay({
    brandName: "Elvara Florist",
    themeColor: "#1c1917",
    onSuccess: () => {
      setCheckoutOpen(false);
    },
  });

  const paymentStatus = getStatus(product.id);
  const isPurchasing = paymentStatus === "processing";

  const thumbnailSrc = imageError
    ? "/images/hero_flower.png"
    : getActiveThumbnail(product);

  const handleQuickBuy = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCheckoutOpen(true);
  };

  const handleConfirmPurchase = async (customerInfo: CustomerInfo) => {
    await initiatePurchase(
      {
        id: product.id,
        title: product.title,
        price: product.price || null,
      },
      customerInfo
    );
  };

  const isWorkshop = product.assetType === "workshops";
  const isGift = product.assetType === "gifts";

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.4 }}
      className="group relative flex flex-col rounded-3xl bg-white border border-neutral-100/80 shadow-xs hover:shadow-xl hover:border-neutral-200/80 transition-all duration-300 overflow-hidden"
    >
      {/* Image Container */}
      <Link
        href={`/products/${product.id}`}
        className="relative block aspect-[4/5] w-full overflow-hidden bg-stone-100"
      >
        <Image
          src={thumbnailSrc}
          alt={product.title}
          fill
          priority={priority}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          onError={() => setImageError(true)}
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
        />

        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Badges */}
        <div className="absolute top-3.5 left-3.5 flex flex-wrap gap-1.5 z-10">
          {product.assetType && (
            <span className="backdrop-blur-md bg-white/90 text-neutral-800 text-[11px] font-medium uppercase tracking-wider px-2.5 py-1 rounded-full shadow-xs">
              {product.assetType}
            </span>
          )}
          {product.views !== undefined && product.views > 50 && (
            <span className="backdrop-blur-md bg-black/60 text-white text-[11px] font-normal px-2 py-0.5 rounded-full flex items-center gap-1">
              <Eye size={11} />
              {formatViews(product.views)}
            </span>
          )}
        </div>

        {/* Quick View Link Indicator */}
        <div className="absolute top-3.5 right-3.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
          <span className="size-8 rounded-full bg-white/90 text-neutral-900 flex items-center justify-center shadow-md">
            <ArrowUpRight size={16} />
          </span>
        </div>
      </Link>

      {/* Content */}
      <div className="flex flex-1 flex-col p-5">
        {/* Tags */}
        {product.tags && product.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-2">
            {product.tags.slice(0, 2).map((tag, idx) => (
              <span
                key={idx}
                className="text-[11px] text-stone-500 font-normal tracking-wide"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Title */}
        <Link href={`/products/${product.id}`} className="group/title">
          <h3 className="font-serif text-lg text-neutral-900 line-clamp-1 group-hover/title:text-neutral-600 transition-colors">
            {product.title}
          </h3>
        </Link>

        {/* Description snippet */}
        {product.description && (
          <p className="mt-1 text-xs text-neutral-500 line-clamp-2 leading-relaxed">
            {product.description}
          </p>
        )}

        {/* Price & Action Row */}
        <div className="mt-auto pt-4 flex items-center justify-between border-t border-neutral-100">
          <div className="flex flex-col">
            <span className="text-[10px] uppercase tracking-wider text-neutral-400 font-medium">
              {isWorkshop ? "Per seat" : isGift ? "Studio item" : "Arrangement"}
            </span>
            <span className="text-base font-serif font-medium text-neutral-900">
              {formatPrice(product.price)}
            </span>
          </div>

          <button
            onClick={handleQuickBuy}
            disabled={isPurchasing}
            className="inline-flex items-center gap-1.5 rounded-full bg-neutral-900 px-3.5 py-1.5 text-xs font-medium text-white hover:bg-neutral-800 disabled:opacity-50 transition-all shadow-xs"
            title="Instant checkout"
          >
            {isPurchasing ? (
              <>
                <Loader2 className="size-3.5 animate-spin" />
                <span>Securing...</span>
              </>
            ) : (
              <>
                <ShoppingBag className="size-3.5" />
                <span>{isWorkshop ? "Book" : "Buy"}</span>
              </>
            )}
          </button>
        </div>
      </div>

      <CheckoutModal
        isOpen={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
        product={product}
        onConfirmPurchase={handleConfirmPurchase}
        isProcessing={isPurchasing}
      />
    </motion.div>
  );
}
