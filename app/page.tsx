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
      <Navbar />
      <main>
        <Hero />
        <About />
        <Portfolio />
      </main>
      <Footer />
    </ContactProvider>
  );
}
