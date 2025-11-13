'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Mail,
  Copy,
  Check,
  Sparkles,
  Zap,
  Shield,
  ChevronDown,
  ChevronRight,
  X,
  Briefcase,
  GraduationCap,
  Users,
  TrendingUp,
  FileText,
} from 'lucide-react';

export default function CoverLetterPage() {
  const [jobTitle, setJobTitle] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [experience, setExperience] = useState('');
  const [whyInterested, setWhyInterested] = useState('');
  const [coverLetter, setCoverLetter] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [guestLetters, setGuestLetters] = useState(0);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isLoadingRateLimit, setIsLoadingRateLimit] = useState(true);

  const MAX_FREE_LETTERS = 10;

  // Load rate limit status on mount
  useEffect(() => {
    const loadRateLimit = async () => {
      try {
        const response = await fetch('/api/rate-limit', {
          method: 'GET',
        });

        if (response.ok) {
          const rateLimit = await response.json();
          const remaining = Math.max(0, MAX_FREE_LETTERS - rateLimit.count);
          setGuestLetters(remaining);

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

  // Handle cover letter generation
  const handleGenerate = async () => {
    if (!jobTitle.trim() || !companyName.trim() || !experience.trim()) {
      alert('Please fill in job title, company name, and experience');
      return;
    }

    if (guestLetters <= 0) {
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
        const remaining = Math.max(0, MAX_FREE_LETTERS - rateLimit.count);
        setGuestLetters(remaining);

        if (rateLimit.blocked) {
          setShowLoginModal(true);
          setIsGenerating(false);
          return;
        }
      }

      // Call the cover letter API
      const response = await fetch('/api/cover-letter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jobTitle,
          companyName,
          experience,
          whyInterested,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 429) {
          setShowLoginModal(true);
          setGuestLetters(0);
          alert(data.message || 'Cover letter limit reached. Please sign up to continue.');
          return;
        }
        throw new Error(data.error || 'Cover letter generation failed');
      }

      setCoverLetter(data.coverLetter);

    } catch (error: any) {
      console.error('Cover letter generation error:', error);
      alert(error.message || 'Failed to generate cover letter. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Copy to clipboard
  const handleCopy = async () => {
    if (!coverLetter) return;

    try {
      await navigator.clipboard.writeText(coverLetter);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-rose-50 via-white to-orange-50 pt-24 pb-16 md:pt-32 md:pb-24">
        <div className="container mx-auto px-4 md:px-6 max-w-7xl">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-neutral-600 mb-6">
            <Link href="/" className="hover:text-primary-600 transition-colors">
              Home
            </Link>
            <ChevronRight size={16} />
            <span className="text-neutral-800 font-medium">Cover Letter Generator</span>
          </div>

          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-rose-100 text-rose-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Mail size={18} />
              <span>Tailored Cover Letters</span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-neutral-900 mb-6 leading-tight">
              Cover Letter Generator -{' '}
              <span className="bg-gradient-to-r from-rose-500 to-orange-600 bg-clip-text text-transparent">
                Land Interviews
              </span>
            </h1>

            <p className="text-lg md:text-xl text-neutral-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              Generate compelling, personalized cover letters that make you stand out. Perfect for job applications in the Philippines and abroad.
            </p>

            {/* Stats */}
            <div className="flex flex-wrap justify-center gap-8 md:gap-12 mb-8">
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-rose-600">150K+</div>
                <div className="text-sm text-neutral-600">Letters Created</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-rose-600">Tailored</div>
                <div className="text-sm text-neutral-600">To Each Job</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-rose-600">Free</div>
                <div className="text-sm text-neutral-600">To Use</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Cover Letter Interface */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4 md:px-6 max-w-7xl">
          <div className="bg-white rounded-2xl shadow-lg border border-neutral-200 overflow-hidden">
            {/* Input Section */}
            <div className="p-6 border-b border-neutral-200">
              <div className="grid grid-cols-1 gap-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Job Title *
                    </label>
                    <input
                      type="text"
                      value={jobTitle}
                      onChange={(e) => setJobTitle(e.target.value)}
                      placeholder="e.g., Marketing Manager"
                      className="w-full p-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Company Name *
                    </label>
                    <input
                      type="text"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="e.g., ABC Corporation"
                      className="w-full p-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Your Relevant Experience * (Brief summary of your background)
                  </label>
                  <textarea
                    value={experience}
                    onChange={(e) => setExperience(e.target.value)}
                    placeholder="e.g., 5 years of experience in digital marketing with expertise in SEO, social media campaigns, and content strategy"
                    className="w-full h-24 p-4 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent resize-none"
                    style={{ fontSize: '16px' }}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Why This Company/Role? (Optional)
                  </label>
                  <textarea
                    value={whyInterested}
                    onChange={(e) => setWhyInterested(e.target.value)}
                    placeholder="e.g., I admire your company's commitment to innovation and sustainability"
                    className="w-full h-24 p-4 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent resize-none"
                    style={{ fontSize: '16px' }}
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-rose-50 rounded-lg">
                  <span className="text-sm text-neutral-700">Cover letters remaining:</span>
                  <span className="text-2xl font-bold text-rose-600">{guestLetters}</span>
                </div>
              </div>
            </div>

            {/* Output Section */}
            <div className="p-6 bg-neutral-50">
              <div className="flex items-center justify-between mb-4">
                <label className="text-sm font-medium text-neutral-700">
                  Generated Cover Letter
                </label>
                {coverLetter && (
                  <button
                    onClick={handleCopy}
                    className="p-2 rounded-lg hover:bg-white transition-colors"
                    title="Copy cover letter"
                  >
                    {copied ? (
                      <Check size={18} className="text-green-600" />
                    ) : (
                      <Copy size={18} className="text-neutral-600" />
                    )}
                  </button>
                )}
              </div>

              <div className="w-full min-h-[500px] p-6 bg-white border border-neutral-300 rounded-lg overflow-y-auto">
                {isGenerating ? (
                  <div className="flex items-center justify-center h-full min-h-[500px]">
                    <div className="text-center">
                      <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-rose-600 mb-3"></div>
                      <p className="text-neutral-600">Creating your cover letter...</p>
                    </div>
                  </div>
                ) : coverLetter ? (
                  <div className="prose max-w-none">
                    <pre className="text-neutral-800 whitespace-pre-wrap leading-relaxed font-sans" style={{ fontSize: '15px' }}>
                      {coverLetter}
                    </pre>
                  </div>
                ) : (
                  <p className="text-neutral-400">Your professional cover letter will appear here...</p>
                )}
              </div>
            </div>

            {/* Action Bar */}
            <div className="border-t border-neutral-200 p-6 bg-neutral-50">
              <button
                onClick={handleGenerate}
                disabled={isGenerating || !jobTitle.trim() || !companyName.trim() || !experience.trim()}
                className="w-full btn-primary btn-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isGenerating ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Generating Letter...
                  </>
                ) : (
                  <>
                    <Sparkles size={20} />
                    Generate Cover Letter
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
              Why Use Our Cover Letter Generator?
            </h2>
            <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
              Stand out from other candidates with compelling letters
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Sparkles,
                title: 'Personalized',
                description: 'Tailored to each job and company, not generic templates',
                color: 'text-rose-600',
                bg: 'bg-rose-50',
              },
              {
                icon: Zap,
                title: 'Instant Creation',
                description: 'Generate professional letters in under 30 seconds',
                color: 'text-orange-600',
                bg: 'bg-orange-50',
              },
              {
                icon: TrendingUp,
                title: 'Proven Format',
                description: 'Follow industry-standard structure and best practices',
                color: 'text-purple-600',
                bg: 'bg-purple-50',
              },
              {
                icon: Shield,
                title: 'Professional Tone',
                description: 'Perfect balance of confidence and professionalism',
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
      <section className="py-16 md:py-24 bg-gradient-to-br from-rose-50 to-orange-50">
        <div className="container mx-auto px-4 md:px-6 max-w-7xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-4">
              Perfect For Every Application
            </h2>
            <p className="text-lg text-neutral-600">
              Land interviews across industries
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                icon: GraduationCap,
                title: 'Entry-Level Positions',
                description: 'Create compelling letters even with limited experience. Highlight education, skills, and potential to grow.',
                stats: 'Fresh Grad',
              },
              {
                icon: Briefcase,
                title: 'Career Advancement',
                description: 'Demonstrate your value for senior roles. Showcase achievements and leadership experience effectively.',
                stats: 'Senior Level',
              },
              {
                icon: TrendingUp,
                title: 'Career Change',
                description: 'Explain your transition smoothly. Emphasize transferable skills and new industry enthusiasm.',
                stats: 'Transition',
              },
              {
                icon: Users,
                title: 'International Jobs',
                description: 'Apply for OFW positions and remote work. Create letters that resonate with global employers.',
                stats: 'Global',
              },
            ].map((useCase, idx) => (
              <div
                key={idx}
                className="bg-white p-8 rounded-2xl border border-neutral-200 hover:shadow-xl transition-shadow duration-300"
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className="bg-rose-100 text-rose-600 w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0">
                    <useCase.icon size={24} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-xl font-semibold text-neutral-900">
                        {useCase.title}
                      </h3>
                      <span className="text-xs font-medium text-rose-600 bg-rose-100 px-3 py-1 rounded-full">
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
              Everything you need to know about cover letters
            </p>
          </div>

          <div className="space-y-4">
            {[
              {
                question: 'Do I really need a cover letter?',
                answer: 'Yes! Many employers expect cover letters and use them to gauge your genuine interest and communication skills. A strong cover letter significantly increases your chances of getting an interview.',
              },
              {
                question: 'Can I customize the generated letter?',
                answer: 'Absolutely! The generated letter is a strong foundation. You can copy it and edit specific details to add more personal touches or company-specific information.',
              },
              {
                question: 'What makes a good cover letter?',
                answer: 'A good cover letter is personalized, concise (3-4 paragraphs), shows genuine interest, highlights relevant experience, and demonstrates how you can add value to the company.',
              },
              {
                question: 'How is this different from a resume?',
                answer: 'A resume lists your qualifications, while a cover letter tells your story and explains why you\'re the perfect fit for this specific role at this specific company.',
              },
              {
                question: 'Should I send a cover letter for every application?',
                answer: 'Yes, especially for jobs you really want. Even if optional, a well-written cover letter can set you apart from candidates who skip it.',
              },
              {
                question: 'How long should a cover letter be?',
                answer: 'Aim for 3-4 short paragraphs or about 250-400 words. Our AI generates concise, impactful letters that respect recruiters\' time.',
              },
            ].map((faq, idx) => (
              <details
                key={idx}
                className="bg-white p-6 rounded-xl border border-neutral-200 hover:shadow-md transition-shadow duration-200 group"
              >
                <summary className="font-semibold text-neutral-900 cursor-pointer list-none flex items-center justify-between">
                  <span className="flex-1">{faq.question}</span>
                  <ChevronDown className="text-rose-600 transform group-open:rotate-180 transition-transform duration-200 flex-shrink-0 ml-4" size={20} />
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
      <section className="py-16 md:py-24 bg-gradient-to-br from-rose-500 to-orange-600 text-white">
        <div className="container mx-auto px-4 md:px-6 max-w-4xl text-center">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
            Create Your Cover Letter Today
          </h2>
          <p className="text-lg md:text-xl text-rose-50 mb-8 max-w-2xl mx-auto">
            Join thousands landing interviews with personalized cover letters
          </p>
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="inline-flex items-center gap-3 bg-white text-rose-600 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-rose-50 transition-all duration-200 hover:scale-105 shadow-lg"
          >
            <Mail size={24} />
            Generate Cover Letter - Free
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
              <div className="bg-rose-100 text-rose-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail size={32} />
              </div>
              <h3 className="text-2xl font-bold text-neutral-900 mb-2">
                Cover Letter Limit Reached
              </h3>
              <p className="text-neutral-600">
                Create a free account for unlimited cover letter generation
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
