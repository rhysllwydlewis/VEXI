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
      className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-10 py-4 transition-all duration-300 ${
        scrolled
          ? 'bg-[rgba(10,14,26,0.8)] backdrop-blur-xl border-b border-white/5'
          : 'bg-transparent'
      }`}
    >
      <span className="text-xl font-bold text-white tracking-tight">VEXI</span>
      <button
        onClick={openContact}
        className="text-sm text-slate-300 hover:text-white transition font-medium"
      >
        Contact Us
      </button>
    </motion.nav>
  );
}
