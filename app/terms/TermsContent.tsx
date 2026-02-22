'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ContactProvider } from '@/components/ContactWidget';
import LegalNav from '@/components/LegalNav';
import Footer from '@/components/Footer';

const sections = [
  {
    title: 'Who we are',
    content: (
      <>
        This site is operated by VEXI (sole trader trading as &apos;VEXI&apos;). By using this
        site, you agree to these terms.
      </>
    ),
  },
  {
    title: 'Use of this site',
    content:
      'This site is provided for informational purposes. You may browse and use the site for personal, non-commercial purposes. You must not misuse this site or attempt to gain unauthorised access to any part of it.',
  },
  {
    title: 'Intellectual property',
    content:
      'All content on this site, including text, images, and design, is owned by or licensed to VEXI. You may not reproduce or distribute any content without prior written permission.',
  },
  {
    title: 'Acceptable use',
    content: (
      <>
        You agree not to use the site for any unlawful purpose, submit false or misleading
        information via the contact form, attempt to gain unauthorised access to any part of the
        site, or transmit any malicious code, viruses, or disruptive material.
      </>
    ),
  },
  {
    title: 'Limitation of liability',
    content:
      'We make no warranties about the accuracy or completeness of the content on this site. To the fullest extent permitted by law, VEXI shall not be liable for any losses arising from your use of this site.',
  },
  {
    title: 'Third-party links',
    content:
      'The site may contain links to third-party websites. These links are provided for convenience only. VEXI has no control over those sites and accepts no responsibility for their content or privacy practices.',
  },
  {
    title: 'Changes to these terms',
    content:
      'We may update these terms from time to time. Continued use of the site after any changes constitutes acceptance of the new terms.',
  },
  {
    title: 'Governing law',
    content: 'These terms are governed by the laws of England and Wales.',
  },
];

export default function TermsContent() {
  return (
    <ContactProvider>
      <LegalNav />

      <main className="min-h-screen bg-[#0a0e1a] pt-36 pb-24 px-6">
        <div className="max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <Link
              href="/legal"
              className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-slate-500 hover:text-white transition-colors duration-200 mb-8"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-3.5 h-3.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
              Legal Hub
            </Link>
          </motion.div>

          <motion.h1
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-4xl md:text-5xl font-black tracking-tight text-white mb-3 mt-6"
          >
            Terms of Use
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.35 }}
            className="text-sm text-slate-500 mb-14"
          >
            Last updated: February 2026
          </motion.p>

          <div className="space-y-10">
            {sections.map((section, i) => (
              <motion.section
                key={section.title}
                initial={{ y: 20, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.6, delay: i * 0.05 }}
                className="pb-10 border-b border-white/10 last:border-b-0"
              >
                <h2 className="text-lg font-semibold text-white mb-3">{section.title}</h2>
                <p className="text-slate-400 leading-relaxed">{section.content}</p>
              </motion.section>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </ContactProvider>
  );
}
