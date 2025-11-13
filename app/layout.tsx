import type { Metadata } from 'next';
import Providers from '@/components/Providers';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://chatgpt-philippines.com'),
  title: {
    default: 'Free ChatGPT Philippines - AI Chat, Generator & Tools',
    template: '%s | ChatGPT Philippines'
  },
  description: 'Free ChatGPT Philippines powered by Claude AI. Image generator, translator, detector, character AI, plagiarism checker, and more AI tools for Filipino users.',
  keywords: [
    'ChatGPT Philippines',
    'free AI chat',
    'image generator',
    'AI detector',
    'translate Tagalog',
    'GPT chat',
    'Perplexity AI',
    'character AI',
    'plagiarism checker',
    'AI tools Philippines',
    'free ChatGPT',
    'AI assistant',
    'Claude AI'
  ],
  authors: [{ name: 'ChatGPT Philippines' }],
  creator: 'ChatGPT Philippines',
  publisher: 'ChatGPT Philippines',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'en_PH',
    url: 'https://chatgpt-philippines.com',
    title: 'Free ChatGPT Philippines - AI Chat, Generator & Tools',
    description: 'Free AI-powered tools for Filipinos: chat, generate images, translate, check plagiarism, and more.',
    siteName: 'ChatGPT Philippines',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free ChatGPT Philippines - AI Chat, Generator & Tools',
    description: 'Free AI-powered tools for Filipinos: chat, generate images, translate, check plagiarism, and more.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
