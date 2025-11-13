import type { Metadata } from 'next';
import PlagiarismCheckerHero from '@/components/plagiarism/PlagiarismCheckerHero';
import TrustIndicators from '@/components/plagiarism/TrustIndicators';
import HowItWorks from '@/components/plagiarism/HowItWorks';
import BenefitsGrid from '@/components/plagiarism/BenefitsGrid';
import PersonasSection from '@/components/plagiarism/PersonasSection';
import FeaturesShowcase from '@/components/plagiarism/FeaturesShowcase';
import AcademicIntegrity from '@/components/plagiarism/AcademicIntegrity';
import IntegrationCapabilities from '@/components/plagiarism/IntegrationCapabilities';
import FAQSection from '@/components/plagiarism/FAQSection';
import ConversionCTA from '@/components/plagiarism/ConversionCTA';

export const metadata: Metadata = {
  title: 'Free Plagiarism Checker Philippines | Thesis & Research Paper Checker | ChatGPT PH',
  description: 'Check your thesis, research papers, and academic work for plagiarism. Free AI-powered plagiarism detection tool for Filipino students, teachers, and professionals. Supports Tagalog and English.',
  keywords: [
    'plagiarism checker philippines',
    'free plagiarism checker',
    'thesis plagiarism check',
    'research paper checker',
    'academic integrity philippines',
    'turnitin alternative',
    'filipino plagiarism detector',
    'check thesis plagiarism',
    'college paper checker',
    'tagalog plagiarism check'
  ],
  openGraph: {
    title: 'Free Plagiarism Checker Philippines | ChatGPT PH',
    description: 'AI-powered plagiarism detection for Filipino students and professionals. Check thesis, research papers, and academic work instantly.',
    type: 'website',
    locale: 'en_PH',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free Plagiarism Checker Philippines | ChatGPT PH',
    description: 'AI-powered plagiarism detection for Filipino students and professionals.',
  },
  alternates: {
    canonical: 'https://chatgpt.com.ph/plagiarism-checker',
  },
};

export default function PlagiarismCheckerPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Hero Section with Interactive Checker */}
      <PlagiarismCheckerHero />

      {/* Trust Indicators */}
      <TrustIndicators />

      {/* How It Works */}
      <HowItWorks />

      {/* Benefits Grid */}
      <BenefitsGrid />

      {/* User Personas */}
      <PersonasSection />

      {/* Features Showcase */}
      <FeaturesShowcase />

      {/* Academic Integrity Section */}
      <AcademicIntegrity />

      {/* Integration Capabilities */}
      <IntegrationCapabilities />

      {/* Conversion CTA */}
      <ConversionCTA />

      {/* FAQ Section */}
      <FAQSection />

      {/* Final CTA */}
      <section className="py-16 bg-gradient-to-r from-emerald-600 to-teal-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Protect Your Academic Integrity Today
          </h2>
          <p className="text-xl text-emerald-50 mb-8">
            Join thousands of Filipino students and professionals who trust ChatGPT Philippines
          </p>
          <a
            href="/api/auth/login"
            className="inline-flex items-center gap-2 bg-white text-emerald-600 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-gray-50 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            Start Checking Now - It's Free
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </a>
        </div>
      </section>
    </main>
  );
}
