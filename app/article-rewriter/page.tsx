'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  FileText,
  RefreshCw,
  Copy,
  Check,
  Sparkles,
  Zap,
  Shield,
  Users,
  Briefcase,
  GraduationCap,
  Search,
  ChevronDown,
  ChevronRight,
  X,
  Clock,
  TrendingUp,
  BookOpen,
  Target,
} from 'lucide-react';

// Rewrite modes
const rewriteModes = [
  { value: 'standard', label: 'Standard', description: 'Balanced rewrite maintaining original meaning' },
  { value: 'creative', label: 'Creative', description: 'More creative rewording with varied vocabulary' },
  { value: 'formal', label: 'Formal', description: 'Professional and business-appropriate tone' },
  { value: 'casual', label: 'Casual', description: 'Relaxed and conversational style' },
  { value: 'academic', label: 'Academic', description: 'Scholarly tone for research papers' },
  { value: 'simple', label: 'Simplified', description: 'Easier to understand, simpler words' },
];

export default function ArticleRewriterPage() {
  const [originalText, setOriginalText] = useState('');
  const [rewrittenText, setRewrittenText] = useState('');
  const [mode, setMode] = useState('standard');
  const [preserveKeywords, setPreserveKeywords] = useState(true);
  const [isRewriting, setIsRewriting] = useState(false);
  const [charCount, setCharCount] = useState(0);
  const [copied, setCopied] = useState(false);
  const [guestRewrites, setGuestRewrites] = useState(0);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isLoadingRateLimit, setIsLoadingRateLimit] = useState(true);

  const maxChars = 5000;
  const MAX_FREE_REWRITES = 10;

  // Load rate limit status on mount
  useEffect(() => {
    const loadRateLimit = async () => {
      try {
        const response = await fetch('/api/rate-limit', {
          method: 'GET',
        });

        if (response.ok) {
          const rateLimit = await response.json();
          const remaining = Math.max(0, MAX_FREE_REWRITES - rateLimit.count);
          setGuestRewrites(remaining);

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

  // Update character count
  useEffect(() => {
    setCharCount(originalText.length);
  }, [originalText]);

  // Handle rewrite
  const handleRewrite = async () => {
    if (!originalText.trim()) {
      alert('Please enter text to rewrite');
      return;
    }

    if (guestRewrites <= 0) {
      setShowLoginModal(true);
      return;
    }

    setIsRewriting(true);

    try {
      // Increment rate limit counter
      const rateLimitResponse = await fetch('/api/rate-limit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'increment' }),
      });

      if (rateLimitResponse.ok) {
        const rateLimit = await rateLimitResponse.json();
        const remaining = Math.max(0, MAX_FREE_REWRITES - rateLimit.count);
        setGuestRewrites(remaining);

        if (rateLimit.blocked) {
          setShowLoginModal(true);
          setIsRewriting(false);
          return;
        }
      }

      // Call the rewrite API
      const response = await fetch('/api/article-rewrite', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: originalText,
          mode,
          preserveKeywords,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 429) {
          setShowLoginModal(true);
          setGuestRewrites(0);
          alert(data.message || 'Rewrite limit reached. Please sign up to continue.');
          return;
        }

        throw new Error(data.error || 'Rewrite failed');
      }

      setRewrittenText(data.rewritten);

    } catch (error: any) {
      console.error('Rewrite error:', error);
      alert(error.message || 'Failed to rewrite. Please try again.');
    } finally {
      setIsRewriting(false);
    }
  };

  // Copy to clipboard
  const handleCopy = async () => {
    if (!rewrittenText) return;

    try {
      await navigator.clipboard.writeText(rewrittenText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  // Load sample text
  const loadSampleText = () => {
    setOriginalText('Artificial intelligence has revolutionized the way we work and live. It has transformed industries, automated repetitive tasks, and enabled us to solve complex problems more efficiently. From healthcare to finance, AI is making a significant impact across various sectors. As technology continues to advance, we can expect even more innovative applications of artificial intelligence in our daily lives.');
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
            <span className="text-neutral-800 font-medium">Article Rewriter</span>
          </div>

          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <RefreshCw size={18} />
              <span>AI-Powered Rewriting</span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-neutral-900 mb-6 leading-tight">
              Article Rewriter -{' '}
              <span className="bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent">
                SEO Friendly
              </span>
            </h1>

            <p className="text-lg md:text-xl text-neutral-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              Rewrite articles, blog posts, and content while preserving meaning and improving quality.
              Perfect for content creators, marketers, and SEO professionals.
            </p>

            {/* Stats */}
            <div className="flex flex-wrap justify-center gap-8 md:gap-12 mb-8">
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-orange-600">50K+</div>
                <div className="text-sm text-neutral-600">Articles Rewritten</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-orange-600">6</div>
                <div className="text-sm text-neutral-600">Rewrite Modes</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-orange-600">Free</div>
                <div className="text-sm text-neutral-600">Forever</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Rewriter Interface */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4 md:px-6 max-w-7xl">
          <div className="bg-white rounded-2xl shadow-lg border border-neutral-200 overflow-hidden">
            {/* Mode Selection */}
            <div className="p-6 border-b border-neutral-200 bg-neutral-50">
              <label className="block text-sm font-medium text-neutral-700 mb-3">
                Rewrite Mode
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                {rewriteModes.map((modeOption) => (
                  <button
                    key={modeOption.value}
                    onClick={() => setMode(modeOption.value)}
                    className={`p-3 rounded-lg border-2 text-sm font-medium transition-all ${
                      mode === modeOption.value
                        ? 'border-orange-500 bg-orange-50 text-orange-700'
                        : 'border-neutral-200 bg-white text-neutral-700 hover:border-orange-300'
                    }`}
                    title={modeOption.description}
                  >
                    {modeOption.label}
                  </button>
                ))}
              </div>
              <div className="mt-3">
                <label className="flex items-center gap-2 text-sm text-neutral-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={preserveKeywords}
                    onChange={(e) => setPreserveKeywords(e.target.checked)}
                    className="w-4 h-4 text-orange-600 border-neutral-300 rounded focus:ring-orange-500"
                  />
                  <span>Preserve important keywords for SEO</span>
                </label>
              </div>
            </div>

            {/* Rewrite Panels */}
            <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-neutral-200">
              {/* Original Text Panel */}
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <label className="text-sm font-medium text-neutral-700">
                    Original Text
                  </label>
                  <button
                    onClick={loadSampleText}
                    className="text-sm text-orange-600 hover:text-orange-700 font-medium"
                  >
                    Load sample
                  </button>
                </div>

                <textarea
                  value={originalText}
                  onChange={(e) => {
                    if (e.target.value.length <= maxChars) {
                      setOriginalText(e.target.value);
                    }
                  }}
                  placeholder="Paste your article or text here to rewrite..."
                  className="w-full h-64 p-4 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none text-neutral-800"
                  style={{ fontSize: '16px' }}
                />

                <div className="flex items-center justify-between mt-3">
                  <div className="text-sm text-neutral-500">
                    {charCount} / {maxChars} characters
                  </div>
                  {originalText && (
                    <button
                      onClick={() => {
                        setOriginalText('');
                        setRewrittenText('');
                      }}
                      className="text-sm text-neutral-500 hover:text-neutral-700"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>

              {/* Rewritten Output Panel */}
              <div className="p-6 bg-neutral-50">
                <div className="flex items-center justify-between mb-4">
                  <label className="text-sm font-medium text-neutral-700">
                    Rewritten Text
                  </label>
                  {rewrittenText && (
                    <button
                      onClick={handleCopy}
                      className="p-2 rounded-lg hover:bg-white transition-colors"
                      title="Copy rewritten text"
                    >
                      {copied ? (
                        <Check size={18} className="text-green-600" />
                      ) : (
                        <Copy size={18} className="text-neutral-600" />
                      )}
                    </button>
                  )}
                </div>

                <div className="w-full h-64 p-4 bg-white border border-neutral-300 rounded-lg overflow-y-auto">
                  {isRewriting ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mb-3"></div>
                        <p className="text-neutral-600">Rewriting your content...</p>
                      </div>
                    </div>
                  ) : rewrittenText ? (
                    <p className="text-neutral-800 whitespace-pre-wrap" style={{ fontSize: '16px' }}>
                      {rewrittenText}
                    </p>
                  ) : (
                    <p className="text-neutral-400">Rewritten text will appear here...</p>
                  )}
                </div>

                <div className="mt-3 text-sm text-neutral-500">
                  {!isRewriting && rewrittenText && (
                    <span>{rewrittenText.length} characters</span>
                  )}
                </div>
              </div>
            </div>

            {/* Action Bar */}
            <div className="border-t border-neutral-200 p-6 bg-neutral-50">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-sm text-neutral-600">
                  Guest rewrites remaining: <span className="font-semibold text-orange-600">{guestRewrites}</span>
                </div>
                <button
                  onClick={handleRewrite}
                  disabled={isRewriting || !originalText.trim()}
                  className="w-full sm:w-auto btn-primary btn-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isRewriting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Rewriting...
                    </>
                  ) : (
                    <>
                      <RefreshCw size={20} />
                      Rewrite Now
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
              Why Use Our Article Rewriter?
            </h2>
            <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
              Advanced AI technology for professional content rewriting
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Target,
                title: 'Preserves Meaning',
                description: 'Maintains the original message while improving clarity',
                color: 'text-blue-600',
                bg: 'bg-blue-50',
              },
              {
                icon: Search,
                title: 'SEO Optimized',
                description: 'Keeps important keywords for search engine ranking',
                color: 'text-purple-600',
                bg: 'bg-purple-50',
              },
              {
                icon: Zap,
                title: 'Instant Results',
                description: 'Rewrite thousands of words in seconds',
                color: 'text-orange-600',
                bg: 'bg-orange-50',
              },
              {
                icon: Shield,
                title: 'Plagiarism Free',
                description: 'Generate unique content that passes plagiarism checks',
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
              Rewrite content for any purpose
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                icon: Users,
                title: 'Content Creators',
                description: 'Repurpose existing content for different platforms. Create multiple versions of articles for various audiences without starting from scratch.',
                stats: 'Blogs & Articles',
              },
              {
                icon: Briefcase,
                title: 'SEO Professionals',
                description: 'Improve content quality while maintaining keyword density. Rewrite underperforming articles to boost search rankings.',
                stats: 'SEO',
              },
              {
                icon: GraduationCap,
                title: 'Students & Researchers',
                description: 'Paraphrase research findings and academic content. Improve clarity and readability of technical writing.',
                stats: 'Academic',
              },
              {
                icon: TrendingUp,
                title: 'Marketing Teams',
                description: 'Refresh marketing copy and product descriptions. Create variations for A/B testing and campaign optimization.',
                stats: 'Marketing',
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
              Everything you need to know about article rewriting
            </p>
          </div>

          <div className="space-y-4">
            {[
              {
                question: 'Will the rewritten content pass plagiarism checks?',
                answer: 'Yes! Our AI generates unique content that maintains the original meaning but uses different wording and sentence structure, ensuring it passes plagiarism detection tools.',
              },
              {
                question: 'How does keyword preservation work?',
                answer: 'When enabled, our AI identifies important keywords and phrases in your original text and ensures they are retained in the rewritten version to maintain SEO value.',
              },
              {
                question: 'Can I rewrite content in different languages?',
                answer: 'Currently, our rewriter works best with English content. We are working on adding support for Filipino and other languages soon.',
              },
              {
                question: 'What is the difference between rewrite modes?',
                answer: 'Each mode changes the style and tone: Standard balances readability and accuracy, Creative uses more varied vocabulary, Formal is professional, Casual is conversational, Academic is scholarly, and Simplified uses easier words.',
              },
              {
                question: 'Is the rewritten content ready to publish?',
                answer: 'The AI provides high-quality rewrites, but we recommend reviewing and editing the output to ensure it meets your specific requirements and style preferences.',
              },
              {
                question: 'How long can my article be?',
                answer: 'You can rewrite articles up to 5,000 characters at a time. For longer articles, you can rewrite them in sections and combine the results.',
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
            Start Rewriting Articles Now
          </h2>
          <p className="text-lg md:text-xl text-orange-50 mb-8 max-w-2xl mx-auto">
            Join thousands of content creators using our AI to improve and repurpose their content
          </p>
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="inline-flex items-center gap-3 bg-white text-orange-600 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-orange-50 transition-all duration-200 hover:scale-105 shadow-lg"
          >
            <RefreshCw size={24} />
            Rewrite Article Now - Free
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
                <RefreshCw size={32} />
              </div>
              <h3 className="text-2xl font-bold text-neutral-900 mb-2">
                Rewrite Limit Reached
              </h3>
              <p className="text-neutral-600">
                Create a free account for unlimited article rewriting
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
              No credit card required. Get unlimited rewrites instantly.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
