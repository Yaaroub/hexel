"use client";

import React from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";

const items = [
  {
    tag: "Brand",
    title: "Brand Identity System",
    desc: "Logo, Farben, Typo, Guidelines – alles konsistent und premium.",
    cta: "Brand ansehen",
    href: "/services",
  },
  {
    tag: "Build",
    title: "Business Website",
    desc: "Schnell, SEO-ready, klare CTAs – gebaut für Anfragen.",
    cta: "Projekte ansehen",
    href: "/projects",
    highlight: true,
  },
  {
    tag: "Scale",
    title: "Web App / Portal",
    desc: "Dashboards, Portale, Automatisierung – skalierbar & wartbar.",
    cta: "Kontakt",
    href: "/contact",
  },
];

function FlipCard({ item, index }) {
  const reduce = useReducedMotion();

  return (
    <motion.div
      initial={reduce ? { opacity: 0 } : { opacity: 0, y: 14 }}
      whileInView={reduce ? { opacity: 1 } : { opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.35 }}
      transition={{ duration: 0.45, delay: index * 0.05 }}
      className="group [perspective:1200px]"
    >
      <div className="relative h-[280px] w-full transition-transform duration-500 [transform-style:preserve-3d] group-hover:[transform:rotateY(180deg)]">
        {/* FRONT */}
        <div className="absolute inset-0 rounded-2xl border border-black/10 bg-white overflow-hidden [backface-visibility:hidden]">
          {/* glow blobs */}
          <div className="pointer-events-none absolute -top-12 -left-10 h-44 w-44 rounded-full bg-[#b29d88]/35 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-14 -right-10 h-56 w-56 rounded-full bg-[#47525d]/15 blur-2xl" />

          <div className="relative h-full p-6 flex flex-col">
            <div className="flex items-center justify-between">
              <span className="text-[11px] uppercase tracking-[0.22em] text-[#5d5247]">
                {item.tag}
              </span>
              {item.highlight && (
                <span className="text-[11px] font-medium px-3 py-1 rounded-full bg-[#b29d88] text-white">
                  Fokus
                </span>
              )}
            </div>

            <h3 className="mt-4 text-xl font-semibold text-[#080706]">
              {item.title}
            </h3>

            <p className="mt-2 text-sm text-[#5d5247] leading-relaxed">
              {item.desc}
            </p>

            <div className="mt-auto pt-5">
              <div className="inline-flex items-center gap-2 text-sm font-medium text-[#080706]">
                <span className="h-2 w-2 rounded-full bg-[#b29d88]" />
                Hover to reveal
              </div>
            </div>
          </div>
        </div>

        {/* BACK */}
        <div className="absolute inset-0 rounded-2xl overflow-hidden [transform:rotateY(180deg)] [backface-visibility:hidden]">
          {/* animated border beam */}
          <div className="absolute inset-0 bg-[#151515]" />
          <div className="absolute -inset-1 opacity-70">
            <div className="absolute inset-0 bg-[conic-gradient(from_180deg,transparent,rgba(178,157,136,0.75),transparent)] animate-[spin_5s_linear_infinite]" />
          </div>
          <div className="absolute inset-[2px] rounded-2xl bg-[#0d0d0f] border border-white/10" />

          <div className="relative h-full p-6 flex flex-col justify-center items-center text-center">
            <div className="mb-3 text-xs uppercase tracking-[0.22em] text-white/60">
              HEXEL tech
            </div>
            <div className="text-lg font-semibold text-white">
              {item.cta}
            </div>
            <p className="mt-2 text-sm text-white/70 max-w-[28ch]">
              Klick – und wir zeigen dir Beispiele/Details.
            </p>

            <Link
              href={item.href}
              className="mt-6 inline-flex items-center justify-center rounded-lg px-5 py-2.5 text-sm font-medium bg-[#b29d88] text-white hover:bg-[#a08b76] transition"
            >
              Öffnen
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function Carousel() {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-bold text-[#080706]">
            Interaktiv statt <span className="text-[#b29d88]">Standard-Carousel</span>
          </h2>
          <p className="mt-2 text-[#5d5247] max-w-2xl mx-auto">
            Mehr Markenfeeling: kleine Interaktionen, viel Tiefe, null Template-Vibe.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {items.map((item, i) => (
            <FlipCard key={item.title} item={item} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}