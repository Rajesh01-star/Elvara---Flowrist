"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { Menu, X, User as UserIcon, LogOut, Package, ShieldCheck, ChevronDown, Loader2 } from "lucide-react";
import Image from "next/image";
import { useSession, signOut } from "@/lib/auth-client";
import { getInitials } from "@/lib/utils";
import AuthDialog from "./AuthDialog";
import JellyRadio from "./JellyRadio";
import { toast } from "sonner";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [navigatingPath, setNavigatingPath] = useState<string | null>(null);
  const [isSigningOut, setIsSigningOut] = useState(false);

  const { data: session, isPending } = useSession();
  const pathname = usePathname();
  const router = useRouter();

  // Reset navigating indicator when route change completes
  useEffect(() => {
    setNavigatingPath(null);
  }, [pathname]);

  const navLinks = [
    { href: "/collections", label: "Collections" },
    { href: "/about", label: "About Us" },
    { href: "/contact", label: "Contact" },
  ];

  // Detect current active nav item based on route
  const currentNavValue =
    navLinks.find(
      (link) =>
        pathname === link.href ||
        (link.href !== "/" && pathname.startsWith(link.href))
    )?.href ?? null;

  // Prefetch navigation and critical user pages for instantaneous switches
  useEffect(() => {
    navLinks.forEach((link) => {
      router.prefetch(link.href);
    });
    router.prefetch("/dashboard");
    router.prefetch("/admin");
  }, [router]);

  const handleSignOut = async () => {
    if (isSigningOut) return;
    setIsSigningOut(true);
    try {
      await signOut({
        fetchOptions: {
          onSuccess: () => {
            toast.success("Signed out successfully");
            setUserDropdownOpen(false);
            setIsOpen(false);
            window.location.href = "/";
          },
          onError: () => {
            setIsSigningOut(false);
            toast.error("Failed to sign out");
          },
        },
      });
    } catch {
      setIsSigningOut(false);
      toast.error("Failed to sign out");
    }
  };

  return (
    <>
      {/* Instant route transition top progress bar */}
      {navigatingPath && (
        <div className="fixed top-0 left-0 right-0 h-1 z-[100] bg-stone-100 overflow-hidden">
          <div className="h-full bg-gradient-to-r from-amber-500 via-amber-600 to-amber-400 animate-pulse w-full transition-all duration-300" />
        </div>
      )}

      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-stone-200/80"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2 flex items-center justify-between">
          {/* Logo & Brand Name */}
          <Link href="/" className="flex items-center gap-3 group">
            <Image
              src="/images/final_logo.png"
              alt="Elvara Florist Logo"
              width={56}
              height={56}
              className="w-10 h-10 sm:w-14 sm:h-14 object-contain rounded-full transition-transform duration-300 group-hover:scale-105"
              priority
            />
            <span className="font-serif text-lg sm:text-xl font-medium tracking-wide text-neutral-900">
              Elvara Florist
            </span>
          </Link>

          {/* Desktop Navigation Links (JellyRadio Effect) */}
          <div className="hidden md:flex items-center">
            <JellyRadio
              items={navLinks.map((link) => ({
                value: link.href,
                label: link.label,
              }))}
              value={currentNavValue}
              onChange={(href) => router.push(href)}
              chipColor="transparent"
              activeColor="#1c1917"
              textColor="#57534e"
              activeTextColor="#fafaf9"
              size="md"
              gap={4}
              radius={9999}
              swell={0.16}
              barge={6}
              shrink={0.06}
              jelly={0.9}
              bounce={0.28}
              stagger={20}
              stiffness={560}
              ariaLabel="Main navigation"
            />
          </div>

          {/* Desktop Right Actions (Auth & Contact) */}
          <div className="hidden md:flex items-center gap-3">
            {isPending ? (
              <div className="size-8 rounded-full bg-stone-100 animate-pulse" />
            ) : session?.user ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 rounded-full border border-stone-200 bg-white px-3 py-1.5 text-xs font-medium text-neutral-800 hover:border-stone-300 hover:bg-stone-50 transition-all shadow-2xs"
                >
                  <div className="size-6 rounded-full bg-stone-800 text-white flex items-center justify-center text-[10px] font-semibold">
                    {getInitials(session.user.name || "User")}
                  </div>
                  <span className="max-w-[100px] truncate">{session.user.name}</span>
                  <ChevronDown size={14} className="text-neutral-400" />
                </button>

                {/* Dropdown Menu */}
                <AnimatePresence>
                  {userDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.98 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-2 w-56 rounded-2xl border border-stone-200 bg-white p-2 shadow-xl z-50 text-neutral-800"
                    >
                      <div className="px-3 py-2 border-b border-stone-100">
                        <p className="text-xs font-semibold text-neutral-900 truncate">
                          {session.user.name}
                        </p>
                        <p className="text-[11px] text-neutral-500 truncate">
                          {session.user.email}
                        </p>
                      </div>

                      <div className="py-1">
                        <Link
                          href="/dashboard"
                          onClick={() => {
                            setUserDropdownOpen(false);
                            if (pathname !== "/dashboard") setNavigatingPath("/dashboard");
                          }}
                          className="flex items-center justify-between rounded-xl px-3 py-2 text-xs text-neutral-700 hover:bg-stone-100 transition-colors"
                        >
                          <div className="flex items-center gap-2.5">
                            <Package size={15} className="text-neutral-500" />
                            <span>{session.user.isAdmin ? "Orders & Deliveries" : "Orders & Purchases"}</span>
                          </div>
                          {navigatingPath === "/dashboard" && (
                            <Loader2 size={13} className="animate-spin text-stone-600" />
                          )}
                        </Link>

                        {session.user.isAdmin && (
                          <Link
                            href="/admin"
                            onClick={() => {
                              setUserDropdownOpen(false);
                              if (pathname !== "/admin") setNavigatingPath("/admin");
                            }}
                            className="flex items-center justify-between rounded-xl px-3 py-2 text-xs text-neutral-700 hover:bg-stone-100 transition-colors"
                          >
                            <div className="flex items-center gap-2.5">
                              <ShieldCheck size={15} className="text-neutral-700" />
                              <span>Admin Studio CMS</span>
                            </div>
                            {navigatingPath === "/admin" && (
                              <Loader2 size={13} className="animate-spin text-stone-600" />
                            )}
                          </Link>
                        )}
                      </div>

                      <div className="border-t border-stone-100 pt-1">
                        <button
                          onClick={handleSignOut}
                          disabled={isSigningOut}
                          className="w-full flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs text-rose-600 hover:bg-rose-50 transition-colors text-left disabled:opacity-60 cursor-pointer disabled:cursor-not-allowed"
                        >
                          {isSigningOut ? (
                            <Loader2 size={15} className="animate-spin text-rose-600" />
                          ) : (
                            <LogOut size={15} />
                          )}
                          <span>{isSigningOut ? "Signing Out..." : "Sign Out"}</span>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <button
                onClick={() => setAuthModalOpen(true)}
                className="flex items-center gap-1.5 text-xs text-neutral-700 hover:text-neutral-950 font-medium px-3 py-2 rounded-full hover:bg-stone-100 transition-all"
              >
                <UserIcon size={14} />
                <span>Sign In</span>
              </button>
            )}

            <Link
              href="/contact"
              className={`rounded-full px-4 sm:px-5 py-1.5 sm:py-2 text-xs sm:text-sm font-medium transition-all duration-300 ${
                pathname === "/contact"
                  ? "bg-neutral-900 text-white shadow-xs"
                  : "border border-neutral-900 text-neutral-900 hover:bg-neutral-900 hover:text-white"
              }`}
            >
              Contact Us
            </Link>
          </div>

          {/* Mobile Hamburger Button */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle navigation menu"
            className="md:hidden text-neutral-800 p-1.5 focus:outline-none"
          >
            <motion.div
              initial={false}
              animate={{ rotate: isOpen ? 90 : 0 }}
              transition={{ duration: 0.25 }}
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </motion.div>
          </motion.button>
        </div>

        {/* Mobile Menu Dropdown */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="absolute top-full left-3 right-3 mt-2 rounded-3xl border border-stone-200 bg-white/98 backdrop-blur-xl py-6 px-6 shadow-2xl md:hidden"
            >
              <div className="flex flex-col items-center gap-4">
                {navLinks.map((link, i) => (
                  <motion.div
                    key={link.href}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 * i, duration: 0.2 }}
                  >
                    <Link
                      href={link.href}
                      onClick={() => setIsOpen(false)}
                      className="text-neutral-800 text-base font-medium tracking-wide hover:text-neutral-950 transition-colors"
                    >
                      {link.label}
                    </Link>
                  </motion.div>
                ))}

                <div className="w-full border-t border-stone-100 my-2 pt-4 flex flex-col gap-2.5">
                  {session?.user ? (
                    <>
                      <div className="flex items-center justify-between px-2 text-xs text-neutral-500">
                        <span>Signed in as:</span>
                        <span className="font-semibold text-neutral-900 truncate max-w-[150px]">
                          {session.user.name}
                        </span>
                      </div>
                      <Link
                        href="/dashboard"
                        onClick={() => {
                          setIsOpen(false);
                          if (pathname !== "/dashboard") setNavigatingPath("/dashboard");
                        }}
                        className="w-full flex items-center justify-center gap-2 bg-stone-100 text-neutral-900 rounded-full py-2.5 text-xs font-medium hover:bg-stone-200 transition-colors"
                      >
                        <span>{session.user.isAdmin ? "Orders & Deliveries" : "Orders & Purchases"}</span>
                        {navigatingPath === "/dashboard" && (
                          <Loader2 size={13} className="animate-spin text-stone-600" />
                        )}
                      </Link>
                      {session.user.isAdmin && (
                        <Link
                          href="/admin"
                          onClick={() => {
                            setIsOpen(false);
                            if (pathname !== "/admin") setNavigatingPath("/admin");
                          }}
                          className="w-full flex items-center justify-center gap-2 bg-stone-100 text-neutral-900 rounded-full py-2.5 text-xs font-medium hover:bg-stone-200 transition-colors"
                        >
                          <span>Admin Studio CMS</span>
                          {navigatingPath === "/admin" && (
                            <Loader2 size={13} className="animate-spin text-stone-600" />
                          )}
                        </Link>
                      )}
                      <button
                        onClick={handleSignOut}
                        disabled={isSigningOut}
                        className="w-full flex items-center justify-center gap-2 text-center text-rose-600 py-1.5 text-xs font-medium disabled:opacity-60 cursor-pointer disabled:cursor-not-allowed"
                      >
                        {isSigningOut ? (
                          <>
                            <Loader2 size={13} className="animate-spin text-rose-600" />
                            <span>Signing Out...</span>
                          </>
                        ) : (
                          <span>Sign Out</span>
                        )}
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => {
                        setIsOpen(false);
                        setAuthModalOpen(true);
                      }}
                      className="w-full text-center bg-stone-100 text-neutral-900 rounded-full py-2.5 text-xs font-medium hover:bg-stone-200 transition-colors"
                    >
                      Sign In / Register
                    </button>
                  )}

                  <Link
                    href="/contact"
                    onClick={() => setIsOpen(false)}
                    className="block w-full text-center bg-neutral-900 text-white rounded-full py-2.5 text-xs font-medium hover:bg-neutral-800 transition-all duration-300"
                  >
                    Contact Us
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* Auth Modal */}
      <AuthDialog
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
      />
    </>
  );
}
