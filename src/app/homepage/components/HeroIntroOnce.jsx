"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";

export default function HeroIntroPro() {
  const reduce = useReducedMotion();
  const videoRef = useRef(null);

  // phases: "intro" (video dominant) -> "reveal" (text animiert) -> "done" (poster, video ausgeblendet)
  const [phase, setPhase] = useState(reduce ? "done" : "intro");

  // Wie viele Sekunden vor Video-Ende die Text-Animation starten soll
  const REVEAL_BEFORE_END = 1.2; // 0.7–1.2 fühlt sich meist perfekt an

  useEffect(() => {
    if (reduce) return;

    const v = videoRef.current;
    if (!v) return;

    const tryPlay = async () => {
      try {
        await v.play();
      } catch {
        // Autoplay blockiert => zeig sofort Text (ohne Intro)
        setPhase("done");
      }
      const onEnded = () => {
        const v = videoRef.current;
        if (!v) return;
      
        v.pause();                // stoppt sauber
        v.currentTime = v.duration; // bleibt auf letztem Frame
        setPhase("done");
      };
    };

    const onTimeUpdate = () => {
      if (!v.duration || !isFinite(v.duration)) return;
      const remaining = v.duration - v.currentTime;

      if (remaining <= REVEAL_BEFORE_END && phase === "intro") {
        setPhase("reveal");
      }
    };

    const onEnded = () => setPhase("done");

    v.addEventListener("timeupdate", onTimeUpdate);
    v.addEventListener("ended", onEnded);

    tryPlay();

    return () => {
      v.removeEventListener("timeupdate", onTimeUpdate);
      v.removeEventListener("ended", onEnded);
    };
  }, [reduce, phase]);

  const variants = useMemo(
    () => ({
      wrap: {
        hidden: {},
        show: { transition: { staggerChildren: 0.12, delayChildren: 0.05 } },
      },
      item: {
        hidden: { opacity: 0, y: 18, filter: "blur(10px)" },
        show: {
          opacity: 1,
          y: 0,
          filter: "blur(0px)",
          transition: { duration: 0.65, ease: "easeOut" },
        },
      },
    }),
    []
  );

  return (
    <section className="relative w-full min-h-[100svh] overflow-hidden bg-black text-white">
      {/* Poster (immer dahinter) */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[url('/hero-poster.webp')] bg-cover bg-center" />
      </div>

      {/* Video (spielt einmal, wird am Ende ausgeblendet) */}
      {!reduce && (
      <motion.video
      ref={videoRef}
      className="absolute inset-0 h-full w-full object-cover"
      autoPlay
      muted
      playsInline
      loop={false}
      preload="auto"
      animate={{ opacity: phase === "done" ? 0 : 1 }}
      transition={{ duration: 0.6 }}
    >
      <source src="/hero-intro.webm" type="video/webm" />
      <source src="/hero-intro.mp4" type="video/mp4" />
    </motion.video>
      )}

      {/* Cinematic overlays */}
      <div className="absolute inset-0 bg-black/55" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(178,157,136,0.24),transparent_60%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(0,0,0,0.30),rgba(0,0,0,0.78))]" />

      {/* Content */}
      <div className="relative z-10 mx-auto flex min-h-[100svh] max-w-7xl items-center px-4 py-16 sm:py-20">
        <div className="w-full">
          {/* Wenn intro läuft: nur kleines Label (optional) */}
          {phase === "intro" && !reduce ? (
            <div className="text-center text-white/60 text-xs uppercase tracking-[0.35em]">
              HEXEL tech
            </div>
          ) : (
            <motion.div
              variants={variants.wrap}
              initial="hidden"
              animate="show"
              className="max-w-4xl mx-auto lg:mx-0 text-center lg:text-left"
            >
              <motion.div
                variants={variants.item}
                className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs uppercase tracking-[0.28em] text-white/75 ring-1 ring-white/15"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-[#b29d88]" />
                HEXEL TECH • BRAND • BUILD • SCALE
              </motion.div>

              <motion.h1
                variants={variants.item}
                className="mt-7 text-4xl sm:text-6xl md:text-7xl font-bold leading-[1.02]"
              >
                Wir bauen digitale{" "}
                <span className="text-[#f3e2c8]">Marken</span>
                <span className="block">die man fühlt.</span>
              </motion.h1>

              <motion.p
                variants={variants.item}
                className="mt-6 text-lg sm:text-xl text-white/75 max-w-2xl mx-auto lg:mx-0"
              >
                Design-first Websites & Web-Apps — klare Struktur, starke Story und saubere Technik.
              </motion.p>

              <motion.div
                variants={variants.item}
                className="mt-9 flex flex-col sm:flex-row gap-3 justify-center lg:justify-start"
              >
                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center rounded-full bg-[#b29d88] px-8 py-3 text-sm font-medium text-black hover:scale-[1.03] transition"
                >
                  Projekt starten
                </Link>
                <Link
                  href="/projects"
                  className="inline-flex items-center justify-center rounded-full border border-white/25 px-8 py-3 text-sm font-medium text-white hover:bg-white/10 transition"
                >
                  Arbeiten ansehen
                </Link>
              </motion.div>

              <motion.div
                variants={variants.item}
                className="mt-8 flex flex-wrap gap-2 justify-center lg:justify-start text-sm text-white/70"
              >
                {["SEO", "Performance", "Design System", "Vercel Deploy", "Monitoring"].map((t) => (
                  <span key={t} className="rounded-full bg-white/10 px-3 py-1 ring-1 ring-white/15">
                    {t}
                  </span>
                ))}
              </motion.div>
            </motion.div>
          )}
        </div>
      </div>

      <div className="pointer-events-none absolute bottom-8 left-1/2 -translate-x-1/2 text-white/55 text-sm">
        Scroll
      </div>
    </section>
  );
}