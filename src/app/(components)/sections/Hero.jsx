'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'

export default function HeroSection() {
  return (
    <section className="h-screen flex items-center justify-center relative">
      <div className="container mx-auto px-4 text-center">
        <motion.h1
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-6xl md:text-8xl font-bold mb-6"
        >
          <span className="bg-gradient-to-r from-hexel-accent to-cyan-400 bg-clip-text text-transparent">
            HEXEL
          </span>
        </motion.h1>
        
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex justify-center gap-4 mt-8"
        >
          <Link
            href="/contact"
            className="bg-hexel-accent px-8 py-4 rounded-full text-hexel-light hover:bg-hexel-accent/90 transition-colors"
          >
            Start Project
          </Link>
        </motion.div>
      </div>
    </section>
  )
}