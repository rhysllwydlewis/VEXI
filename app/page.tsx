'use client';

import { ContactProvider } from '@/components/ContactWidget';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import About from '@/components/About';
import Portfolio from '@/components/Portfolio';
import Footer from '@/components/Footer';

export default function Home() {
  return (
    <ContactProvider>
      {/* Skip to main content — visible on focus for keyboard/screen-reader users */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:rounded-lg focus:bg-blue-500 focus:text-white focus:font-semibold focus:text-sm focus:shadow-lg"
      >
        Skip to main content
      </a>
      <Navbar />
      <main id="main-content">
        <Hero />
        <About />
        <Portfolio />
      </main>
      <Footer />
    </ContactProvider>
  );
}
