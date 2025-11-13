'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Music,
  Sparkles,
  Copy,
  Check,
  Zap,
  Shield,
  Users,
  Mic,
  Radio,
  Heart,
  ChevronDown,
  ChevronRight,
  X,
  Guitar,
  Headphones,
  Play,
  Disc,
} from 'lucide-react';

// Genre options
const genres = [
  { value: 'pop', label: 'Pop' },
  { value: 'rock', label: 'Rock' },
  { value: 'hip-hop', label: 'Hip Hop / Rap' },
  { value: 'country', label: 'Country' },
  { value: 'r&b', label: 'R&B / Soul' },
  { value: 'indie', label: 'Indie / Alternative' },
  { value: 'electronic', label: 'Electronic / EDM' },
  { value: 'jazz', label: 'Jazz' },
  { value: 'folk', label: 'Folk / Acoustic' },
  { value: 'reggae', label: 'Reggae' },
];

// Mood options
const moods = [
  { value: 'happy', label: 'Happy', icon: '😊' },
  { value: 'sad', label: 'Sad', icon: '😢' },
  { value: 'romantic', label: 'Romantic', icon: '❤️' },
  { value: 'energetic', label: 'Energetic', icon: '⚡' },
  { value: 'chill', label: 'Chill', icon: '😌' },
  { value: 'angry', label: 'Angry', icon: '😠' },
  { value: 'inspirational', label: 'Inspirational', icon: '✨' },
  { value: 'melancholic', label: 'Melancholic', icon: '🌧️' },
];

