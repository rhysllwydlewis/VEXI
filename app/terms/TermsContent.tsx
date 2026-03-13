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
        These terms are provided by VEXI (sole trader trading as &apos;VEXI&apos;). VEXI operates
        the corporate website at{' '}
        <a
          href="https://vexi.co.uk"
          className="text-blue-400 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 rounded"
          target="_blank"
          rel="noopener noreferrer"
        >
          vexi.co.uk
        </a>{' '}
        as well as platforms including Event Flow (event-flow.co.uk) and Chlo (chlo.co.uk). By
        using any VEXI-operated site or platform, you agree to these terms.
      </>
    ),
  },
  {
    title: 'Use of this site',
    content: (
      <>
        The vexi.co.uk website is provided for informational purposes. You may browse it for
        personal, non-commercial use. You must not misuse this site or attempt to gain unauthorised
        access to any part of it.
        <br />
        <br />
        VEXI-operated platforms such as Event Flow provide interactive services including account
        registration, a marketplace for event services, messaging between users, and the ability to
        upload content. Certain features of these platforms require you to create an account and
        agree to any additional platform-specific terms presented at registration.
      </>
    ),
  },
  {
    title: 'User accounts',
    content: (
      <>
        Where a VEXI platform requires account registration, you are responsible for providing
        accurate information and keeping your login credentials secure. You must not share your
        account with others or allow unauthorised access. VEXI reserves the right to suspend or
        terminate accounts that violate these terms, engage in prohibited conduct, or are inactive
        for an extended period. If you believe your account has been compromised, please contact us
        immediately.
      </>
    ),
  },
  {
    title: 'User-generated content',
    content: (
      <>
        You retain ownership of content you upload to VEXI platforms, such as photos, reviews, and
        messages. By uploading content, you grant VEXI a non-exclusive, royalty-free licence to
        store, display, and use that content solely for the purpose of operating and improving the
        relevant platform. VEXI reserves the right to moderate, edit, or remove content that
        violates these terms or applicable law. You must not upload content that is unlawful,
        defamatory, harassing, obscene, or infringes the intellectual property rights of others.
      </>
    ),
  },
  {
    title: 'Marketplace conduct',
    content:
      'VEXI platforms such as Event Flow facilitate connections between event suppliers and customers. VEXI is not a party to any transaction or agreement made between suppliers and customers through its platforms. Suppliers are solely responsible for the accuracy of their listings, the services they provide, and compliance with applicable law. Customers are responsible for their interactions with suppliers. VEXI is not liable for disputes, losses, or damages arising from transactions between platform users.',
  },
  {
    title: 'Intellectual property',
    content:
      'All content on VEXI-operated sites, including text, images, and design, is owned by or licensed to VEXI. You may not reproduce or distribute any content without prior written permission.',
  },
  {
    title: 'Acceptable use',
    content: (
      <>
        You agree not to use any VEXI site or platform to: engage in any unlawful activity; submit
        false or misleading information, including fake reviews or inaccurate supplier listings;
        harass, abuse, or threaten other users via messaging or any other means; scrape, copy, or
        systematically extract data from any VEXI site; attempt to gain unauthorised access to any
        part of a VEXI site or platform; or transmit any malicious code, viruses, or disruptive
        material.
      </>
    ),
  },
  {
    title: 'Limitation of liability',
    content:
      'We make no warranties about the accuracy or completeness of the content on any VEXI site. To the fullest extent permitted by law, VEXI shall not be liable for any losses arising from your use of our sites or platforms, including losses arising from disputes between suppliers and customers on our platforms.',
  },
  {
    title: 'Third-party links',
    content:
      'VEXI sites may contain links to third-party websites. These links are provided for convenience only. VEXI has no control over those sites and accepts no responsibility for their content or privacy practices.',
  },
  {
    title: 'Changes to these terms',
    content:
      'We may update these terms from time to time. Continued use of any VEXI site or platform after any changes constitutes acceptance of the new terms.',
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
              className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-slate-500 hover:text-white transition-colors duration-200 mb-8 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40 rounded"
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
            Last updated: March 2026
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
