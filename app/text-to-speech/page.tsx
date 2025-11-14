'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Volume2,
  Copy,
  Check,
  Mic,
  Zap,
  Shield,
  Sparkles,
  ChevronDown,
  ChevronRight,
  X,
  Clock,
  BookOpen,
  MessageSquare,
  Headphones,
  Users,
  GraduationCap,
  Briefcase,
  Radio,
} from 'lucide-react';

// Voice options
const voices = [
  { id: 'female-us', name: 'Female (US)', flag: '🇺🇸' },
  { id: 'male-us', name: 'Male (US)', flag: '🇺🇸' },
  { id: 'female-uk', name: 'Female (UK)', flag: '🇬🇧' },
  { id: 'male-uk', name: 'Male (UK)', flag: '🇬🇧' },
  { id: 'female-ph', name: 'Female (Filipino)', flag: '🇵🇭' },
  { id: 'male-ph', name: 'Male (Filipino)', flag: '🇵🇭' },
];

// Sample texts
const sampleTexts = [
  'Welcome to our text to speech service. Transform your written content into natural sounding audio.',
  'Hello! This is a demonstration of our AI-powered text to speech technology.',
  'Technology makes communication easier and more accessible for everyone around the world.',
];

export default function TextToSpeechPage() {
  const [inputText, setInputText] = useState('');
  const [outputDescription, setOutputDescription] = useState('');
  const [selectedVoice, setSelectedVoice] = useState('female-us');
  const [isGenerating, setIsGenerating] = useState(false);
  const [charCount, setCharCount] = useState(0);
  const [copied, setCopied] = useState(false);
  const [guestUses, setGuestUses] = useState(0);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isLoadingRateLimit, setIsLoadingRateLimit] = useState(true);

  const maxChars = 5000;
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
      } finally {
        setIsLoadingRateLimit(false);
      }
    };

    loadRateLimit();
  }, []);

  // Update character count
  useEffect(() => {
    setCharCount(inputText.length);
  }, [inputText]);

  // Handle generation
  const handleGenerate = async () => {
    if (!inputText.trim()) {
      alert('Please enter text to convert to speech');
      return;
    }

    if (guestUses <= 0) {
      setShowLoginModal(true);
      return;
    }

    setIsGenerating(true);

    try {
      const response = await fetch('/api/text-to-speech', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: inputText,
          voice: selectedVoice,
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

      setOutputDescription(data.description);
      setGuestUses(data.remaining);

      console.log('[TTS] Success:', {
        inputTokens: data.usage.inputTokens,
        outputTokens: data.usage.outputTokens,
      });

    } catch (error: any) {
      console.error('TTS error:', error);
      alert(error.message || 'Failed to generate. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Copy to clipboard
  const handleCopy = async () => {
    if (!outputDescription) return;

    try {
      await navigator.clipboard.writeText(outputDescription);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  // Load sample text
  const loadSampleText = () => {
    const randomSample = sampleTexts[Math.floor(Math.random() * sampleTexts.length)];
    setInputText(randomSample);
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
            <span className="text-neutral-800 font-medium">Text to Speech</span>
          </div>

          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Volume2 size={18} />
              <span>Natural Voice AI</span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-neutral-900 mb-6 leading-tight">
              AI Text to Speech{' '}
              <span className="bg-gradient-to-r from-orange-500 to-purple-600 bg-clip-text text-transparent">
                Generator
              </span>
            </h1>

            <p className="text-lg md:text-xl text-neutral-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              Transform your written content into natural-sounding speech with AI.
              Perfect for content creators, educators, and accessibility needs.
            </p>

            {/* Stats */}
            <div className="flex flex-wrap justify-center gap-8 md:gap-12 mb-8">
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-orange-600">100K+</div>
                <div className="text-sm text-neutral-600">Audio Generated</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-orange-600">6</div>
                <div className="text-sm text-neutral-600">Voice Options</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-orange-600">Free</div>
                <div className="text-sm text-neutral-600">To Use</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Interface */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4 md:px-6 max-w-7xl">
          <div className="bg-white rounded-2xl shadow-lg border border-neutral-200 overflow-hidden">
            {/* Voice Selection */}
            <div className="border-b border-neutral-200 p-6 bg-neutral-50">
              <label className="text-sm font-medium text-neutral-700 mb-3 block">
                Select Voice
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                {voices.map((voice) => (
                  <button
                    key={voice.id}
                    onClick={() => setSelectedVoice(voice.id)}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      selectedVoice === voice.id
                        ? 'border-orange-500 bg-orange-50'
                        : 'border-neutral-200 hover:border-orange-300'
                    }`}
                  >
                    <div className="text-2xl mb-1">{voice.flag}</div>
                    <div className="text-xs font-medium text-neutral-800">{voice.name}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Input/Output Panels */}
            <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-neutral-200">
              {/* Input Panel */}
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <label className="text-sm font-medium text-neutral-700">
                    Enter text
                  </label>
                  <button
                    onClick={loadSampleText}
                    className="text-sm text-orange-600 hover:text-orange-700 font-medium"
                  >
                    Load sample
                  </button>
                </div>

                <textarea
                  value={inputText}
                  onChange={(e) => {
                    if (e.target.value.length <= maxChars) {
                      setInputText(e.target.value);
                    }
                  }}
                  placeholder="Type or paste your text here..."
                  className="w-full h-64 p-4 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none text-neutral-800"
                  style={{ fontSize: '16px' }}
                />

                <div className="flex items-center justify-between mt-3">
                  <div className="text-sm text-neutral-500">
                    {charCount} / {maxChars} characters
                  </div>
                  {inputText && (
                    <button
                      onClick={() => {
                        setInputText('');
                        setOutputDescription('');
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
                    Generated Audio Description
                  </label>
                  {outputDescription && (
                    <button
                      onClick={handleCopy}
                      className="p-2 rounded-lg hover:bg-white transition-colors"
                      title="Copy description"
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
                  ) : outputDescription ? (
                    <p className="text-neutral-800 whitespace-pre-wrap" style={{ fontSize: '16px' }}>
                      {outputDescription}
                    </p>
                  ) : (
                    <p className="text-neutral-400">Audio description will appear here...</p>
                  )}
                </div>

                <div className="mt-3 text-sm text-neutral-500">
                  {!isGenerating && outputDescription && (
                    <span>{outputDescription.length} characters</span>
                  )}
                </div>
              </div>
            </div>

            {/* Action Bar */}
            <div className="border-t border-neutral-200 p-6 bg-neutral-50">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-sm text-neutral-600">
                  Free uses remaining: <span className="font-semibold text-orange-600">{guestUses}</span>
                </div>
                <button
                  onClick={handleGenerate}
                  disabled={isGenerating || !inputText.trim()}
                  className="w-full sm:w-auto btn-primary btn-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isGenerating ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Generating...
                    </>
                  ) : (
                    <>
                      <Volume2 size={20} />
                      Generate Speech
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
              Why Choose Our Text to Speech?
            </h2>
            <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
              AI-powered natural voice generation for all your content needs
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Mic,
                title: 'Natural Voices',
                description: 'Multiple realistic voice options for any content',
                color: 'text-blue-600',
                bg: 'bg-blue-50',
              },
              {
                icon: Sparkles,
                title: 'AI-Powered',
                description: 'Advanced AI for natural-sounding speech',
                color: 'text-purple-600',
                bg: 'bg-purple-50',
              },
              {
                icon: Zap,
                title: 'Instant Results',
                description: 'Generate audio files in seconds',
                color: 'text-orange-600',
                bg: 'bg-orange-50',
              },
              {
                icon: Shield,
                title: 'Free to Use',
                description: 'No hidden costs or subscriptions',
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
              Perfect For Every Use Case
            </h2>
            <p className="text-lg text-neutral-600">
              From content creation to accessibility
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                icon: BookOpen,
                title: 'Content Creators',
                description: 'Create voiceovers for videos, podcasts, and audiobooks without expensive recording equipment.',
                stats: 'YouTube & Podcasts',
              },
              {
                icon: GraduationCap,
                title: 'Education',
                description: 'Make learning materials accessible with audio versions of textbooks and study materials.',
                stats: 'All Levels',
              },
              {
                icon: Briefcase,
                title: 'Business',
                description: 'Generate professional voiceovers for presentations, training materials, and marketing content.',
                stats: 'Professional',
              },
              {
                icon: Users,
                title: 'Accessibility',
                description: 'Make content accessible for visually impaired users with high-quality text-to-speech conversion.',
                stats: 'Inclusive',
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
              Everything you need to know about text to speech
            </p>
          </div>

          <div className="space-y-4">
            {[
              {
                question: 'What is text to speech?',
                answer: 'Text to speech (TTS) is technology that converts written text into spoken audio. Our AI-powered system creates natural-sounding speech from any text you provide.',
              },
              {
                question: 'How realistic are the voices?',
                answer: 'Our AI generates highly realistic voices with natural intonation and pronunciation. The voices are designed to sound human-like and professional.',
              },
              {
                question: 'Can I download the audio files?',
                answer: 'Currently, our tool provides descriptions of the audio that would be generated. Full audio file downloads will be available in the premium version.',
              },
              {
                question: 'What languages are supported?',
                answer: 'We currently support English voices (US and UK accents) and Filipino. More languages and accents are being added regularly.',
              },
              {
                question: 'Is there a character limit?',
                answer: 'Yes, you can convert up to 5,000 characters per request. For longer content, split it into multiple sections.',
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
      <section className="py-16 md:py-24 bg-gradient-to-br from-orange-500 to-purple-600 text-white">
        <div className="container mx-auto px-4 md:px-6 max-w-4xl text-center">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
            Start Creating Audio Now
          </h2>
          <p className="text-lg md:text-xl text-orange-50 mb-8 max-w-2xl mx-auto">
            Transform your text into natural speech with AI - perfect for content creators and educators
          </p>
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="inline-flex items-center gap-3 bg-white text-orange-600 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-orange-50 transition-all duration-200 hover:scale-105 shadow-lg"
          >
            <Volume2 size={24} />
            Generate Speech - Free
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
                <Volume2 size={32} />
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

            <p className="text-sm text-neutral-500 text-center mt-4">
              No credit card required. Get unlimited access instantly.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
