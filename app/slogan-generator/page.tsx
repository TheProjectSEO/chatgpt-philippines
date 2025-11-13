'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Lightbulb,
  Sparkles,
  Copy,
  Check,
  Zap,
  Shield,
  Users,
  Briefcase,
  Store,
  TrendingUp,
  ChevronDown,
  ChevronRight,
  X,
  Hash,
  MessageSquare,
  Award,
  Target,
  Rocket,
} from 'lucide-react';

// Industry options
const industries = [
  { value: 'general', label: 'General Business' },
  { value: 'tech', label: 'Technology' },
  { value: 'food', label: 'Food & Beverage' },
  { value: 'fashion', label: 'Fashion & Apparel' },
  { value: 'health', label: 'Health & Wellness' },
  { value: 'education', label: 'Education' },
  { value: 'real-estate', label: 'Real Estate' },
  { value: 'finance', label: 'Finance' },
  { value: 'sports', label: 'Sports & Fitness' },
  { value: 'entertainment', label: 'Entertainment' },
];

// Style options
const styles = [
  { value: 'catchy', label: 'Catchy', description: 'Memorable and attention-grabbing' },
  { value: 'professional', label: 'Professional', description: 'Business and corporate' },
  { value: 'playful', label: 'Playful', description: 'Fun and lighthearted' },
  { value: 'inspirational', label: 'Inspirational', description: 'Motivating and uplifting' },
  { value: 'modern', label: 'Modern', description: 'Contemporary and trendy' },
  { value: 'classic', label: 'Classic', description: 'Timeless and traditional' },
];

