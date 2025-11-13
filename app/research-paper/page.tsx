'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  BookOpen,
  FileText,
  Copy,
  Check,
  Sparkles,
  GraduationCap,
  Users,
  TrendingUp,
  ChevronRight,
  ChevronDown,
  X,
  Clock,
  Shield,
  Zap,
  Star,
  Search,
  Brain,
  Award,
  BookMarked,
} from 'lucide-react';

// Research types
const researchTypes = [
  { value: 'argumentative', label: 'Argumentative Research' },
  { value: 'analytical', label: 'Analytical Research' },
  { value: 'experimental', label: 'Experimental Research' },
  { value: 'survey', label: 'Survey Research' },
  { value: 'case-study', label: 'Case Study' },
  { value: 'literature-review', label: 'Literature Review' },
];

// Citation styles
const citationStyles = [
  { value: 'apa', label: 'APA 7th Edition' },
  { value: 'mla', label: 'MLA 9th Edition' },
  { value: 'chicago', label: 'Chicago' },
  { value: 'harvard', label: 'Harvard' },
];

export default function ResearchPaperPage() {
  const [topic, setTopic] = useState('');
  const [researchType, setResearchType] = useState('argumentative');
  const [citationStyle, setCitationStyle] = useState('apa');
  const [additionalInfo, setAdditionalInfo] = useState('');
  const [generatedPaper, setGeneratedPaper] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [charCount, setCharCount] = useState(0);
  const [copied, setCopied] = useState(false);
  const [guestUses, setGuestUses] = useState(0);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isLoadingRateLimit, setIsLoadingRateLimit] = useState(true);

  const maxChars = 2000;
  const MAX_FREE_USES = 10;

  // Load rate limit status on mount
  useEffect(() => {
    const loadRateLimit = async () => {
      try {
        const response = await fetch('/api/rate-limit', {
          method: 'GET',
        });

        if (response.ok) {
          const rateLimit = await response.json();
          const remaining = Math.max(0, MAX_FREE_USES - rateLimit.count);
          setGuestUses(remaining);

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
    setCharCount(additionalInfo.length);
  }, [additionalInfo]);

  // Handle generation
  const handleGenerate = async () => {
    if (!topic.trim()) {
      alert('Please enter a research topic');
      return;
    }

    if (guestUses <= 0) {
      setShowLoginModal(true);
      return;
    }

    setIsGenerating(true);

    try {
      const rateLimitResponse = await fetch('/api/rate-limit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'increment' }),
      });

      if (rateLimitResponse.ok) {
        const rateLimit = await rateLimitResponse.json();
        const remaining = Math.max(0, MAX_FREE_USES - rateLimit.count);
        setGuestUses(remaining);

        if (rateLimit.blocked) {
          setShowLoginModal(true);
          setIsGenerating(false);
          return;
        }
      }

      const response = await fetch('/api/research-paper', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          topic,
          researchType,
          citationStyle,
          additionalInfo,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 429) {
          setShowLoginModal(true);
          setGuestUses(0);
          alert(data.message || 'Usage limit reached. Please sign up to continue.');
          return;
        }
        throw new Error(data.error || 'Generation failed');
      }

      setGeneratedPaper(data.paper);
    } catch (error: any) {
      console.error('Generation error:', error);
      alert(error.message || 'Failed to generate. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Copy to clipboard
  const handleCopy = async () => {
    if (!generatedPaper) return;

    try {
      await navigator.clipboard.writeText(generatedPaper);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-50 via-white to-indigo-50 pt-24 pb-16 md:pt-32 md:pb-24">
        <div className="container mx-auto px-4 md:px-6 max-w-7xl">
          <div className="flex items-center gap-2 text-sm text-neutral-600 mb-6">
            <Link href="/" className="hover:text-primary-600 transition-colors">
              Home
            </Link>
            <ChevronRight size={16} />
            <span className="text-neutral-800 font-medium">Research Paper Writer</span>
          </div>

          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <GraduationCap size={18} />
              <span>AI-Powered Academic Writing</span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-neutral-900 mb-6 leading-tight">
              Research Paper Writer{' '}
              <span className="bg-gradient-to-r from-blue-500 to-indigo-600 bg-clip-text text-transparent">
                with AI
              </span>
            </h1>

            <p className="text-lg md:text-xl text-neutral-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              Generate well-structured research papers with proper citations, methodology,
              and academic formatting. Perfect for students and researchers.
            </p>

            <div className="flex flex-wrap justify-center gap-8 md:gap-12 mb-8">
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-blue-600">500K+</div>
                <div className="text-sm text-neutral-600">Papers Generated</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-blue-600">6+</div>
                <div className="text-sm text-neutral-600">Research Types</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-blue-600">4+</div>
                <div className="text-sm text-neutral-600">Citation Styles</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Interface */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4 md:px-6 max-w-5xl">
          <div className="bg-white rounded-2xl shadow-lg border border-neutral-200 overflow-hidden">
            <div className="p-6 md:p-8">
              <h2 className="text-2xl font-bold text-neutral-900 mb-6">Generate Your Research Paper</h2>

              <div className="space-y-6">
                {/* Research Topic */}
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Research Topic *
                  </label>
                  <input
                    type="text"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="e.g., Impact of Social Media on Mental Health"
                    className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Research Type */}
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Research Type
                  </label>
                  <select
                    value={researchType}
                    onChange={(e) => setResearchType(e.target.value)}
                    className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {researchTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Citation Style */}
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Citation Style
                  </label>
                  <select
                    value={citationStyle}
                    onChange={(e) => setCitationStyle(e.target.value)}
                    className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {citationStyles.map((style) => (
                      <option key={style.value} value={style.value}>
                        {style.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Additional Information */}
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Additional Requirements (Optional)
                  </label>
                  <textarea
                    value={additionalInfo}
                    onChange={(e) => {
                      if (e.target.value.length <= maxChars) {
                        setAdditionalInfo(e.target.value);
                      }
                    }}
                    placeholder="Add any specific requirements, key points to cover, or research questions..."
                    className="w-full h-32 px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  />
                  <div className="text-sm text-neutral-500 mt-2">
                    {charCount} / {maxChars} characters
                  </div>
                </div>

                {/* Action Bar */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4">
                  <div className="text-sm text-neutral-600">
                    Guest uses remaining: <span className="font-semibold text-blue-600">{guestUses}</span>
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
                        <BookOpen size={20} />
                        Generate Research Paper
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Output Section */}
            {generatedPaper && (
              <div className="border-t border-neutral-200 p-6 md:p-8 bg-neutral-50">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold text-neutral-900">Generated Research Paper</h3>
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-neutral-300 rounded-lg hover:bg-neutral-50 transition-colors"
                  >
                    {copied ? (
                      <>
                        <Check size={18} className="text-green-600" />
                        <span className="text-green-600">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy size={18} />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
                <div className="bg-white border border-neutral-300 rounded-lg p-6 max-h-96 overflow-y-auto">
                  <pre className="text-neutral-800 whitespace-pre-wrap font-sans">
                    {generatedPaper}
                  </pre>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-24 bg-neutral-50">
        <div className="container mx-auto px-4 md:px-6 max-w-7xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-4">
              Why Use Our Research Paper Writer?
            </h2>
            <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
              AI-powered academic writing with proper structure and citations
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: BookMarked,
                title: 'Proper Citations',
                description: 'Generate accurate citations in APA, MLA, Chicago, and Harvard formats',
                color: 'text-blue-600',
                bg: 'bg-blue-50',
              },
              {
                icon: Brain,
                title: 'AI-Structured',
                description: 'Well-organized papers with introduction, methodology, and conclusion',
                color: 'text-purple-600',
                bg: 'bg-purple-50',
              },
              {
                icon: Zap,
                title: 'Fast Generation',
                description: 'Get your research paper outline in minutes, not hours',
                color: 'text-orange-600',
                bg: 'bg-orange-50',
              },
              {
                icon: Award,
                title: 'Academic Quality',
                description: 'Professional-grade content following academic standards',
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

      {/* FAQ Section */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-4 md:px-6 max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-4">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-4">
            {[
              {
                question: 'Is the generated content plagiarism-free?',
                answer: 'Yes, our AI generates original content. However, we recommend using plagiarism checkers and adding your own research and citations for academic integrity.',
              },
              {
                question: 'What citation formats are supported?',
                answer: 'We support APA 7th Edition, MLA 9th Edition, Chicago, and Harvard citation styles with proper in-text citations and reference lists.',
              },
              {
                question: 'Can I use this for my thesis?',
                answer: 'This tool is designed to help you structure and outline your research. Always review, edit, and add your own research data and findings before submitting any academic work.',
              },
              {
                question: 'How long are the generated papers?',
                answer: 'Papers typically range from 1500-3000 words depending on the topic complexity and requirements you provide.',
              },
            ].map((faq, idx) => (
              <details
                key={idx}
                className="bg-neutral-50 p-6 rounded-xl border border-neutral-200 hover:shadow-md transition-shadow duration-200 group"
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
                <BookOpen size={32} />
              </div>
              <h3 className="text-2xl font-bold text-neutral-900 mb-2">
                Usage Limit Reached
              </h3>
              <p className="text-neutral-600">
                Create a free account for unlimited access
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
          </div>
        </div>
      )}
    </div>
  );
}