export default function LyricsGeneratorPage() {
  const [theme, setTheme] = useState('');
  const [genre, setGenre] = useState('pop');
  const [mood, setMood] = useState('happy');
  const [keywords, setKeywords] = useState('');
  const [includeChorus, setIncludeChorus] = useState(true);
  const [lyrics, setLyrics] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [guestGenerations, setGuestGenerations] = useState(0);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isLoadingRateLimit, setIsLoadingRateLimit] = useState(true);

  const MAX_FREE_GENERATIONS = 10;

  // Load rate limit status on mount
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

  // Handle lyrics generation
  const handleGenerate = async () => {
    if (!theme.trim()) {
      alert('Please enter a theme or topic for your song');
      return;
    }

    if (guestGenerations <= 0) {
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
        const remaining = Math.max(0, MAX_FREE_GENERATIONS - rateLimit.count);
        setGuestGenerations(remaining);

        if (rateLimit.blocked) {
          setShowLoginModal(true);
          setIsGenerating(false);
          return;
        }
      }

      // Call the lyrics generator API
      const response = await fetch('/api/lyrics-generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          theme,
          genre,
          mood,
          keywords,
          includeChorus,
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

      setLyrics(data.lyrics);

    } catch (error: any) {
      console.error('Generation error:', error);
      alert(error.message || 'Failed to generate lyrics. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Copy to clipboard
  const handleCopy = async () => {
    if (!lyrics) return;

    try {
      await navigator.clipboard.writeText(lyrics);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
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
            <span className="text-neutral-800 font-medium">Song Lyrics Generator</span>
          </div>

          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Music size={18} />
              <span>AI-Powered Song Writing</span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-neutral-900 mb-6 leading-tight">
              Song Lyrics Generator -{' '}
              <span className="bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent">
                Any Genre
              </span>
            </h1>

            <p className="text-lg md:text-xl text-neutral-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              Create original song lyrics for any genre, mood, or theme.
              Perfect for songwriters, musicians, and creative artists.
            </p>

            {/* Stats */}
            <div className="flex flex-wrap justify-center gap-8 md:gap-12 mb-8">
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-orange-600">15K+</div>
                <div className="text-sm text-neutral-600">Songs Written</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-orange-600">10+</div>
                <div className="text-sm text-neutral-600">Genres</div>
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
            {/* Input Form */}
            <div className="p-6 md:p-8">
              <div className="space-y-6">
                {/* Theme/Topic */}
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Song Theme or Topic *
                  </label>
                  <textarea
                    value={theme}
                    onChange={(e) => setTheme(e.target.value)}
                    placeholder="What is your song about? (e.g., 'lost love', 'chasing dreams', 'summer vibes', 'overcoming challenges')"
                    className="w-full h-24 p-4 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none text-neutral-800"
                    style={{ fontSize: '16px' }}
                  />
                </div>

                {/* Genre & Mood */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Genre
                    </label>
                    <select
                      value={genre}
                      onChange={(e) => setGenre(e.target.value)}
                      className="w-full p-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-neutral-800"
                    >
                      {genres.map((genreOption) => (
                        <option key={genreOption.value} value={genreOption.value}>
                          {genreOption.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Mood
                    </label>
                    <select
                      value={mood}
                      onChange={(e) => setMood(e.target.value)}
                      className="w-full p-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-neutral-800"
                    >
                      {moods.map((moodOption) => (
                        <option key={moodOption.value} value={moodOption.value}>
                          {moodOption.icon} {moodOption.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Keywords & Options */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Keywords or Phrases to Include (Optional)
                    </label>
                    <input
                      type="text"
                      value={keywords}
                      onChange={(e) => setKeywords(e.target.value)}
                      placeholder="e.g., stars, journey, heartbeat"
                      className="w-full p-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-neutral-800"
                    />
                  </div>

                  <div>
                    <label className="flex items-center gap-2 text-sm text-neutral-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={includeChorus}
                        onChange={(e) => setIncludeChorus(e.target.checked)}
                        className="w-4 h-4 text-orange-600 border-neutral-300 rounded focus:ring-orange-500"
                      />
                      <span>Include chorus section</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Generated Lyrics */}
            <div className="p-6 md:p-8 bg-neutral-50 border-t border-neutral-200">
              <div className="flex items-center justify-between mb-4">
                <label className="text-sm font-medium text-neutral-700">
                  Generated Lyrics
                </label>
                {lyrics && (
                  <button
                    onClick={handleCopy}
                    className="p-2 rounded-lg hover:bg-white transition-colors"
                    title="Copy lyrics"
                  >
                    {copied ? (
                      <Check size={18} className="text-green-600" />
                    ) : (
                      <Copy size={18} className="text-neutral-600" />
                    )}
                  </button>
                )}
              </div>

              <div className="w-full min-h-96 p-6 bg-white border border-neutral-300 rounded-lg overflow-y-auto">
                {isGenerating ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mb-3"></div>
                      <p className="text-neutral-600">Writing your song lyrics...</p>
                    </div>
                  </div>
                ) : lyrics ? (
                  <pre className="text-neutral-800 whitespace-pre-wrap font-sans leading-relaxed" style={{ fontSize: '16px' }}>
                    {lyrics}
                  </pre>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-neutral-400">
                    <Music size={48} className="mb-3 opacity-50" />
                    <p>Your generated song lyrics will appear here...</p>
                  </div>
                )}
              </div>
            </div>

            {/* Action Bar */}
            <div className="border-t border-neutral-200 p-6 bg-neutral-50">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-sm text-neutral-600">
                  Guest generations remaining: <span className="font-semibold text-orange-600">{guestGenerations}</span>
                </div>
                <button
                  onClick={handleGenerate}
                  disabled={isGenerating || !theme.trim()}
                  className="w-full sm:w-auto btn-primary btn-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isGenerating ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles size={20} />
                      Generate Lyrics
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
              Why Use Our Lyrics Generator?
            </h2>
            <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
              AI-powered songwriting for every musician and creative
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Music,
                title: 'Multiple Genres',
                description: 'Generate lyrics for pop, rock, hip-hop, and more',
                color: 'text-blue-600',
                bg: 'bg-blue-50',
              },
              {
                icon: Sparkles,
                title: 'Creative & Original',
                description: 'Unique lyrics tailored to your theme and style',
                color: 'text-purple-600',
                bg: 'bg-purple-50',
              },
              {
                icon: Zap,
                title: 'Instant Results',
                description: 'Complete song lyrics generated in seconds',
                color: 'text-orange-600',
                bg: 'bg-orange-50',
              },
              {
                icon: Heart,
                title: 'Mood-Based',
                description: 'Lyrics that match your desired emotional tone',
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
              Perfect For
            </h2>
            <p className="text-lg text-neutral-600">
              Create song lyrics for any purpose
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                icon: Mic,
                title: 'Songwriters & Musicians',
                description: 'Overcome writer\'s block with AI-generated lyrics. Get fresh ideas and inspiration for your next hit song.',
                stats: 'Original',
              },
              {
                icon: Guitar,
                title: 'Independent Artists',
                description: 'Create complete song lyrics for your music projects. Perfect for demos, albums, and live performances.',
                stats: 'Creative',
              },
              {
                icon: Headphones,
                title: 'Music Producers',
                description: 'Generate placeholder lyrics for beats and instrumentals. Test different themes and moods quickly.',
                stats: 'Production',
              },
              {
                icon: Users,
                title: 'Hobbyists & Students',
                description: 'Learn songwriting techniques and explore different lyrical styles. Practice and improve your craft.',
                stats: 'Learning',
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
              Everything you need to know about lyrics generation
            </p>
          </div>

          <div className="space-y-4">
            {[
              {
                question: 'Can I use the generated lyrics commercially?',
                answer: 'Yes! All generated lyrics are yours to use for your songs, albums, and performances. We recommend reviewing and customizing them to match your artistic vision.',
              },
              {
                question: 'How original are the lyrics?',
                answer: 'Each set of lyrics is uniquely generated by AI based on your inputs. The lyrics are original and not copied from existing songs. However, common themes and phrases may appear.',
              },
              {
                question: 'Can I specify the song structure?',
                answer: 'Yes! You can choose to include a chorus section. The AI will generate verses and a repeating chorus. We\'re working on adding more structure customization options.',
              },
              {
                question: 'What genres are supported?',
                answer: 'We support 10+ genres including Pop, Rock, Hip Hop, Country, R&B, Indie, Electronic, Jazz, Folk, and Reggae. Each genre has distinct lyrical characteristics.',
              },
              {
                question: 'How long are the generated lyrics?',
                answer: 'Typically, the AI generates 2-3 verses and a chorus (if selected), which is enough for a standard song structure. You can generate multiple times to get more verses or variations.',
              },
              {
                question: 'Can I edit the generated lyrics?',
                answer: 'Absolutely! The AI provides a foundation for your song. Feel free to modify, combine, and refine the lyrics to perfectly match your artistic vision and musical style.',
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
            Start Writing Songs Today
          </h2>
          <p className="text-lg md:text-xl text-orange-50 mb-8 max-w-2xl mx-auto">
            Join thousands of musicians using our AI to create amazing song lyrics
          </p>
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="inline-flex items-center gap-3 bg-white text-orange-600 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-orange-50 transition-all duration-200 hover:scale-105 shadow-lg"
          >
            <Music size={24} />
            Generate Lyrics Now - Free
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
                <Music size={32} />
              </div>
              <h3 className="text-2xl font-bold text-neutral-900 mb-2">
                Generation Limit Reached
              </h3>
              <p className="text-neutral-600">
                Create a free account for unlimited lyrics generation
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
              No credit card required. Get unlimited lyrics instantly.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
