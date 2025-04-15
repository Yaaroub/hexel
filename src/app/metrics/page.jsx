"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Briefcase, Users, FileText, Euro } from "lucide-react";

const metrics = [
  {
    icon: Briefcase,
    title: "Aktive Aufträge",
    value: 42,
    gradient: "from-[#b29d88] to-[#47525d]",
  },
  {
    icon: Users,
    title: "Kunden",
    value: 128,
    gradient: "from-[#d4b699] to-[#b29d88]",
  },
  {
    icon: FileText,
    title: "Projekte",
    value: 76,
    gradient: "from-[#c2a98f] to-[#47525d]",
  }
];

export default function MetricsDashboard() {
  return (
    <section className="relative py-24 bg-[#f3f4f6] text-[#47525d]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header mit identischer Akzentlinie */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="mb-16 lg:mb-24"
        >
          <div className="relative pl-6 border-l-4 border-[#47525d]">
            <motion.h2
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-4xl font-bold text-[#47525d] mb-4"
            >
              Unternehmensdaten
            </motion.h2>
            <motion.p
              className="text-xl text-[#47525d] max-w-2xl"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              Echtzeit-Überblick über unsere Aktivitäten
            </motion.p>
          </div>
        </motion.div>

        {/* Metrik-Karten mit animierten Zählern */}
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
              className="group relative h-full"
            >
              <div
                className={`absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-20 transition-opacity duration-300 rounded-xl ${metric.gradient}`}
              />

              <div className="relative h-full bg-white p-8 rounded-xl border border-[#e0d7cf] shadow-sm hover:shadow-md transition-all">
                <div className="mb-6">
                  <metric.icon className="h-12 w-12 text-[#47525d] group-hover:text-[#b29d88] transition-colors" />
                </div>
                <h3 className="text-2xl font-semibold text-[#47525d] mb-4">
                  {metric.title}
                </h3>
                <p className="text-4xl font-bold text-[#47525d]">
                  {typeof metric.value === 'number' ? (
                    <Counter target={metric.value} />
                  ) : (
                    metric.value
                  )}
                </p>

                {/* Hover-Indicator */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#47525d] opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Hintergrund-Elemente */}
        <div className="absolute top-1/3 left-0 w-72 h-72 bg-[#b29d88]/5 rounded-full blur-3xl -z-10" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#47525d]/5 rounded-full blur-3xl -z-10" />
      </div>
    </section>
  );
}

// Animierter Zähler-Komponente
function Counter({ target }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const duration = 2000;
    const startTime = Date.now();
    
    const updateCount = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      setCount(Math.floor(progress * target));
      
      if (progress < 1) {
        requestAnimationFrame(updateCount);
      }
    };

    requestAnimationFrame(updateCount);
  }, [target]);

  return <span>{count}</span>;
}