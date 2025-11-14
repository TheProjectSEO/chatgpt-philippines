'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Copy, Check, ChevronRight, X, Target, Sparkles, FileText, Zap, Shield } from 'lucide-react';

export default function TopicGeneratorPage() {
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState('');
  const [topics, setTopics] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [guestGenerations, setGuestGenerations] = useState(0);
  const [showLoginModal, setShowLoginModal] = useState(false);

  const MAX_FREE_GENERATIONS = 10;

  useEffect(() => {
    const loadRateLimit = async () => {
      try {
        const response = await fetch('/api/rate-limit', { method: 'GET' });
        if (response.ok) {
          const rateLimit = await response.json();
          setGuestGenerations(Math.max(0, MAX_FREE_GENERATIONS - rateLimit.count));
          if (rateLimit.blocked) setShowLoginModal(true);
        }
      } catch (error) {
        console.error('Failed to load rate limit:', error);
      }
    };
    loadRateLimit();
  }, []);

  const handleGenerate = async () => {
    if (!subject.trim()) {
      alert('Please enter a subject area');
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
        setGuestGenerations(Math.max(0, MAX_FREE_GENERATIONS - rateLimit.count));
        if (rateLimit.blocked) {
          setShowLoginModal(true);
          setIsGenerating(false);
          return;
        }
      }

      const response = await fetch('/api/topic-generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject, category }),
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

      setTopics(data.topics);

    } catch (error: any) {
      console.error('Generation error:', error);
      alert(error.message || 'Failed to generate. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = async (topic: string) => {
    try {
      await navigator.clipboard.writeText(topic);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const loadSample = () => {
    setSubject('Technology');
    setCategory('Research Paper');
  };

  return (
    <div className="min-h-screen bg-white">
      <section className="relative bg-gradient-to-br from-teal-50 via-white to-cyan-50 pt-24 pb-16 md:pt-32 md:pb-24">
        <div className="container mx-auto px-4 md:px-6 max-w-7xl">
          <div className="flex items-center gap-2 text-sm text-neutral-600 mb-6">
            <Link href="/" className="hover:text-primary-600 transition-colors">Home</Link>
            <ChevronRight size={16} />
            <span className="text-neutral-800 font-medium">Topic Generator</span>
          </div>

          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-teal-100 text-teal-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Target size={18} />
              <span>AI-Powered Topic Ideas</span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-neutral-900 mb-6 leading-tight">
              AI Topic Generator -{' '}
              <span className="bg-gradient-to-r from-teal-500 to-cyan-600 bg-clip-text text-transparent">
                Fresh Ideas
              </span>
            </h1>

            <p className="text-lg md:text-xl text-neutral-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              Discover unique topic ideas for essays, research papers, blog posts, and more. Beat writer's block with AI.
            </p>

            <div className="flex flex-wrap justify-center gap-8 md:gap-12 mb-8">
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-teal-600">40K+</div>
                <div className="text-sm text-neutral-600">Topics Generated</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-teal-600">15</div>
                <div className="text-sm text-neutral-600">Ideas per Use</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-teal-600">Free</div>
                <div className="text-sm text-neutral-600">Forever</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4 md:px-6 max-w-7xl">
          <div className="bg-white rounded-2xl shadow-lg border border-neutral-200 overflow-hidden">
            <div className="p-6 space-y-4 border-b border-neutral-200">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-medium text-neutral-700">Subject Area</label>
                  <button onClick={loadSample} className="text-sm text-teal-600 hover:text-teal-700">Load sample</button>
                </div>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g., History, Science, Business, Literature"
                  className="w-full p-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-neutral-700 mb-2 block">Category (Optional)</label>
                <input
                  type="text"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="e.g., Essay, Research Paper, Blog Post, Speech"
                  className="w-full p-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>

            <div className="p-6 bg-neutral-50">
              <div className="flex items-center justify-between mb-4">
                <label className="text-sm font-medium text-neutral-700">Topic Ideas</label>
              </div>

              <div className="w-full min-h-96 p-4 bg-white border border-neutral-300 rounded-lg">
                {isGenerating ? (
                  <div className="flex items-center justify-center h-96">
                    <div className="text-center">
                      <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mb-3"></div>
                      <p className="text-neutral-600">Generating topic ideas...</p>
                    </div>
                  </div>
                ) : topics.length > 0 ? (
                  <div className="space-y-3">
                    {topics.map((topic, index) => (
                      <div key={index} className="flex items-start justify-between gap-3 p-4 bg-teal-50 rounded-lg hover:bg-teal-100 transition-colors">
                        <div className="flex-1">
                          <span className="text-sm font-semibold text-teal-700 mr-2">{index + 1}.</span>
                          <span className="text-neutral-800">{topic}</span>
                        </div>
                        <button
                          onClick={() => handleCopy(topic)}
                          className="p-2 rounded-lg hover:bg-white transition-colors flex-shrink-0"
                        >
                          {copied ? <Check size={18} className="text-green-600" /> : <Copy size={18} className="text-neutral-600" />}
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-neutral-400 text-center py-20">Your topic suggestions will appear here...</p>
                )}
              </div>
            </div>

            <div className="border-t border-neutral-200 p-6 bg-neutral-50">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-sm text-neutral-600">
                  Guest generations remaining: <span className="font-semibold text-teal-600">{guestGenerations}</span>
                </div>
                <button
                  onClick={handleGenerate}
                  disabled={isGenerating || !subject.trim()}
                  className="w-full sm:w-auto btn-primary btn-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isGenerating ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Generating...
                    </>
                  ) : (
                    <>
                      <Target size={20} />
                      Generate Topics
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
            <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-4">Why Use Our Topic Generator?</h2>
            <p className="text-lg text-neutral-600 max-w-2xl mx-auto">Never run out of content ideas again</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-neutral-200">
              <div className="bg-teal-100 text-teal-600 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Sparkles size={24} />
              </div>
              <h3 className="text-xl font-semibold text-neutral-900 mb-2">Unique Ideas</h3>
              <p className="text-neutral-600">Get 15 fresh, original topic suggestions every time</p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-neutral-200">
              <div className="bg-cyan-100 text-cyan-600 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <FileText size={24} />
              </div>
              <h3 className="text-xl font-semibold text-neutral-900 mb-2">All Subjects</h3>
              <p className="text-neutral-600">Topics for any field or discipline you need</p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-neutral-200">
              <div className="bg-green-100 text-green-600 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Zap size={24} />
              </div>
              <h3 className="text-xl font-semibold text-neutral-900 mb-2">Beat Writer's Block</h3>
              <p className="text-neutral-600">Overcome creative blocks with AI-powered inspiration</p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-neutral-200">
              <div className="bg-orange-100 text-orange-600 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Shield size={24} />
              </div>
              <h3 className="text-xl font-semibold text-neutral-900 mb-2">Research Ready</h3>
              <p className="text-neutral-600">Topics designed for essays, papers, and projects</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-gradient-to-br from-teal-500 to-cyan-600 text-white">
        <div className="container mx-auto px-4 md:px-6 max-w-4xl text-center">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">Generate Topics Now</h2>
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="inline-flex items-center gap-3 bg-white text-teal-600 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-teal-50 transition-all duration-200"
          >
            <Target size={24} />
            Get Topic Ideas - Free Forever
          </button>
        </div>
      </section>

      {showLoginModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8 relative">
            <button onClick={() => setShowLoginModal(false)} className="absolute top-4 right-4">
              <X size={24} />
            </button>
            <div className="text-center mb-6">
              <div className="bg-teal-100 text-teal-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Target size={32} />
              </div>
              <h3 className="text-2xl font-bold text-neutral-900 mb-2">Generation Limit Reached</h3>
              <p className="text-neutral-600">Create a free account for unlimited topic generation</p>
            </div>
            <div className="space-y-3">
              <Link href="/signup" className="block w-full btn-primary btn-lg text-center">
                Sign Up - Free Forever
              </Link>
              <Link href="/login" className="block w-full btn-secondary btn-lg text-center">
                Log In
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
