"use client";
import { motion } from "framer-motion";
import {
  Code2,
  Cpu,
  Database,
  Palette,
  Image,
  Layers,
} from "lucide-react";

const services = [
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

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { type: "spring", stiffness: 20, duration: 0.6 },
};

export default function Services() {
  return (
    <section className="relative py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header im Homepage-Stil */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="mb-16 text-center"
        >
          <motion.h2
            {...fadeInUp}
            className="text-3xl md:text-4xl font-bold text-[#080706] mb-4"
          >
            Unsere <span className="text-[#b29d88]">Services</span>
          </motion.h2>
          <motion.p
            {...fadeInUp}
            transition={{ delay: 0.2 }}
            className="text-xl text-[#5d5247] max-w-2xl mx-auto"
          >
            Technische Exzellenz trifft auf kreative Umsetzung
          </motion.p>
        </motion.div>

        {/* Services Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <motion.div
              key={index}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp}
              transition={{ delay: index * 0.15 }}
              className="group relative"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${service.gradient} opacity-5 rounded-xl`} />
              
              <div className="relative h-full bg-white p-8 rounded-xl border border-[#e0d7cf] hover-glow transition-all">
                <div className={`w-14 h-14 rounded-lg ${service.gradient.replace('from', 'bg-gradient-to-br from')} mb-6 flex items-center justify-center text-white`}>
                  <service.icon className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold text-[#080706] mb-3">
                  {service.title}
                </h3>
                <p className="text-[#5d5247]">
                  {service.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Hintergrund-Elemente im Homepage-Stil */}
        <div className="absolute top-1/3 left-0 w-72 h-72 bg-[#b29d88]/5 rounded-full blur-3xl -z-10" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#47525d]/5 rounded-full blur-3xl -z-10" />
      </div>
    </section>
  );
}