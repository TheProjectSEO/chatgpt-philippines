'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Search,
  Sparkles,
  Copy,
  Check,
  ChevronRight,
  ChevronDown,
  X,
  Brain,
  BookOpen,
  Zap,
  Shield,
  ExternalLink,
  Loader2,
} from 'lucide-react';

interface Source {
  title: string;
  url: string;
  source: string;
}

interface ToolUse {
  name: string;
  input: any;
}

interface ResearchResult {
  answer: string;
  thinking?: string;
  sources: Source[];
  toolsUsed?: ToolUse[];
  usage?: {
    input_tokens: number;
    output_tokens: number;
  };
}

export default function ResearchAssistantPage() {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState<ResearchResult | null>(null);
  const [isResearching, setIsResearching] = useState(false);
  const [showThinking, setShowThinking] = useState(false);
  const [copied, setCopied] = useState(false);
  const [guestUses, setGuestUses] = useState(10);
  const [showLoginModal, setShowLoginModal] = useState(false);

  const MAX_FREE_USES = 10;

  // Load rate limit on mount
  useEffect(() => {
    const loadRateLimit = async () => {
      try {
        const response = await fetch('/api/rate-limit', { method: 'GET' });
        if (response.ok) {
          const rateLimit = await response.json();
          const remaining = Math.max(0, MAX_FREE_USES - rateLimit.count);
          setGuestUses(remaining);
        }
      } catch (error) {
        console.error('Failed to load rate limit:', error);
      }
    };
    loadRateLimit();
  }, []);

  const handleResearch = async () => {
    if (!query.trim()) {
      alert('Please enter a research query');
      return;
    }

    if (guestUses <= 0) {
      setShowLoginModal(true);
      return;
    }

    setIsResearching(true);
    setResult(null);

    try {
      // Check rate limit
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
          setIsResearching(false);
          return;
        }
      }

      const response = await fetch('/api/research-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Research failed');
      }

      setResult(data);
    } catch (error: any) {
      console.error('Research error:', error);
      alert(error.message || 'Failed to complete research. Please try again.');
    } finally {
      setIsResearching(false);
    }
  };

  const handleCopy = async () => {
    if (!result) return;

    try {
      await navigator.clipboard.writeText(result.answer);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-cyan-50 via-white to-teal-50 pt-24 pb-16 md:pt-32 md:pb-24">
        <div className="container mx-auto px-4 md:px-6 max-w-7xl">
          <div className="flex items-center gap-2 text-sm text-neutral-600 mb-6">
            <Link href="/" className="hover:text-primary-600 transition-colors">
              Home
            </Link>
            <ChevronRight size={16} />
            <span className="text-neutral-800 font-medium">Research Assistant</span>
          </div>

          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-cyan-100 text-cyan-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Brain size={18} />
              <span>AI-Powered Research with Extended Thinking</span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-neutral-900 mb-6 leading-tight">
              Research Assistant{' '}
              <span className="bg-gradient-to-r from-cyan-500 to-teal-600 bg-clip-text text-transparent">
                with AI Tools
              </span>
            </h1>

            <p className="text-lg md:text-xl text-neutral-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              Get comprehensive, well-researched answers with sources. Our AI uses web search,
              documentation lookup, and extended thinking for thorough analysis.
            </p>

            <div className="flex flex-wrap justify-center gap-8 md:gap-12 mb-8">
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-cyan-600">Extended</div>
                <div className="text-sm text-neutral-600">Thinking Process</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-cyan-600">Multi-Tool</div>
                <div className="text-sm text-neutral-600">Research Capability</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-cyan-600">Cited</div>
                <div className="text-sm text-neutral-600">Sources</div>
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
              <h2 className="text-2xl font-bold text-neutral-900 mb-6">Ask Your Research Question</h2>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Research Query *
                  </label>
                  <textarea
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="e.g., What are the latest advancements in quantum computing and their potential applications?"
                    className="w-full h-32 px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent resize-none"
                  />
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4">
                  <div className="text-sm text-neutral-600">
                    Guest uses remaining: <span className="font-semibold text-cyan-600">{guestUses}</span>
                  </div>
                  <button
                    onClick={handleResearch}
                    disabled={isResearching || !query.trim()}
                    className="w-full sm:w-auto bg-gradient-to-r from-cyan-500 to-teal-600 text-white px-8 py-3 rounded-lg font-semibold hover:from-cyan-600 hover:to-teal-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isResearching ? (
                      <>
                        <Loader2 size={20} className="animate-spin" />
                        Researching...
                      </>
                    ) : (
                      <>
                        <Search size={20} />
                        Start Research
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Results Section */}
            {result && (
              <div className="border-t border-neutral-200 p-6 md:p-8 bg-neutral-50">
                {/* Thinking Process (Collapsible) */}
                {result.thinking && (
                  <div className="mb-6">
                    <button
                      onClick={() => setShowThinking(!showThinking)}
                      className="flex items-center justify-between w-full bg-cyan-50 border border-cyan-200 rounded-lg p-4 hover:bg-cyan-100 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <Brain className="text-cyan-600" size={20} />
                        <span className="font-semibold text-cyan-900">Thinking Process</span>
                      </div>
                      <ChevronDown
                        size={20}
                        className={`text-cyan-600 transition-transform ${showThinking ? 'rotate-180' : ''}`}
                      />
                    </button>
                    {showThinking && (
                      <div className="mt-2 bg-white border border-cyan-200 rounded-lg p-4">
                        <pre className="text-sm text-neutral-700 whitespace-pre-wrap font-mono">
                          {result.thinking}
                        </pre>
                      </div>
                    )}
                  </div>
                )}

                {/* Tools Used */}
                {result.toolsUsed && result.toolsUsed.length > 0 && (
                  <div className="mb-6">
                    <div className="flex items-center gap-2 mb-3">
                      <Zap className="text-orange-600" size={18} />
                      <span className="text-sm font-semibold text-neutral-900">Tools Used</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {result.toolsUsed.map((tool, idx) => (
                        <div
                          key={idx}
                          className="bg-orange-50 text-orange-700 px-3 py-1 rounded-full text-sm border border-orange-200"
                        >
                          {tool.name}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Answer */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-semibold text-neutral-900">Research Answer</h3>
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
                  <div className="bg-white border border-neutral-300 rounded-lg p-6">
                    <div className="prose max-w-none">
                      <div className="text-neutral-800 whitespace-pre-wrap">{result.answer}</div>
                    </div>
                  </div>
                </div>

                {/* Sources */}
                {result.sources && result.sources.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <BookOpen className="text-cyan-600" size={18} />
                      <span className="text-sm font-semibold text-neutral-900">Sources</span>
                    </div>
                    <div className="space-y-2">
                      {result.sources.map((source, idx) => (
                        <a
                          key={idx}
                          href={source.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block bg-white border border-neutral-300 rounded-lg p-4 hover:border-cyan-400 hover:shadow-md transition-all group"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <div className="font-medium text-neutral-900 group-hover:text-cyan-600 transition-colors">
                                {source.title}
                              </div>
                              <div className="text-sm text-neutral-600 mt-1">{source.source}</div>
                            </div>
                            <ExternalLink size={16} className="text-neutral-400 flex-shrink-0 mt-1" />
                          </div>
                        </a>
                      ))}
                    </div>
                  </div>
                )}
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
              Advanced Research Capabilities
            </h2>
            <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
              Powered by Claude Sonnet 4 with extended thinking and tool use
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Brain,
                title: 'Extended Thinking',
                description: 'AI reasons through complex queries with visible thought process',
                color: 'text-cyan-600',
                bg: 'bg-cyan-50',
              },
              {
                icon: Search,
                title: 'Web Search',
                description: 'Access current information and multiple sources via MCP tools',
                color: 'text-blue-600',
                bg: 'bg-blue-50',
              },
              {
                icon: BookOpen,
                title: 'Documentation Lookup',
                description: 'Query official docs for technical topics and frameworks',
                color: 'text-purple-600',
                bg: 'bg-purple-50',
              },
              {
                icon: Shield,
                title: 'Cited Sources',
                description: 'Every claim backed by verifiable sources and references',
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
                <h3 className="text-xl font-semibold text-neutral-900 mb-2">{feature.title}</h3>
                <p className="text-neutral-600">{feature.description}</p>
              </div>
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
              <div className="bg-cyan-100 text-cyan-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search size={32} />
              </div>
              <h3 className="text-2xl font-bold text-neutral-900 mb-2">Usage Limit Reached</h3>
              <p className="text-neutral-600">Create a free account for unlimited research</p>
            </div>

            <div className="space-y-3">
              <Link
                href="/signup"
                className="block w-full bg-gradient-to-r from-cyan-500 to-teal-600 text-white px-6 py-3 rounded-lg font-semibold text-center hover:from-cyan-600 hover:to-teal-700 transition-all"
              >
                Sign Up - Free Forever
              </Link>
              <Link
                href="/login"
                className="block w-full bg-white border border-neutral-300 text-neutral-700 px-6 py-3 rounded-lg font-semibold text-center hover:bg-neutral-50 transition-colors"
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
