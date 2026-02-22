import type { Metadata } from 'next';
import Link from 'next/link';
import { ContactProvider } from '@/components/ContactWidget';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Legal Hub – VEXI',
  description: 'Legal information for VEXI, including our Privacy Policy and Terms of Use.',
};

const cards = [
  {
    href: '/privacy',
    title: 'Privacy Policy',
    description: 'How we collect, use, and protect your personal information.',
  },
  {
    href: '/terms',
    title: 'Terms of Use',
    description: 'The terms and conditions that apply when you use this site.',
  },
];

export default function LegalPage() {
  return (
    <ContactProvider>
      <Navbar />
      <main className="min-h-screen bg-[#0a0e1a] text-white px-6 pt-32 pb-20">
        <div className="max-w-2xl mx-auto">
          <Link
            href="/"
            className="text-sm text-slate-400 hover:text-white transition mb-10 inline-block"
          >
            ← Back to Home
          </Link>

          <h1 className="text-3xl md:text-4xl font-bold mb-4">Legal Hub</h1>
          <p className="text-slate-400 leading-relaxed mb-12">
            This page brings together the legal documents that govern your use of VEXI. We&apos;re
            committed to being transparent about how we operate and handle your information.
          </p>

          <div className="flex flex-col gap-4 mb-12">
            {cards.map((card) => (
              <Link
                key={card.href}
                href={card.href}
                className="group block p-6 rounded-xl border border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10 transition"
              >
                <p className="text-lg font-semibold text-white mb-1">
                  {card.title}
                  <span className="ml-2 opacity-40 group-hover:opacity-80 transition-opacity" aria-hidden="true">→</span>
                </p>
                <p className="text-sm text-slate-400">{card.description}</p>
              </Link>
            ))}
          </div>

          <section className="p-6 rounded-xl border border-white/10 bg-white/5 mb-8">
            <h2 className="text-base font-semibold text-white mb-2">Cookies</h2>
            <p className="text-sm text-slate-400 leading-relaxed">
              This site uses only essential cookies required for basic functionality. We do not use
              tracking or advertising cookies. No cookie consent banner is needed as we do not set
              non-essential cookies.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-white mb-2">Questions?</h2>
            <p className="text-sm text-slate-400 leading-relaxed">
              If you have any questions about these documents or how we handle your data, please use
              the contact form on our{' '}
              <Link href="/" className="text-blue-400 hover:underline">
                home page
              </Link>
              .
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </ContactProvider>
  );
}