export default function SloganGeneratorPage() {
  const [businessName, setBusinessName] = useState('');
  const [description, setDescription] = useState('');
  const [industry, setIndustry] = useState('general');
  const [style, setStyle] = useState('catchy');
  const [keywords, setKeywords] = useState('');
  const [slogans, setSlogans] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [guestGenerations, setGuestGenerations] = useState(0);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isLoadingRateLimit, setIsLoadingRateLimit] = useState(true);

  const MAX_FREE_GENERATIONS = 10;

  // Load rate limit status on mount
  useEffect(() => {
    const loadRateLimit = async () => {
      try {
        const response = await fetch('/api/rate-limit', {
          method: 'GET',
        });

        if (response.ok) {
          const rateLimit = await response.json();
          const remaining = Math.max(0, MAX_FREE_GENERATIONS - rateLimit.count);
          setGuestGenerations(remaining);

          if (rateLimit.blocked) {
            setShowLoginModal(true);
          }
        }
      } catch (error) {
        console.error('Failed to load rate limit:', error);
      } finally {
        setIsLoadingRateLimit(false);
      }
    };

    loadRateLimit();
  }, []);

  // Handle slogan generation
  const handleGenerate = async () => {
    if (!businessName.trim()) {
      alert('Please enter your business name');
      return;
    }

    if (guestGenerations <= 0) {
      setShowLoginModal(true);
      return;
    }

    setIsGenerating(true);

    try {
      // Increment rate limit counter
      const rateLimitResponse = await fetch('/api/rate-limit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'increment' }),
      });

      if (rateLimitResponse.ok) {
        const rateLimit = await rateLimitResponse.json();
        const remaining = Math.max(0, MAX_FREE_GENERATIONS - rateLimit.count);
        setGuestGenerations(remaining);

        if (rateLimit.blocked) {
          setShowLoginModal(true);
          setIsGenerating(false);
          return;
        }
      }

      // Call the slogan generator API
      const response = await fetch('/api/slogan-generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          businessName,
          description,
          industry,
          style,
          keywords,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 429) {
          setShowLoginModal(true);
          setGuestGenerations(0);
          alert(data.message || 'Generation limit reached. Please sign up to continue.');
          return;
        }

        throw new Error(data.error || 'Generation failed');
      }

      setSlogans(data.slogans);

    } catch (error: any) {
      console.error('Generation error:', error);
      alert(error.message || 'Failed to generate slogans. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Copy to clipboard
  const handleCopy = async (slogan: string, index: number) => {
    try {
      await navigator.clipboard.writeText(slogan);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-orange-50 via-white to-purple-50 pt-24 pb-16 md:pt-32 md:pb-24">
        <div className="container mx-auto px-4 md:px-6 max-w-7xl">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-neutral-600 mb-6">
            <Link href="/" className="hover:text-primary-600 transition-colors">
              Home
            </Link>
            <ChevronRight size={16} />
            <span className="text-neutral-800 font-medium">Slogan Generator</span>
          </div>

          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Lightbulb size={18} />
              <span>AI-Powered Slogans</span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-neutral-900 mb-6 leading-tight">
              Slogan Generator -{' '}
              <span className="bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent">
                Catchy & Creative
              </span>
            </h1>

            <p className="text-lg md:text-xl text-neutral-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              Create memorable slogans and taglines for your business, brand, or campaign.
              Perfect for startups, marketers, and entrepreneurs.
            </p>

            {/* Stats */}
            <div className="flex flex-wrap justify-center gap-8 md:gap-12 mb-8">
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-orange-600">25K+</div>
                <div className="text-sm text-neutral-600">Slogans Created</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-orange-600">10</div>
                <div className="text-sm text-neutral-600">Per Generation</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-orange-600">Free</div>
                <div className="text-sm text-neutral-600">Forever</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Generator Interface */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4 md:px-6 max-w-7xl">
          <div className="bg-white rounded-2xl shadow-lg border border-neutral-200 overflow-hidden">
            {/* Input Form */}
            <div className="p-6 md:p-8">
              <div className="space-y-6">
                {/* Business Name */}
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Business or Brand Name *
                  </label>
                  <input
                    type="text"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    placeholder="e.g., TechFlow, Bistro Manila, FitLife"
                    className="w-full p-4 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-neutral-800"
                    style={{ fontSize: '16px' }}
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    What Does Your Business Do?
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Brief description of your business, products, or services..."
                    className="w-full h-24 p-4 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none text-neutral-800"
                    style={{ fontSize: '16px' }}
                  />
                </div>

                {/* Industry & Style */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Industry
                    </label>
                    <select
                      value={industry}
                      onChange={(e) => setIndustry(e.target.value)}
                      className="w-full p-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-neutral-800"
                    >
                      {industries.map((ind) => (
                        <option key={ind.value} value={ind.value}>
                          {ind.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Style
                    </label>
                    <select
                      value={style}
                      onChange={(e) => setStyle(e.target.value)}
                      className="w-full p-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-neutral-800"
                    >
                      {styles.map((styleOption) => (
                        <option key={styleOption.value} value={styleOption.value}>
                          {styleOption.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Keywords */}
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Keywords to Include (Optional)
                  </label>
                  <input
                    type="text"
                    value={keywords}
                    onChange={(e) => setKeywords(e.target.value)}
                    placeholder="e.g., innovation, quality, trust"
                    className="w-full p-4 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-neutral-800"
                  />
                </div>
              </div>
            </div>

            {/* Generated Slogans */}
            <div className="p-6 md:p-8 bg-neutral-50 border-t border-neutral-200">
              <div className="mb-4">
                <label className="text-sm font-medium text-neutral-700">
                  Generated Slogans
                </label>
              </div>

              <div className="space-y-3">
                {isGenerating ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                      <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mb-3"></div>
                      <p className="text-neutral-600">Generating creative slogans...</p>
                    </div>
                  </div>
                ) : slogans.length > 0 ? (
                  slogans.map((slogan, idx) => (
                    <div
                      key={idx}
                      className="bg-white p-4 rounded-lg border border-neutral-200 hover:border-orange-300 transition-all group flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <div className="bg-orange-100 text-orange-600 w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0">
                          {idx + 1}
                        </div>
                        <p className="text-neutral-800 font-medium flex-1">{slogan}</p>
                      </div>
                      <button
                        onClick={() => handleCopy(slogan, idx)}
                        className="p-2 rounded-lg hover:bg-neutral-100 transition-colors flex-shrink-0"
                        title="Copy slogan"
                      >
                        {copiedIndex === idx ? (
                          <Check size={18} className="text-green-600" />
                        ) : (
                          <Copy size={18} className="text-neutral-600" />
                        )}
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12 text-neutral-400">
                    <Lightbulb size={48} className="mx-auto mb-3 opacity-50" />
                    <p>Your generated slogans will appear here...</p>
                  </div>
                )}
              </div>
            </div>

            {/* Action Bar */}
            <div className="border-t border-neutral-200 p-6 bg-neutral-50">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-sm text-neutral-600">
                  Guest generations remaining: <span className="font-semibold text-orange-600">{guestGenerations}</span>
                </div>
                <button
                  onClick={handleGenerate}
                  disabled={isGenerating || !businessName.trim()}
                  className="w-full sm:w-auto btn-primary btn-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isGenerating ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles size={20} />
                      Generate Slogans
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-24 bg-neutral-50">
        <div className="container mx-auto px-4 md:px-6 max-w-7xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-4">
              Why Use Our Slogan Generator?
            </h2>
            <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
              Create memorable slogans that capture your brand essence
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Lightbulb,
                title: 'Creative Ideas',
                description: 'Get unique and memorable slogan suggestions instantly',
                color: 'text-blue-600',
                bg: 'bg-blue-50',
              },
              {
                icon: Target,
                title: 'Brand Focused',
                description: 'Slogans tailored to your industry and brand identity',
                color: 'text-purple-600',
                bg: 'bg-purple-50',
              },
              {
                icon: Zap,
                title: 'Multiple Options',
                description: 'Generate 10 different slogans in seconds',
                color: 'text-orange-600',
                bg: 'bg-orange-50',
              },
              {
                icon: Award,
                title: 'Professional Quality',
                description: 'AI-powered slogans ready for marketing campaigns',
                color: 'text-green-600',
                bg: 'bg-green-50',
              },
            ].map((feature, idx) => (
              <div
                key={idx}
                className="bg-white p-6 rounded-xl border border-neutral-200 hover:shadow-lg transition-shadow duration-200"
              >
                <div className={`${feature.bg} ${feature.color} w-12 h-12 rounded-lg flex items-center justify-center mb-4`}>
                  <feature.icon size={24} />
                </div>
                <h3 className="text-xl font-semibold text-neutral-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-neutral-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="py-16 md:py-24 bg-gradient-to-br from-orange-50 to-purple-50">
        <div className="container mx-auto px-4 md:px-6 max-w-7xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-4">
              Perfect For
            </h2>
            <p className="text-lg text-neutral-600">
              Create slogans for any business or campaign
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                icon: Rocket,
                title: 'Startups & New Businesses',
                description: 'Launch your brand with a memorable slogan that captures your mission and values. Make a strong first impression on customers.',
                stats: 'Launch',
              },
              {
                icon: Store,
                title: 'Small Businesses',
                description: 'Stand out from competitors with catchy taglines. Perfect for local businesses, restaurants, and retail stores.',
                stats: 'Local',
              },
              {
                icon: TrendingUp,
                title: 'Marketing Campaigns',
                description: 'Create impactful slogans for advertising campaigns, product launches, and promotional events.',
                stats: 'Campaigns',
              },
              {
                icon: Briefcase,
                title: 'Brand Rebranding',
                description: 'Refresh your brand identity with a new slogan that reflects your evolved business vision and goals.',
                stats: 'Rebrand',
              },
            ].map((useCase, idx) => (
              <div
                key={idx}
                className="bg-white p-8 rounded-2xl border border-neutral-200 hover:shadow-xl transition-shadow duration-300"
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className="bg-orange-100 text-orange-600 w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0">
                    <useCase.icon size={24} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-xl font-semibold text-neutral-900">
                        {useCase.title}
                      </h3>
                      <span className="text-xs font-medium text-orange-600 bg-orange-100 px-3 py-1 rounded-full">
                        {useCase.stats}
                      </span>
                    </div>
                    <p className="text-neutral-600 leading-relaxed">
                      {useCase.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 md:py-24 bg-neutral-50">
        <div className="container mx-auto px-4 md:px-6 max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-lg text-neutral-600">
              Everything you need to know about slogan generation
            </p>
          </div>

          <div className="space-y-4">
            {[
              {
                question: 'How many slogans will I get?',
                answer: 'Each generation provides 10 unique slogan options tailored to your business. You can generate multiple sets to get more options.',
              },
              {
                question: 'Can I use the generated slogans commercially?',
                answer: 'Yes! All generated slogans are yours to use freely for your business, marketing materials, and branding. We recommend checking trademark availability for your final choice.',
              },
              {
                question: 'What makes a good slogan?',
                answer: 'A good slogan is memorable, concise, reflects your brand values, and resonates with your target audience. Our AI creates slogans that are catchy, meaningful, and professionally crafted.',
              },
              {
                question: 'Can I specify the length of the slogan?',
                answer: 'The AI automatically generates slogans of varying lengths, typically between 3-8 words. This range is ideal for memorability and impact.',
              },
              {
                question: 'How do I choose the best slogan?',
                answer: 'Consider your brand identity, target audience, and marketing goals. Test your favorites with colleagues, friends, or potential customers. Choose one that is memorable, authentic, and aligns with your brand.',
              },
              {
                question: 'Can I modify the generated slogans?',
                answer: 'Absolutely! Use the generated slogans as inspiration and feel free to modify them to better fit your brand. Combine elements from different suggestions or adjust wording as needed.',
              },
            ].map((faq, idx) => (
              <details
                key={idx}
                className="bg-white p-6 rounded-xl border border-neutral-200 hover:shadow-md transition-shadow duration-200 group"
              >
                <summary className="font-semibold text-neutral-900 cursor-pointer list-none flex items-center justify-between">
                  <span className="flex-1">{faq.question}</span>
                  <ChevronDown className="text-orange-600 transform group-open:rotate-180 transition-transform duration-200 flex-shrink-0 ml-4" size={20} />
                </summary>
                <p className="text-neutral-600 mt-4 leading-relaxed">
                  {faq.answer}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-gradient-to-br from-orange-500 to-orange-600 text-white">
        <div className="container mx-auto px-4 md:px-6 max-w-4xl text-center">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
            Create Your Perfect Slogan Today
          </h2>
          <p className="text-lg md:text-xl text-orange-50 mb-8 max-w-2xl mx-auto">
            Join thousands of businesses using our AI to create memorable brand slogans
          </p>
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="inline-flex items-center gap-3 bg-white text-orange-600 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-orange-50 transition-all duration-200 hover:scale-105 shadow-lg"
          >
            <Lightbulb size={24} />
            Generate Slogans Now - Free
          </button>
        </div>
      </section>

      {/* Login Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8 relative">
            <button
              onClick={() => setShowLoginModal(false)}
              className="absolute top-4 right-4 text-neutral-500 hover:text-neutral-700"
            >
              <X size={24} />
            </button>

            <div className="text-center mb-6">
              <div className="bg-orange-100 text-orange-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lightbulb size={32} />
              </div>
              <h3 className="text-2xl font-bold text-neutral-900 mb-2">
                Generation Limit Reached
              </h3>
              <p className="text-neutral-600">
                Create a free account for unlimited slogan generation
              </p>
            </div>

            <div className="space-y-3">
              <Link
                href="/signup"
                className="block w-full btn-primary btn-lg text-center"
              >
                Sign Up - Free Forever
              </Link>
              <Link
                href="/login"
                className="block w-full btn-secondary btn-lg text-center"
              >
                Log In
              </Link>
            </div>

            <p className="text-sm text-neutral-500 text-center mt-4">
              No credit card required. Get unlimited slogans instantly.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
