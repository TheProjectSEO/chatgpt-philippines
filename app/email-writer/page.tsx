'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Mail,
  Copy,
  Check,
  Sparkles,
  ChevronRight,
  ChevronDown,
  X,
  Zap,
  Award,
  Target,
  Briefcase,
  Users,
  MessageSquare,
} from 'lucide-react';

// Email types
const emailTypes = [
  { value: 'professional', label: 'Professional/Business' },
  { value: 'casual', label: 'Casual/Friendly' },
  { value: 'formal', label: 'Formal/Official' },
  { value: 'follow-up', label: 'Follow-up' },
  { value: 'thank-you', label: 'Thank You' },
  { value: 'apology', label: 'Apology' },
  { value: 'introduction', label: 'Introduction' },
  { value: 'request', label: 'Request' },
];

export default function EmailWriterPage() {
  const [purpose, setPurpose] = useState('');
  const [emailType, setEmailType] = useState('professional');
  const [recipient, setRecipient] = useState('');
  const [keyPoints, setKeyPoints] = useState('');
  const [generatedEmail, setGeneratedEmail] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [charCount, setCharCount] = useState(0);
  const [copied, setCopied] = useState(false);
  const [guestUses, setGuestUses] = useState(0);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isLoadingRateLimit, setIsLoadingRateLimit] = useState(true);

  const maxChars = 1000;
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

  useEffect(() => {
    setCharCount(keyPoints.length);
  }, [keyPoints]);

  const handleGenerate = async () => {
    if (!purpose.trim()) {
      alert('Please enter the purpose of your email');
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

      const response = await fetch('/api/email-write', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          purpose,
          emailType,
          recipient,
          keyPoints,
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

      setGeneratedEmail(data.email);
    } catch (error: any) {
      console.error('Generation error:', error);
      alert(error.message || 'Failed to generate. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = async () => {
    if (!generatedEmail) return;

    try {
      await navigator.clipboard.writeText(generatedEmail);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-indigo-50 via-white to-blue-50 pt-24 pb-16 md:pt-32 md:pb-24">
        <div className="container mx-auto px-4 md:px-6 max-w-7xl">
          <div className="flex items-center gap-2 text-sm text-neutral-600 mb-6">
            <Link href="/" className="hover:text-primary-600 transition-colors">
              Home
            </Link>
            <ChevronRight size={16} />
            <span className="text-neutral-800 font-medium">Email Writer</span>
          </div>

          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-indigo-100 text-indigo-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Mail size={18} />
              <span>Professional Email Generation</span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-neutral-900 mb-6 leading-tight">
              AI Email Writer{' '}
              <span className="bg-gradient-to-r from-indigo-500 to-blue-600 bg-clip-text text-transparent">
                for Any Purpose
              </span>
            </h1>

            <p className="text-lg md:text-xl text-neutral-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              Compose professional, casual, or formal emails in seconds.
              Perfect tone and structure for business, personal, or official communication.
            </p>

            <div className="flex flex-wrap justify-center gap-8 md:gap-12 mb-8">
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-indigo-600">5M+</div>
                <div className="text-sm text-neutral-600">Emails Generated</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-indigo-600">8+</div>
                <div className="text-sm text-neutral-600">Email Types</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-indigo-600">Fast</div>
                <div className="text-sm text-neutral-600">In Seconds</div>
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
              <h2 className="text-2xl font-bold text-neutral-900 mb-6">Compose Your Email</h2>

              <div className="space-y-6">
                {/* Email Purpose */}
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Email Purpose *
                  </label>
                  <input
                    type="text"
                    value={purpose}
                    onChange={(e) => setPurpose(e.target.value)}
                    placeholder="e.g., Request meeting with manager, Follow up on job application"
                    className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>

                {/* Email Type */}
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Email Type
                  </label>
                  <select
                    value={emailType}
                    onChange={(e) => setEmailType(e.target.value)}
                    className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    {emailTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Recipient */}
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Recipient (Optional)
                  </label>
                  <input
                    type="text"
                    value={recipient}
                    onChange={(e) => setRecipient(e.target.value)}
                    placeholder="e.g., Hiring Manager, John Smith, Dr. Johnson"
                    className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>

                {/* Key Points */}
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Key Points to Include (Optional)
                  </label>
                  <textarea
                    value={keyPoints}
                    onChange={(e) => {
                      if (e.target.value.length <= maxChars) {
                        setKeyPoints(e.target.value);
                      }
                    }}
                    placeholder="Add any specific points, dates, or details you want to include..."
                    className="w-full h-32 px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                  />
                  <div className="text-sm text-neutral-500 mt-2">
                    {charCount} / {maxChars} characters
                  </div>
                </div>

                {/* Action Bar */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4">
                  <div className="text-sm text-neutral-600">
                    Guest uses remaining: <span className="font-semibold text-indigo-600">{guestUses}</span>
                  </div>
                  <button
                    onClick={handleGenerate}
                    disabled={isGenerating || !purpose.trim()}
                    className="w-full sm:w-auto btn-primary btn-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    style={{ backgroundColor: '#6366f1' }}
                  >
                    {isGenerating ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        Generating...
                      </>
                    ) : (
                      <>
                        <Mail size={20} />
                        Generate Email
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Output Section */}
            {generatedEmail && (
              <div className="border-t border-neutral-200 p-6 md:p-8 bg-neutral-50">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold text-neutral-900">Generated Email</h3>
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
                    {generatedEmail}
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
              Why Use Our Email Writer?
            </h2>
            <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
              Write professional emails with the perfect tone and structure
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Target,
                title: 'Perfect Tone',
                description: 'Match the right tone for professional, casual, or formal emails',
                color: 'text-indigo-600',
                bg: 'bg-indigo-50',
              },
              {
                icon: MessageSquare,
                title: '8+ Email Types',
                description: 'From business to thank you notes, cover all email needs',
                color: 'text-blue-600',
                bg: 'bg-blue-50',
              },
              {
                icon: Zap,
                title: 'Save Time',
                description: 'Write emails in seconds instead of minutes',
                color: 'text-orange-600',
                bg: 'bg-orange-50',
              },
              {
                icon: Award,
                title: 'Professional',
                description: 'Well-structured emails that get responses',
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
                question: 'Can I customize the generated emails?',
                answer: 'Yes! The generated emails are starting points. You can edit, add personal touches, and adjust them to perfectly match your needs.',
              },
              {
                question: 'What email types are supported?',
                answer: 'We support professional/business, casual, formal, follow-up, thank you, apology, introduction, and request emails.',
              },
              {
                question: 'Are the emails professional enough for work?',
                answer: 'Yes! Our AI generates professional, well-structured emails suitable for business communication. Always review before sending.',
              },
              {
                question: 'Can I add my own details?',
                answer: 'Absolutely! Use the "Key Points" field to include specific dates, names, projects, or any details you want in the email.',
              },
            ].map((faq, idx) => (
              <details
                key={idx}
                className="bg-neutral-50 p-6 rounded-xl border border-neutral-200 hover:shadow-md transition-shadow duration-200 group"
              >
                <summary className="font-semibold text-neutral-900 cursor-pointer list-none flex items-center justify-between">
                  <span className="flex-1">{faq.question}</span>
                  <ChevronDown className="text-indigo-600 transform group-open:rotate-180 transition-transform duration-200 flex-shrink-0 ml-4" size={20} />
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
              <div className="bg-indigo-100 text-indigo-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail size={32} />
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
