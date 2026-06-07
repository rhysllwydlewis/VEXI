'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import { useContact } from '@/components/ContactWidget';

const NAV_LINKS = [
  { label: 'About', href: '#about', id: 'about' },
  { label: 'Portfolio', href: '#portfolio', id: 'portfolio' },
] as const;

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('');
  const reduceMotion = useReducedMotion();
  const { openContact } = useContact();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    handleScroll();
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
    <motion.header
      initial={reduceMotion ? false : { y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: reduceMotion ? 0 : 0.6 }}
      className={`fixed left-0 right-0 top-0 z-50 border-b px-5 py-4 transition-all duration-300 sm:px-6 md:px-10 ${
        scrolled
          ? 'border-white/5 bg-[rgba(10,14,26,0.84)] backdrop-blur-xl'
          : 'border-transparent bg-transparent'
      }`}
    >
      <nav aria-label="Site navigation" className="mx-auto flex max-w-7xl items-center justify-between gap-4">
        <Link
          href="/"
          className="rounded text-xl font-black tracking-tight text-white transition hover:opacity-80 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0e1a]"
        >
          VEXI
        </Link>

        <div className="hidden items-center gap-7 text-sm sm:flex" aria-label="Page sections">
          {NAV_LINKS.map(({ label, href, id }) => (
            <a
              key={id}
              href={href}
              aria-current={activeSection === id ? 'page' : undefined}
              className={`rounded px-1 py-1 transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50 ${
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
          className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-slate-200 transition hover:border-white/20 hover:bg-white/10 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0e1a]"
        >
          Contact Us
        </button>
      </nav>
    </motion.header>
  );
}
