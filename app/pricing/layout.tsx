import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Pricing Plans - HeyGPT Philippines',
  description: 'Choose the perfect plan for you. Start with our Free Forever plan or upgrade to Pro for unlimited features. 7-day free trial, no credit card required.',
  keywords: [
    'HeyGPT pricing',
    'AI chat pricing Philippines',
    'ChatGPT Philippines price',
    'free AI Philippines',
    'AI subscription plans',
    'Filipino AI pricing',
    'ChatGPT Pro Philippines',
    'AI tools pricing'
  ],
  openGraph: {
    title: 'Pricing Plans - HeyGPT Philippines',
    description: 'Start free or try Pro with a 7-day trial. Transparent pricing for Filipino users.',
    type: 'website',
    locale: 'en_PH',
    url: 'https://chatgpt-philippines.com/pricing'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Pricing Plans - HeyGPT Philippines',
    description: 'Start free or try Pro with a 7-day trial. Transparent pricing for Filipino users.'
  }
};

export default function PricingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
