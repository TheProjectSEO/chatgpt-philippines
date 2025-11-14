'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Code,
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
  Laptop,
  ChevronDown,
  Terminal,
  FileCode,
  Layers,
} from 'lucide-react';

const programmingLanguages = [
  { code: 'python', name: 'Python', icon: '🐍' },
  { code: 'javascript', name: 'JavaScript', icon: '🟨' },
  { code: 'typescript', name: 'TypeScript', icon: '🔷' },
  { code: 'java', name: 'Java', icon: '☕' },
  { code: 'cpp', name: 'C++', icon: '⚡' },
  { code: 'csharp', name: 'C#', icon: '🎯' },
  { code: 'php', name: 'PHP', icon: '🐘' },
  { code: 'ruby', name: 'Ruby', icon: '💎' },
  { code: 'go', name: 'Go', icon: '🔵' },
  { code: 'rust', name: 'Rust', icon: '🦀' },
  { code: 'swift', name: 'Swift', icon: '🍎' },
  { code: 'kotlin', name: 'Kotlin', icon: '🎨' },
];

const samplePrompts = [
  'Create a function to calculate factorial',
  'Build a REST API endpoint for user authentication',
  'Write a binary search algorithm',
  'Create a React component for a todo list',
];

export default function CodeGeneratorPage() {
  const [prompt, setPrompt] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('python');
  const [isGenerating, setIsGenerating] = useState(false);
  const [charCount, setCharCount] = useState(0);
  const [copied, setCopied] = useState(false);
  const [guestUses, setGuestUses] = useState(0);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);

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
    setCharCount(prompt.length);
  }, [prompt]);

  // Get language by code
  const getLanguage = (code: string) => {
    return programmingLanguages.find(lang => lang.code === code) || programmingLanguages[0];
  };

  // Handle code generation
  const handleGenerate = async () => {
    if (!prompt.trim()) {
      alert('Please enter a code description');
      return;
    }

    if (guestUses <= 0) {
      setShowLoginModal(true);
      return;
    }

    setIsGenerating(true);

    try {
      const response = await fetch('/api/code-generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: prompt,
          language: selectedLanguage,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 429) {
          setShowLoginModal(true);
          setGuestUses(0);
          alert(data.message || 'Generation limit reached. Please sign up to continue.');
          return;
        }
        throw new Error(data.error || 'Code generation failed');
      }

      setGeneratedCode(data.code);
      const remaining = Math.max(0, MAX_FREE_USES - (data.count || 0));
      setGuestUses(remaining);

    } catch (error: any) {
      console.error('Code generation error:', error);
      alert(error.message || 'Failed to generate code. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Copy to clipboard
  const handleCopy = async () => {
    if (!generatedCode) return;

    try {
      await navigator.clipboard.writeText(generatedCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  // Load sample prompt
  const loadSamplePrompt = () => {
    const randomPrompt = samplePrompts[Math.floor(Math.random() * samplePrompts.length)];
    setPrompt(randomPrompt);
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
            <span className="text-neutral-800 font-medium">AI Code Generator</span>
          </div>

          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Code size={18} />
              <span>12+ Languages Supported</span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-neutral-900 mb-6 leading-tight">
              AI Code Generator -{' '}
              <span className="bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent">
                Write Code Instantly
              </span>
            </h1>

            <p className="text-lg md:text-xl text-neutral-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              Generate clean, functional code in any programming language. Perfect for developers, students, and coding bootcamp learners.
            </p>

            {/* Stats */}
            <div className="flex flex-wrap justify-center gap-8 md:gap-12 mb-8">
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-orange-600">500K+</div>
                <div className="text-sm text-neutral-600">Code Snippets</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-orange-600">12+</div>
                <div className="text-sm text-neutral-600">Languages</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-orange-600">Free</div>
                <div className="text-sm text-neutral-600">Forever</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Generator Interface */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4 md:px-6 max-w-7xl">
          <div className="bg-white rounded-2xl shadow-lg border border-neutral-200 overflow-hidden">
            {/* Language Selection Bar */}
            <div className="border-b border-neutral-200 p-4">
              <div className="flex items-center gap-4">
                <label className="text-sm font-medium text-neutral-700">Programming Language:</label>
                <div className="relative">
                  <button
                    onClick={() => setShowLanguageDropdown(!showLanguageDropdown)}
                    className="flex items-center gap-3 px-4 py-2 bg-neutral-50 rounded-lg hover:bg-neutral-100 transition-colors border border-neutral-300"
                  >
                    <span className="text-xl">{getLanguage(selectedLanguage).icon}</span>
                    <span className="font-medium text-neutral-800">
                      {getLanguage(selectedLanguage).name}
                    </span>
                    <ChevronDown size={18} className="text-neutral-500" />
                  </button>

                  {/* Language Dropdown */}
                  {showLanguageDropdown && (
                    <div className="absolute top-full left-0 mt-2 bg-white border border-neutral-200 rounded-lg shadow-xl z-50 min-w-[200px]">
                      <div className="max-h-80 overflow-y-auto">
                        {programmingLanguages.map((lang) => (
                          <button
                            key={lang.code}
                            onClick={() => {
                              setSelectedLanguage(lang.code);
                              setShowLanguageDropdown(false);
                            }}
                            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-orange-50 transition-colors"
                          >
                            <span className="text-xl">{lang.icon}</span>
                            <span className="text-neutral-800">{lang.name}</span>
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
                    Describe what you want to code
                  </label>
                  <button
                    onClick={loadSamplePrompt}
                    className="text-sm text-orange-600 hover:text-orange-700 font-medium"
                  >
                    Load sample
                  </button>
                </div>

                <textarea
                  value={prompt}
                  onChange={(e) => {
                    if (e.target.value.length <= maxChars) {
                      setPrompt(e.target.value);
                    }
                  }}
                  placeholder="Example: Create a function that finds the longest word in a string..."
                  className="w-full h-64 p-4 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none text-neutral-800"
                  style={{ fontSize: '16px' }}
                />

                <div className="flex items-center justify-between mt-3">
                  <div className="text-sm text-neutral-500">
                    {charCount} / {maxChars} characters
                  </div>
                  {prompt && (
                    <button
                      onClick={() => {
                        setPrompt('');
                        setGeneratedCode('');
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
                    Generated Code
                  </label>
                  {generatedCode && (
                    <button
                      onClick={handleCopy}
                      className="p-2 rounded-lg hover:bg-white transition-colors"
                      title="Copy code"
                    >
                      {copied ? (
                        <Check size={18} className="text-green-600" />
                      ) : (
                        <Copy size={18} className="text-neutral-600" />
                      )}
                    </button>
                  )}
                </div>

                <div className="w-full h-64 p-4 bg-neutral-900 text-green-400 rounded-lg overflow-y-auto font-mono text-sm">
                  {isGenerating ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mb-3"></div>
                        <p className="text-neutral-400">Generating code...</p>
                      </div>
                    </div>
                  ) : generatedCode ? (
                    <pre className="whitespace-pre-wrap">{generatedCode}</pre>
                  ) : (
                    <p className="text-neutral-500">Generated code will appear here...</p>
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
                  onClick={handleGenerate}
                  disabled={isGenerating || !prompt.trim()}
                  className="w-full sm:w-auto btn-primary btn-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isGenerating ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Generating...
                    </>
                  ) : (
                    <>
                      <Code size={20} />
                      Generate Code
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
              Why Use Our AI Code Generator?
            </h2>
            <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
              Powered by advanced AI to deliver clean, efficient, and well-documented code
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Terminal,
                title: '12+ Languages',
                description: 'Support for all major programming languages and frameworks',
                color: 'text-blue-600',
                bg: 'bg-blue-50',
              },
              {
                icon: Sparkles,
                title: 'AI-Powered',
                description: 'Smart code generation with best practices and optimization',
                color: 'text-purple-600',
                bg: 'bg-purple-50',
              },
              {
                icon: Zap,
                title: 'Instant Results',
                description: 'Get production-ready code in seconds',
                color: 'text-orange-600',
                bg: 'bg-orange-50',
              },
              {
                icon: Shield,
                title: 'Clean Code',
                description: 'Well-structured, documented, and maintainable code',
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
              Perfect For Every Developer
            </h2>
            <p className="text-lg text-neutral-600">
              From students to professionals - accelerate your coding workflow
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                icon: GraduationCap,
                title: 'Students & Learners',
                description: 'Learn programming faster with AI-generated examples. Understand coding patterns and best practices through practical code samples.',
                stats: 'All levels',
              },
              {
                icon: Laptop,
                title: 'Professional Developers',
                description: 'Speed up development with boilerplate code and function templates. Focus on logic while AI handles routine coding tasks.',
                stats: 'Save hours',
              },
              {
                icon: Users,
                title: 'Coding Bootcamps',
                description: 'Supplement your learning with instant code examples. Practice and understand different programming approaches quickly.',
                stats: 'Fast learning',
              },
              {
                icon: Briefcase,
                title: 'Startups & Teams',
                description: 'Prototype faster with AI-generated code snippets. Build MVPs and proof-of-concepts rapidly with clean, functional code.',
                stats: 'Ship faster',
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
              Everything you need to know about our AI code generator
            </p>
          </div>

          <div className="space-y-4">
            {[
              {
                question: 'What programming languages are supported?',
                answer: 'We support 12+ major programming languages including Python, JavaScript, TypeScript, Java, C++, C#, PHP, Ruby, Go, Rust, Swift, and Kotlin. More languages are being added regularly.',
              },
              {
                question: 'Is the generated code production-ready?',
                answer: 'The AI generates clean, functional code following best practices. However, we recommend reviewing and testing all generated code before using it in production environments.',
              },
              {
                question: 'Can I use the generated code commercially?',
                answer: 'Yes! All generated code is yours to use freely in personal and commercial projects without attribution requirements.',
              },
              {
                question: 'How accurate is the code generation?',
                answer: 'Our AI is trained on millions of code samples and generates highly accurate code. For best results, provide clear, specific descriptions of what you want the code to do.',
              },
              {
                question: 'Is it really free?',
                answer: 'Yes! Guest users get 10 free code generations. Create a free account for unlimited access to our AI code generator.',
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
            Start Generating Code Now
          </h2>
          <p className="text-lg md:text-xl text-orange-50 mb-8 max-w-2xl mx-auto">
            Join thousands of developers using our AI code generator to write better code faster
          </p>
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="inline-flex items-center gap-3 bg-white text-orange-600 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-orange-50 transition-all duration-200 hover:scale-105 shadow-lg"
          >
            <Code size={24} />
            Generate Code - Free Forever
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
                <Code size={32} />
              </div>
              <h3 className="text-2xl font-bold text-neutral-900 mb-2">
                Generation Limit Reached
              </h3>
              <p className="text-neutral-600">
                Create a free account for unlimited code generation
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
              No credit card required. Get unlimited code generation instantly.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
