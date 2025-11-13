'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  FileText,
  Sparkles,
  Copy,
  Check,
  Globe,
  Zap,
  Shield,
  Users,
  Briefcase,
  GraduationCap,
  MessageSquare,
  ChevronDown,
  ChevronRight,
  X,
  Clock,
  TrendingUp,
  Star,
  Pen,
  BookOpen,
  Hash,
} from 'lucide-react';

// Content type options
const contentTypes = [
  { value: 'blog', label: 'Blog Article', icon: FileText },
  { value: 'social', label: 'Social Media Post', icon: MessageSquare },
  { value: 'product', label: 'Product Description', icon: Star },
  { value: 'email', label: 'Email Newsletter', icon: Briefcase },
  { value: 'story', label: 'Short Story', icon: BookOpen },
  { value: 'ad', label: 'Advertisement Copy', icon: TrendingUp },
];

// Tone options
const toneOptions = [
  { value: 'professional', label: 'Professional' },
  { value: 'casual', label: 'Casual' },
  { value: 'friendly', label: 'Friendly' },
  { value: 'persuasive', label: 'Persuasive' },
  { value: 'informative', label: 'Informative' },
  { value: 'creative', label: 'Creative' },
];

export default function FilipinoWriterPage() {
  const [topic, setTopic] = useState('');
  const [contentType, setContentType] = useState('blog');
  const [tone, setTone] = useState('professional');
  const [wordCount, setWordCount] = useState(500);
  const [keywords, setKeywords] = useState('');
  const [generatedContent, setGeneratedContent] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
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

  // Handle content generation
  const handleGenerate = async () => {
    if (!topic.trim()) {
      alert('Please enter a topic or description');
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

      // Call the Filipino writer API
      const response = await fetch('/api/filipino-write', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          topic,
          contentType,
          tone,
          wordCount,
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

      setGeneratedContent(data.content);

    } catch (error: any) {
      console.error('Generation error:', error);
      alert(error.message || 'Failed to generate content. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Copy to clipboard
  const handleCopy = async () => {
    if (!generatedContent) return;

    try {
      await navigator.clipboard.writeText(generatedContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
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
            <span className="text-neutral-800 font-medium">Filipino Content Writer AI</span>
          </div>

          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Pen size={18} />
              <span>AI-Powered Filipino Content</span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-neutral-900 mb-6 leading-tight">
              Filipino Content Writer AI -{' '}
              <span className="bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent">
                Tagalog & English
              </span>
            </h1>

            <p className="text-lg md:text-xl text-neutral-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              Generate high-quality Filipino (Tagalog) content for blogs, social media, and business.
              Perfect for Filipino content creators, marketers, and businesses.
            </p>

            {/* Stats */}
            <div className="flex flex-wrap justify-center gap-8 md:gap-12 mb-8">
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-orange-600">10K+</div>
                <div className="text-sm text-neutral-600">Content Created</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-orange-600">6+</div>
                <div className="text-sm text-neutral-600">Content Types</div>
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
                {/* Topic Input */}
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Topic or Description *
                  </label>
                  <textarea
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="Describe what you want to write about... (e.g., 'Ang kahalagahan ng pagiging mabuting mamamayan' or 'Filipino food culture')"
                    className="w-full h-32 p-4 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none text-neutral-800"
                    style={{ fontSize: '16px' }}
                  />
                </div>

                {/* Content Type & Tone */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Content Type
                    </label>
                    <select
                      value={contentType}
                      onChange={(e) => setContentType(e.target.value)}
                      className="w-full p-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-neutral-800"
                    >
                      {contentTypes.map((type) => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Tone
                    </label>
                    <select
                      value={tone}
                      onChange={(e) => setTone(e.target.value)}
                      className="w-full p-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-neutral-800"
                    >
                      {toneOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Word Count & Keywords */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Target Word Count: {wordCount} words
                    </label>
                    <input
                      type="range"
                      min="100"
                      max="1000"
                      step="50"
                      value={wordCount}
                      onChange={(e) => setWordCount(Number(e.target.value))}
                      className="w-full h-2 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-orange-500"
                    />
                    <div className="flex justify-between text-xs text-neutral-500 mt-1">
                      <span>100</span>
                      <span>1000</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Keywords (Optional)
                    </label>
                    <input
                      type="text"
                      value={keywords}
                      onChange={(e) => setKeywords(e.target.value)}
                      placeholder="e.g., negosyo, OFW, pamilya"
                      className="w-full p-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-neutral-800"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Output Panel */}
            <div className="p-6 md:p-8 bg-neutral-50 border-t border-neutral-200">
              <div className="flex items-center justify-between mb-4">
                <label className="text-sm font-medium text-neutral-700">
                  Generated Filipino Content
                </label>
                {generatedContent && (
                  <button
                    onClick={handleCopy}
                    className="p-2 rounded-lg hover:bg-white transition-colors"
                    title="Copy content"
                  >
                    {copied ? (
                      <Check size={18} className="text-green-600" />
                    ) : (
                      <Copy size={18} className="text-neutral-600" />
                    )}
                  </button>
                )}
              </div>

              <div className="w-full min-h-96 p-4 bg-white border border-neutral-300 rounded-lg overflow-y-auto">
                {isGenerating ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mb-3"></div>
                      <p className="text-neutral-600">Generating Filipino content...</p>
                    </div>
                  </div>
                ) : generatedContent ? (
                  <p className="text-neutral-800 whitespace-pre-wrap leading-relaxed" style={{ fontSize: '16px' }}>
                    {generatedContent}
                  </p>
                ) : (
                  <p className="text-neutral-400">Your generated Filipino content will appear here...</p>
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
                  disabled={isGenerating || !topic.trim()}
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
                      Generate Filipino Content
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
              Why Use Our Filipino Writer AI?
            </h2>
            <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
              Create authentic Filipino content with AI that understands your language and culture
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Globe,
                title: 'Native Filipino',
                description: 'Generates authentic Tagalog content that sounds natural',
                color: 'text-blue-600',
                bg: 'bg-blue-50',
              },
              {
                icon: Sparkles,
                title: 'AI-Powered',
                description: 'Advanced AI understands Filipino culture and context',
                color: 'text-purple-600',
                bg: 'bg-purple-50',
              },
              {
                icon: Zap,
                title: 'Instant Results',
                description: 'Generate quality content in seconds, not hours',
                color: 'text-orange-600',
                bg: 'bg-orange-50',
              },
              {
                icon: Shield,
                title: 'SEO Optimized',
                description: 'Content optimized for search engines and readers',
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
              Create Filipino content for any purpose
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                icon: MessageSquare,
                title: 'Social Media Managers',
                description: 'Create engaging Filipino posts for Facebook, Instagram, and TikTok. Connect with your audience in their native language.',
                stats: 'Daily posts',
              },
              {
                icon: Briefcase,
                title: 'Business Owners',
                description: 'Write product descriptions, marketing copy, and business communications in Filipino to reach local customers.',
                stats: 'Marketing',
              },
              {
                icon: FileText,
                title: 'Bloggers & Writers',
                description: 'Generate blog articles, stories, and content in Filipino. Perfect for content creators targeting Filipino audiences.',
                stats: 'Content',
              },
              {
                icon: GraduationCap,
                title: 'Students & Educators',
                description: 'Create educational content, essays, and learning materials in Filipino for academic purposes.',
                stats: 'Education',
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
              Everything you need to know about our Filipino content writer
            </p>
          </div>

          <div className="space-y-4">
            {[
              {
                question: 'Is the content generated purely in Filipino/Tagalog?',
                answer: 'Yes! Our AI generates authentic Filipino (Tagalog) content. It understands Filipino grammar, cultural context, and can handle both pure Tagalog and conversational Taglish based on your preferences.',
              },
              {
                question: 'How long does it take to generate content?',
                answer: 'Content generation typically takes 10-30 seconds depending on the length and complexity. Longer articles may take up to a minute.',
              },
              {
                question: 'Can I specify keywords for SEO?',
                answer: 'Yes! You can provide keywords that will be naturally incorporated into your Filipino content to help with search engine optimization.',
              },
              {
                question: 'What types of content can I create?',
                answer: 'You can create blog articles, social media posts, product descriptions, email newsletters, short stories, and advertisement copy - all in Filipino.',
              },
              {
                question: 'Is the generated content unique?',
                answer: 'Yes! Each piece of content is uniquely generated by AI. The content is original and not copied from existing sources.',
              },
              {
                question: 'Can I edit the generated content?',
                answer: 'Absolutely! You can copy the generated content and edit it as needed. The AI provides a strong foundation that you can refine.',
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
            Start Writing Filipino Content Today
          </h2>
          <p className="text-lg md:text-xl text-orange-50 mb-8 max-w-2xl mx-auto">
            Join thousands of content creators using our AI to create authentic Filipino content
          </p>
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="inline-flex items-center gap-3 bg-white text-orange-600 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-orange-50 transition-all duration-200 hover:scale-105 shadow-lg"
          >
            <Pen size={24} />
            Generate Filipino Content Now
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
                <Pen size={32} />
              </div>
              <h3 className="text-2xl font-bold text-neutral-900 mb-2">
                Generation Limit Reached
              </h3>
              <p className="text-neutral-600">
                Create a free account for unlimited Filipino content generation
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
              No credit card required. Get unlimited content generation instantly.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
