"use client";

import { motion } from "framer-motion";
import {
  Code2,
  Cpu,
  Database,
  Palette,
  Image,
  Layout,
  Layers,
} from "lucide-react";

const metrics = [
  {
    icon: Code2,
    title: "MERN-Stack",
    description: "MongoDB, Express, React, Node.js",
    gradient: "from-[#b29d88] to-[#47525d]",
  },
  {
    icon: Cpu,
    title: "Next.js",
    description: "SSR, SSG & API-Routes",
    gradient: "from-[#47525d] to-[#b29d88]",
  },
  {
    icon: Database,
    title: "Backend-APIs",
    description: "REST & GraphQL APIs",
    gradient: "from-[#d4b699] to-[#47525d]",
  },
  {
    icon: Palette,
    title: "UI/UX Design",
    description: "Figma & nutzerzentrierte Interfaces",
    gradient: "from-[#47525d] to-[#d4b699]",
  },
  {
    icon: Image,
    title: "Mediendesign",
    description: "Digital & Print im Corporate Look",
    gradient: "from-[#b29d88] to-[#d4b699]",
  },
  {
    icon: Layers,
    title: "Grafikdesign",
    description: "Branding & visuelle Identität",
    gradient: "from-[#d4b699] to-[#b29d88]",
  },
];

export default function MetricsDashboard() {
  return (
    <section className="py-24 bg-white text-[#47525d]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="mb-16 lg:mb-24"
        >
          <div className="relative pl-6 border-l-4 border-[#b29d88]">
            <motion.h2
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-4xl md:text-5xl font-bold mb-4"
            >
              Was wir bieten
            </motion.h2>
            <motion.p
              className="text-xl text-[#47525d]/90 max-w-2xl"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              Technische Exzellenz trifft auf kreative Umsetzung
            </motion.p>
          </div>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {metrics.map((metric, index) => (
            <motion.div
              key={index}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={{
                hidden: { opacity: 0, y: 40 },
                visible: {
                  opacity: 1,
                  y: 0,
                  transition: {
                    type: "spring",
                    stiffness: 50,
                    delay: index * 0.15,
                  },
                },
              }}
            >
              <div className="group relative h-full">
                {/* Hover-Gradient */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#e8ded3] opacity-0 group-hover:opacity-100 transition-opacity" />

                {/* Card Content */}
                <div className="relative z-10 h-full bg-white p-8 rounded-xl border border-[#e0d7cf] shadow-sm group-hover:shadow-md transition-shadow duration-300">
                  <div className="mb-6">
                    <metric.icon className="h-12 w-12 text-[#47525d] group-hover:text-[#b29d88] transition-colors duration-300" />
                  </div>
                  <h3 className="text-2xl font-semibold mb-4">
                    {metric.title}
                  </h3>
                  <p className="text-[#47525d]/90 leading-relaxed">
                    {metric.description}
                  </p>

                  {/* Bottom Indicator */}
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#b29d88] opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
