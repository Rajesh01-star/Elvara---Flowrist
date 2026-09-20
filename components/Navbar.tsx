"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import { Menu, X } from "lucide-react";
import Image from "next/image";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  const navLinks = [
    { href: "/collections", label: "Collections" },
    { href: "/bouquets", label: "Bouquets" },
    { href: "/about", label: "About us" },
    { href: "/workshops", label: "Workshops" },
  ];

  return (
    <motion.nav
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-neutral-200"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-1.5 sm:py-2 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/images/final_logo.png"
            alt="Elvara Florist Logo"
            width={50}
            height={50}
            className="w-12 h-12 sm:w-13 sm:h-13 object-contain rounded-full"
            priority
          />
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-6 lg:gap-10">
          {navLinks.map((link, i) => (
            <motion.div
              key={link.href}
              initial={{ y: -10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.1 * i }}
            >
              <Link
                href={link.href}
                className="relative text-sm lg:text-[15px] tracking-wide text-neutral-700 hover:text-neutral-950 transition-colors group py-1"
              >
                {link.label}
                <span className="absolute bottom-0 left-0 w-0 h-px bg-neutral-900 group-hover:w-full transition-all duration-300" />
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Contact Button */}
        <Link
          href="/contact"
          className="hidden md:block border border-neutral-800 text-neutral-900 rounded-full px-5 lg:px-6 py-2 text-xs lg:text-sm hover:bg-neutral-900 hover:text-white transition-all duration-300"
        >
          Contact us
        </Link>

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
            transition={{ duration: 0.3 }}
          >
            {isOpen ? <X size={26} /> : <Menu size={26} />}
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
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="absolute top-full left-3 right-3 mt-2 rounded-2xl border border-neutral-200 bg-white/95 backdrop-blur-xl py-6 px-6 shadow-xl md:hidden"
          >
            <div className="flex flex-col items-center gap-5">
              {navLinks.map((link, i) => (
                <motion.div
                  key={link.href}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.08 * i, duration: 0.25 }}
                >
                  <Link
                    href={link.href}
                    onClick={() => setIsOpen(false)}
                    className="text-neutral-900 text-base font-medium tracking-wide hover:opacity-75 transition-opacity"
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35, duration: 0.25 }}
                className="w-full pt-2"
              >
                <Link
                  href="/contact"
                  onClick={() => setIsOpen(false)}
                  className="block w-full text-center bg-neutral-900 text-white rounded-full py-2.5 text-sm font-medium hover:bg-neutral-800 transition-all duration-300"
                >
                  Contact us
                </Link>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
