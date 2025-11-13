'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Briefcase,
  Copy,
  Check,
  Sparkles,
  Zap,
  Shield,
  ChevronDown,
  ChevronRight,
  X,
  GraduationCap,
  Users,
  TrendingUp,
  FileText,
} from 'lucide-react';

export default function ResumeBuilderPage() {
  const [jobTitle, setJobTitle] = useState('');
  const [experience, setExperience] = useState('');
  const [skills, setSkills] = useState('');
  const [education, setEducation] = useState('');
  const [resume, setResume] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [guestResumes, setGuestResumes] = useState(0);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isLoadingRateLimit, setIsLoadingRateLimit] = useState(true);

  const MAX_FREE_RESUMES = 10;

  // Load rate limit status on mount
  useEffect(() => {
    const loadRateLimit = async () => {
      try {
        const response = await fetch('/api/rate-limit', {
          method: 'GET',
        });

        if (response.ok) {
          const rateLimit = await response.json();
          const remaining = Math.max(0, MAX_FREE_RESUMES - rateLimit.count);
          setGuestResumes(remaining);

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

  // Handle resume generation
  const handleGenerate = async () => {
    if (!jobTitle.trim() || !experience.trim()) {
      alert('Please fill in at least job title and experience');
      return;
    }

    if (guestResumes <= 0) {
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
        const remaining = Math.max(0, MAX_FREE_RESUMES - rateLimit.count);
        setGuestResumes(remaining);

        if (rateLimit.blocked) {
          setShowLoginModal(true);
          setIsGenerating(false);
          return;
        }
      }

      // Call the resume building API
      const response = await fetch('/api/resume-build', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jobTitle,
          experience,
          skills,
          education,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 429) {
          setShowLoginModal(true);
          setGuestResumes(0);
          alert(data.message || 'Resume limit reached. Please sign up to continue.');
          return;
        }
        throw new Error(data.error || 'Resume generation failed');
      }

      setResume(data.resume);

    } catch (error: any) {
      console.error('Resume generation error:', error);
      alert(error.message || 'Failed to generate resume. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Copy to clipboard
  const handleCopy = async () => {
    if (!resume) return;

    try {
      await navigator.clipboard.writeText(resume);
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
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-neutral-600 mb-6">
            <Link href="/" className="hover:text-primary-600 transition-colors">
              Home
            </Link>
            <ChevronRight size={16} />
            <span className="text-neutral-800 font-medium">Resume Builder AI</span>
          </div>

          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-indigo-100 text-indigo-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Briefcase size={18} />
              <span>ATS-Optimized Resumes</span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-neutral-900 mb-6 leading-tight">
              Resume Builder AI -{' '}
              <span className="bg-gradient-to-r from-indigo-500 to-blue-600 bg-clip-text text-transparent">
                Professional Resumes
              </span>
            </h1>

            <p className="text-lg md:text-xl text-neutral-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              Create ATS-optimized professional resumes in minutes. Stand out from the competition and land your dream job in the Philippines.
            </p>

            {/* Stats */}
            <div className="flex flex-wrap justify-center gap-8 md:gap-12 mb-8">
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-indigo-600">200K+</div>
                <div className="text-sm text-neutral-600">Resumes Created</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-indigo-600">ATS</div>
                <div className="text-sm text-neutral-600">Optimized</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-indigo-600">Free</div>
                <div className="text-sm text-neutral-600">To Use</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Resume Builder Interface */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4 md:px-6 max-w-7xl">
          <div className="bg-white rounded-2xl shadow-lg border border-neutral-200 overflow-hidden">
            {/* Input Section */}
            <div className="p-6 border-b border-neutral-200">
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Target Job Title *
                  </label>
                  <input
                    type="text"
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    placeholder="e.g., Software Engineer, Marketing Manager, Data Analyst"
                    className="w-full p-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Work Experience * (Describe your roles and achievements)
                  </label>
                  <textarea
                    value={experience}
                    onChange={(e) => setExperience(e.target.value)}
                    placeholder="e.g., Senior Developer at ABC Corp (2020-2024): Led team of 5, developed microservices architecture, reduced API latency by 40%"
                    className="w-full h-32 p-4 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                    style={{ fontSize: '16px' }}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Skills (Optional - comma separated)
                  </label>
                  <input
                    type="text"
                    value={skills}
                    onChange={(e) => setSkills(e.target.value)}
                    placeholder="e.g., JavaScript, React, Node.js, Project Management, SEO"
                    className="w-full p-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Education (Optional)
                  </label>
                  <input
                    type="text"
                    value={education}
                    onChange={(e) => setEducation(e.target.value)}
                    placeholder="e.g., BS Computer Science, University of the Philippines (2016-2020)"
                    className="w-full p-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-indigo-50 rounded-lg">
                  <span className="text-sm text-neutral-700">Resumes remaining:</span>
                  <span className="text-2xl font-bold text-indigo-600">{guestResumes}</span>
                </div>
              </div>
            </div>

            {/* Output Section */}
            <div className="p-6 bg-neutral-50">
              <div className="flex items-center justify-between mb-4">
                <label className="text-sm font-medium text-neutral-700">
                  Generated Resume
                </label>
                {resume && (
                  <button
                    onClick={handleCopy}
                    className="p-2 rounded-lg hover:bg-white transition-colors"
                    title="Copy resume"
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
                      <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mb-3"></div>
                      <p className="text-neutral-600">Creating your professional resume...</p>
                    </div>
                  </div>
                ) : resume ? (
                  <div className="prose max-w-none">
                    <pre className="text-neutral-800 whitespace-pre-wrap leading-relaxed font-sans" style={{ fontSize: '15px' }}>
                      {resume}
                    </pre>
                  </div>
                ) : (
                  <p className="text-neutral-400">Your professional resume will appear here...</p>
                )}
              </div>
            </div>

            {/* Action Bar */}
            <div className="border-t border-neutral-200 p-6 bg-neutral-50">
              <button
                onClick={handleGenerate}
                disabled={isGenerating || !jobTitle.trim() || !experience.trim()}
                className="w-full btn-primary btn-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isGenerating ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Building Resume...
                  </>
                ) : (
                  <>
                    <Sparkles size={20} />
                    Build Resume
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
              Why Use Our Resume Builder?
            </h2>
            <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
              AI-powered professional resumes that get noticed
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: TrendingUp,
                title: 'ATS-Optimized',
                description: 'Pass applicant tracking systems with keyword optimization',
                color: 'text-indigo-600',
                bg: 'bg-indigo-50',
              },
              {
                icon: Sparkles,
                title: 'Professional Format',
                description: 'Clean, modern layouts that impress recruiters',
                color: 'text-blue-600',
                bg: 'bg-blue-50',
              },
              {
                icon: Zap,
                title: 'Instant Creation',
                description: 'Generate complete resumes in under 30 seconds',
                color: 'text-purple-600',
                bg: 'bg-purple-50',
              },
              {
                icon: Shield,
                title: 'Industry-Standard',
                description: 'Follows best practices for Philippine job market',
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
      <section className="py-16 md:py-24 bg-gradient-to-br from-indigo-50 to-blue-50">
        <div className="container mx-auto px-4 md:px-6 max-w-7xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-4">
              Perfect For Job Seekers
            </h2>
            <p className="text-lg text-neutral-600">
              Land your dream job in the Philippines
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                icon: GraduationCap,
                title: 'Fresh Graduates',
                description: 'Create your first professional resume with no experience required. Highlight education, internships, and projects effectively.',
                stats: 'Entry Level',
              },
              {
                icon: Briefcase,
                title: 'Career Changers',
                description: 'Transition to new industries with resumes that highlight transferable skills and relevant achievements.',
                stats: 'Transition',
              },
              {
                icon: TrendingUp,
                title: 'Professionals',
                description: 'Showcase your experience and achievements with senior-level resumes optimized for leadership roles.',
                stats: 'Senior',
              },
              {
                icon: Users,
                title: 'OFWs & Remote Workers',
                description: 'Create international-standard resumes for overseas employment and remote work opportunities.',
                stats: 'Global',
              },
            ].map((useCase, idx) => (
              <div
                key={idx}
                className="bg-white p-8 rounded-2xl border border-neutral-200 hover:shadow-xl transition-shadow duration-300"
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className="bg-indigo-100 text-indigo-600 w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0">
                    <useCase.icon size={24} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-xl font-semibold text-neutral-900">
                        {useCase.title}
                      </h3>
                      <span className="text-xs font-medium text-indigo-600 bg-indigo-100 px-3 py-1 rounded-full">
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
              Everything you need to know about resume building
            </p>
          </div>

          <div className="space-y-4">
            {[
              {
                question: 'What is ATS optimization?',
                answer: 'ATS (Applicant Tracking System) optimization ensures your resume can be properly read by software that employers use to filter candidates. Our AI uses proper formatting and keywords.',
              },
              {
                question: 'Can I edit the generated resume?',
                answer: 'Yes! Copy the resume and paste it into any word processor or resume editor. Customize it further to match your specific needs and preferences.',
              },
              {
                question: 'What information do I need to provide?',
                answer: 'At minimum, provide your target job title and work experience. Adding skills and education makes your resume more comprehensive and effective.',
              },
              {
                question: 'Is this suitable for Philippine job applications?',
                answer: 'Absolutely! Our AI is trained on best practices for the Philippine job market and creates resumes that work well with local and international employers.',
              },
              {
                question: 'How long should my resume be?',
                answer: 'Our AI creates concise, impactful resumes typically 1-2 pages long. This is the ideal length preferred by most employers and recruiters.',
              },
              {
                question: 'Can fresh graduates use this?',
                answer: 'Yes! Even without work experience, you can create strong resumes by including internships, projects, academic achievements, and relevant coursework.',
              },
            ].map((faq, idx) => (
              <details
                key={idx}
                className="bg-white p-6 rounded-xl border border-neutral-200 hover:shadow-md transition-shadow duration-200 group"
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

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-gradient-to-br from-indigo-500 to-blue-600 text-white">
        <div className="container mx-auto px-4 md:px-6 max-w-4xl text-center">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
            Build Your Resume Today
          </h2>
          <p className="text-lg md:text-xl text-indigo-50 mb-8 max-w-2xl mx-auto">
            Join thousands landing jobs with professional AI-generated resumes
          </p>
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="inline-flex items-center gap-3 bg-white text-indigo-600 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-indigo-50 transition-all duration-200 hover:scale-105 shadow-lg"
          >
            <Briefcase size={24} />
            Create Resume - Free
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
              <div className="bg-indigo-100 text-indigo-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Briefcase size={32} />
              </div>
              <h3 className="text-2xl font-bold text-neutral-900 mb-2">
                Resume Limit Reached
              </h3>
              <p className="text-neutral-600">
                Create a free account for unlimited resume building
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
