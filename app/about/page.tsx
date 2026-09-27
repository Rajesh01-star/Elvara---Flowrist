import Image from "next/image";
import Link from "next/link";
import { Heart, Leaf, ShieldCheck, MapPin, Clock, ArrowRight, Sparkles, Phone } from "lucide-react";
import AtelierRadialBackdrop from "@/components/AtelierRadialBackdrop";

export default function AboutPage() {
  return (
    <main className="min-h-screen pb-20 pt-10">
      {/* Hero Header */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        <AtelierRadialBackdrop
          variant="botanical-dusk"
          placement="center"
          intensity={1.2}
          className="p-8 sm:p-14 text-center shadow-2xl border border-emerald-500/20 text-white"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-400/25 text-emerald-300 text-xs tracking-wider uppercase font-medium mb-4 backdrop-blur-xs">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
            </span>
            <span>Our Story & Philosophy</span>
          </div>
          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl text-white tracking-tight leading-tight">
            Where Botanical Artistry Meets Mindful Craft
          </h1>
          <p className="mt-4 text-base sm:text-lg text-stone-300 font-light max-w-2xl mx-auto leading-relaxed">
            Founded in Hyderabad by florist Sridevi Dasari, Elvara was born from a desire to return to the poetic, untamed soul of floristry — honoring nature’s fleeting perfection with sculptural grace.
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-3 sm:gap-4 text-xs text-stone-200">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 backdrop-blur-xs">
              <Leaf size={14} className="text-emerald-400" /> 100% Regenerative Sourcing
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 backdrop-blur-xs">
              <Sparkles size={14} className="text-emerald-400" /> Foam-Free Sculptural Mechanics
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 backdrop-blur-xs">
              <Clock size={14} className="text-emerald-400" /> Madhapur Studio · Hyderabad
            </span>
          </div>
        </AtelierRadialBackdrop>
      </div>

      {/* Philosophy Pillars */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mb-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="rounded-3xl bg-white p-7 border border-stone-200/80 shadow-xs">
            <div className="size-10 rounded-2xl bg-amber-50 text-amber-800 flex items-center justify-center mb-4">
              <Leaf size={20} />
            </div>
            <h3 className="font-serif text-xl text-neutral-900 mb-2">Regenerative Sourcing</h3>
            <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
              We partner directly with sustainable micro-farms across the Northeast and certified European growers who cultivate without harsh synthetics or mono-cropping.
            </p>
          </div>

          <div className="rounded-3xl bg-white p-7 border border-stone-200/80 shadow-xs">
            <div className="size-10 rounded-2xl bg-emerald-50 text-emerald-800 flex items-center justify-center mb-4">
              <ShieldCheck size={20} />
            </div>
            <h3 className="font-serif text-xl text-neutral-900 mb-2">Foam-Free Mechanics</h3>
            <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
              We have eliminated floral foam from our atelier entirely. All our sculptures utilize heirloom brass kenzans, fresh water mechanics, and chicken wire armatures.
            </p>
          </div>

          <div className="rounded-3xl bg-white p-7 border border-stone-200/80 shadow-xs">
            <div className="size-10 rounded-2xl bg-rose-50 text-rose-800 flex items-center justify-center mb-4">
              <Heart size={20} />
            </div>
            <h3 className="font-serif text-xl text-neutral-900 mb-2">Artisanal Vessels</h3>
            <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
              Every vase and urn in our collection is hand-thrown by independent ceramic artists, designed to be treasured long after the final blossom fades.
            </p>
          </div>
        </div>
      </div>

      {/* Story & Craft Narrative */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mb-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="relative aspect-[4/5] rounded-3xl overflow-hidden shadow-xl border border-stone-200">
            <Image
              src="/images/bouquet_artisan.jpg"
              alt="Handcrafted bouquet"
              fill
              className="object-cover"
            />
          </div>

          <div className="space-y-6">
            <span className="text-xs font-semibold uppercase tracking-widest text-stone-500">
              The Atelier Experience
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl text-neutral-900 leading-snug">
              Every arrangement tells a story of the season it came from.
            </h2>
            <p className="text-neutral-600 text-sm leading-relaxed">
              In an age of uniform, mass-produced bouquets, Elvara celebrates individuality. Our florists compose with negative space, varying stem lengths, and unexpected textural contrasts — dusty lavender against garden cabbage roses, trailing sweet pea vines with wild berry branches.
            </p>
            <p className="text-neutral-600 text-sm leading-relaxed">
              Whether you are honoring an intimate wedding, sending solace, or joining us for a Saturday morning tea workshop, we approach your stems with reverence and artistry.
            </p>

            <div className="pt-2">
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 rounded-full bg-neutral-900 px-6 py-3 text-xs font-medium text-white hover:bg-neutral-800 transition-colors shadow-xs"
              >
                <span>Plan Your Floral Consultation</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Visit the Atelier */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-stone-100/80 p-8 sm:p-12 border border-stone-200/80 flex flex-col md:flex-row items-center justify-between gap-8">
          <div>
            <span className="text-xs uppercase tracking-wider font-semibold text-stone-500">
              Come Say Hello
            </span>
            <h3 className="font-serif text-2xl sm:text-3xl text-neutral-900 mt-1">
              Visit Our Madhapur Studio
            </h3>
            <div className="mt-4 space-y-2 text-xs sm:text-sm text-neutral-600">
              <p className="flex items-start gap-2">
                <MapPin size={16} className="text-stone-500 shrink-0 mt-0.5" />
                <span className="leading-snug">My Home Navadweepa, 606, Varuna, Patrika Nagar, Madhapur, Hitec City Road, Hyderabad – 500081</span>
              </p>
              <p className="flex items-center gap-2">
                <Phone size={16} className="text-stone-500 shrink-0" />
                <a href="tel:+919652722499" className="hover:underline font-medium text-neutral-900">
                  +91 96527 22499
                </a>
              </p>
              <p className="flex items-center gap-2">
                <Clock size={16} className="text-stone-500 shrink-0" />
                <span>Tuesday through Sunday, 9:00 AM – 7:00 PM</span>
              </p>
            </div>
          </div>

          <Link
            href="/contact"
            className="rounded-full bg-white border border-stone-300 text-neutral-900 px-6 py-3 text-xs font-medium hover:bg-stone-50 transition-colors shrink-0 shadow-2xs"
          >
            Get in touch
          </Link>
        </div>
      </div>
    </main>
  );
}
