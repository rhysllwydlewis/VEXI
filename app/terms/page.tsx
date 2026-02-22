import type { Metadata } from 'next';
import Link from 'next/link';
import { ContactProvider } from '@/components/ContactWidget';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Terms of Use – VEXI',
  description: 'Terms of Use for VEXI.',
};

export default function TermsPage() {
  return (
    <ContactProvider>
      <Navbar />
      <main className="min-h-screen bg-[#0a0e1a] text-white px-6 pt-32 pb-20">
        <div className="max-w-3xl mx-auto">
          <Link
            href="/legal"
            className="text-sm text-slate-400 hover:text-white transition mb-10 inline-block"
          >
            ← Back to Legal Hub
          </Link>

        <h1 className="text-3xl md:text-4xl font-bold mb-2">Terms of Use</h1>
        <p className="text-slate-400 text-sm mb-10">
          Last updated: January 2026 &mdash;{' '}
          <span className="text-amber-400">
            Placeholder document — not legal advice.
          </span>
        </p>

        <div className="space-y-8 text-slate-300 leading-relaxed">
          <section>
            <h2 className="text-xl font-semibold text-white mb-3">1. Acceptance of Terms</h2>
            <p>
              By accessing or using the VEXI website at{' '}
              <a
                href="https://vexi.co.uk"
                className="text-blue-400 hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                vexi.co.uk
              </a>{' '}
              (&quot;Site&quot;), you agree to be bound by these Terms of Use. If you do not
              agree, please do not use the Site.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">2. About the Site</h2>
            <p>
              This Site is operated by VEXI (sole trader trading as &apos;VEXI&apos;). The Site provides
              information about VEXI and its portfolio of digital platforms. It is not a
              transactional website and does not collect payment information.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">3. Intellectual Property</h2>
            <p>
              All content on this Site — including text, graphics, logos, and code — is the
              property of VEXI or its content suppliers and is protected by applicable
              intellectual property laws. You may not reproduce, distribute, or create
              derivative works without our express written permission.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">4. Acceptable Use</h2>
            <p>You agree not to:</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Use the Site for any unlawful purpose</li>
              <li>Submit false or misleading information via the contact form</li>
              <li>Attempt to gain unauthorised access to any part of the Site</li>
              <li>
                Transmit any malicious code, viruses, or disruptive material
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">5. Disclaimer of Warranties</h2>
            <p>
              The Site is provided on an &quot;as is&quot; and &quot;as available&quot; basis. VEXI makes
              no warranties, express or implied, regarding the accuracy, completeness, or
              fitness for purpose of any content on the Site.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">6. Limitation of Liability</h2>
            <p>
              To the fullest extent permitted by law, VEXI shall not be liable for any
              indirect, incidental, or consequential damages arising from your use of or
              inability to use the Site.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">7. Third-Party Links</h2>
            <p>
              The Site may contain links to third-party websites (e.g. Event Flow). These
              links are provided for convenience only. VEXI has no control over those
              sites and accepts no responsibility for their content or privacy practices.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">8. Governing Law</h2>
            <p>
              These Terms are governed by and construed in accordance with the laws of
              England and Wales. Any disputes shall be subject to the exclusive jurisdiction
              of the courts of England and Wales.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">9. Changes to These Terms</h2>
            <p>
              We may revise these Terms from time to time. Updated terms will be posted on
              this page with a revised &quot;Last updated&quot; date.
            </p>
          </section>
        </div>
        </div>
      </main>
      <Footer />
    </ContactProvider>
  );
}
