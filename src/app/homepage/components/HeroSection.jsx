'use client'
import React from "react";
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { type: "spring", stiffness: 20, duration: 0.6 },
};

const WORK_PROCESS = [
  { icon: '🗓️', title: 'Konzeptphase', desc: 'Anforderungsanalyse & Planung' },
  { icon: '🎨', title: 'Design', desc: 'Prototyping & UI/UX Konzeption' },
  { icon: '💻', title: 'Entwicklung', desc: 'Agile Implementierung' },
  { icon: '🚀', title: 'Launch', desc: 'Testing & Deployment' }
];

const FEATURES = [
  { 
    title: 'Individuelle Lösungen',
    desc: '100% maßgeschneiderte Entwicklungen',
    color: 'from-[#b29d88] to-[#47525d]'
  },
  { 
    title: 'Moderne Technologien',
    desc: 'React, Next.js, Node.js, AWS',
    color: 'from-[#d4b699] to-[#b29d88]'
  },
  { 
    title: 'Agile Entwicklung',
    desc: 'Sprints mit klaren Meilensteinen',
    color: 'from-[#c2a98f] to-[#47525d]'
  }
];

const TESTIMONIALS = [
  {
    name: "Max Mustermann",
    company: "ABC GmbH",
    comment: "Hexel Tech hat unsere Prozesse revolutioniert. Die Software läuft einwandfrei und die Zusammenarbeit war hervorragend!",
    rating: 5,
    image: "/images/client1.png"
  },
  {
    name: "Erika Musterfrau",
    company: "XYZ AG",
    comment: "Besonders beeindruckt hat uns die schnelle Reaktionszeit des Teams. Absolute Empfehlung für komplexe Projekte.",
    rating: 4,
    image: "/images/client2.png"
  },
  {
    name: "Dr. Schmidt & Co.",
    company: "MediTech Solutions",
    comment: "Maßgeschneiderte Lösung mit exzellentem Support. Wir planen bereits das nächste Projekt mit Hexel!",
    rating: 5,
    image: "/images/client3.png"
  }
];

const TEAM_MEMBERS = [
  { name: 'Yaaroub Al Haj Dawoud', role: 'Software developer', image: 'team1.png' },
  { name: 'Mohammad Abdulwahab', role: 'Design Lead', image: 'team2.png' },
  { name: 'Yaman Al Haj Dawoud', role: 'Software developer', image: 'team3.png' }
];

