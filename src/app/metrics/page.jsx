"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Briefcase, Users, FileText } from "lucide-react";

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
    <section className="relative py-24 ">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header im Stil der Homepage */}
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
            Unsere <span className="text-[#b29d88]">Leistungen</span> in Zahlen
          </motion.h2>
          <motion.p
            {...fadeInUp}
            transition={{ delay: 0.2 }}
            className="text-xl text-[#5d5247] max-w-2xl mx-auto"
          >
            Transparenz durch klare Kennzahlen
          </motion.p>
        </motion.div>

        {/* Metrik-Karten im Homepage-Design */}
        <div className="grid md:grid-cols-3 gap-8">
          {metrics.map((metric, index) => (
            <motion.div
              key={index}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp}
              transition={{ delay: index * 0.15 }}
              className="group relative h-full"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${metric.gradient} opacity-5 rounded-xl`} />
              
              <div className="relative h-full bg-white p-8 rounded-xl border border-[#e0d7cf] hover-glow transition-all">
                <div className={`w-14 h-14 rounded-lg ${metric.gradient.replace('from', 'bg-gradient-to-br from')} mb-6 flex items-center justify-center text-white`}>
                  <metric.icon className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold text-[#080706] mb-4">
                  {metric.title}
                </h3>
                <p className="text-4xl font-bold text-[#47525d]">
                  {typeof metric.value === 'number' ? (
                    <Counter target={metric.value} />
                  ) : (
                    metric.value
                  )}
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

// Animierter Zähler (unverändert)
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

// Konsistente Animationen wie in der Homepage
const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { type: "spring", stiffness: 20, duration: 0.6 },
};