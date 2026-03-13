import type { Metadata } from 'next';
import TermsContent from './TermsContent';

export const metadata: Metadata = {
  title: 'Terms of Use – VEXI',
  description:
    'Read the Terms of Use for VEXI. Understand the terms and conditions that apply when you use VEXI and its operated platforms, including Event Flow.',
};

export default function TermsPage() {
  return <TermsContent />;
}
