'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { FiMenu, FiX } from 'react-icons/fi'
import Image from 'next/image'

const links = [
  { path: '/', name: 'Home' },
  { path: '/services', name: 'Services' },
  { path: '/metrics', name: 'Metrics Dashboard' },
  { path: '/contact', name: 'Contact' }
]

export default function Navigation() {
  const path = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  return (
    <nav className="fixed top-0 w-full bg-gradient-to-r from-[#b29d88] to-[#47525d] backdrop-blur-md shadow-md z-50">
      <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4 flex justify-between items-center">
        {/* Logo */}
        <Link 
          href="/" 
          className="hover:text-hexel-accent transition"
          onClick={() => setIsOpen(false)}
        >
          <div className="flex items-center">
            <Image 
              src="/images/x.png" 
              alt="Hexel Icon" 
              width={32}
              height={32}
              className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 mr-2"
            />
            <span className="sr-only">Home</span>
          </div>
        </Link>

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

        {/* Mobile Menu Button */}
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden text-white hover:text-hexel-accent transition p-1"
          aria-label={isOpen ? "Close menu" : "Open menu"}
        >
          {isOpen ? <FiX size={24} /> : <FiMenu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden bg-[#47525d]/95 backdrop-blur-md px-6 py-4"
          >
            <div className="flex flex-col space-y-3">
              {links.map((link) => (
                <Link
                  key={link.path}
                  href={link.path}
                  className={`py-2 text-base text-white hover:text-hexel-accent transition ${
                    link.path === path ? 'font-semibold' : 'font-medium'
                  }`}
                  onClick={() => setIsOpen(false)}
                >
                  {link.name}
                  {link.path === path && (
                    <motion.span
                      layoutId="mobile-underline"
                      className="block h-[2px] w-full bg-hexel-accent mt-1"
                      transition={{ type: 'spring', bounce: 0.3, duration: 0.5 }}
                    />
                  )}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}