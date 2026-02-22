import type { Metadata } from 'next';
import '@fontsource/inter/300.css';
import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';
import '@fontsource/inter/700.css';
import '@fontsource/inter/800.css';
import '@fontsource/inter/900.css';
import './globals.css';

export const metadata: Metadata = {
  title: 'Vexi — Technology Group',
  description:
    'Vexi is the technology group behind a growing portfolio of digital platforms including Event Flow. Building the future of digital experiences.',
  metadataBase: new URL('https://vexi.co.uk'),
  openGraph: {
    title: 'Vexi — Technology Group',
    description:
      'Vexi is the technology group behind a growing portfolio of digital platforms including Event Flow. Building the future of digital experiences.',
    url: 'https://vexi.co.uk',
    siteName: 'Vexi',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
  },
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className="antialiased bg-[#0a0e1a] text-white"
        style={{ fontFamily: 'Inter, sans-serif' }}
      >
        {children}
      </body>
    </html>
  );
}
