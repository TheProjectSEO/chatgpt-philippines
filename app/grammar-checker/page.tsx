'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  CheckCircle,
  Sparkles,
  Zap,
  Shield,
  Languages,
  BookOpen,
  Send,
  AlertCircle,
  Info,
  Copy,
  Check,
  X,
  ChevronRight,
  Star,
  GraduationCap,
  MessageSquare,
  Briefcase,
  FileText,
  Users,
  Globe,
  Clock,
  Award
} from 'lucide-react';

// Error type definitions
type ErrorType = 'grammar' | 'spelling' | 'punctuation' | 'style';

interface GrammarError {
  id: string;
  type: ErrorType;
  message: string;
  explanation: string;
  suggestion: string;
  start: number;
  end: number;
  originalText: string;
}

export default function GrammarCheckerPage() {
  const [text, setText] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const [hasChecked, setHasChecked] = useState(false);
  const [errors, setErrors] = useState<GrammarError[]>([]);
  const [selectedError, setSelectedError] = useState<string | null>(null);
  const [language, setLanguage] = useState<'auto' | 'english' | 'filipino'>('auto');
  const [copiedText, setCopiedText] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [checkCount, setCheckCount] = useState(0);
  const [isLoadingRateLimit, setIsLoadingRateLimit] = useState(true);

  const MAX_FREE_CHECKS = 10;
  const MAX_CHARACTERS = 5000;

  // Load rate limit status on mount
  useEffect(() => {
    const loadRateLimit = async () => {
      try {
        const response = await fetch('/api/rate-limit', {
          method: 'GET',
        });

        if (response.ok) {
          const rateLimit = await response.json();
          setCheckCount(rateLimit.count);

          // Show modal if already blocked
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

  // Real grammar checking function using Claude API
  const checkGrammar = async () => {
    // Check rate limit BEFORE processing
    if (checkCount >= MAX_FREE_CHECKS) {
      setShowLoginModal(true);
      return;
    }

    setIsChecking(true);
    setHasChecked(false);
    setErrors([]);

    try {
      // Call the grammar check API
      const response = await fetch('/api/grammar-check', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          language
        })
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle rate limit or other errors
        if (response.status === 429) {
          setShowLoginModal(true);
          throw new Error(data.message || 'Rate limit exceeded');
        }
        throw new Error(data.error || 'Failed to check grammar');
      }

      // Set the errors from the API response
      setErrors(data.errors || []);
      setHasChecked(true);

      // Increment check count based on the actual usage
      const newCount = checkCount + 1;
      setCheckCount(newCount);

      // Show login modal after MAX_FREE_CHECKS
      if (newCount >= MAX_FREE_CHECKS) {
        setTimeout(() => setShowLoginModal(true), 1500);
      }
    } catch (error: any) {
      console.error('Grammar check error:', error);
      // Show error to user
      alert(error.message || 'Failed to check grammar. Please try again.');
      setHasChecked(false);
    } finally {
      setIsChecking(false);
    }
  };

  const applyCorrection = (error: GrammarError) => {
    const newText = text.substring(0, error.start) + error.suggestion + text.substring(error.end);
    setText(newText);
    setErrors(errors.filter(e => e.id !== error.id));
  };

  const copyText = () => {
    navigator.clipboard.writeText(text);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  const getErrorColor = (type: ErrorType) => {
    switch (type) {
      case 'grammar': return 'text-red-600 bg-red-50 border-red-200';
      case 'spelling': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'punctuation': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'style': return 'text-purple-600 bg-purple-50 border-purple-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const errorCounts = {
    grammar: errors.filter(e => e.type === 'grammar').length,
    spelling: errors.filter(e => e.type === 'spelling').length,
    punctuation: errors.filter(e => e.type === 'punctuation').length,
    style: errors.filter(e => e.type === 'style').length,
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Login Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowLoginModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 animate-in fade-in zoom-in duration-200">
            <button
              onClick={() => setShowLoginModal(false)}
              className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>

            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-[#E8844A] to-[#D46D38] rounded-2xl flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-white" />
              </div>
            </div>

            <h2 className="text-2xl font-bold text-center mb-2 text-gray-900">
              You've reached your free limit
            </h2>
            <p className="text-gray-600 text-center mb-6">
              You've used all {MAX_FREE_CHECKS} free grammar checks. Sign in to continue checking unlimited texts.
            </p>

            <div className="bg-gradient-to-br from-orange-50 to-yellow-50 rounded-xl p-4 mb-6">
              <p className="text-sm font-semibold text-gray-900 mb-3">Sign in to unlock:</p>
              <ul className="space-y-2">
                {[
                  'Unlimited grammar checks',
                  'Save your corrections history',
                  'Advanced style suggestions',
                  'Priority support'
                ].map((benefit, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                    <CheckCircle className="w-5 h-5 text-[#E8844A] flex-shrink-0 mt-0.5" />
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-3">
              <a
                href="/api/auth/login"
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-[#E8844A] to-[#D46D38] text-white py-3 px-6 rounded-lg font-semibold hover:opacity-90 transition-opacity shadow-lg"
              >
                Sign In
              </a>
              <a
                href="/signup"
                className="w-full flex items-center justify-center gap-2 border-2 border-gray-300 text-gray-700 py-3 px-6 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
              >
                Create Account
              </a>
            </div>

            <p className="text-xs text-gray-500 text-center mt-4">
              Free to sign up. No credit card required.
            </p>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-lg border-b border-gray-200">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center space-x-2">
              <Sparkles className="w-8 h-8 text-[#E8844A]" />
              <span className="text-xl font-bold text-gray-900">HeyGPT.ph</span>
            </Link>
            <div className="flex items-center space-x-4">
              <Link href="/login" className="text-gray-700 hover:text-gray-900 font-medium text-sm sm:text-base">
                Log In
              </Link>
              <Link
                href="/signup"
                className="bg-gradient-to-r from-[#E8844A] to-[#D46D38] text-white px-4 py-2 rounded-lg hover:opacity-90 transition-opacity font-medium text-sm sm:text-base shadow-md"
              >
                Sign Up Free
              </Link>
            </div>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-orange-50 to-white pt-12 pb-16 sm:pt-16 sm:pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Grammar Checker
              <span className="block text-[#E8844A]">Write Better, Every Time</span>
            </h1>
            <p className="text-lg sm:text-xl text-gray-600 mb-4 max-w-3xl mx-auto">
              Catch typos and grammar mistakes in Filipino or English. Perfect for students, professionals, and content creators.
            </p>
            <div className="flex items-center justify-center gap-8 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-[#E8844A]" />
                <span className="font-medium">500,000+ texts checked</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-[#E8844A]" />
                <span className="font-medium">99% accuracy</span>
              </div>
            </div>
          </div>

          {/* Grammar Checker Interface */}
          <div className="max-w-5xl mx-auto">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
              {/* Language Toggle */}
              <div className="flex items-center justify-between px-6 py-4 bg-gray-50 border-b border-gray-200">
                <div className="flex items-center gap-2">
                  <Languages className="w-5 h-5 text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">Language:</span>
                </div>
                <div className="flex gap-2">
                  {(['auto', 'english', 'filipino'] as const).map((lang) => (
                    <button
                      key={lang}
                      onClick={() => setLanguage(lang)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        language === lang
                          ? 'bg-[#E8844A] text-white shadow-md'
                          : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                      }`}
                    >
                      {lang.charAt(0).toUpperCase() + lang.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Text Input Area */}
              <div className="grid md:grid-cols-2 gap-0 md:divide-x divide-gray-200">
                {/* Input */}
                <div className="relative">
                  <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value.slice(0, MAX_CHARACTERS))}
                    placeholder="Paste your text here... We'll check grammar, spelling, and style."
                    className="w-full h-96 p-6 text-base resize-none focus:outline-none focus:ring-2 focus:ring-[#E8844A] focus:ring-inset"
                    disabled={isChecking}
                  />
                  <div className="absolute bottom-4 right-4 text-sm text-gray-500">
                    {text.length} / {MAX_CHARACTERS}
                  </div>
                </div>

                {/* Results */}
                <div className="relative bg-gray-50">
                  {!hasChecked && !isChecking && (
                    <div className="h-96 flex items-center justify-center p-6">
                      <div className="text-center">
                        <CheckCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500">
                          Your corrections will appear here
                        </p>
                      </div>
                    </div>
                  )}

                  {isChecking && (
                    <div className="h-96 flex items-center justify-center p-6">
                      <div className="text-center">
                        <div className="w-16 h-16 border-4 border-[#E8844A] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                        <p className="text-gray-700 font-medium">Checking your text...</p>
                      </div>
                    </div>
                  )}

                  {hasChecked && !isChecking && (
                    <div className="h-96 overflow-y-auto p-6">
                      {errors.length === 0 ? (
                        <div className="text-center py-12">
                          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                          <h3 className="text-xl font-bold text-gray-900 mb-2">Perfect!</h3>
                          <p className="text-gray-600">No errors found in your text.</p>
                        </div>
                      ) : (
                        <div>
                          <div className="mb-6 p-4 bg-white rounded-lg border border-gray-200">
                            <h3 className="font-semibold text-gray-900 mb-3">Summary</h3>
                            <div className="grid grid-cols-2 gap-3">
                              <div className="flex items-center gap-2">
                                <AlertCircle className="w-4 h-4 text-red-600" />
                                <span className="text-sm text-gray-700">Grammar: {errorCounts.grammar}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <AlertCircle className="w-4 h-4 text-blue-600" />
                                <span className="text-sm text-gray-700">Spelling: {errorCounts.spelling}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <AlertCircle className="w-4 h-4 text-yellow-600" />
                                <span className="text-sm text-gray-700">Punctuation: {errorCounts.punctuation}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <AlertCircle className="w-4 h-4 text-purple-600" />
                                <span className="text-sm text-gray-700">Style: {errorCounts.style}</span>
                              </div>
                            </div>
                          </div>

                          <div className="space-y-3">
                            {errors.map((error) => (
                              <div
                                key={error.id}
                                className={`p-4 rounded-lg border ${getErrorColor(error.type)} cursor-pointer transition-all ${
                                  selectedError === error.id ? 'ring-2 ring-[#E8844A]' : ''
                                }`}
                                onClick={() => setSelectedError(error.id)}
                              >
                                <div className="flex items-start justify-between mb-2">
                                  <div className="flex items-center gap-2">
                                    <AlertCircle className="w-4 h-4" />
                                    <span className="font-semibold text-sm">{error.message}</span>
                                  </div>
                                  <span className="text-xs uppercase font-medium">{error.type}</span>
                                </div>
                                <p className="text-sm mb-3">{error.explanation}</p>
                                <div className="flex items-center gap-2">
                                  <span className="text-sm line-through text-gray-500">{error.originalText}</span>
                                  <ChevronRight className="w-4 h-4" />
                                  <span className="text-sm font-semibold text-green-600">{error.suggestion}</span>
                                </div>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    applyCorrection(error);
                                  }}
                                  className="mt-3 w-full bg-[#E8844A] text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-[#D46D38] transition-colors"
                                >
                                  Apply Correction
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between px-6 py-4 bg-gray-50 border-t border-gray-200">
                <button
                  onClick={copyText}
                  className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  disabled={!text}
                >
                  {copiedText ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  <span className="text-sm font-medium">{copiedText ? 'Copied!' : 'Copy Text'}</span>
                </button>

                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setText('');
                      setErrors([]);
                      setHasChecked(false);
                    }}
                    className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors text-sm font-medium"
                  >
                    Clear
                  </button>
                  <button
                    onClick={checkGrammar}
                    disabled={!text || isChecking || checkCount >= MAX_FREE_CHECKS}
                    className="flex items-center gap-2 bg-gradient-to-r from-[#E8844A] to-[#D46D38] text-white px-6 py-2 rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                  >
                    <CheckCircle className="w-5 h-5" />
                    Check Grammar
                  </button>
                </div>
              </div>

              {checkCount > 0 && checkCount < MAX_FREE_CHECKS && (
                <div className="px-6 py-3 bg-orange-50 border-t border-orange-200">
                  <p className="text-sm text-center text-gray-700">
                    {MAX_FREE_CHECKS - checkCount} free {MAX_FREE_CHECKS - checkCount === 1 ? 'check' : 'checks'} remaining.{' '}
                    <Link href="/signup" className="text-[#E8844A] font-semibold hover:underline">
                      Sign up for unlimited checks
                    </Link>
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-orange-200 rounded-full opacity-20 blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-yellow-200 rounded-full opacity-20 blur-3xl"></div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Powerful Grammar Checking Features
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Everything you need to write confidently in Filipino or English
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Zap,
                title: 'Catches typos instantly',
                description: 'Advanced AI detects errors in real-time as you type',
                color: 'bg-orange-100 text-[#E8844A]'
              },
              {
                icon: Languages,
                title: 'Works in Filipino & English',
                description: 'Full support for Tagalog, English, and Taglish',
                color: 'bg-blue-100 text-blue-600'
              },
              {
                icon: BookOpen,
                title: 'Explains every mistake',
                description: 'Learn from errors with clear, simple explanations',
                color: 'bg-purple-100 text-purple-600'
              },
              {
                icon: CheckCircle,
                title: 'One-click corrections',
                description: 'Apply fixes instantly with a single click',
                color: 'bg-green-100 text-green-600'
              }
            ].map((feature, i) => (
              <div key={i} className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 ${feature.color}`}>
                  <feature.icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Perfect for Every Filipino
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Students, professionals, and content creators trust our grammar checker
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Send,
                title: 'Email writing',
                description: 'Perfect professional emails every time',
                gradient: 'from-orange-50 to-white border-orange-200'
              },
              {
                icon: FileText,
                title: 'Reports',
                description: 'Error-free business documents',
                gradient: 'from-blue-50 to-white border-blue-200'
              },
              {
                icon: MessageSquare,
                title: 'Social media',
                description: 'Polished posts and captions',
                gradient: 'from-purple-50 to-white border-purple-200'
              },
              {
                icon: GraduationCap,
                title: 'Academic papers',
                description: 'Thesis and research perfection',
                gradient: 'from-green-50 to-white border-green-200'
              }
            ].map((useCase, i) => (
              <div key={i} className={`bg-gradient-to-br ${useCase.gradient} border rounded-xl p-6 hover:shadow-lg transition-shadow`}>
                <useCase.icon className="w-10 h-10 text-[#E8844A] mb-4" />
                <h3 className="text-lg font-bold text-gray-900 mb-2">{useCase.title}</h3>
                <p className="text-gray-600 text-sm">{useCase.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-lg text-gray-600">
              Check your grammar in 3 simple steps
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: 1,
                title: 'Paste',
                description: 'Copy and paste your text into the checker',
                icon: Copy
              },
              {
                step: 2,
                title: 'Check',
                description: 'AI analyzes grammar, spelling, and style',
                icon: CheckCircle
              },
              {
                step: 3,
                title: 'Correct',
                description: 'Review suggestions and apply corrections',
                icon: Sparkles
              }
            ].map((step) => (
              <div key={step.step} className="relative">
                <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
                  <div className="bg-gradient-to-r from-[#E8844A] to-[#D46D38] w-12 h-12 rounded-full flex items-center justify-center mb-4 text-white text-xl font-bold">
                    {step.step}
                  </div>
                  <step.icon className="w-8 h-8 text-[#E8844A] mb-3" />
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{step.title}</h3>
                  <p className="text-gray-600">{step.description}</p>
                </div>
                {step.step < 3 && (
                  <ChevronRight className="hidden md:block absolute top-1/2 -right-4 w-8 h-8 text-gray-300 transform -translate-y-1/2" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-4">
            {[
              {
                q: 'Does it work for Filipino?',
                a: 'Yes! Our grammar checker fully supports Tagalog, English, and Taglish. It understands common Filipino-English patterns and provides culturally relevant suggestions.'
              },
              {
                q: 'Is it free?',
                a: 'Yes, you get 3 free grammar checks without signing up. Sign up for a free account to get unlimited checks forever - no credit card required.'
              },
              {
                q: 'What errors does it catch?',
                a: 'Our AI catches grammar mistakes, spelling errors, punctuation issues, and style problems. It understands context and provides intelligent suggestions.'
              },
              {
                q: 'How accurate is it?',
                a: 'Our AI-powered checker has 99% accuracy for common grammar and spelling errors. It uses advanced language models trained on millions of texts.'
              },
              {
                q: 'Can I use it for academic work?',
                a: 'Absolutely! Many Filipino students use our checker for essays, thesis, and research papers. It helps ensure your writing meets academic standards.'
              },
              {
                q: 'Is my text private?',
                a: `Yes, your text is completely private. We don't store or share your content. Your data is processed securely and deleted immediately after checking.`
              }
            ].map((faq, i) => (
              <details key={i} className="group bg-white rounded-lg border border-gray-200 overflow-hidden">
                <summary className="cursor-pointer p-6 font-semibold text-gray-900 flex justify-between items-center hover:bg-gray-50 transition-colors">
                  <span>{faq.q}</span>
                  <ChevronRight className="w-5 h-5 text-gray-400 group-open:rotate-90 transition-transform" />
                </summary>
                <div className="px-6 pb-6 text-gray-600">
                  {faq.a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-[#E8844A] to-[#D46D38]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
            Start checking your grammar now
          </h2>
          <p className="text-xl text-orange-50 mb-8">
            Join 500,000+ Filipinos writing better with AI
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="bg-white text-[#E8844A] px-8 py-4 rounded-lg hover:bg-gray-100 transition-colors text-lg font-semibold shadow-lg"
            >
              Try It Free
            </button>
            <Link
              href="/signup"
              className="border-2 border-white text-white px-8 py-4 rounded-lg hover:bg-white hover:text-[#E8844A] transition-all text-lg font-semibold"
            >
              Sign Up for Unlimited
            </Link>
          </div>
          <p className="mt-6 text-sm text-orange-50">
            No credit card required • 100% Free Forever
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Sparkles className="w-6 h-6 text-[#E8844A]" />
                <span className="text-lg font-bold text-white">HeyGPT.ph</span>
              </div>
              <p className="text-sm text-gray-400">
                Free AI-powered tools for Filipinos. Grammar checker, chat, and more.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-white mb-4">Tools</h3>
              <ul className="space-y-2 text-sm">
                <li><Link href="/grammar-checker" className="hover:text-[#E8844A] transition-colors">Grammar Checker</Link></li>
                <li><Link href="/plagiarism-checker" className="hover:text-[#E8844A] transition-colors">Plagiarism Checker</Link></li>
                <li><Link href="/ai-detector" className="hover:text-[#E8844A] transition-colors">AI Detector</Link></li>
                <li><Link href="/chat" className="hover:text-[#E8844A] transition-colors">AI Chat</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-white mb-4">Resources</h3>
              <ul className="space-y-2 text-sm">
                <li><Link href="/blog" className="hover:text-[#E8844A] transition-colors">Blog</Link></li>
                <li><Link href="/help" className="hover:text-[#E8844A] transition-colors">Help Center</Link></li>
                <li><Link href="/about" className="hover:text-[#E8844A] transition-colors">About Us</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-white mb-4">Legal</h3>
              <ul className="space-y-2 text-sm">
                <li><Link href="/privacy" className="hover:text-[#E8844A] transition-colors">Privacy Policy</Link></li>
                <li><Link href="/terms" className="hover:text-[#E8844A] transition-colors">Terms of Service</Link></li>
                <li><Link href="/contact" className="hover:text-[#E8844A] transition-colors">Contact</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 text-center text-sm text-gray-400">
            <p>2024 HeyGPT.ph. All rights reserved. Made with love for Filipinos.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
