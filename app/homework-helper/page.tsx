'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  BookOpen,
  Copy,
  Check,
  ChevronRight,
  X,
  Zap,
  Shield,
  Sparkles,
  Users,
  Briefcase,
  GraduationCap,
  Brain,
  ChevronDown,
  Calculator,
  Globe,
  FileText,
  Microscope,
} from 'lucide-react';

const subjects = [
  { code: 'math', name: 'Mathematics', icon: '🔢' },
  { code: 'science', name: 'Science', icon: '🔬' },
  { code: 'english', name: 'English', icon: '📚' },
  { code: 'history', name: 'History', icon: '📜' },
  { code: 'geography', name: 'Geography', icon: '🌍' },
  { code: 'physics', name: 'Physics', icon: '⚛️' },
  { code: 'chemistry', name: 'Chemistry', icon: '🧪' },
  { code: 'biology', name: 'Biology', icon: '🧬' },
  { code: 'literature', name: 'Literature', icon: '📖' },
  { code: 'economics', name: 'Economics', icon: '💰' },
];

const sampleQuestions = [
  'Explain the Pythagorean theorem with examples',
  'What caused World War I?',
  'How does photosynthesis work?',
  'Analyze the themes in Romeo and Juliet',
];

export default function HomeworkHelperPage() {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('math');
  const [isProcessing, setIsProcessing] = useState(false);
  const [charCount, setCharCount] = useState(0);
  const [copied, setCopied] = useState(false);
  const [guestUses, setGuestUses] = useState(0);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showSubjectDropdown, setShowSubjectDropdown] = useState(false);

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
      }
    };

    loadRateLimit();
  }, []);

  // Update character count
  useEffect(() => {
    setCharCount(question.length);
  }, [question]);

  // Get subject by code
  const getSubject = (code: string) => {
    return subjects.find(subj => subj.code === code) || subjects[0];
  };

  // Handle homework help
  const handleGetHelp = async () => {
    if (!question.trim()) {
      alert('Please enter your homework question');
      return;
    }

    if (guestUses <= 0) {
      setShowLoginModal(true);
      return;
    }

    setIsProcessing(true);

    try {
      const response = await fetch('/api/homework-help', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: question,
          subject: selectedSubject,
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
        throw new Error(data.error || 'Failed to get homework help');
      }

      setAnswer(data.answer);
      const remaining = Math.max(0, MAX_FREE_USES - (data.count || 0));
      setGuestUses(remaining);

    } catch (error: any) {
      console.error('Homework help error:', error);
      alert(error.message || 'Failed to get help. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Copy to clipboard
  const handleCopy = async () => {
    if (!answer) return;

    try {
      await navigator.clipboard.writeText(answer);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  // Load sample question
  const loadSampleQuestion = () => {
    const randomQuestion = sampleQuestions[Math.floor(Math.random() * sampleQuestions.length)];
    setQuestion(randomQuestion);
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
            <span className="text-neutral-800 font-medium">AI Homework Helper</span>
          </div>

          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <BookOpen size={18} />
              <span>All Subjects Supported</span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-neutral-900 mb-6 leading-tight">
              AI Homework Helper -{' '}
              <span className="bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent">
                Get Smart Answers
              </span>
            </h1>

            <p className="text-lg md:text-xl text-neutral-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              Get step-by-step explanations for homework questions. Perfect for students from elementary to college level.
            </p>

            {/* Stats */}
            <div className="flex flex-wrap justify-center gap-8 md:gap-12 mb-8">
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-orange-600">1M+</div>
                <div className="text-sm text-neutral-600">Questions Solved</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-orange-600">10+</div>
                <div className="text-sm text-neutral-600">Subjects</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-orange-600">24/7</div>
                <div className="text-sm text-neutral-600">Available</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Helper Interface */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4 md:px-6 max-w-7xl">
          <div className="bg-white rounded-2xl shadow-lg border border-neutral-200 overflow-hidden">
            {/* Subject Selection Bar */}
            <div className="border-b border-neutral-200 p-4">
              <div className="flex items-center gap-4">
                <label className="text-sm font-medium text-neutral-700">Subject:</label>
                <div className="relative">
                  <button
                    onClick={() => setShowSubjectDropdown(!showSubjectDropdown)}
                    className="flex items-center gap-3 px-4 py-2 bg-neutral-50 rounded-lg hover:bg-neutral-100 transition-colors border border-neutral-300"
                  >
                    <span className="text-xl">{getSubject(selectedSubject).icon}</span>
                    <span className="font-medium text-neutral-800">
                      {getSubject(selectedSubject).name}
                    </span>
                    <ChevronDown size={18} className="text-neutral-500" />
                  </button>

                  {/* Subject Dropdown */}
                  {showSubjectDropdown && (
                    <div className="absolute top-full left-0 mt-2 bg-white border border-neutral-200 rounded-lg shadow-xl z-50 min-w-[200px]">
                      <div className="max-h-80 overflow-y-auto">
                        {subjects.map((subj) => (
                          <button
                            key={subj.code}
                            onClick={() => {
                              setSelectedSubject(subj.code);
                              setShowSubjectDropdown(false);
                            }}
                            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-orange-50 transition-colors"
                          >
                            <span className="text-xl">{subj.icon}</span>
                            <span className="text-neutral-800">{subj.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Input/Output Panels */}
            <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-neutral-200">
              {/* Input Panel */}
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <label className="text-sm font-medium text-neutral-700">
                    Enter your homework question
                  </label>
                  <button
                    onClick={loadSampleQuestion}
                    className="text-sm text-orange-600 hover:text-orange-700 font-medium"
                  >
                    Load sample
                  </button>
                </div>

                <textarea
                  value={question}
                  onChange={(e) => {
                    if (e.target.value.length <= maxChars) {
                      setQuestion(e.target.value);
                    }
                  }}
                  placeholder="Example: Explain how to solve quadratic equations step by step..."
                  className="w-full h-64 p-4 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none text-neutral-800"
                  style={{ fontSize: '16px' }}
                />

                <div className="flex items-center justify-between mt-3">
                  <div className="text-sm text-neutral-500">
                    {charCount} / {maxChars} characters
                  </div>
                  {question && (
                    <button
                      onClick={() => {
                        setQuestion('');
                        setAnswer('');
                      }}
                      className="text-sm text-neutral-500 hover:text-neutral-700"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>

              {/* Output Panel */}
              <div className="p-6 bg-neutral-50">
                <div className="flex items-center justify-between mb-4">
                  <label className="text-sm font-medium text-neutral-700">
                    Answer & Explanation
                  </label>
                  {answer && (
                    <button
                      onClick={handleCopy}
                      className="p-2 rounded-lg hover:bg-white transition-colors"
                      title="Copy answer"
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
                  {isProcessing ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mb-3"></div>
                        <p className="text-neutral-600">Processing question...</p>
                      </div>
                    </div>
                  ) : answer ? (
                    <p className="text-neutral-800 whitespace-pre-wrap" style={{ fontSize: '16px' }}>
                      {answer}
                    </p>
                  ) : (
                    <p className="text-neutral-400">Answer will appear here...</p>
                  )}
                </div>
              </div>
            </div>

            {/* Action Bar */}
            <div className="border-t border-neutral-200 p-6 bg-neutral-50">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-sm text-neutral-600">
                  Guest uses remaining: <span className="font-semibold text-orange-600">{guestUses}</span>
                </div>
                <button
                  onClick={handleGetHelp}
                  disabled={isProcessing || !question.trim()}
                  className="w-full sm:w-auto btn-primary btn-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isProcessing ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <BookOpen size={20} />
                      Get Help
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
              Why Use Our AI Homework Helper?
            </h2>
            <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
              Powered by advanced AI to provide clear, educational explanations
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Brain,
                title: 'Smart Explanations',
                description: 'Get step-by-step breakdowns that help you understand concepts',
                color: 'text-blue-600',
                bg: 'bg-blue-50',
              },
              {
                icon: Sparkles,
                title: 'AI-Powered',
                description: 'Advanced AI that understands context and provides accurate answers',
                color: 'text-purple-600',
                bg: 'bg-purple-50',
              },
              {
                icon: Zap,
                title: 'Instant Help',
                description: 'Get answers in seconds, available 24/7 when you need it',
                color: 'text-orange-600',
                bg: 'bg-orange-50',
              },
              {
                icon: Shield,
                title: 'Learning Focused',
                description: 'Designed to help you learn, not just get answers',
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
              Perfect For All Students
            </h2>
            <p className="text-lg text-neutral-600">
              From elementary school to university - get homework help anytime
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                icon: GraduationCap,
                title: 'Elementary & High School',
                description: 'Get help with basic to advanced homework across all subjects. Understand difficult concepts with simple explanations tailored to your level.',
                stats: 'Grades 1-12',
              },
              {
                icon: Users,
                title: 'College Students',
                description: 'Tackle complex university-level problems with detailed explanations. Get help understanding theories, solving equations, and analyzing texts.',
                stats: 'All majors',
              },
              {
                icon: Brain,
                title: 'Exam Preparation',
                description: 'Practice and prepare for tests with instant feedback. Understand your mistakes and learn the right approach to solve similar problems.',
                stats: 'All tests',
              },
              {
                icon: Briefcase,
                title: 'Self-Learners',
                description: 'Explore new subjects at your own pace. Get explanations for topics you are teaching yourself without waiting for a tutor.',
                stats: 'Anytime',
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
              Everything you need to know about our AI homework helper
            </p>
          </div>

          <div className="space-y-4">
            {[
              {
                question: 'What subjects are supported?',
                answer: 'We support all major subjects including Mathematics, Science, English, History, Geography, Physics, Chemistry, Biology, Literature, and Economics. Our AI can help with questions from elementary to college level.',
              },
              {
                question: 'Will this just give me the answer?',
                answer: 'No! Our AI provides step-by-step explanations to help you understand the concept. We focus on teaching you how to solve problems, not just giving you answers to copy.',
              },
              {
                question: 'Can I upload images of my homework?',
                answer: 'Currently, you need to type your question. Image upload support is coming soon. For now, you can describe your problem or type out the question.',
              },
              {
                question: 'Is this considered cheating?',
                answer: 'Our tool is designed as a learning aid, similar to a tutor. It helps you understand concepts and solve problems yourself. Always check your school policy on homework help tools.',
              },
              {
                question: 'Is it really free?',
                answer: 'Yes! Guest users get 10 free questions. Create a free account for unlimited access to our AI homework helper.',
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
            Start Learning Better Today
          </h2>
          <p className="text-lg md:text-xl text-orange-50 mb-8 max-w-2xl mx-auto">
            Join thousands of students getting smarter homework help with AI
          </p>
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="inline-flex items-center gap-3 bg-white text-orange-600 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-orange-50 transition-all duration-200 hover:scale-105 shadow-lg"
          >
            <BookOpen size={24} />
            Get Homework Help - Free Forever
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
                <BookOpen size={32} />
              </div>
              <h3 className="text-2xl font-bold text-neutral-900 mb-2">
                Usage Limit Reached
              </h3>
              <p className="text-neutral-600">
                Create a free account for unlimited homework help
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
              No credit card required. Get unlimited homework help instantly.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
