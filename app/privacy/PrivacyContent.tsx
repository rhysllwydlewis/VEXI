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
        This policy is provided by VEXI (sole trader trading as &apos;VEXI&apos;). When we refer to
        &quot;we&quot;, &quot;us&quot;, or &quot;our&quot; in this policy, we mean VEXI. Our
        corporate website is{' '}
        <a
          href="https://vexi.co.uk"
          className="text-blue-400 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 rounded"
          target="_blank"
          rel="noopener noreferrer"
        >
          vexi.co.uk
        </a>
        . VEXI also operates platforms including{' '}
        <a
          href="https://event-flow.co.uk"
          className="text-blue-400 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 rounded"
          target="_blank"
          rel="noopener noreferrer"
        >
          Event Flow
        </a>{' '}
        (event-flow.co.uk) and{' '}
        <a
          href="https://chlo.co.uk"
          className="text-blue-400 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 rounded"
          target="_blank"
          rel="noopener noreferrer"
        >
          Chlo
        </a>{' '}
        (chlo.co.uk). This policy covers personal data collected across all VEXI-operated sites and
        platforms.
      </>
    ),
  },
  {
    title: 'Information we collect',
    content: (
      <>
        <span className="block mb-3">
          <strong className="text-white font-semibold">vexi.co.uk (this site):</strong> We may
          collect your name and email address when you use our contact form. We do not collect any
          information automatically beyond what is strictly necessary for the site to function.
        </span>
        <span className="block">
          <strong className="text-white font-semibold">VEXI platforms (e.g. Event Flow):</strong>{' '}
          When you register for or use a VEXI-operated platform, we may collect: account
          registration data (name, email address, hashed password, and email verification tokens);
          event planning details (dates, guest counts, budgets, and locations); photos and other
          media you upload; messages sent between users on the platform; reviews and ratings you
          submit; payment and subscription information processed via third-party providers such as
          Stripe; and usage data including search history, browsing behaviour, and error reports
          collected via tools such as Sentry.
        </span>
      </>
    ),
  },
  {
    title: 'How we use your information',
    content: (
      <>
        <span className="block mb-3">
          Information you provide via the contact form on vexi.co.uk is used solely to respond to
          your enquiry.
        </span>
        <span className="block">
          For data collected through VEXI&apos;s platforms, we use your information to: provide and
          maintain the marketplace service; process transactions and manage subscriptions; facilitate
          messaging between customers and suppliers; moderate user-generated content; deliver
          personalised recommendations; send service communications; and improve our platforms
          through analytics and error tracking. We do not use your data for marketing purposes or
          share it with third parties without your consent, except where required to deliver the
          services described above.
        </span>
      </>
    ),
  },
  {
    title: 'Legal basis for processing',
    content: (
      <>
        We rely on the following legal bases under the UK GDPR:
        <ul className="list-disc list-inside mt-3 space-y-2">
          <li>
            <strong className="text-white font-semibold">Legitimate interests</strong>{' '}
            (Article 6(1)(f)) — to respond to contact form enquiries, and for security, fraud
            prevention, and service improvement across our platforms.
          </li>
          <li>
            <strong className="text-white font-semibold">Contract performance</strong>{' '}
            (Article 6(1)(b)) — to provide platform accounts, process transactions, and deliver the
            services you have signed up for on VEXI-operated platforms.
          </li>
          <li>
            <strong className="text-white font-semibold">Consent</strong> (Article 6(1)(a)) — for
            optional cookies and analytics on VEXI platforms where you have provided your
            preference via the platform&apos;s cookie controls.
          </li>
        </ul>
      </>
    ),
  },
  {
    title: 'How long we keep your data',
    content:
      'We retain your personal data only as long as necessary for the purpose it was collected, after which it is securely deleted. Contact form submissions are retained for a short period sufficient to handle your enquiry. Data associated with platform accounts (such as Event Flow) is retained for the duration of your account and for a reasonable period thereafter, in accordance with our legal obligations.',
  },
  {
    title: 'Cookies',
    content: (
      <>
        <span className="block mb-3">
          <strong className="text-white font-semibold">vexi.co.uk:</strong> This site uses only
          essential cookies required for basic functionality. We do not use tracking or advertising
          cookies on this site.
        </span>
        <span className="block">
          <strong className="text-white font-semibold">VEXI platforms (e.g. Event Flow):</strong>{' '}
          VEXI-operated platforms may use additional cookies, including authentication cookies,
          preference cookies, and analytics cookies. Those platforms provide their own cookie
          preference controls, allowing you to manage your choices. Please refer to the relevant
          platform for details.
        </span>
      </>
    ),
  },
  {
    title: 'Your rights',
    content: (
      <>
        Under UK data protection law you have the right to access, correct, or request deletion of
        any personal data we hold about you. You may also lodge a complaint with the ICO at{' '}
        <a
          href="https://ico.org.uk"
          className="text-blue-400 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 rounded"
          target="_blank"
          rel="noopener noreferrer"
        >
          ico.org.uk
        </a>
        . To exercise these rights, please contact us using the form on our home page.
      </>
    ),
  },
  {
    title: 'Changes to this policy',
    content:
      'We may update this Privacy Policy from time to time. When we do, we will revise the "Last updated" date at the top of this page.',
  },
];

export default function PrivacyContent() {
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
            Privacy Policy
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
                <div className="text-slate-400 leading-relaxed">{section.content}</div>
              </motion.section>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </ContactProvider>
  );
}
