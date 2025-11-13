'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  BookOpen,
  Copy,
  Check,
  ChevronDown,
  ChevronRight,
  X,
  Sparkles,
  FileText,
  GraduationCap,
  Briefcase,
  Zap,
  Shield,
} from 'lucide-react';

const citationStyles = [
  { code: 'apa', name: 'APA 7th Edition', description: 'American Psychological Association' },
  { code: 'mla', name: 'MLA 9th Edition', description: 'Modern Language Association' },
  { code: 'chicago', name: 'Chicago Style', description: 'Chicago Manual of Style' },
  { code: 'harvard', name: 'Harvard Style', description: 'Harvard Referencing' },
  { code: 'ieee', name: 'IEEE Style', description: 'Institute of Electrical and Electronics Engineers' },
  { code: 'vancouver', name: 'Vancouver Style', description: 'Medical and Scientific' },
];

const sourceTypes = [
  'Book', 'Journal Article', 'Website', 'Newspaper', 'Magazine',
  'Conference Paper', 'Thesis', 'Report', 'Video', 'Podcast'
];

export default function BibliographyPage() {
  const [sourceInfo, setSourceInfo] = useState('');
  const [citationStyle, setCitationStyle] = useState('apa');
  const [sourceType, setSourceType] = useState('Book');
  const [bibliography, setBibliography] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [guestGenerations, setGuestGenerations] = useState(0);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showStyleDropdown, setShowStyleDropdown] = useState(false);
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);
  const [isLoadingRateLimit, setIsLoadingRateLimit] = useState(true);

  const maxChars = 2000;
  const MAX_FREE_GENERATIONS = 10;

  useEffect(() => {
    const loadRateLimit = async () => {
      try {
        const response = await fetch('/api/rate-limit', {
          method: 'GET',
        });

        if (response.ok) {
          const rateLimit = await response.json();
          const remaining = Math.max(0, MAX_FREE_GENERATIONS - rateLimit.count);
          setGuestGenerations(remaining);

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
    if (!sourceInfo.trim()) {
      alert('Please enter source information');
      return;
    }

    if (guestGenerations <= 0) {
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
        const remaining = Math.max(0, MAX_FREE_GENERATIONS - rateLimit.count);
        setGuestGenerations(remaining);

        if (rateLimit.blocked) {
          setShowLoginModal(true);
          setIsGenerating(false);
          return;
        }
      }

      const response = await fetch('/api/bibliography', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sourceInfo,
          citationStyle,
          sourceType,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 429) {
          setShowLoginModal(true);
          setGuestGenerations(0);
          alert(data.message || 'Generation limit reached. Please sign up to continue.');
          return;
        }
        throw new Error(data.error || 'Generation failed');
      }

      setBibliography(data.bibliography);

    } catch (error: any) {
      console.error('Generation error:', error);
      alert(error.message || 'Failed to generate. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = async () => {
    if (!bibliography) return;

    try {
      await navigator.clipboard.writeText(bibliography);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const loadSample = () => {
    setSourceInfo('Author: Smith, John\nTitle: Introduction to Modern Psychology\nYear: 2024\nPublisher: Academic Press\nLocation: New York');
  };

  const getStyle = (code: string) => {
    return citationStyles.find(style => style.code === code) || citationStyles[0];
  };

  return (
    <div className="min-h-screen bg-white">
      <section className="relative bg-gradient-to-br from-orange-50 via-white to-purple-50 pt-24 pb-16 md:pt-32 md:pb-24">
        <div className="container mx-auto px-4 md:px-6 max-w-7xl">
          <div className="flex items-center gap-2 text-sm text-neutral-600 mb-6">
            <Link href="/" className="hover:text-primary-600 transition-colors">
              Home
            </Link>
            <ChevronRight size={16} />
            <span className="text-neutral-800 font-medium">Bibliography Generator</span>
          </div>

          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <BookOpen size={18} />
              <span>6+ Citation Styles Supported</span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-neutral-900 mb-6 leading-tight">
              AI Bibliography Generator -{' '}
              <span className="bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent">
                Perfect Citations
              </span>
            </h1>

            <p className="text-lg md:text-xl text-neutral-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              Generate accurate citations in APA, MLA, Chicago, Harvard, IEEE, and Vancouver styles.
              Perfect for students, researchers, and academics.
            </p>

            <div className="flex flex-wrap justify-center gap-8 md:gap-12 mb-8">
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-orange-600">100K+</div>
                <div className="text-sm text-neutral-600">Citations</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-orange-600">6+</div>
                <div className="text-sm text-neutral-600">Styles</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-orange-600">Free</div>
                <div className="text-sm text-neutral-600">Forever</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4 md:px-6 max-w-7xl">
          <div className="bg-white rounded-2xl shadow-lg border border-neutral-200 overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-2 border-b border-neutral-200">
              <div className="relative border-b md:border-b-0 md:border-r border-neutral-200">
                <button
                  onClick={() => setShowStyleDropdown(!showStyleDropdown)}
                  className="w-full flex items-center justify-between gap-3 p-4 hover:bg-neutral-50 transition-colors"
                >
                  <div className="flex flex-col items-start gap-1">
                    <span className="font-medium text-neutral-800">{getStyle(citationStyle).name}</span>
                    <span className="text-xs text-neutral-500">{getStyle(citationStyle).description}</span>
                  </div>
                  <ChevronDown size={20} className="text-neutral-500" />
                </button>

                {showStyleDropdown && (
                  <div className="absolute top-full left-0 right-0 bg-white border border-neutral-200 rounded-b-lg shadow-xl z-50 max-h-96 overflow-y-auto">
                    {citationStyles.map((style) => (
                      <button
                        key={style.code}
                        onClick={() => {
                          setCitationStyle(style.code);
                          setShowStyleDropdown(false);
                        }}
                        className="w-full flex flex-col items-start gap-1 px-4 py-3 hover:bg-orange-50 transition-colors"
                      >
                        <span className="text-neutral-800 font-medium">{style.name}</span>
                        <span className="text-xs text-neutral-500">{style.description}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="relative">
                <button
                  onClick={() => setShowTypeDropdown(!showTypeDropdown)}
                  className="w-full flex items-center justify-between gap-3 p-4 hover:bg-neutral-50 transition-colors"
                >
                  <span className="font-medium text-neutral-800">{sourceType}</span>
                  <ChevronDown size={20} className="text-neutral-500" />
                </button>

                {showTypeDropdown && (
                  <div className="absolute top-full left-0 right-0 bg-white border border-neutral-200 rounded-b-lg shadow-xl z-50 max-h-96 overflow-y-auto">
                    {sourceTypes.map((type) => (
                      <button
                        key={type}
                        onClick={() => {
                          setSourceType(type);
                          setShowTypeDropdown(false);
                        }}
                        className="w-full text-left px-4 py-3 hover:bg-orange-50 transition-colors"
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-neutral-200">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <label className="text-sm font-medium text-neutral-700">
                    Enter source information
                  </label>
                  <button
                    onClick={loadSample}
                    className="text-sm text-orange-600 hover:text-orange-700 font-medium"
                  >
                    Load sample
                  </button>
                </div>

                <textarea
                  value={sourceInfo}
                  onChange={(e) => {
                    if (e.target.value.length <= maxChars) {
                      setSourceInfo(e.target.value);
                    }
                  }}
                  placeholder="Enter author, title, year, publisher, and other relevant information..."
                  className="w-full h-64 p-4 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none text-neutral-800"
                  style={{ fontSize: '16px' }}
                />

                <div className="flex items-center justify-between mt-3">
                  <div className="text-sm text-neutral-500">
                    {sourceInfo.length} / {maxChars} characters
                  </div>
                  {sourceInfo && (
                    <button
                      onClick={() => {
                        setSourceInfo('');
                        setBibliography('');
                      }}
                      className="text-sm text-neutral-500 hover:text-neutral-700"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>

              <div className="p-6 bg-neutral-50">
                <div className="flex items-center justify-between mb-4">
                  <label className="text-sm font-medium text-neutral-700">
                    Citation
                  </label>
                  {bibliography && (
                    <button
                      onClick={handleCopy}
                      className="p-2 rounded-lg hover:bg-white transition-colors"
                      title="Copy citation"
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
                  {isGenerating ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mb-3"></div>
                        <p className="text-neutral-600">Generating...</p>
                      </div>
                    </div>
                  ) : bibliography ? (
                    <p className="text-neutral-800 whitespace-pre-wrap" style={{ fontSize: '16px' }}>
                      {bibliography}
                    </p>
                  ) : (
                    <p className="text-neutral-400">Citation will appear here...</p>
                  )}
                </div>
              </div>
            </div>

            <div className="border-t border-neutral-200 p-6 bg-neutral-50">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-sm text-neutral-600">
                  Guest generations remaining: <span className="font-semibold text-orange-600">{guestGenerations}</span>
                </div>
                <button
                  onClick={handleGenerate}
                  disabled={isGenerating || !sourceInfo.trim()}
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
                      Generate Citation
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-neutral-50">
        <div className="container mx-auto px-4 md:px-6 max-w-7xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-4">
              Why Use Our Bibliography Generator?
            </h2>
            <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
              AI-powered accuracy for all your academic citation needs
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: BookOpen,
                title: '6+ Citation Styles',
                description: 'APA, MLA, Chicago, Harvard, IEEE, and Vancouver',
                color: 'text-blue-600',
                bg: 'bg-blue-50',
              },
              {
                icon: Sparkles,
                title: 'AI-Powered',
                description: 'Accurate formatting following latest guidelines',
                color: 'text-purple-600',
                bg: 'bg-purple-50',
              },
              {
                icon: Zap,
                title: 'Instant Results',
                description: 'Generate citations in seconds',
                color: 'text-orange-600',
                bg: 'bg-orange-50',
              },
              {
                icon: Shield,
                title: 'Always Accurate',
                description: 'Updated with latest citation rules',
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

      <section className="py-16 md:py-24 bg-gradient-to-br from-orange-500 to-orange-600 text-white">
        <div className="container mx-auto px-4 md:px-6 max-w-4xl text-center">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
            Start Creating Citations Now
          </h2>
          <p className="text-lg md:text-xl text-orange-50 mb-8 max-w-2xl mx-auto">
            Generate perfect citations in seconds with AI
          </p>
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="inline-flex items-center gap-3 bg-white text-orange-600 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-orange-50 transition-all duration-200 hover:scale-105 shadow-lg"
          >
            <BookOpen size={24} />
            Generate Citation - Free Forever
          </button>
        </div>
      </section>

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
                Generation Limit Reached
              </h3>
              <p className="text-neutral-600">
                Create a free account for unlimited citations
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
