import type { Metadata } from 'next';
import Providers from '../components/Providers';
import Navbar from '../components/Navbar';
import RegisterServiceWorker from './register-sw';
import PWAInstallPrompt from '../components/PWAInstallPrompt';
import { WebVitals } from './web-vitals';
import { inter, plusJakartaSans } from './fonts';
import SchemaMarkup from '../components/seo/SchemaMarkup';
import { generateOrganizationSchema, generateWebPageSchema } from '@/lib/seo';
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
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'ChatGPT PH',
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
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
    userScalable: true,
    viewportFit: 'cover',
  },
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#E8844A' },
    { media: '(prefers-color-scheme: dark)', color: '#D46D38' },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Generate site-wide organization schema
  const organizationSchema = generateOrganizationSchema({
    name: 'ChatGPT Philippines',
    url: 'https://chatgpt-philippines.com',
    logo: 'https://chatgpt-philippines.com/logo.png',
    description: 'Free AI-powered tools for Filipinos: chat, translate, check grammar, detect AI, and more.',
    socialProfiles: [
      'https://facebook.com/chatgptph',
      'https://twitter.com/chatgptph',
    ],
  });

  const websiteSchema = generateWebPageSchema({
    name: 'ChatGPT Philippines',
    description: 'Free AI-powered tools for Filipinos including chat, image generation, translation, plagiarism checker, and more.',
    url: 'https://chatgpt-philippines.com',
    siteName: 'ChatGPT Philippines',
    siteUrl: 'https://chatgpt-philippines.com',
  });

  return (
    <html lang="en" className={`${inter.variable} ${plusJakartaSans.variable}`}>
      <head>
        {/* PWA Meta Tags */}
        <link rel="apple-touch-icon" sizes="180x180" href="/icons/icon-192x192.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/icons/icon-192x192.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/icons/icon-192x192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="ChatGPT PH" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-TileColor" content="#E8844A" />
        <meta name="msapplication-tap-highlight" content="no" />

        {/* Structured Data - Organization & WebSite Schema */}
        <SchemaMarkup schema={organizationSchema} id="organization-schema" />
        <SchemaMarkup schema={websiteSchema} id="website-schema" />
      </head>
      <body className={inter.className}>
        <WebVitals />
        <RegisterServiceWorker />
        <PWAInstallPrompt />
        <Navbar />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
