'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  RefreshCw,
  Copy,
  Check,
  Sparkles,
  Zap,
  Shield,
  ChevronDown,
  ChevronRight,
  X,
  BookOpen,
  GraduationCap,
  Briefcase,
  Users,
  FileText,
} from 'lucide-react';

export default function ParaphraserPage() {
  const [sourceText, setSourceText] = useState('');
  const [paraphrasedText, setParaphrasedText] = useState('');
  const [paraphraseMode, setParaphraseMode] = useState('standard');
  const [isParaphrasing, setIsParaphrasing] = useState(false);
  const [charCount, setCharCount] = useState(0);
  const [copied, setCopied] = useState(false);
  const [guestParaphrases, setGuestParaphrases] = useState(0);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isLoadingRateLimit, setIsLoadingRateLimit] = useState(true);

  const maxChars = 3000;
  const MAX_FREE_PARAPHRASES = 10;

  // Load rate limit status on mount
  useEffect(() => {
    const loadRateLimit = async () => {
      try {
        const response = await fetch('/api/rate-limit', {
          method: 'GET',
        });

        if (response.ok) {
          const rateLimit = await response.json();
          const remaining = Math.max(0, MAX_FREE_PARAPHRASES - rateLimit.count);
          setGuestParaphrases(remaining);

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
    setCharCount(sourceText.length);
  }, [sourceText]);

  // Handle paraphrasing
  const handleParaphrase = async () => {
    if (!sourceText.trim()) {
      alert('Please enter text to paraphrase');
      return;
    }

    if (guestParaphrases <= 0) {
      setShowLoginModal(true);
      return;
    }

    setIsParaphrasing(true);

    try {
      // Increment rate limit counter
      const rateLimitResponse = await fetch('/api/rate-limit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'increment' }),
      });

      if (rateLimitResponse.ok) {
        const rateLimit = await rateLimitResponse.json();
        const remaining = Math.max(0, MAX_FREE_PARAPHRASES - rateLimit.count);
        setGuestParaphrases(remaining);

        if (rateLimit.blocked) {
          setShowLoginModal(true);
          setIsParaphrasing(false);
          return;
        }
      }

      // Call the paraphrasing API
      const response = await fetch('/api/paraphrase', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: sourceText,
          mode: paraphraseMode,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 429) {
          setShowLoginModal(true);
          setGuestParaphrases(0);
          alert(data.message || 'Paraphrase limit reached. Please sign up to continue.');
          return;
        }
        throw new Error(data.error || 'Paraphrasing failed');
      }

      setParaphrasedText(data.paraphrased);

    } catch (error: any) {
      console.error('Paraphrasing error:', error);
      alert(error.message || 'Failed to paraphrase. Please try again.');
    } finally {
      setIsParaphrasing(false);
    }
  };

  // Copy to clipboard
  const handleCopy = async () => {
    if (!paraphrasedText) return;

    try {
      await navigator.clipboard.writeText(paraphrasedText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-green-50 via-white to-blue-50 pt-24 pb-16 md:pt-32 md:pb-24">
        <div className="container mx-auto px-4 md:px-6 max-w-7xl">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-neutral-600 mb-6">
            <Link href="/" className="hover:text-primary-600 transition-colors">
              Home
            </Link>
            <ChevronRight size={16} />
            <span className="text-neutral-800 font-medium">Paraphrasing Tool</span>
          </div>

          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <RefreshCw size={18} />
              <span>Rewrite & Rephrase</span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-neutral-900 mb-6 leading-tight">
              Paraphrasing Tool -{' '}
              <span className="bg-gradient-to-r from-green-500 to-blue-600 bg-clip-text text-transparent">
                Rewrite Anything
              </span>
            </h1>

            <p className="text-lg md:text-xl text-neutral-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              Rewrite text while preserving meaning. Perfect for avoiding plagiarism, improving clarity, and creating unique content.
            </p>

            {/* Stats */}
            <div className="flex flex-wrap justify-center gap-8 md:gap-12 mb-8">
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-green-600">800K+</div>
                <div className="text-sm text-neutral-600">Texts Paraphrased</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-green-600">4</div>
                <div className="text-sm text-neutral-600">Rewrite Modes</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-green-600">Free</div>
                <div className="text-sm text-neutral-600">To Use</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Paraphraser Interface */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4 md:px-6 max-w-7xl">
          <div className="bg-white rounded-2xl shadow-lg border border-neutral-200 overflow-hidden">
            {/* Settings Bar */}
            <div className="border-b border-neutral-200 p-6 bg-neutral-50">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <label className="text-sm font-medium text-neutral-700">
                    Paraphrase Mode:
                  </label>
                  <select
                    value={paraphraseMode}
                    onChange={(e) => setParaphraseMode(e.target.value)}
                    className="p-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="standard">Standard</option>
                    <option value="formal">Formal</option>
                    <option value="simple">Simple</option>
                    <option value="creative">Creative</option>
                  </select>
                </div>
                <div className="text-sm text-neutral-600">
                  Paraphrases remaining: <span className="font-semibold text-green-600">{guestParaphrases}</span>
                </div>
              </div>
            </div>

            {/* Translation Panels */}
            <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-neutral-200">
              {/* Source Text Panel */}
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <label className="text-sm font-medium text-neutral-700">
                    Original Text
                  </label>
                </div>

                <textarea
                  value={sourceText}
                  onChange={(e) => {
                    if (e.target.value.length <= maxChars) {
                      setSourceText(e.target.value);
                    }
                  }}
                  placeholder="Paste your text here to paraphrase..."
                  className="w-full h-64 p-4 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none text-neutral-800"
                  style={{ fontSize: '16px' }}
                />

                <div className="flex items-center justify-between mt-3">
                  <div className="text-sm text-neutral-500">
                    {charCount} / {maxChars} characters
                  </div>
                  {sourceText && (
                    <button
                      onClick={() => {
                        setSourceText('');
                        setParaphrasedText('');
                      }}
                      className="text-sm text-neutral-500 hover:text-neutral-700"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>

              {/* Paraphrased Output Panel */}
              <div className="p-6 bg-neutral-50">
                <div className="flex items-center justify-between mb-4">
                  <label className="text-sm font-medium text-neutral-700">
                    Paraphrased Text
                  </label>
                  {paraphrasedText && (
                    <button
                      onClick={handleCopy}
                      className="p-2 rounded-lg hover:bg-white transition-colors"
                      title="Copy paraphrased text"
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
                  {isParaphrasing ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mb-3"></div>
                        <p className="text-neutral-600">Paraphrasing...</p>
                      </div>
                    </div>
                  ) : paraphrasedText ? (
                    <p className="text-neutral-800 whitespace-pre-wrap" style={{ fontSize: '16px' }}>
                      {paraphrasedText}
                    </p>
                  ) : (
                    <p className="text-neutral-400">Paraphrased text will appear here...</p>
                  )}
                </div>

                <div className="mt-3 text-sm text-neutral-500">
                  {!isParaphrasing && paraphrasedText && (
                    <span>{paraphrasedText.length} characters</span>
                  )}
                </div>
              </div>
            </div>

            {/* Action Bar */}
            <div className="border-t border-neutral-200 p-6 bg-neutral-50">
              <button
                onClick={handleParaphrase}
                disabled={isParaphrasing || !sourceText.trim()}
                className="w-full btn-primary btn-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isParaphrasing ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Paraphrasing...
                  </>
                ) : (
                  <>
                    <RefreshCw size={20} />
                    Paraphrase Now
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-24 bg-neutral-50">
        <div className="container mx-auto px-4 md:px-6 max-w-7xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-4">
              Why Use Our Paraphrasing Tool?
            </h2>
            <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
              AI-powered text rewriting that preserves meaning
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Sparkles,
                title: 'AI-Powered',
                description: 'Advanced AI understands context and maintains original meaning',
                color: 'text-purple-600',
                bg: 'bg-purple-50',
              },
              {
                icon: Zap,
                title: 'Instant Results',
                description: 'Get paraphrased text in seconds with one click',
                color: 'text-green-600',
                bg: 'bg-green-50',
              },
              {
                icon: RefreshCw,
                title: 'Multiple Modes',
                description: 'Standard, formal, simple, or creative paraphrasing styles',
                color: 'text-blue-600',
                bg: 'bg-blue-50',
              },
              {
                icon: Shield,
                title: 'Plagiarism-Free',
                description: 'Create unique content while preserving original ideas',
                color: 'text-orange-600',
                bg: 'bg-orange-50',
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
      <section className="py-16 md:py-24 bg-gradient-to-br from-green-50 to-blue-50">
        <div className="container mx-auto px-4 md:px-6 max-w-7xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-4">
              Perfect For Everyone
            </h2>
            <p className="text-lg text-neutral-600">
              From students to content creators
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                icon: GraduationCap,
                title: 'Students & Researchers',
                description: 'Avoid plagiarism by paraphrasing sources, quotes, and research materials. Improve writing quality and citation practices.',
                stats: 'Academic',
              },
              {
                icon: BookOpen,
                title: 'Content Writers',
                description: 'Create unique variations of content for different platforms. Repurpose articles, blog posts, and marketing materials.',
                stats: 'Marketing',
              },
              {
                icon: Briefcase,
                title: 'Professionals',
                description: 'Rewrite business documents, emails, and reports for different audiences. Improve clarity and professionalism.',
                stats: 'Business',
              },
              {
                icon: Users,
                title: 'Bloggers & SEO',
                description: 'Generate unique content variations for better SEO. Avoid duplicate content penalties while maintaining message.',
                stats: 'Digital',
              },
            ].map((useCase, idx) => (
              <div
                key={idx}
                className="bg-white p-8 rounded-2xl border border-neutral-200 hover:shadow-xl transition-shadow duration-300"
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className="bg-green-100 text-green-600 w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0">
                    <useCase.icon size={24} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-xl font-semibold text-neutral-900">
                        {useCase.title}
                      </h3>
                      <span className="text-xs font-medium text-green-600 bg-green-100 px-3 py-1 rounded-full">
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
              Everything you need to know about paraphrasing
            </p>
          </div>

          <div className="space-y-4">
            {[
              {
                question: 'Is paraphrasing the same as plagiarism?',
                answer: 'No! Proper paraphrasing rewrites text in your own words while preserving meaning. Always cite original sources even when paraphrasing for academic work.',
              },
              {
                question: 'How does the paraphrasing tool work?',
                answer: 'Our AI analyzes your text, understands its meaning and context, then rewrites it using different words and sentence structures while maintaining the original message.',
              },
              {
                question: 'What are the different paraphrase modes?',
                answer: 'Standard mode balances clarity and naturalness. Formal mode uses professional language. Simple mode uses easier words. Creative mode provides unique rewrites.',
              },
              {
                question: 'Can I paraphrase academic papers?',
                answer: 'Yes! Our tool is perfect for paraphrasing research materials and quotes. Remember to always cite your sources properly in academic work.',
              },
              {
                question: 'Is the paraphrased text plagiarism-free?',
                answer: 'Our tool creates original rewrites, but you should still cite sources for academic work and run final checks through plagiarism detectors.',
              },
              {
                question: 'How long can my text be?',
                answer: 'You can paraphrase up to 3,000 characters at once. For longer texts, break them into smaller sections and paraphrase separately.',
              },
            ].map((faq, idx) => (
              <details
                key={idx}
                className="bg-white p-6 rounded-xl border border-neutral-200 hover:shadow-md transition-shadow duration-200 group"
              >
                <summary className="font-semibold text-neutral-900 cursor-pointer list-none flex items-center justify-between">
                  <span className="flex-1">{faq.question}</span>
                  <ChevronDown className="text-green-600 transform group-open:rotate-180 transition-transform duration-200 flex-shrink-0 ml-4" size={20} />
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
      <section className="py-16 md:py-24 bg-gradient-to-br from-green-500 to-blue-600 text-white">
        <div className="container mx-auto px-4 md:px-6 max-w-4xl text-center">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
            Start Paraphrasing Today
          </h2>
          <p className="text-lg md:text-xl text-green-50 mb-8 max-w-2xl mx-auto">
            Join thousands using AI to create unique, plagiarism-free content
          </p>
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="inline-flex items-center gap-3 bg-white text-green-600 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-green-50 transition-all duration-200 hover:scale-105 shadow-lg"
          >
            <RefreshCw size={24} />
            Paraphrase Now - Free
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
              <div className="bg-green-100 text-green-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <RefreshCw size={32} />
              </div>
              <h3 className="text-2xl font-bold text-neutral-900 mb-2">
                Paraphrase Limit Reached
              </h3>
              <p className="text-neutral-600">
                Create a free account for unlimited paraphrasing
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
              No credit card required. Get unlimited access instantly.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
