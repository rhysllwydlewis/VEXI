import type { Metadata } from 'next';
import LegalHubContent from './LegalHubContent';

export const metadata: Metadata = {
  title: 'Legal Hub – VEXI',
  description: 'Legal information for VEXI, including our Privacy Policy and Terms of Use.',
};

export default function LegalPage() {
  return <LegalHubContent />;
}
