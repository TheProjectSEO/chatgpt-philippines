'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  BookOpen,
  Copy,
  Check,
  Sparkles,
  ChevronRight,
  ChevronDown,
  X,
  Zap,
  Award,
  Wand2,
  Heart,
  Ghost,
  Rocket,
  Shield,
} from 'lucide-react';

// Story genres
const genres = [
  { value: 'fantasy', label: 'Fantasy', icon: Wand2 },
  { value: 'romance', label: 'Romance', icon: Heart },
  { value: 'mystery', label: 'Mystery', icon: Ghost },
  { value: 'sci-fi', label: 'Sci-Fi', icon: Rocket },
  { value: 'adventure', label: 'Adventure', icon: Shield },
  { value: 'horror', label: 'Horror', icon: Ghost },
  { value: 'comedy', label: 'Comedy', icon: Sparkles },
  { value: 'drama', label: 'Drama', icon: Heart },
];

// Story lengths
const lengths = [
  { value: 'short', label: 'Short (300-500 words)' },
  { value: 'medium', label: 'Medium (500-800 words)' },
  { value: 'long', label: 'Long (800-1200 words)' },
];

export default function StoryGeneratorPage() {
  const [prompt, setPrompt] = useState('');
  const [genre, setGenre] = useState('fantasy');
  const [length, setLength] = useState('medium');
  const [characters, setCharacters] = useState('');
  const [generatedStory, setGeneratedStory] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [charCount, setCharCount] = useState(0);
  const [copied, setCopied] = useState(false);
  const [guestUses, setGuestUses] = useState(0);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isLoadingRateLimit, setIsLoadingRateLimit] = useState(true);

  const maxChars = 500;
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
    setCharCount(prompt.length);
  }, [prompt]);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      alert('Please enter a story prompt or idea');
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

      const response = await fetch('/api/story-generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          genre,
          length,
          characters,
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

      setGeneratedStory(data.story);
    } catch (error: any) {
      console.error('Generation error:', error);
      alert(error.message || 'Failed to generate. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = async () => {
    if (!generatedStory) return;

    try {
      await navigator.clipboard.writeText(generatedStory);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const loadSample = () => {
    const samples: Record<string, string> = {
      fantasy: 'A young wizard discovers a forbidden spell that can change destiny',
      romance: 'Two strangers keep meeting by chance in a small coffee shop',
      mystery: 'A detective receives anonymous clues about an unsolved case',
      'sci-fi': 'In 2150, humans discover they are not alone in the universe',
      adventure: 'A treasure map leads to an unexpected journey across continents',
      horror: 'Strange things happen when a family moves into their dream house',
      comedy: 'A case of mistaken identity leads to hilarious situations',
      drama: 'A family secret resurfaces after decades of silence',
    };
    setPrompt(samples[genre] || samples.fantasy);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-pink-50 via-white to-purple-50 pt-24 pb-16 md:pt-32 md:pb-24">
        <div className="container mx-auto px-4 md:px-6 max-w-7xl">
          <div className="flex items-center gap-2 text-sm text-neutral-600 mb-6">
            <Link href="/" className="hover:text-primary-600 transition-colors">
              Home
            </Link>
            <ChevronRight size={16} />
            <span className="text-neutral-800 font-medium">Story Generator</span>
          </div>

          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-pink-100 text-pink-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Sparkles size={18} />
              <span>AI-Powered Creative Writing</span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-neutral-900 mb-6 leading-tight">
              AI Story Generator{' '}
              <span className="bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
                for Writers
              </span>
            </h1>

            <p className="text-lg md:text-xl text-neutral-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              Create engaging stories in any genre with AI. From fantasy adventures
              to romantic tales, bring your ideas to life instantly.
            </p>

            <div className="flex flex-wrap justify-center gap-8 md:gap-12 mb-8">
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-pink-600">3M+</div>
                <div className="text-sm text-neutral-600">Stories Created</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-pink-600">8+</div>
                <div className="text-sm text-neutral-600">Genres</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-pink-600">Unlimited</div>
                <div className="text-sm text-neutral-600">Creativity</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Genre Pills */}
      <section className="py-8 border-b border-neutral-200 bg-neutral-50">
        <div className="container mx-auto px-4 md:px-6 max-w-7xl">
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <span className="text-sm font-medium text-neutral-700">Popular genres:</span>
            {genres.slice(0, 5).map((g) => (
              <button
                key={g.value}
                onClick={() => setGenre(g.value)}
                className={`text-sm px-4 py-2 rounded-full border transition-all duration-200 ${
                  genre === g.value
                    ? 'bg-pink-500 text-white border-pink-500'
                    : 'bg-white text-neutral-700 border-neutral-300 hover:border-pink-500'
                }`}
              >
                {g.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Main Interface */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4 md:px-6 max-w-5xl">
          <div className="bg-white rounded-2xl shadow-lg border border-neutral-200 overflow-hidden">
            <div className="p-6 md:p-8">
              <h2 className="text-2xl font-bold text-neutral-900 mb-6">Create Your Story</h2>

              <div className="space-y-6">
                {/* Story Prompt */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-neutral-700">
                      Story Idea or Prompt *
                    </label>
                    <button
                      onClick={loadSample}
                      className="text-sm text-pink-600 hover:text-pink-700 font-medium"
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
                    placeholder="Enter your story idea, theme, or opening line..."
                    className="w-full h-32 px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent resize-none"
                  />
                  <div className="text-sm text-neutral-500 mt-2">
                    {charCount} / {maxChars} characters
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Genre */}
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Genre
                    </label>
                    <select
                      value={genre}
                      onChange={(e) => setGenre(e.target.value)}
                      className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    >
                      {genres.map((g) => (
                        <option key={g.value} value={g.value}>
                          {g.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Length */}
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Story Length
                    </label>
                    <select
                      value={length}
                      onChange={(e) => setLength(e.target.value)}
                      className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    >
                      {lengths.map((l) => (
                        <option key={l.value} value={l.value}>
                          {l.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Characters */}
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Main Characters (Optional)
                  </label>
                  <input
                    type="text"
                    value={characters}
                    onChange={(e) => setCharacters(e.target.value)}
                    placeholder="e.g., Alex (brave knight), Luna (wise wizard)"
                    className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  />
                </div>

                {/* Action Bar */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4">
                  <div className="text-sm text-neutral-600">
                    Guest uses remaining: <span className="font-semibold text-pink-600">{guestUses}</span>
                  </div>
                  <button
                    onClick={handleGenerate}
                    disabled={isGenerating || !prompt.trim()}
                    className="w-full sm:w-auto btn-primary btn-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    style={{ backgroundColor: '#ec4899' }}
                  >
                    {isGenerating ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        Creating Story...
                      </>
                    ) : (
                      <>
                        <Sparkles size={20} />
                        Generate Story
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Output Section */}
            {generatedStory && (
              <div className="border-t border-neutral-200 p-6 md:p-8 bg-neutral-50">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold text-neutral-900">Your Story</h3>
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
                  <div className="text-neutral-800 whitespace-pre-wrap leading-relaxed">
                    {generatedStory}
                  </div>
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
              Why Use Our Story Generator?
            </h2>
            <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
              Unleash your creativity with AI-powered storytelling
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Sparkles,
                title: 'Multiple Genres',
                description: 'From fantasy to romance, create stories in any genre you love',
                color: 'text-pink-600',
                bg: 'bg-pink-50',
              },
              {
                icon: Wand2,
                title: 'Creative Freedom',
                description: 'Customize characters, length, and plot to match your vision',
                color: 'text-purple-600',
                bg: 'bg-purple-50',
              },
              {
                icon: Zap,
                title: 'Instant Results',
                description: 'Get complete stories in seconds, beat writer\'s block',
                color: 'text-orange-600',
                bg: 'bg-orange-50',
              },
              {
                icon: Award,
                title: 'Quality Writing',
                description: 'Engaging narratives with proper structure and flow',
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
                question: 'Can I use the generated stories?',
                answer: 'Yes! You can use the stories for personal projects, inspiration, or as starting points for your own writing. We recommend editing and adding your own creativity.',
              },
              {
                question: 'What genres are available?',
                answer: 'We support fantasy, romance, mystery, sci-fi, adventure, horror, comedy, and drama. Each genre follows appropriate storytelling conventions.',
              },
              {
                question: 'How long are the generated stories?',
                answer: 'You can choose between short (300-500 words), medium (500-800 words), or long (800-1200 words) stories.',
              },
              {
                question: 'Can I specify characters?',
                answer: 'Yes! You can add character names and descriptions, and the AI will incorporate them into your story.',
              },
            ].map((faq, idx) => (
              <details
                key={idx}
                className="bg-neutral-50 p-6 rounded-xl border border-neutral-200 hover:shadow-md transition-shadow duration-200 group"
              >
                <summary className="font-semibold text-neutral-900 cursor-pointer list-none flex items-center justify-between">
                  <span className="flex-1">{faq.question}</span>
                  <ChevronDown className="text-pink-600 transform group-open:rotate-180 transition-transform duration-200 flex-shrink-0 ml-4" size={20} />
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
              <div className="bg-pink-100 text-pink-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen size={32} />
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
