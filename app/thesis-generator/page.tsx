'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  FileText,
  Copy,
  Check,
  Sparkles,
  GraduationCap,
  BookOpen,
  ChevronRight,
  ChevronDown,
  X,
  Zap,
  Award,
  Target,
  Lightbulb,
} from 'lucide-react';

// Essay types
const essayTypes = [
  { value: 'argumentative', label: 'Argumentative Essay' },
  { value: 'analytical', label: 'Analytical Essay' },
  { value: 'expository', label: 'Expository Essay' },
  { value: 'narrative', label: 'Narrative Essay' },
  { value: 'persuasive', label: 'Persuasive Essay' },
  { value: 'compare-contrast', label: 'Compare & Contrast' },
];

export default function ThesisGeneratorPage() {
  const [topic, setTopic] = useState('');
  const [essayType, setEssayType] = useState('argumentative');
  const [stance, setStance] = useState('');
  const [generatedThesis, setGeneratedThesis] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState<number | null>(null);
  const [guestUses, setGuestUses] = useState(0);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isLoadingRateLimit, setIsLoadingRateLimit] = useState(true);

  const MAX_FREE_USES = 10;

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

  const handleGenerate = async () => {
    if (!topic.trim()) {
      alert('Please enter a topic');
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

      const response = await fetch('/api/thesis-generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          topic,
          essayType,
          stance,
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

      setGeneratedThesis(data.thesisStatements);
    } catch (error: any) {
      console.error('Generation error:', error);
      alert(error.message || 'Failed to generate. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = async (text: string, index: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(index);
      setTimeout(() => setCopied(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-purple-50 via-white to-pink-50 pt-24 pb-16 md:pt-32 md:pb-24">
        <div className="container mx-auto px-4 md:px-6 max-w-7xl">
          <div className="flex items-center gap-2 text-sm text-neutral-600 mb-6">
            <Link href="/" className="hover:text-primary-600 transition-colors">
              Home
            </Link>
            <ChevronRight size={16} />
            <span className="text-neutral-800 font-medium">Thesis Generator</span>
          </div>

          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-purple-100 text-purple-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Target size={18} />
              <span>Strong Thesis Statements</span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-neutral-900 mb-6 leading-tight">
              Thesis Statement Generator{' '}
              <span className="bg-gradient-to-r from-purple-500 to-pink-600 bg-clip-text text-transparent">
                with AI
              </span>
            </h1>

            <p className="text-lg md:text-xl text-neutral-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              Create strong, arguable thesis statements for your essays and research papers.
              Get multiple variations to choose from.
            </p>

            <div className="flex flex-wrap justify-center gap-8 md:gap-12 mb-8">
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-purple-600">1M+</div>
                <div className="text-sm text-neutral-600">Thesis Generated</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-purple-600">3</div>
                <div className="text-sm text-neutral-600">Variations</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-purple-600">6+</div>
                <div className="text-sm text-neutral-600">Essay Types</div>
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
              <h2 className="text-2xl font-bold text-neutral-900 mb-6">Generate Your Thesis Statement</h2>

              <div className="space-y-6">
                {/* Topic */}
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Essay Topic *
                  </label>
                  <input
                    type="text"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="e.g., The impact of social media on teenagers"
                    className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                {/* Essay Type */}
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Essay Type
                  </label>
                  <select
                    value={essayType}
                    onChange={(e) => setEssayType(e.target.value)}
                    className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    {essayTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Stance/Position */}
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Your Stance/Position (Optional)
                  </label>
                  <input
                    type="text"
                    value={stance}
                    onChange={(e) => setStance(e.target.value)}
                    placeholder="e.g., Social media has negative effects on mental health"
                    className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                {/* Action Bar */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4">
                  <div className="text-sm text-neutral-600">
                    Guest uses remaining: <span className="font-semibold text-purple-600">{guestUses}</span>
                  </div>
                  <button
                    onClick={handleGenerate}
                    disabled={isGenerating || !topic.trim()}
                    className="w-full sm:w-auto btn-primary btn-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    style={{ backgroundColor: '#9333ea' }}
                  >
                    {isGenerating ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles size={20} />
                        Generate Thesis Statements
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Output Section */}
            {generatedThesis.length > 0 && (
              <div className="border-t border-neutral-200 p-6 md:p-8 bg-neutral-50">
                <h3 className="text-xl font-semibold text-neutral-900 mb-4">Generated Thesis Statements</h3>
                <div className="space-y-4">
                  {generatedThesis.map((thesis, index) => (
                    <div key={index} className="bg-white border border-neutral-300 rounded-lg p-6">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="text-sm font-medium text-purple-600 mb-2">Option {index + 1}</div>
                          <p className="text-neutral-800 leading-relaxed">{thesis}</p>
                        </div>
                        <button
                          onClick={() => handleCopy(thesis, index)}
                          className="flex-shrink-0 p-2 hover:bg-neutral-100 rounded-lg transition-colors"
                        >
                          {copied === index ? (
                            <Check size={18} className="text-green-600" />
                          ) : (
                            <Copy size={18} className="text-neutral-600" />
                          )}
                        </button>
                      </div>
                    </div>
                  ))}
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
              Why Use Our Thesis Generator?
            </h2>
            <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
              Create strong, focused thesis statements in seconds
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Target,
                title: 'Clear & Focused',
                description: 'Generate specific, arguable thesis statements that guide your essay',
                color: 'text-purple-600',
                bg: 'bg-purple-50',
              },
              {
                icon: Lightbulb,
                title: 'Multiple Options',
                description: 'Get 3 different variations to choose the best fit for your essay',
                color: 'text-pink-600',
                bg: 'bg-pink-50',
              },
              {
                icon: Zap,
                title: 'Instant Results',
                description: 'Generate thesis statements in seconds, not hours of brainstorming',
                color: 'text-orange-600',
                bg: 'bg-orange-50',
              },
              {
                icon: Award,
                title: 'Academic Quality',
                description: 'Professionally crafted statements for all essay types',
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
                question: 'What makes a strong thesis statement?',
                answer: 'A strong thesis is specific, arguable, and clearly states your position on a topic. It should guide the entire essay and be defensible with evidence.',
              },
              {
                question: 'Can I edit the generated thesis?',
                answer: 'Absolutely! The generated thesis statements are starting points. You should refine and customize them to perfectly match your essay.',
              },
              {
                question: 'What essay types are supported?',
                answer: 'We support argumentative, analytical, expository, narrative, persuasive, and compare & contrast essays.',
              },
              {
                question: 'How many thesis statements will I get?',
                answer: 'You will receive 3 different variations for each topic, giving you options to choose from.',
              },
            ].map((faq, idx) => (
              <details
                key={idx}
                className="bg-neutral-50 p-6 rounded-xl border border-neutral-200 hover:shadow-md transition-shadow duration-200 group"
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
                <FileText size={32} />
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
