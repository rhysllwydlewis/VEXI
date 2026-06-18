import type { Metadata } from 'next';
import { ContactProvider } from '@/components/ContactWidget';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import About from '@/components/About';
import Portfolio from '@/components/Portfolio';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  alternates: {
    canonical: '/',
  },
};

const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'VEXI',
  url: 'https://vexi.co.uk',
  description:
    'VEXI is the technology group behind purpose-built digital platforms that scale from day one.',
};

export default function Home() {
  return (
    <ContactProvider>
      <Navbar />
      <main>
        <Hero />
        <About />
        <Portfolio />
      </main>
      <Footer />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
      />
    </ContactProvider>
  );
}
