'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Linkedin, Github, Mail, ArrowUpRight } from 'lucide-react'

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
    <motion.footer
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="border-t border-hexel-primary/30 bg-hexel-dark/80 backdrop-blur-lg"
    >
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Logo Section */}
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-6">
              <div className="h-8 w-8 bg-hexel-accent rounded-lg flex items-center justify-center">
                <span className="font-bold text-hexel-dark">H</span>
              </div>
              <span className="text-xl font-semibold">HEXEL</span>
            </Link>
            <p className="text-sm text-hexel-light/60 max-w-xs">
              Crafting digital excellence since 2022
            </p>
          </div>

          {/* Link Groups */}
          {footerLinks.map((section, index) => (
            <div key={index} className="space-y-4">
              <h3 className="text-hexel-light/80 font-medium mb-4">
                {section.title}
              </h3>
              <ul className="space-y-3">
                {section.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    <Link
                      href={link.href}
                      className="flex items-center gap-2 text-hexel-light/60 hover:text-hexel-accent transition-colors group"
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
            <h3 className="text-hexel-light/80 font-medium mb-4">
              Follow Us
            </h3>
            <div className="flex gap-4">
              {socialIcons.map((social, index) => (
                <Link
                  key={index}
                  href={social.href}
                  target="_blank"
                  className="p-2 rounded-lg bg-hexel-primary/20 hover:bg-hexel-accent/10 text-hexel-light/60 hover:text-hexel-accent transition-colors"
                >
                  {social.icon}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-hexel-primary/20 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm">
          <p className="text-hexel-light/60">
            © {currentYear} HEXEL. All rights reserved.
          </p>
          <div className="flex gap-4">
            <Link
              href="/privacy"
              className="text-hexel-light/60 hover:text-hexel-accent transition-colors"
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms"
              className="text-hexel-light/60 hover:text-hexel-accent transition-colors"
            >
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </motion.footer>
  )
}