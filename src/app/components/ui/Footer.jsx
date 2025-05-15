'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Linkedin, Github, Mail, ArrowUpRight } from 'lucide-react'
import Image from 'next/image'

const MotionFooter = motion.footer;

export default function Footer() {
  const currentYear = new Date().getFullYear()

  const footerLinks = [
    {
      title: 'Company',
      links: [
        { name: 'About', href: '/about' },
        { name: 'Services', href: '/services' },
        { name: 'Projects', href: '/projects' },
      ],
    },
    {
      title: 'Legal',
      links: [
        { name: 'Privacy', href: '/privacy' },
        { name: 'Terms', href: '/terms' },
        { name: 'Contact', href: '/contact' },
      ],
    },
    {
      title: 'Connect',
      links: [
        { name: 'LinkedIn', href: 'https://linkedin.com/company/hexel' },
        { name: 'GitHub', href: 'https://github.com/hexel' },
        { name: 'Jobs', href: '/careers' },
      ],
    },
  ]

  const socialIcons = [
    { icon: <Linkedin size={20} />, href: 'https://linkedin.com/company/hexel' },
    { icon: <Github size={20} />, href: 'https://github.com/hexel' },
    { icon: <Mail size={20} />, href: 'mailto:hello@hexel.dev' },
  ]

  return (
    <MotionFooter
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-gradient-to-r from-[#b29d88] to-[#47525d] border-t border-white/10"
    >
      <div className="container mx-auto px-4 py-12 text-white">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Logo Section */}
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-6">
              <div className="h-8 w-8  rounded-lg flex items-center justify-center">
              <Image
                    src="/images/x.png"
                    alt="HEXEL Icon"
                    width={128}
                    height={128}
                    priority
                    className="filter drop-shadow-lg"
                  />
              </div>
              <Image
                    src="/images/titel.png"
                    alt="HEXEL Logo"
                    width={256}
                    height={128}
                    priority
                    className="filter drop-shadow-lg"
                  />
            </Link>
            <p className="text-sm text-white/70 max-w-xs">
              Crafting digital excellence since 2022
            </p>
          </div>

          {/* Link Groups */}
          {footerLinks.length > 0 && footerLinks.map((section, index) => (
            <div key={index} className="space-y-4">
              <h3 className="text-white/80 font-medium mb-4">
                {section.title}
              </h3>
              <ul className="space-y-3">
                {section.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    <Link
                      href={link.href}
                      className="flex items-center gap-2 text-white/70 hover:text-white transition-colors group"
                      target={link.href.startsWith('http') ? '_blank' : '_self'}
                      rel={link.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                    >
                      {link.name}
                      {link.href.startsWith('http') && (
                        <ArrowUpRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Social Links */}
          <div className="space-y-4">
            <h3 className="text-white/80 font-medium mb-4">
              Follow Us
            </h3>
            <div className="flex gap-4">
              {socialIcons.map((social, index) => (
                <Link
                  key={index}
                  href={social.href}
                  target="_blank"
                  className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
                >
                  {social.icon}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/20 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm">
          <p className="text-white/70">
            © {currentYear} HEXEL. All rights reserved.
          </p>
          <div className="flex gap-4">
            <Link
              href="/privacy"
              className="text-white/70 hover:text-white transition-colors"
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms"
              className="text-white/70 hover:text-white transition-colors"
            >
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </MotionFooter>
  )
}
