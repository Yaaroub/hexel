"use client";
import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import Carousel from "@/app/components/Carousel";
import {
  CalendarIcon,
  PaintBrushIcon,
  CodeBracketIcon,
  RocketLaunchIcon,
} from "@heroicons/react/24/outline";

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { type: "spring", stiffness: 20, duration: 0.6 },
};

const WORK_PROCESS = [
  {
    icon: <CalendarIcon className="w-8 h-8 text-[#b29d88]" />,
    title: "Konzeptphase",
    desc: "Anforderungsanalyse & Planung",
  },
  {
    icon: <PaintBrushIcon className="w-8 h-8 text-[#b29d88]" />,
    title: "Design",
    desc: "Prototyping & UI/UX Konzeption",
  },
  {
    icon: <CodeBracketIcon className="w-8 h-8 text-[#b29d88]" />,
    title: "Entwicklung",
    desc: "Agile Implementierung",
  },
  {
    icon: <RocketLaunchIcon className="w-8 h-8 text-[#b29d88]" />,
    title: "Launch",
    desc: "Testing & Deployment",
  },
];

const FEATURES = [
  {
    title: "Individuelle Lösungen",
    desc: "100% maßgeschneiderte Entwicklungen",
    color: "from-[#b29d88] to-[#47525d]",
  },
  {
    title: "Moderne Technologien",
    desc: "React, Next.js, Node.js, AWS",
    color: "from-[#d4b699] to-[#b29d88]",
  },
  {
    title: "Agile Entwicklung",
    desc: "Sprints mit klaren Meilensteinen",
    color: "from-[#c2a98f] to-[#47525d]",
  },
];

const TESTIMONIALS = [
  {
    name: "Max Mustermann",
    company: "ABC GmbH",
    comment: "Hexel Tech hat unsere Prozesse revolutioniert. Die Software läuft einwandfrei und die Zusammenarbeit war hervorragend!",
    rating: 5,
    image: "/images/client1.png",
  },
  {
    name: "Erika Musterfrau",
    company: "XYZ AG",
    comment: "Besonders beeindruckt hat uns die schnelle Reaktionszeit des Teams. Absolute Empfehlung für komplexe Projekte.",
    rating: 4,
    image: "/images/client2.png",
  },
  {
    name: "Dr. Schmidt & Co.",
    company: "MediTech Solutions",
    comment: "Maßgeschneiderte Lösung mit exzellentem Support. Wir planen bereits das nächste Projekt mit Hexel!",
    rating: 5,
    image: "/images/client3.png",
  },
];

const TEAM_MEMBERS = [
  {
    name: "Yaaroub Al Haj Dawoud",
    role: "Software developer",
    image: "team1.png",
  },
  { 
    name: "Mohammad Abdulwahab", 
    role: "Design Lead", 
    image: "team2.png" 
  },
  {
    name: "Yaman Al Haj Dawoud",
    role: "Software developer",
    image: "team3.png",
  },
];

const CAROUSEL_ITEMS = [
  {
    title: "Webentwicklung",
    description: "Moderne Webanwendungen mit React und Next.js",
    id: 1,
    icon: <CodeBracketIcon className="h-6 w-6 text-[#b29d88]" />,
  },
  {
    title: "UI/UX Design",
    description: "Ansprechende Benutzeroberflächen und Erfahrungen",
    id: 2,
    icon: <PaintBrushIcon className="h-6 w-6 text-[#b29d88]" />,
  },
  {
    title: "Beratung",
    description: "Individuelle Lösungen für Ihr Unternehmen",
    id: 3,
    icon: <CalendarIcon className="h-6 w-6 text-[#b29d88]" />,
  },
];

const StarRating = ({ rating }) => (
  <div className="flex justify-center mb-4">
    {[...Array(5)].map((_, i) => (
      <svg
        key={i}
        className={`h-5 w-5 ${i < rating ? "text-yellow-400" : "text-gray-300"}`}
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ))}
  </div>
);