const StarRating = ({ rating }) => (
  <div className="flex justify-center mb-4">
    {[...Array(5)].map((_, i) => (
      <svg
        key={i}
        className={`h-5 w-5 ${i < rating ? 'text-yellow-400' : 'text-gray-300'}`}
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
    <>
      {/* 1. Hero Section */}
      <section className="relative py-32 md:py-40 bg-hexel-gradient animate-gradient-x">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="mb-12 md:mb-16 lg:mb-24 glass-effect p-8"
          >
            <div className="flex flex-col items-center space-y-6">
              <motion.div {...fadeInUp} className="flex flex-col md:flex-row items-center gap-6">
                <Image
                  src="/images/x.png"
                  alt="HEXEL Icon"
                  width={96}
                  height={96}
                  priority
                  className="w-16 h-16 md:w-32 md:h-32 "
                />
                <Image
                  src="/images/titel.png"
                  alt="HEXEL Logo"
                  width={192}
                  height={96}
                  priority
                  className="w-48 md:w-64  "
                />
              </motion.div>

              <motion.p  className="text-lg md:text-xl text-white/90 text-center">
                Innovative Software- und Designlösungen für Ihr Unternehmen
              </motion.p>

              <Link
                href="/contact"
                className="btn-hover-effect bg-[#b29d88] text-white py-3 px-8 rounded-lg"
              >
                Jetzt Kontakt aufnehmen
              </Link>
            </div>
          </motion.div>
        </div>
        <div className="bg-grid-pattern absolute inset-0 -z-10" />
      </section>

      {/* 2. About Us */}
      <section className="relative py-12 md:py-16 bg-white text-center border-t border-[#e0d7cf]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.h2 
            {...fadeInUp}
            className="text-2xl md:text-3xl font-bold text-[#080706] mb-4 md:mb-6"
          >
            Wer wir sind
          </motion.h2>
          <p className="text-base md:text-lg text-[#5d5247] mb-6 md:mb-8 max-w-3xl mx-auto leading-relaxed px-4">
            HEXEL bietet maßgeschneiderte digitale Lösungen, die perfekt auf die Bedürfnisse Ihres Unternehmens abgestimmt sind. 
            Mit unserem Team aus Softwareentwicklern und Designern schaffen wir Lösungen, die Ihre Marke stärken und Ihr Unternehmen voranbringen.
          </p>
          <Link 
            href="/services" 
            className="text-[#b29d88] hover:text-[#080706] transition-colors duration-300 font-medium text-sm md:text-base "
          >
            Erfahren Sie mehr über unsere Dienstleistungen →
          </Link>
        </div>
      </section>

      {/* 3. Work Process */}
      <section className="relative py-12 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="mb-12 md:mb-16"
          >
            <motion.h2 {...fadeInUp} className="text-3xl md:text-4xl font-bold text-[#080706] mb-6 text-center">
              Unser Arbeitsprozess
            </motion.h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {WORK_PROCESS.map((step, index) => (
                <motion.div
                  key={index}
                  variants={fadeInUp}
                  className="group relative p-8 bg-white rounded-xl border border-[#e0d7cf] hover-glow"
                >
                  <div className="text-4xl mb-4">{step.icon}</div>
                  <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                  <p className="text-[#5d5247]">{step.desc}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* 4. Features */}
      <section className="relative py-12 md:py-24 bg-[#47525d]/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.h2 {...fadeInUp} className="text-3xl md:text-4xl font-bold text-[#080706] mb-12 text-center">
            Unsere Stärken
          </motion.h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {FEATURES.map((feature, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                className="group relative p-8 bg-white rounded-xl border border-[#e0d7cf] hover-glow"
              >
                <div className={`absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-10 ${feature.color} transition-opacity`} />
                <h3 className="text-xl md:text-2xl font-bold text-[#080706] mb-3">
                  {feature.title}
                </h3>
                <p className="text-[#5d5247]">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Team */}
      <section className="relative py-12 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.h2 {...fadeInUp} className="text-3xl md:text-4xl font-bold text-[#080706] text-center mb-12">
            Unser Team
          </motion.h2>

          <div className="grid md:grid-cols-3 gap-8">
            {TEAM_MEMBERS.map((member, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                className="group relative p-4 bg-white rounded-xl border border-[#e0d7cf] hover-glow"
              >
                <div className="relative h-80 bg-gray-100 transition-transform duration-300">
                  <Image
                    src={`/images/${member.image}`}
                    alt={member.name}
                    fill
                    className="object-contain grayscale group-hover:grayscale-0 transition-all"
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

      {/* 6. Testimonials */}
      <section className="relative py-12 md:py-24 bg-hexel-gradient animate-gradient-x">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.h2 {...fadeInUp} className="text-3xl md:text-4xl font-bold text-white text-center mb-12">
            Kundenstimmen
          </motion.h2>

          <div className="grid lg:grid-cols-3 gap-8">
            {TESTIMONIALS.map((testimonial, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                className="glass-effect p-6 btn-hover-effect"
              >
                <StarRating rating={testimonial.rating} />
                <blockquote className="text-white/80 italic mb-6">
                  "{testimonial.comment}"
                </blockquote>
                <div className="flex items-center">
                  <Image
                    src={testimonial.image}
                    alt={testimonial.name}
                    width={56}
                    height={56}
                    className="rounded-full   mr-4"
                  />
                  <div>
                    <p className="font-medium text-white">{testimonial.name}</p>
                    <p className="text-[#b29d88] text-sm">{testimonial.company}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. Call to Action */}
      <section className="relative py-12 md:py-16 bg-[#47525d] text-white text-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.h2 
            {...fadeInUp}
            className="text-2xl md:text-3xl font-bold mb-4 md:mb-6"
          >
            Bereit für Ihre nächste digitale Lösung?
          </motion.h2>
          <p className="text-base md:text-lg mb-6 md:mb-8 max-w-xl mx-auto px-4">
            Lassen Sie uns gemeinsam Ihr Projekt zum Erfolg führen. Kontaktieren Sie uns noch heute!
          </p>
          <Link 
            href="/contact" 
            className="inline-block bg-[#b29d88] text-white py-2 px-4 md:py-3 md:px-6 rounded-lg hover:bg-[#47525d] transition-all duration-300 transform hover:scale-105 shadow-sm hover:shadow-md text-sm md:text-base"
          >
            Jetzt Kontakt aufnehmen
          </Link>
        </div>
      
        <div className="absolute top-0 left-1/4 w-64 h-64 md:w-96 md:h-96 bg-[#b29d88]/5 rounded-full blur-3xl -z-10" />
      </section>
    </>
  );
}