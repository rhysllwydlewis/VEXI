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
  title: 'VEXI - Technology Group',
  description:
    'VEXI is the technology group behind purpose-built digital platforms that scale from day one. Home of Event Flow, Chlo, and a growing portfolio of industry-transforming products.',
  metadataBase: new URL('https://vexi.co.uk'),
  openGraph: {
    title: 'VEXI - Technology Group',
    description:
      'VEXI is the technology group behind purpose-built digital platforms that scale from day one. Home of Event Flow, Chlo, and a growing portfolio of industry-transforming products.',
    url: 'https://vexi.co.uk',
    siteName: 'VEXI',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'VEXI - Technology Group',
    description:
      'VEXI is the technology group behind purpose-built digital platforms that scale from day one. Home of Event Flow, Chlo, and a growing portfolio of industry-transforming products.',
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '48x48' },
      { url: '/favicon.svg', type: 'image/svg+xml' },
    ],
    shortcut: '/favicon.ico',
    apple: '/apple-touch-icon.png',
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
