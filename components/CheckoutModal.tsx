"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { X, MapPin, User, Mail, Phone, FileText, ShieldCheck, Loader2, Navigation, Map } from "lucide-react";
import { formatPrice, getActiveThumbnail } from "@/lib/utils";
import { useSession } from "@/lib/auth-client";
import { CustomerInfo } from "@/lib/useRazorpay";
import { toast } from "sonner";

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: {
    id: string;
    title: string;
    price?: string | number | null;
    imageUrl?: string | null;
    thumbnails?: string[];
    activeThumbnailIndex?: number;
    assetType?: string;
  } | null;
  onConfirmPurchase: (customerInfo: CustomerInfo) => Promise<void> | void;
  isProcessing?: boolean;
}

export default function CheckoutModal({
  isOpen,
  onClose,
  product,
  onConfirmPurchase,
  isProcessing = false,
}: CheckoutModalProps) {
  const { data: session } = useSession();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [deliveryNotes, setDeliveryNotes] = useState("");

  const [locating, setLocating] = useState(false);

  // Populate from session whenever session or modal opens
  useEffect(() => {
    if (session?.user && isOpen) {
      if (!name) setName(session.user.name || "");
      if (!email) setEmail(session.user.email || "");
    }
  }, [session, isOpen]);

  const handleUseCurrentLocation = () => {
    if (typeof window === "undefined" || !navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }

    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`,
            {
              headers: {
                "Accept-Language": "en",
              },
            }
          );
          if (!res.ok) throw new Error("Could not convert coordinates to address");
          const data = await res.json();
          const addr = data.address || {};

          // Construct street address
          const streetParts = [
            addr.house_number,
            addr.building,
            addr.road || addr.pedestrian || addr.suburb || addr.neighbourhood,
          ].filter(Boolean);

          const fullStreet = streetParts.length > 0 
            ? streetParts.join(" ") 
            : data.display_name?.split(",")?.slice(0, 2)?.join(",") || "";

          const detectedCity = addr.city || addr.town || addr.village || addr.county || addr.state_district || "";
          const detectedPostalCode = addr.postcode || "";

          if (fullStreet) setAddress(fullStreet);
          if (detectedCity) setCity(detectedCity);
          if (detectedPostalCode) setPostalCode(detectedPostalCode);

          toast.success("Delivery address populated from current location!");
        } catch (err: any) {
          console.error(err);
          // Fallback to coordinates
          setAddress(`Location (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`);
          toast.info("GPS coordinates captured. Please refine your street address.");
        } finally {
          setLocating(false);
        }
      },
      (err) => {
        setLocating(false);
        if (err.code === err.PERMISSION_DENIED) {
          toast.error("Location permission denied. Please enter address manually.");
        } else if (err.code === err.POSITION_UNAVAILABLE) {
          toast.error("Location information is currently unavailable.");
        } else if (err.code === err.TIMEOUT) {
          toast.error("Request to get location timed out.");
        } else {
          toast.error("Unable to retrieve location.");
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }
    );
  };

  if (!isOpen || !product) return null;

  const thumbnailSrc = getActiveThumbnail(product);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Please enter your recipient or contact name");
      return;
    }
    if (!email.trim() || !email.includes("@")) {
      toast.error("Please enter a valid email address");
      return;
    }
    if (!phone.trim()) {
      toast.error("Please enter your contact phone number for delivery");
      return;
    }
    if (!address.trim()) {
      toast.error("Please enter delivery street address");
      return;
    }
    if (!city.trim()) {
      toast.error("Please enter your city");
      return;
    }

    onConfirmPurchase({
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      address: address.trim(),
      city: city.trim(),
      postalCode: postalCode.trim() || undefined,
      deliveryNotes: deliveryNotes.trim() || undefined,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-lg rounded-3xl bg-white shadow-2xl border border-stone-200 overflow-hidden my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative border-b border-stone-100 bg-stone-50/70 p-5 sm:p-6">
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="absolute top-5 right-5 size-8 rounded-full bg-white border border-stone-200 flex items-center justify-center text-stone-500 hover:text-stone-900 transition-colors shadow-xs"
          >
            <X size={16} />
          </button>

          <h2 className="font-serif text-2xl text-neutral-900">
            Delivery & Contact Details
          </h2>
          <p className="text-xs text-neutral-500 mt-0.5">
            Provide your courier delivery and recipient information
          </p>
        </div>

        {/* Selected Product Summary */}
        <div className="mx-5 sm:mx-6 mt-5 p-3.5 rounded-2xl bg-stone-50 border border-stone-100 flex items-center gap-3.5">
          <div className="relative size-14 rounded-xl overflow-hidden bg-stone-200 shrink-0 border border-stone-200/60">
            <Image
              src={thumbnailSrc}
              alt={product.title}
              fill
              className="object-cover"
            />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-serif text-sm font-medium text-neutral-900 truncate">
              {product.title}
            </p>
            <p className="text-xs text-stone-500 capitalize">
              {product.assetType || "Arrangement"}
            </p>
          </div>
          <div className="text-right pl-2">
            <span className="font-serif text-base font-semibold text-neutral-900">
              {formatPrice(product.price)}
            </span>
          </div>
        </div>

        {/* Details Form */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4">
          {/* Recipient Name */}
          <div>
            <label className="block text-xs font-medium text-neutral-700 mb-1">
              Full Name <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <User className="absolute left-3 top-3 size-4 text-stone-400" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Clara Oswald"
                className="w-full rounded-xl border border-stone-200 pl-9 pr-3.5 py-2.5 text-xs text-neutral-900 placeholder:text-stone-400 focus:border-neutral-900 focus:outline-none transition-colors"
              />
            </div>
          </div>

          {/* Email & Phone Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-medium text-neutral-700 mb-1">
                Email Address <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 size-4 text-stone-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full rounded-xl border border-stone-200 pl-9 pr-3.5 py-2.5 text-xs text-neutral-900 placeholder:text-stone-400 focus:border-neutral-900 focus:outline-none transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-700 mb-1">
                Phone Number <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 size-4 text-stone-400" />
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  className="w-full rounded-xl border border-stone-200 pl-9 pr-3.5 py-2.5 text-xs text-neutral-900 placeholder:text-stone-400 focus:border-neutral-900 focus:outline-none transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Delivery Street Address */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-medium text-neutral-700">
                Delivery Address <span className="text-rose-500">*</span>
              </label>
              <button
                type="button"
                onClick={handleUseCurrentLocation}
                disabled={locating}
                className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-800 hover:text-amber-950 bg-amber-50 hover:bg-amber-100/80 px-2.5 py-1 rounded-full border border-amber-200/60 transition-colors disabled:opacity-50 cursor-pointer"
                title="Detect current address using browser Geolocation"
              >
                {locating ? (
                  <>
                    <Loader2 size={11} className="animate-spin text-amber-800" />
                    <span>Locating...</span>
                  </>
                ) : (
                  <>
                    <MapPin size={11} className="text-amber-800" />
                    <span>Use Current Location</span>
                  </>
                )}
              </button>
            </div>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 size-4 text-stone-400" />
              <input
                type="text"
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Apartment, suite, street address"
                className="w-full rounded-xl border border-stone-200 pl-9 pr-3.5 py-2.5 text-xs text-neutral-900 placeholder:text-stone-400 focus:border-neutral-900 focus:outline-none transition-colors"
              />
            </div>
          </div>

          {/* City & Postal Code Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-medium text-neutral-700 mb-1">
                City <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="New York, London, etc."
                className="w-full rounded-xl border border-stone-200 px-3.5 py-2.5 text-xs text-neutral-900 placeholder:text-stone-400 focus:border-neutral-900 focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-700 mb-1">
                Postal / Zip Code
              </label>
              <input
                type="text"
                value={postalCode}
                onChange={(e) => setPostalCode(e.target.value)}
                placeholder="10001"
                className="w-full rounded-xl border border-stone-200 px-3.5 py-2.5 text-xs text-neutral-900 placeholder:text-stone-400 focus:border-neutral-900 focus:outline-none transition-colors"
              />
            </div>
          </div>

          {/* Delivery Notes / Gift Message */}
          <div>
            <label className="block text-xs font-medium text-neutral-700 mb-1 flex items-center gap-1">
              <FileText size={12} className="text-stone-400" />
              <span>Card Message or Delivery Instructions (Optional)</span>
            </label>
            <textarea
              rows={2}
              value={deliveryNotes}
              onChange={(e) => setDeliveryNotes(e.target.value)}
              placeholder="e.g. Please leave at front desk, card note: 'Happy Anniversary love!'"
              className="w-full rounded-xl border border-stone-200 p-2.5 text-xs text-neutral-900 placeholder:text-stone-400 focus:border-neutral-900 focus:outline-none transition-colors"
            />
          </div>

          {/* Submit Actions */}
          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isProcessing}
              className="rounded-full px-4 py-2.5 text-xs font-medium text-neutral-600 hover:bg-stone-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isProcessing}
              className="rounded-full bg-neutral-900 px-6 py-2.5 text-xs font-medium text-white hover:bg-neutral-800 disabled:opacity-50 transition-all shadow-md flex items-center gap-2"
            >
              {isProcessing ? (
                <>
                  <Loader2 size={13} className="animate-spin" />
                  <span>Processing Order...</span>
                </>
              ) : (
                <span>Confirm & Pay {formatPrice(product.price)}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
