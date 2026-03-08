'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useContact } from '@/components/ContactWidget';

const NAV_LINKS = [
  { label: 'About', href: '#about', id: 'about' },
  { label: 'Portfolio', href: '#portfolio', id: 'portfolio' },
] as const;

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('');
  const { openContact } = useContact();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Scroll-spy: mark the nav link whose section is currently in the upper 40 % of the viewport.
  // Uses rAF-throttling to avoid excessive DOM reads on every scroll tick.
  useEffect(() => {
    let rafId: ReturnType<typeof requestAnimationFrame> | null = null;
    const update = () => {
      rafId = null;
      const scrollMid = window.scrollY + window.innerHeight * 0.4;
      let current = '';
      for (const { id } of NAV_LINKS) {
        const el = document.getElementById(id);
        if (el && el.offsetTop <= scrollMid) current = id;
      }
      setActiveSection(current);
    };
    const onScroll = () => {
      if (rafId !== null) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(update);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    update();
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (rafId !== null) cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6 }}
      aria-label="Site navigation"
      className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-10 py-4 transition-all duration-300 border-b ${
        scrolled
          ? 'bg-[rgba(10,14,26,0.8)] backdrop-blur-xl border-white/5'
          : 'bg-transparent border-transparent'
      }`}
    >
      <Link href="/" className="text-xl font-bold text-white tracking-tight hover:opacity-75 transition">VEXI</Link>

      {/* Section nav links — hidden on very small screens */}
      <div className="hidden sm:flex items-center gap-6 text-sm" aria-label="Page sections">
        {NAV_LINKS.map(({ label, href, id }) => (
          <a
            key={id}
            href={href}
            className={`transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50 rounded ${
              activeSection === id
                ? 'text-white'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {label}
          </a>
        ))}
      </div>

      <button
        type="button"
        onClick={openContact}
        className="text-sm text-slate-300 hover:text-white transition font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50 rounded"
      >
        Contact Us
      </button>
    </motion.nav>
  );
}
