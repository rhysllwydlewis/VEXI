import type { Metadata } from 'next';
import Link from 'next/link';
import { ContactProvider } from '@/components/ContactWidget';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Privacy Policy – VEXI',
  description: 'Privacy Policy for VEXI Ltd.',
};

export default function PrivacyPage() {
  return (
    <ContactProvider>
      <Navbar />
      <main className="min-h-screen bg-[#0a0e1a] text-white px-6 pt-32 pb-20">
        <div className="max-w-3xl mx-auto">
          <Link
            href="/"
            className="text-sm text-slate-400 hover:text-white transition mb-10 inline-block"
          >
            ← Back to Home
          </Link>

        <h1 className="text-3xl md:text-4xl font-bold mb-2">Privacy Policy</h1>
        <p className="text-slate-400 text-sm mb-10">
          Last updated: January 2026 &mdash;{' '}
          <span className="text-amber-400">
            Placeholder document — not legal advice.
          </span>
        </p>

        <div className="space-y-8 text-slate-300 leading-relaxed">
          <section>
            <h2 className="text-xl font-semibold text-white mb-3">1. Who We Are</h2>
            <p>
              VEXI Ltd (&quot;VEXI&quot;, &quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) is a technology group
              registered in England and Wales. Our registered address and company number
              will be listed here once formally incorporated. Our website is{' '}
              <a
                href="https://vexi.co.uk"
                className="text-blue-400 hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                vexi.co.uk
              </a>
              .
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">2. What Data We Collect</h2>
            <p>When you submit our contact form, we collect:</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Your name</li>
              <li>Your email address</li>
              <li>The subject and body of your message</li>
            </ul>
            <p className="mt-3">
              We do not use cookies for tracking, run analytics, or share your personal
              data with third-party marketing services.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">3. How We Use Your Data</h2>
            <p>
              We use the information you provide solely to respond to your enquiry.
              Your data is not sold, rented, or shared with third parties except where
              required by law.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">4. Legal Basis for Processing</h2>
            <p>
              Our legal basis for processing contact form submissions is{' '}
              <strong className="text-white">legitimate interests</strong> — specifically, to
              respond to your messages — under Article 6(1)(f) of the UK GDPR.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">5. Data Retention</h2>
            <p>
              Contact form submissions are retained only as long as necessary to resolve your
              enquiry. We review retained data regularly and delete records that are no longer
              needed.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">6. Your Rights</h2>
            <p>Under UK data protection law you have the right to:</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Access the personal data we hold about you</li>
              <li>Correct inaccurate data</li>
              <li>Request erasure of your data</li>
              <li>Object to or restrict our processing</li>
              <li>Lodge a complaint with the ICO (<a href="https://ico.org.uk" className="text-blue-400 hover:underline" target="_blank" rel="noopener noreferrer">ico.org.uk</a>)</li>
            </ul>
            <p className="mt-3">
              To exercise any of these rights, please contact us using the form on our
              home page.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">7. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. When we do, we will revise
              the &quot;Last updated&quot; date at the top of this page.
            </p>
          </section>
        </div>
        </div>
      </main>
      <Footer />
    </ContactProvider>
  );
}
