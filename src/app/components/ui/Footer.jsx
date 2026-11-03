"use client";

import Link from "next/link";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { Linkedin, Github, Mail, ArrowUpRight, Sparkles } from "lucide-react";

const MotionFooter = motion.footer;

export default function Footer() {
  const reduce = useReducedMotion();
  const currentYear = new Date().getFullYear();

  const footerLinks = [
    {
      title: "Company",
      links: [
        { name: "About", href: "/about" },
        { name: "Services", href: "/services" },
        { name: "Projects", href: "/projects" },
      ],
    },
    {
      title: "Legal",
      links: [
        { name: "Privacy", href: "/privacy" },
        { name: "Terms", href: "/terms" },
        { name: "Contact", href: "/contact" },
      ],
    },
    {
      title: "Connect",
      links: [
        { name: "LinkedIn", href: "https://linkedin.com/company/hexel" },
        { name: "GitHub", href: "https://github.com/hexel" },
        { name: "Contact", href: "/contact" },
      ],
    },
  ];

  const socialIcons = [
    { label: "LinkedIn", icon: <Linkedin size={18} />, href: "https://linkedin.com/company/hexel" },
    { label: "GitHub", icon: <Github size={18} />, href: "https://github.com/hexel" },
    { label: "Mail", icon: <Mail size={18} />, href: "mailto:hello@hexel.dev" },
  ];

  const fade = reduce
    ? { initial: { opacity: 0 }, whileInView: { opacity: 1 } }
    : { initial: { opacity: 0, y: 18 }, whileInView: { opacity: 1, y: 0 } };

  return (
    <MotionFooter
      {...fade}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: reduce ? 0.25 : 0.5 }}
      className="relative overflow-hidden border-t border-black/10 bg-[#080706] text-white"
    >
      {/* Premium background (subtle) */}
      <div className="pointer-events-none absolute inset-0 opacity-70">
        <div className="absolute inset-0 bg-hexel-gradient animate-gradient-x" />
        <div className="absolute inset-0 bg-grid-pattern opacity-20" />
      </div>

      {/* Blobs */}
      <div className="pointer-events-none absolute -top-32 left-1/4 h-72 w-72 rounded-full bg-[#b29d88]/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 right-1/4 h-80 w-80 rounded-full bg-[#47525d]/25 blur-3xl" />

      <div className="relative max-w-7xl mx-auto px-4 py-14 sm:py-16">
        {/* Top row */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
          {/* Brand block */}
          <div className="md:col-span-5">
            <Link href="/" className="inline-flex items-center gap-3">
              <span className="relative h-11 w-11 rounded-2xl bg-white/10 ring-1 ring-white/15 flex items-center justify-center overflow-hidden">
                <span className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />
                <Image
                  src="/images/x.png"
                  alt="HEXEL Icon"
                  width={44}
                  height={44}
                  priority
                  className="relative drop-shadow"
                />
              </span>

              <span className="relative">
                <Image
                  src="/images/titel.png"
                  alt="HEXEL Logo"
                  width={190}
                  height={40}
                  priority
                  className="drop-shadow"
                />
                <span className="mt-1 block text-[11px] tracking-[0.22em] uppercase text-white/70">
                  Brand • Build • Scale
                </span>
              </span>
            </Link>

            <p className="mt-5 text-sm text-white/75 max-w-md leading-relaxed">
              HEXEL tech gestaltet Marken, baut performante Business Websites und entwickelt Web-Apps,
              die mit Ihrem Unternehmen wachsen.
            </p>

            {/* Quick CTA */}
            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <Link
                href="/contact"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#b29d88] px-4 py-2.5 text-sm font-medium text-white shadow-lg shadow-black/20 hover:bg-[#a08b76] transition"
              >
                <Sparkles className="h-4 w-4" />
                Kostenloses Erstgespräch
              </Link>
              <Link
                href="/projects"
                className="inline-flex items-center justify-center rounded-xl bg-white/10 px-4 py-2.5 text-sm font-medium text-white ring-1 ring-white/15 hover:bg-white/15 transition"
              >
                Portfolio ansehen
              </Link>
            </div>

            {/* Social */}
            <div className="mt-6 flex items-center gap-3">
              {socialIcons.map((s) => (
                <Link
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="inline-flex items-center justify-center h-10 w-10 rounded-xl bg-white/10 ring-1 ring-white/15 hover:bg-white/15 transition"
                >
                  {s.icon}
                </Link>
              ))}
            </div>
          </div>

          {/* Link groups */}
          <div className="md:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-8">
            {footerLinks.map((section) => (
              <div key={section.title} className="space-y-4">
                <h3 className="text-xs uppercase tracking-[0.22em] text-white/70">
                  {section.title}
                </h3>
                <ul className="space-y-3">
                  {section.links.map((l) => {
                    const external = l.href.startsWith("http");
                    return (
                      <li key={l.name}>
                        <Link
                          href={l.href}
                          target={external ? "_blank" : "_self"}
                          rel={external ? "noopener noreferrer" : undefined}
                          className="group inline-flex items-center gap-2 text-sm text-white/75 hover:text-white transition"
                        >
                          <span className="relative">
                            {l.name}
                            <span className="absolute left-0 -bottom-1 h-px w-0 bg-white/70 transition-all duration-200 group-hover:w-full" />
                          </span>
                          {external && (
                            <ArrowUpRight className="h-4 w-4 opacity-0 translate-y-[1px] transition-all duration-200 group-hover:opacity-100" />
                          )}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div className="mt-12 h-px w-full bg-gradient-to-r from-transparent via-white/20 to-transparent" />

        {/* Bottom bar */}
        <div className="mt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-sm">
          <p className="text-white/70">
            © {currentYear} HEXEL tech. All rights reserved.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-white/70">
            <Link href="/privacy" className="hover:text-white transition">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-white transition">
              Terms of Service
            </Link>
            <Link href="/impressum" className="hover:text-white transition">
              Impressum
            </Link>
          </div>
        </div>
      </div>
    </MotionFooter>
  );
}
