import type { Metadata } from 'next';
import PrivacyContent from './PrivacyContent';

export const metadata: Metadata = {
  title: 'Privacy Policy – VEXI',
  description:
    'Read the Privacy Policy for VEXI. Learn how we collect, use, and protect your personal information.',
};

export default function PrivacyPage() {
  return <PrivacyContent />;
}
