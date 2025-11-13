'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Mic,
  Copy,
  Check,
  ChevronDown,
  ChevronRight,
  X,
  Sparkles,
  Users,
  GraduationCap,
  Briefcase,
  Zap,
  Shield,
} from 'lucide-react';

const speechTypes = [
  'Wedding Toast', 'Best Man Speech', 'Maid of Honor', 'Graduation Speech',
  'Business Presentation', 'Motivational Speech', 'Farewell Speech',
  'Introduction Speech', 'Thank You Speech', 'Award Acceptance'
];

const tones = ['Formal', 'Casual', 'Humorous', 'Inspirational', 'Professional', 'Emotional'];
const durations = ['1-2 minutes', '3-5 minutes', '5-10 minutes', '10+ minutes'];

export default function SpeechWriterPage() {
  const [occasion, setOccasion] = useState('');
  const [audience, setAudience] = useState('');
  const [keyPoints, setKeyPoints] = useState('');
  const [speechType, setSpeechType] = useState('Wedding Toast');
  const [tone, setTone] = useState('Formal');
  const [duration, setDuration] = useState('3-5 minutes');
  const [speech, setSpeech] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [guestGenerations, setGuestGenerations] = useState(0);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);
  const [showToneDropdown, setShowToneDropdown] = useState(false);
  const [showDurationDropdown, setShowDurationDropdown] = useState(false);

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
    if (!occasion.trim() || !keyPoints.trim()) {
      alert('Please provide occasion and key points');
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

      const response = await fetch('/api/speech-write', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          occasion,
          audience,
          keyPoints,
          speechType,
          tone,
          duration,
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

      setSpeech(data.speech);

    } catch (error: any) {
      console.error('Generation error:', error);
      alert(error.message || 'Failed to generate. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = async () => {
    if (!speech) return;
    try {
      await navigator.clipboard.writeText(speech);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const loadSample = () => {
    setOccasion("Sarah and John's Wedding");
    setAudience('Family and friends');
    setKeyPoints('Known Sarah since college, funny story about first date, wish them happiness');
  };

  return (
    <div className="min-h-screen bg-white">
      <section className="relative bg-gradient-to-br from-orange-50 via-white to-purple-50 pt-24 pb-16 md:pt-32 md:pb-24">
        <div className="container mx-auto px-4 md:px-6 max-w-7xl">
          <div className="flex items-center gap-2 text-sm text-neutral-600 mb-6">
            <Link href="/" className="hover:text-primary-600 transition-colors">Home</Link>
            <ChevronRight size={16} />
            <span className="text-neutral-800 font-medium">Speech Writer</span>
          </div>

          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Mic size={18} />
              <span>AI-Powered Speech Writing</span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-neutral-900 mb-6 leading-tight">
              AI Speech Writer -{' '}
              <span className="bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent">
                Perfect Speeches
              </span>
            </h1>

            <p className="text-lg md:text-xl text-neutral-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              Create compelling speeches for any occasion. Weddings, graduations, business presentations, and more.
            </p>

            <div className="flex flex-wrap justify-center gap-8 md:gap-12 mb-8">
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-orange-600">50K+</div>
                <div className="text-sm text-neutral-600">Speeches</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-orange-600">10+</div>
                <div className="text-sm text-neutral-600">Types</div>
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
                <button
                  onClick={() => setShowTypeDropdown(!showTypeDropdown)}
                  className="w-full flex items-center justify-between gap-3 p-4 hover:bg-neutral-50 transition-colors"
                >
                  <span className="font-medium text-neutral-800">{speechType}</span>
                  <ChevronDown size={20} className="text-neutral-500" />
                </button>
                {showTypeDropdown && (
                  <div className="absolute top-full left-0 right-0 bg-white border border-neutral-200 rounded-b-lg shadow-xl z-50 max-h-96 overflow-y-auto">
                    {speechTypes.map((type) => (
                      <button
                        key={type}
                        onClick={() => {
                          setSpeechType(type);
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

              <div className="relative border-b md:border-b-0 md:border-r border-neutral-200">
                <button
                  onClick={() => setShowToneDropdown(!showToneDropdown)}
                  className="w-full flex items-center justify-between gap-3 p-4 hover:bg-neutral-50 transition-colors"
                >
                  <span className="font-medium text-neutral-800">{tone}</span>
                  <ChevronDown size={20} className="text-neutral-500" />
                </button>
                {showToneDropdown && (
                  <div className="absolute top-full left-0 right-0 bg-white border border-neutral-200 rounded-b-lg shadow-xl z-50">
                    {tones.map((t) => (
                      <button
                        key={t}
                        onClick={() => {
                          setTone(t);
                          setShowToneDropdown(false);
                        }}
                        className="w-full text-left px-4 py-3 hover:bg-orange-50 transition-colors"
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="relative">
                <button
                  onClick={() => setShowDurationDropdown(!showDurationDropdown)}
                  className="w-full flex items-center justify-between gap-3 p-4 hover:bg-neutral-50 transition-colors"
                >
                  <span className="font-medium text-neutral-800">{duration}</span>
                  <ChevronDown size={20} className="text-neutral-500" />
                </button>
                {showDurationDropdown && (
                  <div className="absolute top-full left-0 right-0 bg-white border border-neutral-200 rounded-b-lg shadow-xl z-50">
                    {durations.map((d) => (
                      <button
                        key={d}
                        onClick={() => {
                          setDuration(d);
                          setShowDurationDropdown(false);
                        }}
                        className="w-full text-left px-4 py-3 hover:bg-orange-50 transition-colors"
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="p-6 space-y-4 border-b border-neutral-200">
              <div>
                <label className="text-sm font-medium text-neutral-700 mb-2 block">Occasion</label>
                <input
                  type="text"
                  value={occasion}
                  onChange={(e) => setOccasion(e.target.value)}
                  placeholder="e.g., Sarah and John's Wedding"
                  className="w-full p-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-neutral-700 mb-2 block">Audience</label>
                <input
                  type="text"
                  value={audience}
                  onChange={(e) => setAudience(e.target.value)}
                  placeholder="e.g., Family and friends"
                  className="w-full p-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-neutral-700 mb-2 flex justify-between">
                  <span>Key Points to Include</span>
                  <button onClick={loadSample} className="text-sm text-orange-600 hover:text-orange-700">
                    Load sample
                  </button>
                </label>
                <textarea
                  value={keyPoints}
                  onChange={(e) => setKeyPoints(e.target.value)}
                  placeholder="List main points you want to cover..."
                  className="w-full h-32 p-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
                />
              </div>
            </div>

            <div className="p-6 bg-neutral-50">
              <div className="flex items-center justify-between mb-4">
                <label className="text-sm font-medium text-neutral-700">Your Speech</label>
                {speech && (
                  <button onClick={handleCopy} className="p-2 rounded-lg hover:bg-white transition-colors">
                    {copied ? <Check size={18} className="text-green-600" /> : <Copy size={18} className="text-neutral-600" />}
                  </button>
                )}
              </div>

              <div className="w-full h-96 p-4 bg-white border border-neutral-300 rounded-lg overflow-y-auto">
                {isGenerating ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mb-3"></div>
                      <p className="text-neutral-600">Writing your speech...</p>
                    </div>
                  </div>
                ) : speech ? (
                  <p className="text-neutral-800 whitespace-pre-wrap" style={{ fontSize: '16px' }}>{speech}</p>
                ) : (
                  <p className="text-neutral-400">Your speech will appear here...</p>
                )}
              </div>
            </div>

            <div className="border-t border-neutral-200 p-6 bg-neutral-50">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-sm text-neutral-600">
                  Guest generations remaining: <span className="font-semibold text-orange-600">{guestGenerations}</span>
                </div>
                <button
                  onClick={handleGenerate}
                  disabled={isGenerating || !occasion.trim() || !keyPoints.trim()}
                  className="w-full sm:w-auto btn-primary btn-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isGenerating ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Generating...
                    </>
                  ) : (
                    <>
                      <Mic size={20} />
                      Write My Speech
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
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
            Create Your Perfect Speech Now
          </h2>
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="inline-flex items-center gap-3 bg-white text-orange-600 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-orange-50 transition-all duration-200"
          >
            <Mic size={24} />
            Write Speech - Free Forever
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
              <div className="bg-orange-100 text-orange-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mic size={32} />
              </div>
              <h3 className="text-2xl font-bold text-neutral-900 mb-2">Generation Limit Reached</h3>
              <p className="text-neutral-600">Create a free account for unlimited speeches</p>
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
