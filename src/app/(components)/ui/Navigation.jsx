'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'

const links = [
  { path: '/', name: 'Home' },
  { path: '/services', name: 'Services' },
  { path: '/projects', name: 'Projects' },
  { path: '/contact', name: 'Contact' },
]

export default function Navigation() {
  const path = usePathname()

  return (
    <nav className="fixed top-0 w-full bg-hexel-dark/80 backdrop-blur z-50">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold">
          HEXEL
        </Link>
        
        <div className="flex gap-8">
          {links.map((link) => (
            <Link
              key={link.path}
              href={link.path}
              className="relative"
            >
              {link.path === path && (
                <motion.span
                  layoutId="underline"
                  className="absolute left-0 top-full block h-[2px] w-full bg-hexel-accent"
                />
              )}
              {link.name}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  )
}