export default function HomePage() {
  return (
    <div>
      {/* Hero Section */}
      <section className="relative py-32 md:py-40 bg-hexel-gradient animate-gradient-x">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="space-y-8"
          >
            <motion.div 
              {...fadeInUp}
              className="flex flex-col items-center"
            >
              <div className="mb-8 flex items-center justify-center relative">
                <div className="absolute inset-0 rounded-full bg-[#b29d88] opacity-20 blur-3xl -z-10"></div>
                <Image
                  src="/images/x.png"
                  alt="HEXEL Icon"
                  width={120}
                  height={120}
                  className="w-20 h-20 md:w-32 md:h-32 drop-shadow-lg"
                />
                <Image
                  src="/images/titel.png"
                  alt="HEXEL Logo"
                  width={240}
                  height={120}
                  className="w-48 md:w-64 drop-shadow-lg"
                />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-white drop-shadow-lg">
                Innovative <span className="text-[#b29d88]">Digital</span> Solutions
              </h1>
            </motion.div>

            <motion.p 
              {...fadeInUp}
              className="text-xl text-white/90 max-w-2xl mx-auto"
            >
              Maßgeschneiderte Software- und Designlösungen für Ihr Unternehmen
            </motion.p>

            <motion.div {...fadeInUp} className="pt-4">
              <Link
                href="/contact"
                className="inline-block bg-[#b29d88] hover:bg-[#a08b76] text-white font-medium py-3 px-8 rounded-lg transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                Projekt anfragen
              </Link>
            </motion.div>
          </motion.div>
        </div>
        <div className="bg-grid-pattern absolute inset-0 -z-10" />
      </section>

      {/* Rounded Carousel Section */}
      <section className="py-16 bg-[#f9f7f5]">
        <div className="max-w-7xl mx-auto px-4">
          <motion.h2 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="text-3xl md:text-4xl font-bold text-[#080706] text-center mb-16"
          >
            Unsere <span className="text-[#b29d88]">Leistungen</span>
          </motion.h2>
          
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="flex justify-center"
          >
            <Carousel
              items={CAROUSEL_ITEMS}
              baseWidth={350}
              autoplay={true}
              autoplayDelay={3500}
              pauseOnHover={true}
              loop={true}
              round={true}
            />
          </motion.div>
        </div>
      </section>

      {/* Work Process */}
      <section className="py-24 bg-white">
        <div className="max-w-5xl mx-auto px-4">
          <motion.h2 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="text-3xl md:text-4xl font-bold text-[#080706] text-center mb-16"
          >
            Unser <span className="text-[#b29d88]">Prozess</span>
          </motion.h2>

          <div className="relative">
            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-transparent via-[#b29d88] to-transparent md:left-1/2 md:-translate-x-1/2" />
            
            {WORK_PROCESS.map((step, index) => (
              <motion.div
                key={index}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeInUp}
                transition={{ delay: index * 0.15 }}
                className={`relative mb-12 last:mb-0 ${index % 2 === 0 ? 'md:pr-[50%]' : 'md:pl-[50%]'} ${index % 2 !== 0 ? 'md:text-right' : ''}`}
              >
                <div className="absolute left-0 w-12 h-12 rounded-full bg-[#b29d88] flex items-center justify-center text-white md:left-1/2 md:-translate-x-6 transition-transform duration-300 hover:scale-110 hover:shadow-lg">
                  {step.icon}
                </div>
                <div className="ml-20 bg-white p-6 rounded-lg shadow-sm md:ml-0 border border-[#e0d7cf] transition-all duration-300 hover:shadow-lg hover:border-[#b29d88]/50">
                  <h3 className="text-xl font-bold mb-2 text-[#080706]">{step.title}</h3>
                  <p className="text-[#5d5247]">{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 bg-[#f9f7f5]">
        <div className="max-w-7xl mx-auto px-4">
          <motion.h2 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="text-3xl md:text-4xl font-bold text-[#080706] text-center mb-16"
          >
            Unsere <span className="text-[#b29d88]">Stärken</span>
          </motion.h2>

          <div className="grid md:grid-cols-3 gap-8">
            {FEATURES.map((feature, index) => (
              <motion.div
                key={index}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeInUp}
                className="bg-white rounded-xl overflow-hidden shadow-sm relative"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-5`}></div>
                <div className="p-8 relative">
                  <div className={`w-12 h-12 rounded-lg ${feature.color.replace('from', 'bg-gradient-to-br from')} mb-6 flex items-center justify-center text-white`}>
                    {index === 0 && <CodeBracketIcon className="h-6 w-6" />}
                    {index === 1 && <PaintBrushIcon className="h-6 w-6" />}
                    {index === 2 && <CalendarIcon className="h-6 w-6" />}
                  </div>
                  <h3 className="text-xl md:text-2xl font-bold text-[#080706] mb-3">{feature.title}</h3>
                  <p className="text-[#5d5247]">{feature.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <motion.h2 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="text-3xl md:text-4xl font-bold text-[#080706] text-center mb-12"
          >
            Unser Team
          </motion.h2>

          <div className="grid md:grid-cols-3 gap-8">
            {TEAM_MEMBERS.map((member, index) => (
              <motion.div
                key={index}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeInUp}
                transition={{ delay: index * 0.1 }}
                className="group relative p-4 bg-white rounded-xl border border-[#e0d7cf]"
              >
                <div className="relative h-80 bg-gray-100">
                  <Image
                    src={`/images/${member.image}`}
                    alt={member.name}
                    fill
                    className="object-contain grayscale group-hover:grayscale-0 transition-all duration-500"
                  />
                </div>
                <div className="p-4 bg-white">
                  <h3 className="text-xl font-semibold">{member.name}</h3>
                  <p className="text-[#b29d88]">{member.role}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="relative py-24 bg-hexel-gradient animate-gradient-x">
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <motion.h2 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="text-3xl md:text-4xl font-bold text-white text-center mb-12 drop-shadow-lg"
          >
            Kundenstimmen
          </motion.h2>

          <div className="grid lg:grid-cols-3 gap-8">
            {TESTIMONIALS.map((testimonial, index) => (
              <motion.div
                key={index}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeInUp}
                className="bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/10"
              >
                <StarRating rating={testimonial.rating} />
                <blockquote className="text-white/90 italic mb-6">
                '{testimonial.comment}'
                </blockquote>
                <div className="flex items-center">
                  <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-[#b29d88]">
                    <Image
                      src={testimonial.image}
                      alt={testimonial.name}
                      width={56}
                      height={56}
                      className="object-cover"
                    />
                  </div>
                  <div className="ml-4">
                    <p className="font-medium text-white">{testimonial.name}</p>
                    <p className="text-[#b29d88] text-sm">
                      {testimonial.company}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
        <div className="absolute inset-0 bg-[url('/images/glow.png')] bg-cover opacity-10 -z-0"></div>
      </section>

      {/* CTA Section */}
      <section className="relative py-24 bg-[#47525d] text-white text-center">
        <div className="max-w-4xl mx-auto px-4 relative z-10">
          <motion.h2
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="text-3xl md:text-4xl font-bold mb-8 drop-shadow-lg"
          >
            Bereit für Ihre nächste digitale Lösung?
          </motion.h2>
          <motion.p
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="text-xl text-white/90 mb-12 max-w-2xl mx-auto"
          >
            Lassen Sie uns gemeinsam Ihr Projekt zum Erfolg führen.
          </motion.p>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
          >
            <Link
              href="/contact"
              className="inline-block bg-[#b29d88] hover:bg-[#a08b76] text-white font-medium py-4 px-12 rounded-lg transition-all shadow-xl hover:shadow-2xl transform hover:scale-105"
            >
              Jetzt Kontakt aufnehmen
            </Link>
          </motion.div>
        </div>
        <div className="absolute top-0 left-1/4 w-64 h-64 md:w-96 md:h-96 bg-[#b29d88]/10 rounded-full blur-3xl -z-0"></div>
        <div className="absolute bottom-0 right-1/4 w-64 h-64 md:w-96 md:h-96 bg-[#47525d]/20 rounded-full blur-3xl -z-0"></div>
      </section>
    </div>
  );
}