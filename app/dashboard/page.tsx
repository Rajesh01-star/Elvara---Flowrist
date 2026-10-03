"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import Link from "next/link";
import { 
  Package, 
  Calendar, 
  ShoppingBag, 
  User, 
  ExternalLink, 
  Loader2, 
  ShieldCheck, 
  ArrowRight,
  FileText,
  MapPin,
  Phone,
  Mail,
  Printer,
  X,
  CheckCircle2,
  Clock,
  Sparkles,
  Truck,
  Gift
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useSession } from "@/lib/auth-client";
import { formatPrice, formatDate, getActiveThumbnail, getInitials } from "@/lib/utils";
import AuthDialog from "@/components/AuthDialog";
import RelaxingLoader from "@/components/RelaxingLoader";
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
  customerName?: string | null;
  customerEmail?: string | null;
  customerPhone?: string | null;
  shippingAddress?: string | null;
  city?: string | null;
  postalCode?: string | null;
  deliveryNotes?: string | null;
  accountName?: string | null;
  accountEmail?: string | null;
}

interface PurchasesApiResponse {
  purchases: PurchaseItem[];
  isAdmin?: boolean;
  view?: "all" | "mine";
  totalOrders?: number;
}

export default function CustomerDashboardPage() {
  const { data: session, isPending: sessionLoading } = useSession();
  const [authOpen, setAuthOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<PurchaseItem | null>(null);
  const [adminViewMode, setAdminViewMode] = useState<"all" | "mine">("all");

  const isSessionAdmin = Boolean(session?.user?.isAdmin);

  // Fetch purchases from GET /api/user/purchases
  const { data: responseData, isLoading: purchasesLoading } = useQuery<PurchasesApiResponse>({
    queryKey: ["user-purchases", adminViewMode],
    queryFn: async () => {
      const res = await fetch(`/api/user/purchases?view=${adminViewMode}`);
      if (res.status === 401) {
        throw new Error("Please sign in to view your orders");
      }
      return res.json();
    },
    enabled: !!session?.user,
  });

  const purchases = responseData?.purchases || [];
  const userIsAdmin = responseData?.isAdmin ?? isSessionAdmin;

  if (sessionLoading) {
    return (
      <div className="min-h-screen py-32 flex items-center justify-center">
        <RelaxingLoader label="Loading your customer atelier profile..." size={150} />
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
            Please sign in to view your bespoke orders, workshop reservations, and delivery records.
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

  const renderOrdersContent = () => {
    if (purchasesLoading) {
      return (
        <div className="py-16 flex items-center justify-center">
          <RelaxingLoader label="Retrieving orders..." size={120} />
        </div>
      );
    }

    if (purchases.length === 0) {
      return (
        <div className="py-16 text-center rounded-3xl bg-white border border-stone-200/80 p-8 max-w-md mx-auto">
          <Package className="size-12 text-stone-300 mx-auto mb-3" />
          <h3 className="font-serif text-xl text-neutral-800">
            {userIsAdmin && adminViewMode === "all" ? "No Customer Orders Yet" : "No Orders Yet"}
          </h3>
          <p className="text-xs text-neutral-500 mt-1 max-w-xs mx-auto leading-relaxed">
            {userIsAdmin && adminViewMode === "all"
              ? "Completed customer purchases will appear here with recipient addresses and card notes for dispatch."
              : "You haven't placed any orders with Elvara yet. Explore our handcrafted arrangements or book an intimate masterclass."}
          </p>
          <Link
            href="/collections"
            className="mt-5 inline-flex items-center gap-1.5 rounded-full bg-neutral-900 px-5 py-2.5 text-xs font-medium text-white hover:bg-neutral-800 transition-colors"
          >
            <span>Discover Collections</span>
            <ArrowRight size={13} />
          </Link>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {purchases.map((purchase) => {
          const thumb = getActiveThumbnail(purchase);
          const recipientName = purchase.customerName || purchase.accountName || "Patron";
          return (
            <div
              key={purchase.orderId}
              className="rounded-3xl bg-white border border-stone-200/80 p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 transition-all hover:border-stone-300"
            >
              <div className="flex items-start sm:items-center gap-4 w-full sm:w-auto">
                <div className="relative size-20 rounded-2xl overflow-hidden bg-stone-100 shrink-0 border border-stone-100">
                  <Image
                    src={thumb}
                    alt={purchase.title}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Link
                      href={`/products/${purchase.postId}`}
                      className="font-serif text-lg font-medium text-neutral-900 hover:text-neutral-600 transition-colors line-clamp-1"
                    >
                      {purchase.title}
                    </Link>
                    {userIsAdmin && adminViewMode === "all" && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 shrink-0">
                        <Truck size={10} />
                        <span>Ready to Deliver</span>
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-neutral-500">
                    <span className="flex items-center gap-1">
                      <Calendar size={13} />
                      {formatDate(purchase.purchasedAt)}
                    </span>
                    <span>•</span>
                    <span className="font-mono text-[11px] text-stone-400">
                      {purchase.orderId.slice(0, 13)}...
                    </span>
                  </div>

                  {/* Recipient & Delivery Details */}
                  {(purchase.customerName || purchase.shippingAddress || purchase.accountName) && (
                    <div className="text-[11px] text-stone-600 pt-1 space-y-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-semibold text-stone-800">Recipient:</span>
                        <span className="font-medium text-neutral-900">{recipientName}</span>
                        {purchase.customerPhone && (
                          <a
                            href={`tel:${purchase.customerPhone}`}
                            className="text-amber-900 hover:underline font-medium"
                          >
                            • Ph: {purchase.customerPhone}
                          </a>
                        )}
                        {purchase.customerEmail && (
                          <span className="text-stone-400 truncate max-w-[200px]">
                            • {purchase.customerEmail}
                          </span>
                        )}
                      </div>

                      {purchase.shippingAddress && (
                        <div className="flex items-start gap-1 text-stone-500">
                          <MapPin size={12} className="text-stone-400 shrink-0 mt-0.5" />
                          <span className="leading-snug">
                            {purchase.shippingAddress}
                            {purchase.city ? `, ${purchase.city}` : ""}
                            {purchase.postalCode ? ` - ${purchase.postalCode}` : ""}
                          </span>
                        </div>
                      )}

                      {purchase.deliveryNotes && (
                        <div className="mt-1.5 inline-flex items-start gap-1.5 text-[11px] bg-amber-50/80 border border-amber-200/60 text-amber-900 rounded-xl px-2.5 py-1 max-w-xl">
                          <Gift size={12} className="text-amber-700 shrink-0 mt-0.5" />
                          <span className="italic leading-tight">
                            &ldquo;{purchase.deliveryNotes}&rdquo;
                          </span>
                        </div>
                      )}
                    </div>
                  )}
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
                  onClick={() => setSelectedOrder(purchase)}
                  className="inline-flex items-center gap-1.5 rounded-full border border-stone-200 bg-stone-50 px-4 py-2 text-xs font-medium text-neutral-700 hover:bg-stone-100 hover:border-stone-300 transition-all cursor-pointer shadow-2xs"
                  title="View Full Order & Delivery Details"
                >
                  <FileText size={13} className="text-stone-500" />
                  <span>{userIsAdmin ? "Dispatch Details" : "Order Details"}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <main className="min-h-screen pb-24 pt-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Admin Delivery Dispatch Banner & Filter */}
        {userIsAdmin && (
          <div className="rounded-3xl bg-amber-50/70 border border-amber-200/80 p-5 sm:p-6 mb-8 shadow-xs">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="size-11 rounded-2xl bg-amber-500/10 text-amber-900 flex items-center justify-center border border-amber-500/20 shrink-0">
                  <Truck size={22} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-serif text-lg font-medium text-neutral-900">
                      Florist Delivery Dispatch (Admin)
                    </h3>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-amber-200 text-amber-950">
                      Admin Mode
                    </span>
                  </div>
                  <p className="text-xs text-neutral-600 mt-0.5">
                    {adminViewMode === "all"
                      ? "Displaying all customer orders with recipient addresses and gift card notes for packaging and delivery."
                      : "Displaying only personal orders made by your admin account."}
                  </p>
                </div>
              </div>

              {/* View Switcher Filter */}
              <div className="flex items-center bg-white rounded-full p-1 border border-amber-200/80 shadow-2xs self-start md:self-auto">
                <button
                  type="button"
                  onClick={() => setAdminViewMode("all")}
                  className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
                    adminViewMode === "all"
                      ? "bg-neutral-900 text-white shadow-xs"
                      : "text-stone-600 hover:text-neutral-900 hover:bg-stone-50"
                  }`}
                >
                  <ShoppingBag size={13} />
                  <span>All Customer Orders</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-semibold ${
                      adminViewMode === "all" ? "bg-white/20 text-white" : "bg-stone-100 text-stone-600"
                    }`}
                  >
                    {purchases.length}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setAdminViewMode("mine")}
                  className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
                    adminViewMode === "mine"
                      ? "bg-neutral-900 text-white shadow-xs"
                      : "text-stone-600 hover:text-neutral-900 hover:bg-stone-50"
                  }`}
                >
                  <User size={13} />
                  <span>My Personal Orders</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Orders Section Header */}
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-stone-200/80 pb-4">
            <div>
              <h2 className="font-serif text-2xl text-neutral-900">
                {userIsAdmin && adminViewMode === "all" ? "Customer Delivery Orders" : "Order History"}
              </h2>
              <p className="text-xs text-neutral-500 mt-0.5">
                {userIsAdmin && adminViewMode === "all"
                  ? "Bespoke floral orders placed by customers awaiting handover or dispatch"
                  : "Past floral arrangements, deliveries, and masterclass admissions"}
              </p>
            </div>
            <span className="text-xs font-semibold text-stone-500 bg-stone-100 rounded-full px-3 py-1">
              {purchases.length} {purchases.length === 1 ? "Order" : "Orders"}
            </span>
          </div>

          {renderOrdersContent()}
        </div>
      </div>

      {/* Order Details Modal */}
      <AnimatePresence>
        {selectedOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedOrder(null)}
              className="absolute inset-0 bg-neutral-950/40 backdrop-blur-xs"
            />

            {/* Modal Dialog */}
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 10 }}
              className="relative w-full max-w-lg rounded-3xl bg-white p-6 sm:p-8 shadow-2xl border border-stone-200 max-h-[90vh] overflow-y-auto z-10 space-y-6"
            >
              {/* Header */}
              <div className="flex items-start justify-between">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[11px] font-medium mb-2">
                    <CheckCircle2 size={12} />
                    <span>Payment Completed</span>
                    {userIsAdmin && (
                      <span className="text-emerald-800 font-semibold">• Ready for Delivery</span>
                    )}
                  </div>
                  <h3 className="font-serif text-2xl text-neutral-900">
                    {userIsAdmin ? "Order & Delivery Slip" : "Order Details"}
                  </h3>
                  <p className="text-xs text-stone-500 mt-0.5">
                    Placed on {formatDate(selectedOrder.purchasedAt)}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="rounded-full p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Product Info Card */}
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-stone-50 border border-stone-200/80">
                <div className="relative size-16 rounded-xl overflow-hidden bg-stone-100 shrink-0 border border-stone-200">
                  <Image
                    src={getActiveThumbnail(selectedOrder)}
                    alt={selectedOrder.title}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-serif text-base font-semibold text-neutral-900 truncate">
                    {selectedOrder.title}
                  </h4>
                  <p className="text-xs text-stone-500 capitalize">
                    {selectedOrder.aspect || "Bespoke Floral Craft"}
                  </p>
                  <span className="font-serif text-sm font-semibold text-neutral-900 mt-1 block">
                    {formatPrice(selectedOrder.amount)}
                  </span>
                </div>
                <Link
                  href={`/products/${selectedOrder.postId}`}
                  target="_blank"
                  className="text-stone-400 hover:text-neutral-900 p-2"
                  title="View Floral Offering"
                >
                  <ExternalLink size={16} />
                </Link>
              </div>

              {/* Recipient & Delivery Information */}
              <div className="space-y-3">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-500">
                  Delivery & Recipient
                </h4>
                <div className="rounded-2xl border border-stone-200/80 p-4 space-y-3 text-xs text-stone-700 bg-white">
                  <div className="flex items-center gap-2.5">
                    <User size={14} className="text-stone-400 shrink-0" />
                    <div>
                      <span className="text-stone-400 text-[10px] uppercase tracking-wider block">Recipient Name</span>
                      <span className="font-medium text-neutral-900">
                        {selectedOrder.customerName || selectedOrder.accountName || "Patron"}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <Phone size={14} className="text-stone-400 shrink-0" />
                    <div>
                      <span className="text-stone-400 text-[10px] uppercase tracking-wider block">Phone Contact</span>
                      {selectedOrder.customerPhone ? (
                        <a
                          href={`tel:${selectedOrder.customerPhone}`}
                          className="font-medium text-amber-900 hover:underline"
                        >
                          {selectedOrder.customerPhone}
                        </a>
                      ) : (
                        <span className="font-medium text-neutral-500">Not specified</span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <Mail size={14} className="text-stone-400 shrink-0" />
                    <div>
                      <span className="text-stone-400 text-[10px] uppercase tracking-wider block">Email</span>
                      <span className="font-medium text-neutral-900">
                        {selectedOrder.customerEmail || selectedOrder.accountEmail || "Not specified"}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5 pt-1 border-t border-stone-100">
                    <MapPin size={14} className="text-stone-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-stone-400 text-[10px] uppercase tracking-wider block">Delivery Destination</span>
                      <span className="font-medium text-neutral-900 leading-relaxed block">
                        {selectedOrder.shippingAddress ? (
                          <>
                            {selectedOrder.shippingAddress}
                            {selectedOrder.city ? `, ${selectedOrder.city}` : ""}
                            {selectedOrder.postalCode ? ` - ${selectedOrder.postalCode}` : ""}
                          </>
                        ) : (
                          "Atelier Handover / Studio Pickup"
                        )}
                      </span>
                    </div>
                  </div>

                  {selectedOrder.deliveryNotes && (
                    <div className="pt-2 border-t border-stone-100">
                      <span className="text-stone-400 text-[10px] uppercase tracking-wider block mb-1">
                        Gift Note / Delivery Instructions
                      </span>
                      <p className="text-xs text-stone-700 italic bg-stone-50 p-2.5 rounded-xl border border-stone-200/50">
                        &ldquo;{selectedOrder.deliveryNotes}&rdquo;
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Payment & Order Reference */}
              <div className="space-y-3">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-500">
                  Payment Reference
                </h4>
                <div className="rounded-2xl border border-stone-200/80 p-4 space-y-2.5 text-xs text-stone-700 bg-stone-50/50">
                  <div className="flex justify-between items-center">
                    <span className="text-stone-500">Order ID:</span>
                    <span className="font-mono text-[11px] text-stone-800 font-medium">
                      {selectedOrder.orderId}
                    </span>
                  </div>
                  {selectedOrder.paymentId && (
                    <div className="flex justify-between items-center">
                      <span className="text-stone-500">Payment Reference:</span>
                      <span className="font-mono text-[11px] text-stone-800 font-medium">
                        {selectedOrder.paymentId}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between items-center pt-2 border-t border-stone-200/60 font-medium">
                    <span className="text-neutral-900">Total Paid:</span>
                    <span className="font-serif text-base text-neutral-900 font-semibold">
                      {formatPrice(selectedOrder.amount)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="pt-2 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full border border-stone-200 bg-white text-xs font-medium text-stone-700 hover:bg-stone-50 transition-colors cursor-pointer"
                >
                  <Printer size={13} />
                  <span>{userIsAdmin ? "Print Packing Slip" : "Print Receipt"}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedOrder(null)}
                  className="px-6 py-2.5 rounded-full bg-neutral-900 text-xs font-medium text-white hover:bg-neutral-800 transition-colors cursor-pointer"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </main>
  );
}
