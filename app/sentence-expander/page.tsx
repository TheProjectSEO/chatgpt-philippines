'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Copy, Check, ChevronRight, X, Maximize2, Sparkles, FileText, Zap, Shield } from 'lucide-react';

export default function SentenceExpanderPage() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [isExpanding, setIsExpanding] = useState(false);
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

  const handleExpand = async () => {
    if (!input.trim()) {
      alert('Please enter text to expand');
      return;
    }

    if (guestGenerations <= 0) {
      setShowLoginModal(true);
      return;
    }

    setIsExpanding(true);

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
          setIsExpanding(false);
          return;
        }
      }

      const response = await fetch('/api/sentence-expand', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: input }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 429) {
          setShowLoginModal(true);
          setGuestGenerations(0);
          alert(data.message || 'Generation limit reached. Please sign up to continue.');
          return;
        }
        throw new Error(data.error || 'Expansion failed');
      }

      setOutput(data.expanded);

    } catch (error: any) {
      console.error('Expansion error:', error);
      alert(error.message || 'Failed to expand. Please try again.');
    } finally {
      setIsExpanding(false);
    }
  };

  const handleCopy = async () => {
    if (!output) return;
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const loadSample = () => {
    setInput('The project was successful.');
  };

  return (
    <div className="min-h-screen bg-white">
      <section className="relative bg-gradient-to-br from-purple-50 via-white to-blue-50 pt-24 pb-16 md:pt-32 md:pb-24">
        <div className="container mx-auto px-4 md:px-6 max-w-7xl">
          <div className="flex items-center gap-2 text-sm text-neutral-600 mb-6">
            <Link href="/" className="hover:text-primary-600 transition-colors">Home</Link>
            <ChevronRight size={16} />
            <span className="text-neutral-800 font-medium">Sentence Expander</span>
          </div>

          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-purple-100 text-purple-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Maximize2 size={18} />
              <span>AI-Powered Text Expansion</span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-neutral-900 mb-6 leading-tight">
              Free Sentence Expander -{' '}
              <span className="bg-gradient-to-r from-purple-500 to-blue-600 bg-clip-text text-transparent">
                Add More Detail
              </span>
            </h1>

            <p className="text-lg md:text-xl text-neutral-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              Transform short sentences into detailed, comprehensive text. Perfect for essays, reports, and content writing.
            </p>

            <div className="flex flex-wrap justify-center gap-8 md:gap-12 mb-8">
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-purple-600">20K+</div>
                <div className="text-sm text-neutral-600">Texts Expanded</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-purple-600">10</div>
                <div className="text-sm text-neutral-600">Free Uses Daily</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-purple-600">AI</div>
                <div className="text-sm text-neutral-600">Powered</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4 md:px-6 max-w-7xl">
          <div className="bg-white rounded-2xl shadow-lg border border-neutral-200 overflow-hidden">
            <div className="p-6 space-y-4 border-b border-neutral-200">
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium text-neutral-700">Original Text</label>
                <button onClick={loadSample} className="text-sm text-purple-600 hover:text-purple-700">Load sample</button>
              </div>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Enter your short sentence or text here..."
                className="w-full h-48 p-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
              />
            </div>

            <div className="p-6 bg-neutral-50">
              <div className="flex items-center justify-between mb-4">
                <label className="text-sm font-medium text-neutral-700">Expanded Text</label>
                {output && (
                  <button onClick={handleCopy} className="p-2 rounded-lg hover:bg-white transition-colors">
                    {copied ? <Check size={18} className="text-green-600" /> : <Copy size={18} className="text-neutral-600" />}
                  </button>
                )}
              </div>

              <div className="w-full h-96 p-4 bg-white border border-neutral-300 rounded-lg overflow-y-auto">
                {isExpanding ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mb-3"></div>
                      <p className="text-neutral-600">Expanding your text...</p>
                    </div>
                  </div>
                ) : output ? (
                  <p className="text-neutral-800 whitespace-pre-wrap" style={{ fontSize: '16px' }}>{output}</p>
                ) : (
                  <p className="text-neutral-400">Your expanded text will appear here...</p>
                )}
              </div>
            </div>

            <div className="border-t border-neutral-200 p-6 bg-neutral-50">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-sm text-neutral-600">
                  Guest generations remaining: <span className="font-semibold text-purple-600">{guestGenerations}</span>
                </div>
                <button
                  onClick={handleExpand}
                  disabled={isExpanding || !input.trim()}
                  className="w-full sm:w-auto btn-primary btn-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isExpanding ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Expanding...
                    </>
                  ) : (
                    <>
                      <Maximize2 size={20} />
                      Expand Text
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
            <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-4">Why Use Our Sentence Expander?</h2>
            <p className="text-lg text-neutral-600 max-w-2xl mx-auto">Turn brief sentences into rich, detailed paragraphs</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-neutral-200">
              <div className="bg-purple-100 text-purple-600 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Sparkles size={24} />
              </div>
              <h3 className="text-xl font-semibold text-neutral-900 mb-2">Add Detail</h3>
              <p className="text-neutral-600">Automatically add relevant details and context to your sentences</p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-neutral-200">
              <div className="bg-blue-100 text-blue-600 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <FileText size={24} />
              </div>
              <h3 className="text-xl font-semibold text-neutral-900 mb-2">Improve Flow</h3>
              <p className="text-neutral-600">Create smooth, natural-sounding expanded text</p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-neutral-200">
              <div className="bg-green-100 text-green-600 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Zap size={24} />
              </div>
              <h3 className="text-xl font-semibold text-neutral-900 mb-2">Professional Tone</h3>
              <p className="text-neutral-600">Maintain a professional and polished writing style</p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-neutral-200">
              <div className="bg-orange-100 text-orange-600 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Shield size={24} />
              </div>
              <h3 className="text-xl font-semibold text-neutral-900 mb-2">Context Rich</h3>
              <p className="text-neutral-600">Add meaningful context while staying on topic</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-gradient-to-br from-purple-500 to-blue-600 text-white">
        <div className="container mx-auto px-4 md:px-6 max-w-4xl text-center">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">Expand Your Text Now</h2>
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="inline-flex items-center gap-3 bg-white text-purple-600 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-purple-50 transition-all duration-200"
          >
            <Maximize2 size={24} />
            Start Expanding - Free Forever
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
              <div className="bg-purple-100 text-purple-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Maximize2 size={32} />
              </div>
              <h3 className="text-2xl font-bold text-neutral-900 mb-2">Generation Limit Reached</h3>
              <p className="text-neutral-600">Create a free account for unlimited expansions</p>
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
