'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { usePathname } from 'next/navigation';

const links = [
  { path: '/', name: 'Home' },
  { path: '/services', name: 'Services' },
  { path: '/metrics', name: 'Metrics Dashboard' },
  { path: '/contact', name: 'Contact' }
];

const letters = 'Hexel Tech'.split('');

export default function Navigation() {
  const path = usePathname();
  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => setMounted(true), 300);
    return () => clearTimeout(timeout);
  }, []);

  return (
    <nav className="fixed top-0 w-full bg-gradient-to-r from-[#b29d88] to-[#47525d] backdrop-blur-md shadow-md z-50">
      <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between relative">
        {/* Logo + Hexel Tech */}
        <div className="flex items-center gap-2">
          {/* Logo */}
          {/** Desktop: Logo with rotation animation */}
          <motion.div
            className="hidden sm:block flex-shrink-0"
            animate={mounted ? { rotate: 360 } : {}}
            transition={{ delay: 0.5, duration: 0.8 }}
          >
            <Image
              src="/images/x.png"
              alt="Hexel Icon"
              width={36}
              height={36}
              className="w-8 h-8 sm:w-10 sm:h-10"
            />
          </motion.div>

          {/** Mobile: Static Logo */}
          <div className="block sm:hidden flex-shrink-0">
            <Image
              src="/images/x.png"
              alt="Hexel Icon"
              width={36}
              height={36}
              className="w-8 h-8 sm:w-10 sm:h-10"
            />
          </div>

          {/* Hexel Tech Text with Slide Animation */}
          <div className="flex gap-[2px]">
            {letters.map((char, index) => (
              <motion.span
                key={index}
                initial={{ opacity: 0, y: -10 }}
                animate={mounted ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.3 + index * 0.08, duration: 0.4 }}
                className={`text-white text-lg font-semibold ${
                  char === 'x' ? 'text-[#47525d]' : ''
                }`}
              >
                {char}
              </motion.span>
            ))}
          </div>
        </div>

        {/* Desktop Links */}
        <div className="hidden md:flex gap-6 lg:gap-8">
          {links.map((link) => (
            <Link
              key={link.path}
              href={link.path}
              className={`relative text-white hover:text-hexel-accent transition text-sm lg:text-base ${
                link.path === path ? 'font-semibold' : 'font-medium'
              }`}
            >
              {link.name}
              {link.path === path && (
                <motion.span
                  layoutId="underline"
                  className="absolute left-0 top-full h-[2px] w-full bg-hexel-accent"
                  transition={{ type: 'spring', bounce: 0.3, duration: 0.5 }}
                />
              )}
            </Link>
          ))}
        </div>

        {/* Mobile Menu Icon */}
        <button
          className="md:hidden text-white focus:outline-none"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle Mobile Menu"
        >
          {mobileMenuOpen ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile Links */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={mobileMenuOpen ? { opacity: 1, y: 0 } : { opacity: 0, y: -10 }}
        className={`md:hidden px-4 pb-3 absolute w-full bg-gradient-to-b from-[#b29d88] to-[#47525d] transition-all duration-300 ease-in-out ${
          mobileMenuOpen ? 'block' : 'hidden'
        }`}
      >
        <div className="flex flex-col space-y-2 mt-2 p-4">
          {links.map((link) => (
            <Link
              key={link.path}
              href={link.path}
              className={`text-base text-white hover:text-hexel-accent transition ${
                link.path === path ? 'font-semibold' : 'font-medium'
              }`}
              onClick={() => setMobileMenuOpen(false)} // Close menu on link click
            >
              {link.name}
            </Link>
          ))}
        </div>
      </motion.div>
    </nav>
  );
}