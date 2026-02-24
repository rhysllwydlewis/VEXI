'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useContact } from '@/components/ContactWidget';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const { openContact } = useContact();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
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
      <span className="text-xl font-bold text-white tracking-tight">VEXI</span>
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
