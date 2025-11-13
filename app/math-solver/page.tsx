'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Calculator,
  Copy,
  Check,
  Sparkles,
  ChevronRight,
  ChevronDown,
  X,
  Zap,
  Award,
  Target,
  BookOpen,
  TrendingUp,
  Brain,
} from 'lucide-react';

// Math problem types
const problemTypes = [
  { value: 'algebra', label: 'Algebra' },
  { value: 'calculus', label: 'Calculus' },
  { value: 'geometry', label: 'Geometry' },
  { value: 'trigonometry', label: 'Trigonometry' },
  { value: 'statistics', label: 'Statistics' },
  { value: 'arithmetic', label: 'Arithmetic' },
];

export default function MathSolverPage() {
  const [problem, setProblem] = useState('');
  const [problemType, setProblemType] = useState('algebra');
  const [solution, setSolution] = useState('');
  const [isSolving, setIsSolving] = useState(false);
  const [copied, setCopied] = useState(false);
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

  const handleSolve = async () => {
    if (!problem.trim()) {
      alert('Please enter a math problem');
      return;
    }

    if (guestUses <= 0) {
      setShowLoginModal(true);
      return;
    }

    setIsSolving(true);

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
          setIsSolving(false);
          return;
        }
      }

      const response = await fetch('/api/math-solve', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          problem,
          problemType,
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
        throw new Error(data.error || 'Solving failed');
      }

      setSolution(data.solution);
    } catch (error: any) {
      console.error('Solving error:', error);
      alert(error.message || 'Failed to solve. Please try again.');
    } finally {
      setIsSolving(false);
    }
  };

  const handleCopy = async () => {
    if (!solution) return;

    try {
      await navigator.clipboard.writeText(solution);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const loadSample = () => {
    const samples: Record<string, string> = {
      algebra: 'Solve for x: 3x + 7 = 22',
      calculus: 'Find the derivative of f(x) = x³ + 2x² - 5x + 1',
      geometry: 'Find the area of a circle with radius 7 cm',
      trigonometry: 'Solve: sin(x) = 0.5 for 0 ≤ x ≤ 2π',
      statistics: 'Find the mean, median, and mode of: 5, 8, 12, 8, 15, 20, 8',
      arithmetic: 'Calculate: (25 × 4) + (18 ÷ 3) - 7',
    };
    setProblem(samples[problemType] || samples.algebra);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-green-50 via-white to-teal-50 pt-24 pb-16 md:pt-32 md:pb-24">
        <div className="container mx-auto px-4 md:px-6 max-w-7xl">
          <div className="flex items-center gap-2 text-sm text-neutral-600 mb-6">
            <Link href="/" className="hover:text-primary-600 transition-colors">
              Home
            </Link>
            <ChevronRight size={16} />
            <span className="text-neutral-800 font-medium">Math Problem Solver</span>
          </div>

          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Calculator size={18} />
              <span>Step-by-Step Solutions</span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-neutral-900 mb-6 leading-tight">
              Math Problem Solver{' '}
              <span className="bg-gradient-to-r from-green-500 to-teal-600 bg-clip-text text-transparent">
                with AI
              </span>
            </h1>

            <p className="text-lg md:text-xl text-neutral-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              Solve math problems with detailed step-by-step explanations.
              From algebra to calculus, get instant solutions with AI.
            </p>

            <div className="flex flex-wrap justify-center gap-8 md:gap-12 mb-8">
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-green-600">2M+</div>
                <div className="text-sm text-neutral-600">Problems Solved</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-green-600">6+</div>
                <div className="text-sm text-neutral-600">Math Topics</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-green-600">24/7</div>
                <div className="text-sm text-neutral-600">Available</div>
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
              <h2 className="text-2xl font-bold text-neutral-900 mb-6">Solve Your Math Problem</h2>

              <div className="space-y-6">
                {/* Problem Type */}
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Problem Type
                  </label>
                  <select
                    value={problemType}
                    onChange={(e) => setProblemType(e.target.value)}
                    className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    {problemTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Problem Input */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-neutral-700">
                      Math Problem *
                    </label>
                    <button
                      onClick={loadSample}
                      className="text-sm text-green-600 hover:text-green-700 font-medium"
                    >
                      Load sample
                    </button>
                  </div>
                  <textarea
                    value={problem}
                    onChange={(e) => setProblem(e.target.value)}
                    placeholder="Enter your math problem here..."
                    className="w-full h-32 px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                  />
                </div>

                {/* Action Bar */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4">
                  <div className="text-sm text-neutral-600">
                    Guest uses remaining: <span className="font-semibold text-green-600">{guestUses}</span>
                  </div>
                  <button
                    onClick={handleSolve}
                    disabled={isSolving || !problem.trim()}
                    className="w-full sm:w-auto btn-primary btn-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    style={{ backgroundColor: '#059669' }}
                  >
                    {isSolving ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        Solving...
                      </>
                    ) : (
                      <>
                        <Calculator size={20} />
                        Solve Problem
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Solution Output */}
            {solution && (
              <div className="border-t border-neutral-200 p-6 md:p-8 bg-neutral-50">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold text-neutral-900">Solution</h3>
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
                    {solution}
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
              Why Use Our Math Solver?
            </h2>
            <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
              Understand math problems with clear, detailed explanations
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: BookOpen,
                title: 'Step-by-Step',
                description: 'Get detailed explanations for every step of the solution',
                color: 'text-green-600',
                bg: 'bg-green-50',
              },
              {
                icon: Brain,
                title: 'Learn Better',
                description: 'Understand the concepts behind each solution',
                color: 'text-blue-600',
                bg: 'bg-blue-50',
              },
              {
                icon: Zap,
                title: 'Instant Help',
                description: 'Get solutions in seconds, available 24/7',
                color: 'text-orange-600',
                bg: 'bg-orange-50',
              },
              {
                icon: Award,
                title: 'All Levels',
                description: 'From basic arithmetic to advanced calculus',
                color: 'text-purple-600',
                bg: 'bg-purple-50',
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
                question: 'What types of math problems can you solve?',
                answer: 'We can solve algebra, calculus, geometry, trigonometry, statistics, and arithmetic problems. From basic equations to complex derivatives and integrals.',
              },
              {
                question: 'Do you show step-by-step solutions?',
                answer: 'Yes! Every solution includes detailed step-by-step explanations so you can understand the process and learn the concepts.',
              },
              {
                question: 'Can I use this for homework?',
                answer: 'Our solver is designed to help you learn. Use it to check your work and understand concepts, but always try solving problems yourself first.',
              },
              {
                question: 'Is it accurate?',
                answer: 'Our AI is trained on mathematical principles and provides accurate solutions. However, always verify important calculations independently.',
              },
            ].map((faq, idx) => (
              <details
                key={idx}
                className="bg-neutral-50 p-6 rounded-xl border border-neutral-200 hover:shadow-md transition-shadow duration-200 group"
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
                <Calculator size={32} />
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
