'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Code,
  Shield,
  Zap,
  AlertTriangle,
  CheckCircle,
  Info,
  ChevronRight,
  ChevronDown,
  Copy,
  Check,
  X,
  Brain,
  Bug,
  AlertCircle,
  TrendingUp,
  FileCode,
  Sparkles,
} from 'lucide-react';

// Programming languages
const languages = [
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'python', label: 'Python' },
  { value: 'java', label: 'Java' },
  { value: 'cpp', label: 'C++' },
  { value: 'csharp', label: 'C#' },
  { value: 'php', label: 'PHP' },
  { value: 'ruby', label: 'Ruby' },
  { value: 'go', label: 'Go' },
  { value: 'rust', label: 'Rust' },
  { value: 'swift', label: 'Swift' },
  { value: 'kotlin', label: 'Kotlin' },
];

// Severity badge component
const SeverityBadge = ({ severity }: { severity: string }) => {
  const config = {
    critical: { bg: 'bg-red-100', text: 'text-red-700', icon: AlertCircle },
    warning: { bg: 'bg-yellow-100', text: 'text-yellow-700', icon: AlertTriangle },
    info: { bg: 'bg-blue-100', text: 'text-blue-700', icon: Info },
  };

  const severityLower = severity.toLowerCase();
  const { bg, text, icon: Icon } = config[severityLower as keyof typeof config] || config.info;

  return (
    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${bg} ${text}`}>
      <Icon size={14} />
      {severity}
    </span>
  );
};

export default function CodeAnalyzerPage() {
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [analysis, setAnalysis] = useState('');
  const [thinking, setThinking] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [charCount, setCharCount] = useState(0);
  const [copied, setCopied] = useState(false);
  const [guestUses, setGuestUses] = useState(0);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isLoadingRateLimit, setIsLoadingRateLimit] = useState(true);
  const [showThinking, setShowThinking] = useState(false);

  const maxChars = 10000;
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
    setCharCount(code.length);
  }, [code]);

  // Handle analysis
  const handleAnalyze = async () => {
    if (!code.trim()) {
      alert('Please enter code to analyze');
      return;
    }

    if (guestUses <= 0) {
      setShowLoginModal(true);
      return;
    }

    setIsAnalyzing(true);

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
          setIsAnalyzing(false);
          return;
        }
      }

      const response = await fetch('/api/code-analyzer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code,
          language,
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
        throw new Error(data.error || 'Analysis failed');
      }

      setAnalysis(data.analysis);
      setThinking(data.thinking || '');
    } catch (error: any) {
      console.error('Analysis error:', error);
      alert(error.message || 'Failed to analyze. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Copy to clipboard
  const handleCopy = async () => {
    if (!analysis) return;

    try {
      await navigator.clipboard.writeText(analysis);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-purple-50 via-white to-indigo-50 pt-24 pb-16 md:pt-32 md:pb-24">
        <div className="container mx-auto px-4 md:px-6 max-w-7xl">
          <div className="flex items-center gap-2 text-sm text-neutral-600 mb-6">
            <Link href="/" className="hover:text-primary-600 transition-colors">
              Home
            </Link>
            <ChevronRight size={16} />
            <span className="text-neutral-800 font-medium">Code Analyzer</span>
          </div>

          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-purple-100 text-purple-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Shield size={18} />
              <span>AI-Powered Deep Code Analysis</span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-neutral-900 mb-6 leading-tight">
              Advanced Code Analyzer{' '}
              <span className="bg-gradient-to-r from-purple-500 to-indigo-600 bg-clip-text text-transparent">
                with Extended Thinking
              </span>
            </h1>

            <p className="text-lg md:text-xl text-neutral-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              Detect security vulnerabilities, performance issues, code smells, and best practice violations
              with AI-powered deep analysis using extended thinking for complex patterns.
            </p>

            <div className="flex flex-wrap justify-center gap-8 md:gap-12 mb-8">
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-purple-600">5</div>
                <div className="text-sm text-neutral-600">Analysis Categories</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-purple-600">12+</div>
                <div className="text-sm text-neutral-600">Languages</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-purple-600">15K</div>
                <div className="text-sm text-neutral-600">Thinking Tokens</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Interface */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4 md:px-6 max-w-6xl">
          <div className="bg-white rounded-2xl shadow-lg border border-neutral-200 overflow-hidden">
            <div className="p-6 md:p-8">
              <h2 className="text-2xl font-bold text-neutral-900 mb-6">Analyze Your Code</h2>

              <div className="space-y-6">
                {/* Language Selector */}
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Programming Language
                  </label>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    {languages.map((lang) => (
                      <option key={lang.value} value={lang.value}>
                        {lang.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Code Input */}
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Code to Analyze *
                  </label>
                  <textarea
                    value={code}
                    onChange={(e) => {
                      if (e.target.value.length <= maxChars) {
                        setCode(e.target.value);
                      }
                    }}
                    placeholder="Paste your code here..."
                    className="w-full h-96 px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none font-mono text-sm"
                    spellCheck={false}
                  />
                  <div className="flex justify-between items-center text-sm text-neutral-500 mt-2">
                    <span>{charCount} / {maxChars} characters</span>
                    <span className="text-xs">Supports up to 10,000 characters</span>
                  </div>
                </div>

                {/* Action Bar */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4">
                  <div className="text-sm text-neutral-600">
                    Guest uses remaining: <span className="font-semibold text-purple-600">{guestUses}</span>
                  </div>
                  <button
                    onClick={handleAnalyze}
                    disabled={isAnalyzing || !code.trim()}
                    className="w-full sm:w-auto bg-gradient-to-r from-purple-500 to-indigo-600 text-white px-8 py-3 rounded-lg font-medium hover:from-purple-600 hover:to-indigo-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isAnalyzing ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        Analyzing with Extended Thinking...
                      </>
                    ) : (
                      <>
                        <Shield size={20} />
                        Analyze Code
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Output Section */}
            {analysis && (
              <div className="border-t border-neutral-200 bg-neutral-50">
                {/* Analysis Results */}
                <div className="p-6 md:p-8">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-semibold text-neutral-900">Analysis Results</h3>
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
                  <div className="bg-white border border-neutral-300 rounded-lg p-6 max-h-[600px] overflow-y-auto">
                    <pre className="text-neutral-800 whitespace-pre-wrap font-sans leading-relaxed">
                      {analysis}
                    </pre>
                  </div>
                </div>

                {/* Thinking Process (Collapsible) */}
                {thinking && (
                  <div className="border-t border-neutral-200 p-6 md:p-8 bg-purple-50">
                    <button
                      onClick={() => setShowThinking(!showThinking)}
                      className="w-full flex items-center justify-between text-left group"
                    >
                      <div className="flex items-center gap-2">
                        <Brain className="text-purple-600" size={24} />
                        <h3 className="text-xl font-semibold text-neutral-900">Extended Thinking Process</h3>
                      </div>
                      <ChevronDown
                        className={`text-purple-600 transform transition-transform duration-200 ${
                          showThinking ? 'rotate-180' : ''
                        }`}
                        size={24}
                      />
                    </button>

                    {showThinking && (
                      <div className="mt-4 bg-white border border-purple-200 rounded-lg p-6 max-h-96 overflow-y-auto">
                        <p className="text-sm text-purple-700 mb-3 font-medium">
                          See how the AI reasoned through your code analysis:
                        </p>
                        <pre className="text-neutral-700 whitespace-pre-wrap font-sans text-sm leading-relaxed">
                          {thinking}
                        </pre>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Analysis Categories */}
      <section className="py-16 md:py-24 bg-neutral-50">
        <div className="container mx-auto px-4 md:px-6 max-w-7xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-4">
              What We Analyze
            </h2>
            <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
              Comprehensive code analysis across multiple dimensions
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Shield,
                title: 'Security Vulnerabilities',
                description: 'SQL injection, XSS, CSRF, authentication issues, exposed secrets',
                color: 'text-red-600',
                bg: 'bg-red-50',
                severity: 'Critical',
              },
              {
                icon: Zap,
                title: 'Performance Issues',
                description: 'N+1 queries, memory leaks, inefficient algorithms, caching problems',
                color: 'text-orange-600',
                bg: 'bg-orange-50',
                severity: 'Warning',
              },
              {
                icon: CheckCircle,
                title: 'Best Practices',
                description: 'Code organization, naming conventions, error handling, SOLID principles',
                color: 'text-green-600',
                bg: 'bg-green-50',
                severity: 'Info',
              },
              {
                icon: Bug,
                title: 'Code Smells',
                description: 'Duplicated code, long methods, dead code, god objects, tight coupling',
                color: 'text-purple-600',
                bg: 'bg-purple-50',
                severity: 'Warning',
              },
              {
                icon: AlertTriangle,
                title: 'Potential Bugs',
                description: 'Race conditions, null pointers, off-by-one errors, edge cases',
                color: 'text-yellow-600',
                bg: 'bg-yellow-50',
                severity: 'Warning',
              },
              {
                icon: Brain,
                title: 'Extended Thinking',
                description: 'Deep reasoning through complex code patterns with 15K thinking tokens',
                color: 'text-indigo-600',
                bg: 'bg-indigo-50',
                severity: 'Info',
              },
            ].map((category, idx) => (
              <div
                key={idx}
                className="bg-white p-6 rounded-xl border border-neutral-200 hover:shadow-lg transition-all duration-200 hover:-translate-y-1"
              >
                <div className={`${category.bg} ${category.color} w-12 h-12 rounded-lg flex items-center justify-center mb-4`}>
                  <category.icon size={24} />
                </div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xl font-semibold text-neutral-900">
                    {category.title}
                  </h3>
                  <SeverityBadge severity={category.severity} />
                </div>
                <p className="text-neutral-600 text-sm">
                  {category.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-4 md:px-6 max-w-7xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-4">
              Why Use Our Code Analyzer?
            </h2>
            <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
              Powered by Claude Sonnet 4 with extended thinking for deep analysis
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Brain,
                title: 'Extended Thinking',
                description: '15,000 tokens of reasoning for complex code patterns and security analysis',
                color: 'text-purple-600',
                bg: 'bg-purple-50',
              },
              {
                icon: Sparkles,
                title: 'Claude Sonnet 4',
                description: 'Latest AI model with superior code understanding and analysis',
                color: 'text-indigo-600',
                bg: 'bg-indigo-50',
              },
              {
                icon: FileCode,
                title: '12+ Languages',
                description: 'Support for JavaScript, Python, Java, C++, Go, Rust, and more',
                color: 'text-blue-600',
                bg: 'bg-blue-50',
              },
              {
                icon: TrendingUp,
                title: 'Actionable Insights',
                description: 'Get specific recommendations with code examples for fixes',
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
                <p className="text-neutral-600 text-sm">
                  {feature.description}
                </p>
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
          </div>

          <div className="space-y-4">
            {[
              {
                question: 'What is Extended Thinking?',
                answer: 'Extended thinking allows the AI to reason through complex code patterns before providing analysis. It uses up to 15,000 tokens to deeply understand your code, identify subtle issues, and provide more accurate recommendations.',
              },
              {
                question: 'What languages are supported?',
                answer: 'We support 12+ programming languages including JavaScript, TypeScript, Python, Java, C++, C#, PHP, Ruby, Go, Rust, Swift, and Kotlin. More languages are being added regularly.',
              },
              {
                question: 'How accurate is the security analysis?',
                answer: 'Our analyzer uses Claude Sonnet 4 with extended thinking to identify common security vulnerabilities like SQL injection, XSS, CSRF, and exposed credentials. However, it should complement, not replace, professional security audits.',
              },
              {
                question: 'Can I analyze production code?',
                answer: 'Yes, but be cautious about analyzing proprietary code. We recommend reviewing our privacy policy and considering sanitizing sensitive information before analysis. Code is not stored long-term.',
              },
              {
                question: 'What is the maximum code length?',
                answer: 'You can analyze up to 10,000 characters of code per request. For larger codebases, consider analyzing critical sections or individual files separately.',
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
                <Shield size={32} />
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
                className="block w-full bg-gradient-to-r from-purple-500 to-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:from-purple-600 hover:to-indigo-700 transition-all duration-200 text-center"
              >
                Sign Up - Free Forever
              </Link>
              <Link
                href="/login"
                className="block w-full bg-white border-2 border-purple-500 text-purple-600 px-6 py-3 rounded-lg font-medium hover:bg-purple-50 transition-all duration-200 text-center"
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
