"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import Link from "next/link";
import { 
  Package, 
  Calendar, 
  Download, 
  ShoppingBag, 
  User, 
  ExternalLink, 
  Loader2, 
  ShieldCheck, 
  ArrowRight 
} from "lucide-react";
import { useSession } from "@/lib/auth-client";
import { formatPrice, formatDate, getActiveThumbnail, getInitials } from "@/lib/utils";
import AuthDialog from "@/components/AuthDialog";
import { getProductFileUrlAction } from "@/app/admin/actions";
import { toast } from "sonner";

interface PurchaseItem {
  orderId: string;
  paymentId?: string | null;
  amount: string;
  purchasedAt: string | Date;
  postId: string;
  title: string;
  description?: string | null;
  price?: string | null;
  aspect?: "horizontal" | "vertical";
  imageUrl?: string | null;
  thumbnails?: string[];
  activeThumbnailIndex?: number;
}

export default function CustomerDashboardPage() {
  const { data: session, isPending: sessionLoading } = useSession();
  const [authOpen, setAuthOpen] = useState(false);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  // Fetch user purchases from GET /api/user/purchases
  const { data: purchases = [], isLoading: purchasesLoading, error } = useQuery<PurchaseItem[]>({
    queryKey: ["user-purchases"],
    queryFn: async () => {
      const res = await fetch("/api/user/purchases");
      if (res.status === 401) {
        throw new Error("Please sign in to view your orders");
      }
      const data = await res.json();
      return data.purchases || [];
    },
    enabled: !!session?.user,
  });

  const handleDownloadCareGuide = async (postId: string) => {
    try {
      setDownloadingId(postId);
      const url = await getProductFileUrlAction(postId);
      if (url) {
        window.open(url, "_blank");
      } else {
        toast.info("No digital guide attached for this item. Contact studio for assistance.");
      }
    } catch (err: any) {
      toast.error(err?.message || "Failed to download item resources");
    } finally {
      setDownloadingId(null);
    }
  };

  if (sessionLoading) {
    return (
      <div className="min-h-screen py-32 flex flex-col items-center justify-center text-neutral-500">
        <Loader2 className="size-8 animate-spin text-stone-600 mb-3" />
        <p className="text-sm">Loading your customer atelier profile...</p>
      </div>
    );
  }

  // Not signed in state
  if (!session?.user) {
    return (
      <main className="min-h-screen py-24 px-4 flex items-center justify-center">
        <div className="max-w-md w-full text-center rounded-3xl bg-white p-8 sm:p-10 border border-stone-200 shadow-xl">
          <div className="size-16 rounded-full bg-amber-50 text-amber-800 flex items-center justify-center mx-auto mb-5">
            <Package size={28} />
          </div>
          <h1 className="font-serif text-3xl text-neutral-900">Patron Dashboard</h1>
          <p className="mt-2 text-sm text-neutral-600 font-light leading-relaxed">
            Please sign in to view your bespoke orders, workshop reservations, and digital flower care guides.
          </p>
          <button
            onClick={() => setAuthOpen(true)}
            className="mt-6 w-full rounded-full bg-neutral-900 py-3 text-xs font-medium text-white hover:bg-neutral-800 transition-colors shadow-xs"
          >
            Sign In or Create Account
          </button>
          <AuthDialog isOpen={authOpen} onClose={() => setAuthOpen(false)} />
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen pb-24 pt-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Profile Header Card */}
        <div className="rounded-3xl bg-white p-6 sm:p-8 border border-stone-200/80 shadow-xs mb-10 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4 text-center sm:text-left flex-col sm:flex-row">
            <div className="size-16 rounded-full bg-neutral-900 text-white flex items-center justify-center font-serif text-2xl shadow-sm">
              {getInitials(session.user.name || "Client")}
            </div>
            <div>
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <h1 className="font-serif text-2xl sm:text-3xl text-neutral-900">
                  {session.user.name}
                </h1>
                {session.user.isAdmin && (
                  <span className="rounded-full bg-amber-100 text-amber-900 px-2.5 py-0.5 text-[10px] font-semibold tracking-wider uppercase">
                    Admin
                  </span>
                )}
              </div>
              <p className="text-xs text-neutral-500 mt-0.5">{session.user.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/collections"
              className="inline-flex items-center gap-2 rounded-full border border-stone-200 bg-stone-50 px-5 py-2.5 text-xs font-medium text-neutral-800 hover:bg-stone-100 transition-colors"
            >
              <ShoppingBag size={14} />
              <span>Browse Offerings</span>
            </Link>
            {session.user.isAdmin && (
              <Link
                href="/admin"
                className="inline-flex items-center gap-2 rounded-full bg-amber-900 px-5 py-2.5 text-xs font-medium text-white hover:bg-amber-800 transition-colors shadow-xs"
              >
                <ShieldCheck size={14} />
                <span>Admin CMS</span>
              </Link>
            )}
          </div>
        </div>

        {/* Orders & Purchases Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-stone-200/80 pb-4">
            <div>
              <h2 className="font-serif text-2xl text-neutral-900">Order History</h2>
              <p className="text-xs text-neutral-500 mt-0.5">
                Past floral arrangements, deliveries, and masterclass admissions
              </p>
            </div>
            <span className="text-xs font-semibold text-stone-500 bg-stone-100 rounded-full px-3 py-1">
              {purchases.length} {purchases.length === 1 ? "Order" : "Orders"}
            </span>
          </div>

          {purchasesLoading ? (
            <div className="py-20 flex flex-col items-center justify-center text-neutral-400">
              <Loader2 className="size-7 animate-spin text-stone-600 mb-2" />
              <p className="text-xs">Retrieving your orders...</p>
            </div>
          ) : purchases.length === 0 ? (
            <div className="py-16 text-center rounded-3xl bg-white border border-stone-200/80 p-8 max-w-md mx-auto">
              <Package className="size-12 text-stone-300 mx-auto mb-3" />
              <h3 className="font-serif text-xl text-neutral-800">No Orders Yet</h3>
              <p className="text-xs text-neutral-500 mt-1 max-w-xs mx-auto leading-relaxed">
                You haven&apos;t placed any orders with Elvara yet. Explore our handcrafted arrangements or book an intimate masterclass.
              </p>
              <Link
                href="/collections"
                className="mt-5 inline-flex items-center gap-1.5 rounded-full bg-neutral-900 px-5 py-2.5 text-xs font-medium text-white hover:bg-neutral-800 transition-colors"
              >
                <span>Discover Collections</span>
                <ArrowRight size={13} />
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {purchases.map((purchase) => {
                const thumb = getActiveThumbnail(purchase);
                return (
                  <div
                    key={purchase.orderId}
                    className="rounded-3xl bg-white border border-stone-200/80 p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-5 transition-all hover:border-stone-300"
                  >
                    <div className="flex items-center gap-4 w-full sm:w-auto">
                      <div className="relative size-20 rounded-2xl overflow-hidden bg-stone-100 shrink-0 border border-stone-100">
                        <Image
                          src={thumb}
                          alt={purchase.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="space-y-1">
                        <Link
                          href={`/products/${purchase.postId}`}
                          className="font-serif text-lg font-medium text-neutral-900 hover:text-neutral-600 transition-colors line-clamp-1"
                        >
                          {purchase.title}
                        </Link>
                        <div className="flex flex-wrap items-center gap-3 text-xs text-neutral-500">
                          <span className="flex items-center gap-1">
                            <Calendar size={13} />
                            {formatDate(purchase.purchasedAt)}
                          </span>
                          <span>•</span>
                          <span className="font-mono text-[11px] text-stone-400">
                            {purchase.orderId}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-5 w-full sm:w-auto border-t sm:border-t-0 pt-3 sm:pt-0 border-stone-100">
                      <div className="text-right">
                        <span className="text-[10px] uppercase tracking-wider text-neutral-400 font-medium block">
                          Paid Total
                        </span>
                        <span className="font-serif text-lg font-medium text-neutral-900">
                          {formatPrice(purchase.amount)}
                        </span>
                      </div>

                      <button
                        onClick={() => handleDownloadCareGuide(purchase.postId)}
                        disabled={downloadingId === purchase.postId}
                        className="inline-flex items-center gap-1.5 rounded-full border border-stone-200 bg-stone-50 px-4 py-2 text-xs font-medium text-neutral-700 hover:bg-stone-100 transition-colors disabled:opacity-50"
                        title="Download Care Brochure & Invoice"
                      >
                        {downloadingId === purchase.postId ? (
                          <Loader2 size={13} className="animate-spin" />
                        ) : (
                          <Download size={13} />
                        )}
                        <span>Care Guide</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
