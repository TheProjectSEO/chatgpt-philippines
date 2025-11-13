'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  FileText,
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
  List,
} from 'lucide-react';

export default function SummarizerPage() {
  const [sourceText, setSourceText] = useState('');
  const [summary, setSummary] = useState('');
  const [summaryLength, setSummaryLength] = useState('medium');
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [charCount, setCharCount] = useState(0);
  const [copied, setCopied] = useState(false);
  const [guestSummaries, setGuestSummaries] = useState(0);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isLoadingRateLimit, setIsLoadingRateLimit] = useState(true);

  const maxChars = 10000;
  const MAX_FREE_SUMMARIES = 10;

  // Load rate limit status on mount
  useEffect(() => {
    const loadRateLimit = async () => {
      try {
        const response = await fetch('/api/rate-limit', {
          method: 'GET',
        });

        if (response.ok) {
          const rateLimit = await response.json();
          const remaining = Math.max(0, MAX_FREE_SUMMARIES - rateLimit.count);
          setGuestSummaries(remaining);

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

  // Handle summarization
  const handleSummarize = async () => {
    if (!sourceText.trim()) {
      alert('Please enter text to summarize');
      return;
    }

    if (guestSummaries <= 0) {
      setShowLoginModal(true);
      return;
    }

    setIsSummarizing(true);

    try {
      // Increment rate limit counter
      const rateLimitResponse = await fetch('/api/rate-limit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'increment' }),
      });

      if (rateLimitResponse.ok) {
        const rateLimit = await rateLimitResponse.json();
        const remaining = Math.max(0, MAX_FREE_SUMMARIES - rateLimit.count);
        setGuestSummaries(remaining);

        if (rateLimit.blocked) {
          setShowLoginModal(true);
          setIsSummarizing(false);
          return;
        }
      }

      // Call the summarization API
      const response = await fetch('/api/summarize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: sourceText,
          length: summaryLength,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 429) {
          setShowLoginModal(true);
          setGuestSummaries(0);
          alert(data.message || 'Summary limit reached. Please sign up to continue.');
          return;
        }
        throw new Error(data.error || 'Summarization failed');
      }

      setSummary(data.summary);

    } catch (error: any) {
      console.error('Summarization error:', error);
      alert(error.message || 'Failed to summarize. Please try again.');
    } finally {
      setIsSummarizing(false);
    }
  };

  // Copy to clipboard
  const handleCopy = async () => {
    if (!summary) return;

    try {
      await navigator.clipboard.writeText(summary);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-purple-50 via-white to-pink-50 pt-24 pb-16 md:pt-32 md:pb-24">
        <div className="container mx-auto px-4 md:px-6 max-w-7xl">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-neutral-600 mb-6">
            <Link href="/" className="hover:text-primary-600 transition-colors">
              Home
            </Link>
            <ChevronRight size={16} />
            <span className="text-neutral-800 font-medium">AI Summarizer</span>
          </div>

          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-purple-100 text-purple-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <List size={18} />
              <span>Condense Any Text</span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-neutral-900 mb-6 leading-tight">
              AI Summarizer -{' '}
              <span className="bg-gradient-to-r from-purple-500 to-pink-600 bg-clip-text text-transparent">
                Instant Summaries
              </span>
            </h1>

            <p className="text-lg md:text-xl text-neutral-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              Condense long articles, research papers, and documents into concise summaries. Save time and get key insights instantly.
            </p>

            {/* Stats */}
            <div className="flex flex-wrap justify-center gap-8 md:gap-12 mb-8">
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-purple-600">1M+</div>
                <div className="text-sm text-neutral-600">Texts Summarized</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-purple-600">10K</div>
                <div className="text-sm text-neutral-600">Max Characters</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-purple-600">Free</div>
                <div className="text-sm text-neutral-600">To Use</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Summarizer Interface */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4 md:px-6 max-w-7xl">
          <div className="bg-white rounded-2xl shadow-lg border border-neutral-200 overflow-hidden">
            {/* Settings Bar */}
            <div className="border-b border-neutral-200 p-6 bg-neutral-50">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <label className="text-sm font-medium text-neutral-700">
                    Summary Length:
                  </label>
                  <select
                    value={summaryLength}
                    onChange={(e) => setSummaryLength(e.target.value)}
                    className="p-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="short">Short (2-3 sentences)</option>
                    <option value="medium">Medium (1 paragraph)</option>
                    <option value="long">Long (Multiple paragraphs)</option>
                    <option value="bullet">Bullet Points</option>
                  </select>
                </div>
                <div className="text-sm text-neutral-600">
                  Summaries remaining: <span className="font-semibold text-purple-600">{guestSummaries}</span>
                </div>
              </div>
            </div>

            {/* Text Panels */}
            <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-neutral-200">
              {/* Source Text Panel */}
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <label className="text-sm font-medium text-neutral-700">
                    Text to Summarize
                  </label>
                </div>

                <textarea
                  value={sourceText}
                  onChange={(e) => {
                    if (e.target.value.length <= maxChars) {
                      setSourceText(e.target.value);
                    }
                  }}
                  placeholder="Paste your long text, article, or document here..."
                  className="w-full h-80 p-4 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none text-neutral-800"
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
                        setSummary('');
                      }}
                      className="text-sm text-neutral-500 hover:text-neutral-700"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>

              {/* Summary Output Panel */}
              <div className="p-6 bg-neutral-50">
                <div className="flex items-center justify-between mb-4">
                  <label className="text-sm font-medium text-neutral-700">
                    Summary
                  </label>
                  {summary && (
                    <button
                      onClick={handleCopy}
                      className="p-2 rounded-lg hover:bg-white transition-colors"
                      title="Copy summary"
                    >
                      {copied ? (
                        <Check size={18} className="text-green-600" />
                      ) : (
                        <Copy size={18} className="text-neutral-600" />
                      )}
                    </button>
                  )}
                </div>

                <div className="w-full h-80 p-4 bg-white border border-neutral-300 rounded-lg overflow-y-auto">
                  {isSummarizing ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mb-3"></div>
                        <p className="text-neutral-600">Summarizing...</p>
                      </div>
                    </div>
                  ) : summary ? (
                    <p className="text-neutral-800 whitespace-pre-wrap leading-relaxed" style={{ fontSize: '16px' }}>
                      {summary}
                    </p>
                  ) : (
                    <p className="text-neutral-400">Summary will appear here...</p>
                  )}
                </div>

                <div className="mt-3 text-sm text-neutral-500">
                  {!isSummarizing && summary && (
                    <span>{summary.length} characters</span>
                  )}
                </div>
              </div>
            </div>

            {/* Action Bar */}
            <div className="border-t border-neutral-200 p-6 bg-neutral-50">
              <button
                onClick={handleSummarize}
                disabled={isSummarizing || !sourceText.trim()}
                className="w-full btn-primary btn-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSummarizing ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Summarizing...
                  </>
                ) : (
                  <>
                    <Sparkles size={20} />
                    Summarize Now
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
              Why Use Our AI Summarizer?
            </h2>
            <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
              Get to the point faster with intelligent summarization
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Sparkles,
                title: 'AI-Powered',
                description: 'Advanced AI extracts key points and main ideas accurately',
                color: 'text-purple-600',
                bg: 'bg-purple-50',
              },
              {
                icon: Zap,
                title: 'Instant Results',
                description: 'Get summaries in seconds, even for long documents',
                color: 'text-pink-600',
                bg: 'bg-pink-50',
              },
              {
                icon: List,
                title: 'Multiple Formats',
                description: 'Short, medium, long summaries, or bullet points',
                color: 'text-blue-600',
                bg: 'bg-blue-50',
              },
              {
                icon: Shield,
                title: 'Context Preserved',
                description: 'Maintains important context and key information',
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
      <section className="py-16 md:py-24 bg-gradient-to-br from-purple-50 to-pink-50">
        <div className="container mx-auto px-4 md:px-6 max-w-7xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-4">
              Perfect For Everyone
            </h2>
            <p className="text-lg text-neutral-600">
              Save time reading and research
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                icon: GraduationCap,
                title: 'Students & Researchers',
                description: 'Quickly understand research papers, articles, and textbooks. Create study notes and literature review summaries efficiently.',
                stats: 'Academic',
              },
              {
                icon: BookOpen,
                title: 'Content Creators',
                description: 'Extract key points from source materials. Create content briefs and outlines from long-form content quickly.',
                stats: 'Writing',
              },
              {
                icon: Briefcase,
                title: 'Business Professionals',
                description: 'Summarize reports, emails, and meeting notes. Get executive summaries of lengthy business documents.',
                stats: 'Business',
              },
              {
                icon: Users,
                title: 'News & Research',
                description: 'Stay informed by summarizing news articles, reports, and industry updates. Save hours of reading time.',
                stats: 'Information',
              },
            ].map((useCase, idx) => (
              <div
                key={idx}
                className="bg-white p-8 rounded-2xl border border-neutral-200 hover:shadow-xl transition-shadow duration-300"
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className="bg-purple-100 text-purple-600 w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0">
                    <useCase.icon size={24} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-xl font-semibold text-neutral-900">
                        {useCase.title}
                      </h3>
                      <span className="text-xs font-medium text-purple-600 bg-purple-100 px-3 py-1 rounded-full">
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
              Everything you need to know about text summarization
            </p>
          </div>

          <div className="space-y-4">
            {[
              {
                question: 'How accurate are the summaries?',
                answer: 'Our AI summarizer accurately identifies and extracts the main points and key information from your text. It maintains context and relevance while condensing content.',
              },
              {
                question: 'What can I summarize?',
                answer: 'You can summarize articles, research papers, reports, emails, blog posts, books, and any other text content up to 10,000 characters.',
              },
              {
                question: 'What is the difference between summary lengths?',
                answer: 'Short gives 2-3 sentences, Medium provides a full paragraph, Long creates multiple paragraphs, and Bullet Points lists key takeaways.',
              },
              {
                question: 'Can I summarize documents in Filipino?',
                answer: 'Yes! Our AI can summarize text in Filipino (Tagalog), English, and many other languages while maintaining accuracy.',
              },
              {
                question: 'Is it free to use?',
                answer: 'Yes! You get 10 free summaries as a guest. Create a free account for unlimited summarization with no credit card required.',
              },
              {
                question: 'How long does summarization take?',
                answer: 'Most summaries are generated within 5-15 seconds, regardless of the original text length.',
              },
            ].map((faq, idx) => (
              <details
                key={idx}
                className="bg-white p-6 rounded-xl border border-neutral-200 hover:shadow-md transition-shadow duration-200 group"
              >
                <summary className="font-semibold text-neutral-900 cursor-pointer list-none flex items-center justify-between">
                  <span className="flex-1">{faq.question}</span>
                  <ChevronDown className="text-purple-600 transform group-open:rotate-180 transition-transform duration-200 flex-shrink-0 ml-4" size={20} />
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
      <section className="py-16 md:py-24 bg-gradient-to-br from-purple-500 to-pink-600 text-white">
        <div className="container mx-auto px-4 md:px-6 max-w-4xl text-center">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
            Start Summarizing Today
          </h2>
          <p className="text-lg md:text-xl text-purple-50 mb-8 max-w-2xl mx-auto">
            Join thousands saving time with AI-powered text summarization
          </p>
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="inline-flex items-center gap-3 bg-white text-purple-600 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-purple-50 transition-all duration-200 hover:scale-105 shadow-lg"
          >
            <List size={24} />
            Summarize Now - Free
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
              <div className="bg-purple-100 text-purple-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <List size={32} />
              </div>
              <h3 className="text-2xl font-bold text-neutral-900 mb-2">
                Summary Limit Reached
              </h3>
              <p className="text-neutral-600">
                Create a free account for unlimited summarization
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
