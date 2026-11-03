"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { usePathname } from "next/navigation";

const links = [
  { path: "/", name: "Home" },
  { path: "/about", name: "About" },        // ✅ Added
  { path: "/services", name: "Services" },
  { path: "/projects", name: "Projects" },
  { path: "/contact", name: "Contact" },
];

export default function Navigation() {
  const path = usePathname();
  const reduce = useReducedMotion();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // keep original body overflow to restore correctly
  const prevOverflowRef = useRef("");

  // close on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [path]);

  // body scroll lock (robust)
  useEffect(() => {
    if (mobileMenuOpen) {
      prevOverflowRef.current = document.body.style.overflow || "";
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = prevOverflowRef.current;
    }
    return () => {
      document.body.style.overflow = prevOverflowRef.current;
    };
  }, [mobileMenuOpen]);

  // esc to close
  const onKeyDown = useCallback((e) => {
    if (e.key === "Escape") setMobileMenuOpen(false);
  }, []);

  useEffect(() => {
    if (!mobileMenuOpen) return;
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [mobileMenuOpen, onKeyDown]);

  // scroll style
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const isActive = useCallback(
    (href) => {
      if (href === "/") return path === "/";
      return path?.startsWith(href);
    },
    [path]
  );

  const navVariants = {
    initial: { opacity: 0, y: reduce ? 0 : -6 },
    animate: { opacity: 1, y: 0 },
  };

  return (
    <motion.nav
      variants={navVariants}
      initial="initial"
      animate="animate"
      transition={{ duration: reduce ? 0.2 : 0.35 }}
      className={[
        "fixed top-0 w-full z-50",
        "transition-all duration-300",
        scrolled
          ? "bg-white/80 backdrop-blur-xl border-b border-[#e0d7cf] shadow-sm"
          : "bg-transparent",
      ].join(" ")}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-3 group">
          {/* Logo */}
          <div className="relative w-9 h-9">
            <Image
              src="/images/x.png"
              alt="HEXEL"
              fill
              className="object-contain transition-transform duration-300 group-hover:scale-[1.03]"
              priority
            />
          </div>

          {/* Wordmark */}
          <div className="leading-tight">
            <div className="text-[#080706] font-semibold tracking-tight text-base">
              HEXEL <span className="text-[#b29d88]">tech</span>
            </div>
            <div className="text-[11px] text-[#5d5247] tracking-[0.18em] uppercase">
              Brand • Build • Scale
            </div>
          </div>
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-2">
          <div className="flex items-center gap-1 rounded-full border border-[#e0d7cf] bg-white/70 backdrop-blur px-2 py-1">
            {links.map((l) => {
              const active = isActive(l.path);
              return (
                <Link
                  key={l.path}
                  href={l.path}
                  aria-current={active ? "page" : undefined}
                  className={[
                    "relative px-3 py-2 rounded-full text-sm font-medium transition",
                    active
                      ? "text-[#080706] bg-[#f9f7f5] shadow-sm"
                      : "text-[#5d5247] hover:text-[#080706] hover:bg-white",
                  ].join(" ")}
                >
                  {l.name}
                  {active && (
                    <span className="absolute inset-x-3 -bottom-0.5 h-[2px] bg-[#b29d88] rounded-full" />
                  )}
                </Link>
              );
            })}
          </div>

          {/* CTA */}
          <Link
            href="/contact"
            className="ml-3 inline-flex items-center justify-center rounded-xl bg-[#080706] text-white px-4 py-2 text-sm font-medium shadow-lg shadow-black/10 hover:opacity-90 transition"
          >
            Erstgespräch
          </Link>
        </div>

        {/* Mobile toggle */}
        <button
          className="md:hidden inline-flex items-center justify-center w-11 h-11 rounded-xl border border-[#e0d7cf] bg-white/80 backdrop-blur text-[#080706] hover:bg-white transition focus:outline-none focus:ring-2 focus:ring-[#b29d88]"
          onClick={() => setMobileMenuOpen((v) => !v)}
          aria-label={mobileMenuOpen ? "Menü schließen" : "Menü öffnen"}
          aria-expanded={mobileMenuOpen}
          aria-controls="mobile-nav"
          type="button"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
            <path
              d={mobileMenuOpen ? "M6 6L18 18" : "M4 7h16"}
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <path
              d={mobileMenuOpen ? "" : "M4 12h16"}
              className={mobileMenuOpen ? "opacity-0" : "opacity-100"}
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <path
              d={mobileMenuOpen ? "M6 18L18 6" : "M4 17h16"}
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>

      {/* Mobile overlay + drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              className="fixed inset-0 z-40 bg-black/35"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: reduce ? 0.15 : 0.2 }}
              onClick={() => setMobileMenuOpen(false)}
            />

            <motion.div
              id="mobile-nav"
              className="fixed top-16 left-0 right-0 z-50 bg-white/95 backdrop-blur-xl border-b border-[#e0d7cf] shadow-[0_20px_60px_-30px_rgba(0,0,0,0.35)]"
              initial={{ opacity: 0, y: reduce ? 0 : -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: reduce ? 0 : -10 }}
              transition={{ duration: reduce ? 0.15 : 0.2 }}
            >
              <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5">
                {/* Header inside drawer */}
                <div className="flex items-center justify-between gap-3 mb-4">
                  <div className="text-sm font-semibold text-[#080706]">
                    Navigation
                  </div>
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-[#5d5247] hover:text-[#080706] rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-[#b29d88]"
                    type="button"
                    aria-label="Menü schließen"
                  >
                    Schließen
                  </button>
                </div>

                <div className="flex flex-col gap-2">
                  {links.map((l) => {
                    const active = isActive(l.path);
                    return (
                      <Link
                        key={l.path}
                        href={l.path}
                        aria-current={active ? "page" : undefined}
                        className={[
                          "flex items-center justify-between rounded-2xl px-4 py-3 transition border",
                          active
                            ? "bg-[#f9f7f5] text-[#080706] border-[#e0d7cf] shadow-sm"
                            : "bg-white text-[#5d5247] border-[#e0d7cf] hover:bg-[#f9f7f5] hover:text-[#080706]",
                        ].join(" ")}
                      >
                        <span className="font-medium">{l.name}</span>
                        <span
                          className={[
                            "h-2 w-2 rounded-full",
                            active ? "bg-[#b29d88]" : "bg-[#e0d7cf]",
                          ].join(" ")}
                        />
                      </Link>
                    );
                  })}
                </div>

                <div className="mt-5 pt-5 border-t border-[#e0d7cf]">
                  <Link
                    href="/contact"
                    className="w-full inline-flex items-center justify-center rounded-2xl bg-[#080706] text-white px-4 py-3 font-medium shadow-lg shadow-black/10 hover:opacity-90 transition"
                  >
                    Erstgespräch buchen
                  </Link>

                  <p className="mt-4 text-xs text-[#5d5247] text-center tracking-[0.18em] uppercase">
                    Brand • Build • Scale
                  </p>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
