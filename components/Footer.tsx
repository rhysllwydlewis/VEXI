'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useContact } from '@/components/ContactWidget';

export default function Footer() {
  const { openContact } = useContact();

  return (
    <motion.footer
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      className="bg-[#060a12] border-t border-white/5 py-12 px-6"
    >
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="text-sm text-slate-500">
          © 2026 VEXI Ltd. All rights reserved.
        </p>
        <div className="flex items-center gap-6 text-sm">
          <Link href="/privacy" className="text-slate-500 hover:text-slate-300 transition">
            Privacy Policy
          </Link>
          <Link href="/terms" className="text-slate-500 hover:text-slate-300 transition">
            Terms
          </Link>
          <button
            type="button"
            onClick={openContact}
            className="text-slate-500 hover:text-blue-400 transition cursor-pointer"
          >
            Contact Us
          </button>
        </div>
      </div>
    </motion.footer>
  );
}
