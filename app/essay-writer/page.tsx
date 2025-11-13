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
  Clock,
  TrendingUp,
  BookOpen,
  GraduationCap,
  Briefcase,
  Users,
  Target,
} from 'lucide-react';

export default function EssayWriterPage() {
  const [topic, setTopic] = useState('');
  const [essayType, setEssayType] = useState('argumentative');
  const [wordCount, setWordCount] = useState('500');
  const [generatedEssay, setGeneratedEssay] = useState('');
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

  // Handle essay generation
  const handleGenerate = async () => {
    if (!topic.trim()) {
      alert('Please enter an essay topic');
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

      // Call the essay writing API
      const response = await fetch('/api/essay-write', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          topic,
          essayType,
          wordCount: parseInt(wordCount),
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
        throw new Error(data.error || 'Essay generation failed');
      }

      setGeneratedEssay(data.essay);

    } catch (error: any) {
      console.error('Essay generation error:', error);
      alert(error.message || 'Failed to generate essay. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Copy to clipboard
  const handleCopy = async () => {
    if (!generatedEssay) return;

    try {
      await navigator.clipboard.writeText(generatedEssay);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-50 via-white to-purple-50 pt-24 pb-16 md:pt-32 md:pb-24">
        <div className="container mx-auto px-4 md:px-6 max-w-7xl">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-neutral-600 mb-6">
            <Link href="/" className="hover:text-primary-600 transition-colors">
              Home
            </Link>
            <ChevronRight size={16} />
            <span className="text-neutral-800 font-medium">AI Essay Writer</span>
          </div>

          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <FileText size={18} />
              <span>Academic & Creative Essays</span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-neutral-900 mb-6 leading-tight">
              AI Essay Writer -{' '}
              <span className="bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
                Instant Essays
              </span>
            </h1>

            <p className="text-lg md:text-xl text-neutral-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              Generate high-quality essays on any topic in seconds. Perfect for students, researchers, and content creators in the Philippines.
            </p>

            {/* Stats */}
            <div className="flex flex-wrap justify-center gap-8 md:gap-12 mb-8">
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-blue-600">500K+</div>
                <div className="text-sm text-neutral-600">Essays Generated</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-blue-600">10+</div>
                <div className="text-sm text-neutral-600">Essay Types</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-blue-600">Free</div>
                <div className="text-sm text-neutral-600">To Use</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Essay Writer Interface */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4 md:px-6 max-w-7xl">
          <div className="bg-white rounded-2xl shadow-lg border border-neutral-200 overflow-hidden">
            {/* Input Section */}
            <div className="p-6 border-b border-neutral-200">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Essay Type
                  </label>
                  <select
                    value={essayType}
                    onChange={(e) => setEssayType(e.target.value)}
                    className="w-full p-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="argumentative">Argumentative</option>
                    <option value="persuasive">Persuasive</option>
                    <option value="expository">Expository</option>
                    <option value="descriptive">Descriptive</option>
                    <option value="narrative">Narrative</option>
                    <option value="compare-contrast">Compare & Contrast</option>
                    <option value="cause-effect">Cause & Effect</option>
                    <option value="analytical">Analytical</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Word Count
                  </label>
                  <select
                    value={wordCount}
                    onChange={(e) => setWordCount(e.target.value)}
                    className="w-full p-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="300">300 words</option>
                    <option value="500">500 words</option>
                    <option value="750">750 words</option>
                    <option value="1000">1000 words</option>
                    <option value="1500">1500 words</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Generations Left
                  </label>
                  <div className="flex items-center h-[48px] px-4 bg-blue-50 rounded-lg border border-blue-200">
                    <span className="text-2xl font-bold text-blue-600">{guestGenerations}</span>
                    <span className="text-sm text-neutral-600 ml-2">/ {MAX_FREE_GENERATIONS}</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Essay Topic
                </label>
                <textarea
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="Enter your essay topic or question here... (e.g., 'The impact of social media on Philippine society')"
                  className="w-full h-32 p-4 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-neutral-800"
                  style={{ fontSize: '16px' }}
                />
              </div>
            </div>

            {/* Output Section */}
            <div className="p-6 bg-neutral-50">
              <div className="flex items-center justify-between mb-4">
                <label className="text-sm font-medium text-neutral-700">
                  Generated Essay
                </label>
                {generatedEssay && (
                  <button
                    onClick={handleCopy}
                    className="p-2 rounded-lg hover:bg-white transition-colors"
                    title="Copy essay"
                  >
                    {copied ? (
                      <Check size={18} className="text-green-600" />
                    ) : (
                      <Copy size={18} className="text-neutral-600" />
                    )}
                  </button>
                )}
              </div>

              <div className="w-full min-h-[400px] p-4 bg-white border border-neutral-300 rounded-lg overflow-y-auto">
                {isGenerating ? (
                  <div className="flex items-center justify-center h-full min-h-[400px]">
                    <div className="text-center">
                      <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-3"></div>
                      <p className="text-neutral-600">Generating your essay...</p>
                    </div>
                  </div>
                ) : generatedEssay ? (
                  <div className="prose max-w-none">
                    <p className="text-neutral-800 whitespace-pre-wrap leading-relaxed" style={{ fontSize: '16px' }}>
                      {generatedEssay}
                    </p>
                  </div>
                ) : (
                  <p className="text-neutral-400">Your generated essay will appear here...</p>
                )}
              </div>
            </div>

            {/* Action Bar */}
            <div className="border-t border-neutral-200 p-6 bg-neutral-50">
              <button
                onClick={handleGenerate}
                disabled={isGenerating || !topic.trim()}
                className="w-full btn-primary btn-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isGenerating ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Generating Essay...
                  </>
                ) : (
                  <>
                    <Sparkles size={20} />
                    Generate Essay
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
              Why Use Our AI Essay Writer?
            </h2>
            <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
              Advanced AI technology for academic excellence
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Sparkles,
                title: 'AI-Powered Quality',
                description: 'Well-structured essays with proper introduction, body, and conclusion',
                color: 'text-purple-600',
                bg: 'bg-purple-50',
              },
              {
                icon: Zap,
                title: 'Instant Generation',
                description: 'Generate complete essays in seconds, not hours',
                color: 'text-blue-600',
                bg: 'bg-blue-50',
              },
              {
                icon: Target,
                title: 'Multiple Types',
                description: 'Argumentative, persuasive, expository, and more essay types',
                color: 'text-orange-600',
                bg: 'bg-orange-50',
              },
              {
                icon: Shield,
                title: 'Original Content',
                description: 'Unique essays generated fresh for every topic',
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
      <section className="py-16 md:py-24 bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="container mx-auto px-4 md:px-6 max-w-7xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-4">
              Perfect For Everyone
            </h2>
            <p className="text-lg text-neutral-600">
              From students to professionals
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                icon: GraduationCap,
                title: 'Students & Learners',
                description: 'Get help with school assignments, college essays, and academic papers. Learn essay structure and improve your writing skills.',
                stats: 'All Levels',
              },
              {
                icon: BookOpen,
                title: 'Content Creators',
                description: 'Generate blog posts, articles, and editorial content quickly. Perfect for maintaining consistent publishing schedules.',
                stats: 'Bloggers',
              },
              {
                icon: Briefcase,
                title: 'Professionals',
                description: 'Create business reports, white papers, and professional documents. Save time on research and writing.',
                stats: 'Business',
              },
              {
                icon: Users,
                title: 'Researchers',
                description: 'Draft literature reviews, analysis papers, and research proposals. Organize thoughts and structure arguments effectively.',
                stats: 'Academic',
              },
            ].map((useCase, idx) => (
              <div
                key={idx}
                className="bg-white p-8 rounded-2xl border border-neutral-200 hover:shadow-xl transition-shadow duration-300"
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className="bg-blue-100 text-blue-600 w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0">
                    <useCase.icon size={24} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-xl font-semibold text-neutral-900">
                        {useCase.title}
                      </h3>
                      <span className="text-xs font-medium text-blue-600 bg-blue-100 px-3 py-1 rounded-full">
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
              Everything you need to know about our AI essay writer
            </p>
          </div>

          <div className="space-y-4">
            {[
              {
                question: 'Is the AI essay writer free to use?',
                answer: 'Yes! You get 10 free essay generations as a guest. Create a free account for unlimited access to all essay types and word counts.',
              },
              {
                question: 'Are the essays plagiarism-free?',
                answer: 'Yes, our AI generates original content for each request. However, we recommend using the essays as starting points and adding your own insights and research for academic submissions.',
              },
              {
                question: 'What essay types can I generate?',
                answer: 'We support argumentative, persuasive, expository, descriptive, narrative, compare & contrast, cause & effect, and analytical essays.',
              },
              {
                question: 'Can I edit the generated essay?',
                answer: 'Absolutely! The generated essay is fully editable. Copy it to your preferred editor and customize it to match your specific requirements and writing style.',
              },
              {
                question: 'How long does it take to generate an essay?',
                answer: 'Essays are typically generated in 10-30 seconds, depending on the length and complexity. Longer essays (1500+ words) may take up to a minute.',
              },
              {
                question: 'Can I use this for school assignments?',
                answer: 'Our tool is designed as a learning and brainstorming aid. We recommend using generated essays as outlines or inspiration, then adding your own research and insights for academic work.',
              },
            ].map((faq, idx) => (
              <details
                key={idx}
                className="bg-white p-6 rounded-xl border border-neutral-200 hover:shadow-md transition-shadow duration-200 group"
              >
                <summary className="font-semibold text-neutral-900 cursor-pointer list-none flex items-center justify-between">
                  <span className="flex-1">{faq.question}</span>
                  <ChevronDown className="text-blue-600 transform group-open:rotate-180 transition-transform duration-200 flex-shrink-0 ml-4" size={20} />
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
      <section className="py-16 md:py-24 bg-gradient-to-br from-blue-500 to-purple-600 text-white">
        <div className="container mx-auto px-4 md:px-6 max-w-4xl text-center">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
            Start Writing Essays Today
          </h2>
          <p className="text-lg md:text-xl text-blue-50 mb-8 max-w-2xl mx-auto">
            Join thousands of students and writers using AI to create better essays faster
          </p>
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="inline-flex items-center gap-3 bg-white text-blue-600 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-blue-50 transition-all duration-200 hover:scale-105 shadow-lg"
          >
            <FileText size={24} />
            Generate Essay - Free
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
              <div className="bg-blue-100 text-blue-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText size={32} />
              </div>
              <h3 className="text-2xl font-bold text-neutral-900 mb-2">
                Generation Limit Reached
              </h3>
              <p className="text-neutral-600">
                Create a free account for unlimited essay generation
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
