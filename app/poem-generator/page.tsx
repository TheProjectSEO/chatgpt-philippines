'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Feather, Copy, Check, ChevronDown, ChevronRight, X, Sparkles, Heart, BookOpen, Pen, Zap, Shield } from 'lucide-react';

const poemStyles = ['Free Verse', 'Haiku', 'Sonnet', 'Limerick', 'Acrostic', 'Ballad', 'Ode', 'Villanelle'];
const moods = ['Happy', 'Sad', 'Romantic', 'Inspirational', 'Melancholic', 'Playful', 'Peaceful', 'Intense'];
const lengths = ['Short (4-8 lines)', 'Medium (8-16 lines)', 'Long (16+ lines)'];

export default function PoemGeneratorPage() {
  const [theme, setTheme] = useState('');
  const [style, setStyle] = useState('Free Verse');
  const [mood, setMood] = useState('Happy');
  const [length, setLength] = useState('Medium (8-16 lines)');
  const [poem, setPoem] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [guestGenerations, setGuestGenerations] = useState(0);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showStyleDropdown, setShowStyleDropdown] = useState(false);
  const [showMoodDropdown, setShowMoodDropdown] = useState(false);
  const [showLengthDropdown, setShowLengthDropdown] = useState(false);

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
    if (!theme.trim()) {
      alert('Please enter a theme');
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

      const response = await fetch('/api/poem-generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ theme, style, mood, length }),
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

      setPoem(data.poem);

    } catch (error: any) {
      console.error('Generation error:', error);
      alert(error.message || 'Failed to generate. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = async () => {
    if (!poem) return;
    try {
      await navigator.clipboard.writeText(poem);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const loadSample = () => {
    setTheme('A sunset over the ocean, waves gently touching the shore');
  };

  return (
    <div className="min-h-screen bg-white">
      <section className="relative bg-gradient-to-br from-orange-50 via-white to-purple-50 pt-24 pb-16 md:pt-32 md:pb-24">
        <div className="container mx-auto px-4 md:px-6 max-w-7xl">
          <div className="flex items-center gap-2 text-sm text-neutral-600 mb-6">
            <Link href="/" className="hover:text-primary-600 transition-colors">Home</Link>
            <ChevronRight size={16} />
            <span className="text-neutral-800 font-medium">Poem Generator</span>
          </div>

          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Feather size={18} />
              <span>AI-Powered Poetry</span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-neutral-900 mb-6 leading-tight">
              AI Poem Generator -{' '}
              <span className="bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent">
                Creative Poetry
              </span>
            </h1>

            <p className="text-lg md:text-xl text-neutral-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              Generate beautiful, original poems in various styles. From haikus to sonnets, create poetry for any occasion.
            </p>

            <div className="flex flex-wrap justify-center gap-8 md:gap-12 mb-8">
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-orange-600">25K+</div>
                <div className="text-sm text-neutral-600">Poems</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-orange-600">8+</div>
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
            <div className="grid grid-cols-1 md:grid-cols-3 border-b border-neutral-200">
              <div className="relative border-b md:border-b-0 md:border-r border-neutral-200">
                <button onClick={() => setShowStyleDropdown(!showStyleDropdown)} className="w-full flex items-center justify-between gap-3 p-4 hover:bg-neutral-50 transition-colors">
                  <span className="font-medium text-neutral-800">{style}</span>
                  <ChevronDown size={20} className="text-neutral-500" />
                </button>
                {showStyleDropdown && (
                  <div className="absolute top-full left-0 right-0 bg-white border border-neutral-200 rounded-b-lg shadow-xl z-50 max-h-96 overflow-y-auto">
                    {poemStyles.map((s) => (
                      <button key={s} onClick={() => { setStyle(s); setShowStyleDropdown(false); }} className="w-full text-left px-4 py-3 hover:bg-orange-50 transition-colors">{s}</button>
                    ))}
                  </div>
                )}
              </div>

              <div className="relative border-b md:border-b-0 md:border-r border-neutral-200">
                <button onClick={() => setShowMoodDropdown(!showMoodDropdown)} className="w-full flex items-center justify-between gap-3 p-4 hover:bg-neutral-50 transition-colors">
                  <span className="font-medium text-neutral-800">{mood}</span>
                  <ChevronDown size={20} className="text-neutral-500" />
                </button>
                {showMoodDropdown && (
                  <div className="absolute top-full left-0 right-0 bg-white border border-neutral-200 rounded-b-lg shadow-xl z-50">
                    {moods.map((m) => (
                      <button key={m} onClick={() => { setMood(m); setShowMoodDropdown(false); }} className="w-full text-left px-4 py-3 hover:bg-orange-50 transition-colors">{m}</button>
                    ))}
                  </div>
                )}
              </div>

              <div className="relative">
                <button onClick={() => setShowLengthDropdown(!showLengthDropdown)} className="w-full flex items-center justify-between gap-3 p-4 hover:bg-neutral-50 transition-colors">
                  <span className="font-medium text-neutral-800">{length}</span>
                  <ChevronDown size={20} className="text-neutral-500" />
                </button>
                {showLengthDropdown && (
                  <div className="absolute top-full left-0 right-0 bg-white border border-neutral-200 rounded-b-lg shadow-xl z-50">
                    {lengths.map((l) => (
                      <button key={l} onClick={() => { setLength(l); setShowLengthDropdown(false); }} className="w-full text-left px-4 py-3 hover:bg-orange-50 transition-colors">{l}</button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-neutral-200">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <label className="text-sm font-medium text-neutral-700">Enter poem theme</label>
                  <button onClick={loadSample} className="text-sm text-orange-600 hover:text-orange-700 font-medium">Load sample</button>
                </div>
                <textarea value={theme} onChange={(e) => setTheme(e.target.value)} placeholder="Describe what you want your poem to be about..." className="w-full h-64 p-4 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none" />
              </div>

              <div className="p-6 bg-neutral-50">
                <div className="flex items-center justify-between mb-4">
                  <label className="text-sm font-medium text-neutral-700">Your Poem</label>
                  {poem && (
                    <button onClick={handleCopy} className="p-2 rounded-lg hover:bg-white transition-colors">
                      {copied ? <Check size={18} className="text-green-600" /> : <Copy size={18} className="text-neutral-600" />}
                    </button>
                  )}
                </div>
                <div className="w-full h-64 p-4 bg-white border border-neutral-300 rounded-lg overflow-y-auto">
                  {isGenerating ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mb-3"></div>
                        <p className="text-neutral-600">Creating your poem...</p>
                      </div>
                    </div>
                  ) : poem ? (
                    <p className="text-neutral-800 whitespace-pre-wrap" style={{ fontSize: '16px' }}>{poem}</p>
                  ) : (
                    <p className="text-neutral-400">Your poem will appear here...</p>
                  )}
                </div>
              </div>
            </div>

            <div className="border-t border-neutral-200 p-6 bg-neutral-50">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-sm text-neutral-600">
                  Guest generations remaining: <span className="font-semibold text-orange-600">{guestGenerations}</span>
                </div>
                <button onClick={handleGenerate} disabled={isGenerating || !theme.trim()} className="w-full sm:w-auto btn-primary btn-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
                  {isGenerating ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Generating...
                    </>
                  ) : (
                    <>
                      <Feather size={20} />
                      Generate Poem
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-gradient-to-br from-orange-500 to-orange-600 text-white">
        <div className="container mx-auto px-4 md:px-6 max-w-4xl text-center">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">Create Beautiful Poetry Now</h2>
          <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="inline-flex items-center gap-3 bg-white text-orange-600 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-orange-50 transition-all duration-200">
            <Feather size={24} />
            Generate Poem - Free Forever
          </button>
        </div>
      </section>

      {showLoginModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8 relative">
            <button onClick={() => setShowLoginModal(false)} className="absolute top-4 right-4"><X size={24} /></button>
            <div className="text-center mb-6">
              <div className="bg-orange-100 text-orange-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Feather size={32} />
              </div>
              <h3 className="text-2xl font-bold text-neutral-900 mb-2">Generation Limit Reached</h3>
              <p className="text-neutral-600">Create a free account for unlimited poems</p>
            </div>
            <div className="space-y-3">
              <Link href="/signup" className="block w-full btn-primary btn-lg text-center">Sign Up - Free Forever</Link>
              <Link href="/login" className="block w-full btn-secondary btn-lg text-center">Log In</Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
