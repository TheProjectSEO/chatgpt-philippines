'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Mic2,
  Copy,
  Check,
  Radio,
  Zap,
  Shield,
  Sparkles,
  ChevronDown,
  ChevronRight,
  X,
  Users,
  GraduationCap,
  Briefcase,
  Film,
  Sliders,
} from 'lucide-react';

// Voice styles
const voiceStyles = [
  { id: 'professional', name: 'Professional', emoji: '💼' },
  { id: 'friendly', name: 'Friendly', emoji: '😊' },
  { id: 'energetic', name: 'Energetic', emoji: '⚡' },
  { id: 'calm', name: 'Calm', emoji: '😌' },
  { id: 'authoritative', name: 'Authoritative', emoji: '👔' },
  { id: 'casual', name: 'Casual', emoji: '👋' },
];

// Age options
const ageOptions = [
  { id: 'young', name: 'Young (18-30)', emoji: '👶' },
  { id: 'middle', name: 'Middle (30-50)', emoji: '🧑' },
  { id: 'mature', name: 'Mature (50+)', emoji: '👴' },
];

// Sample prompts
const samplePrompts = [
  'Create a warm, friendly female voice for a meditation app narrator',
  'Generate a professional male voice suitable for corporate training videos',
  'Design an energetic voice for a sports commentary',
];

export default function VoiceGeneratorPage() {
  const [inputPrompt, setInputPrompt] = useState('');
  const [outputDescription, setOutputDescription] = useState('');
  const [selectedStyle, setSelectedStyle] = useState('professional');
  const [selectedAge, setSelectedAge] = useState('middle');
  const [gender, setGender] = useState('female');
  const [isGenerating, setIsGenerating] = useState(false);
  const [charCount, setCharCount] = useState(0);
  const [copied, setCopied] = useState(false);
  const [guestUses, setGuestUses] = useState(0);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isLoadingRateLimit, setIsLoadingRateLimit] = useState(true);

  const maxChars = 2000;
  const MAX_FREE_USES = 10;

  useEffect(() => {
    const loadRateLimit = async () => {
      try {
        const response = await fetch('/api/rate-limit', { method: 'GET' });
        if (response.ok) {
          const rateLimit = await response.json();
          const remaining = Math.max(0, MAX_FREE_USES - rateLimit.count);
          setGuestUses(remaining);
          if (rateLimit.blocked) setShowLoginModal(true);
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
    setCharCount(inputPrompt.length);
  }, [inputPrompt]);

  const handleGenerate = async () => {
    if (!inputPrompt.trim()) {
      alert('Please enter a voice description');
      return;
    }

    if (guestUses <= 0) {
      setShowLoginModal(true);
      return;
    }

    setIsGenerating(true);

    try {
      const response = await fetch('/api/voice-generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: inputPrompt,
          style: selectedStyle,
          age: selectedAge,
          gender,
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

    } catch (error: any) {
      console.error('Voice generation error:', error);
      alert(error.message || 'Failed to generate. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

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

  const loadSamplePrompt = () => {
    const randomSample = samplePrompts[Math.floor(Math.random() * samplePrompts.length)];
    setInputPrompt(randomSample);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-orange-50 via-white to-purple-50 pt-24 pb-16 md:pt-32 md:pb-24">
        <div className="container mx-auto px-4 md:px-6 max-w-7xl">
          <div className="flex items-center gap-2 text-sm text-neutral-600 mb-6">
            <Link href="/" className="hover:text-primary-600 transition-colors">Home</Link>
            <ChevronRight size={16} />
            <span className="text-neutral-800 font-medium">Voice Generator</span>
          </div>

          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Mic2 size={18} />
              <span>AI Voice Creation</span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-neutral-900 mb-6 leading-tight">
              AI Voice{' '}
              <span className="bg-gradient-to-r from-orange-500 to-purple-600 bg-clip-text text-transparent">
                Generator
              </span>
            </h1>

            <p className="text-lg md:text-xl text-neutral-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              Create custom AI voices with specific characteristics, tones, and styles.
              Perfect for content creators, podcasters, and video producers.
            </p>

            <div className="flex flex-wrap justify-center gap-8 md:gap-12 mb-8">
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-orange-600">50K+</div>
                <div className="text-sm text-neutral-600">Voices Created</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-orange-600">Custom</div>
                <div className="text-sm text-neutral-600">Voice Profiles</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-orange-600">Free</div>
                <div className="text-sm text-neutral-600">To Try</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Interface */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4 md:px-6 max-w-7xl">
          <div className="bg-white rounded-2xl shadow-lg border border-neutral-200 overflow-hidden">
            {/* Voice Configuration */}
            <div className="border-b border-neutral-200 p-6 bg-neutral-50">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="text-sm font-medium text-neutral-700 mb-3 block">Gender</label>
                  <div className="flex gap-3">
                    {['female', 'male'].map((g) => (
                      <button
                        key={g}
                        onClick={() => setGender(g)}
                        className={`flex-1 p-3 rounded-lg border-2 transition-all capitalize ${
                          gender === g ? 'border-orange-500 bg-orange-50' : 'border-neutral-200 hover:border-orange-300'
                        }`}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-neutral-700 mb-3 block">Voice Style</label>
                  <select
                    value={selectedStyle}
                    onChange={(e) => setSelectedStyle(e.target.value)}
                    className="w-full p-3 border-2 border-neutral-200 rounded-lg focus:border-orange-500 focus:outline-none"
                  >
                    {voiceStyles.map((style) => (
                      <option key={style.id} value={style.id}>
                        {style.emoji} {style.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium text-neutral-700 mb-3 block">Age Range</label>
                  <select
                    value={selectedAge}
                    onChange={(e) => setSelectedAge(e.target.value)}
                    className="w-full p-3 border-2 border-neutral-200 rounded-lg focus:border-orange-500 focus:outline-none"
                  >
                    {ageOptions.map((age) => (
                      <option key={age.id} value={age.id}>
                        {age.emoji} {age.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Input/Output Panels */}
            <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-neutral-200">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <label className="text-sm font-medium text-neutral-700">Describe the voice you want</label>
                  <button onClick={loadSamplePrompt} className="text-sm text-orange-600 hover:text-orange-700 font-medium">
                    Load sample
                  </button>
                </div>

                <textarea
                  value={inputPrompt}
                  onChange={(e) => {
                    if (e.target.value.length <= maxChars) {
                      setInputPrompt(e.target.value);
                    }
                  }}
                  placeholder="Describe the voice characteristics you need..."
                  className="w-full h-64 p-4 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none text-neutral-800"
                  style={{ fontSize: '16px' }}
                />

                <div className="flex items-center justify-between mt-3">
                  <div className="text-sm text-neutral-500">{charCount} / {maxChars} characters</div>
                  {inputPrompt && (
                    <button onClick={() => { setInputPrompt(''); setOutputDescription(''); }} className="text-sm text-neutral-500 hover:text-neutral-700">
                      Clear
                    </button>
                  )}
                </div>
              </div>

              <div className="p-6 bg-neutral-50">
                <div className="flex items-center justify-between mb-4">
                  <label className="text-sm font-medium text-neutral-700">Generated Voice Profile</label>
                  {outputDescription && (
                    <button onClick={handleCopy} className="p-2 rounded-lg hover:bg-white transition-colors" title="Copy description">
                      {copied ? <Check size={18} className="text-green-600" /> : <Copy size={18} className="text-neutral-600" />}
                    </button>
                  )}
                </div>

                <div className="w-full h-64 p-4 bg-white border border-neutral-300 rounded-lg overflow-y-auto">
                  {isGenerating ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mb-3"></div>
                        <p className="text-neutral-600">Generating voice profile...</p>
                      </div>
                    </div>
                  ) : outputDescription ? (
                    <p className="text-neutral-800 whitespace-pre-wrap" style={{ fontSize: '16px' }}>{outputDescription}</p>
                  ) : (
                    <p className="text-neutral-400">Voice profile will appear here...</p>
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
                  disabled={isGenerating || !inputPrompt.trim()}
                  className="w-full sm:w-auto btn-primary btn-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isGenerating ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Generating...
                    </>
                  ) : (
                    <>
                      <Mic2 size={20} />
                      Generate Voice
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
            <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-4">Why Choose Our Voice Generator?</h2>
            <p className="text-lg text-neutral-600 max-w-2xl mx-auto">Create custom AI voices for any project</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Sliders, title: 'Customizable', description: 'Fine-tune voice characteristics to match your needs', color: 'text-blue-600', bg: 'bg-blue-50' },
              { icon: Sparkles, title: 'AI-Powered', description: 'Advanced AI creates natural voice profiles', color: 'text-purple-600', bg: 'bg-purple-50' },
              { icon: Zap, title: 'Instant Creation', description: 'Generate voice profiles in seconds', color: 'text-orange-600', bg: 'bg-orange-50' },
              { icon: Shield, title: 'Free to Use', description: 'No hidden fees or subscriptions', color: 'text-green-600', bg: 'bg-green-50' },
            ].map((feature, idx) => (
              <div key={idx} className="bg-white p-6 rounded-xl border border-neutral-200 hover:shadow-lg transition-shadow duration-200">
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

      {/* Use Cases Section */}
      <section className="py-16 md:py-24 bg-gradient-to-br from-orange-50 to-purple-50">
        <div className="container mx-auto px-4 md:px-6 max-w-7xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-4">Perfect For Every Creator</h2>
            <p className="text-lg text-neutral-600">From podcasts to video production</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { icon: Film, title: 'Video Creators', description: 'Create unique voice profiles for video narration, explainer videos, and YouTube content.', stats: 'Content Creation' },
              { icon: Radio, title: 'Podcasters', description: 'Generate distinctive voices for podcast intros, outros, and character voices.', stats: 'Broadcasting' },
              { icon: Briefcase, title: 'Business', description: 'Professional voices for corporate videos, presentations, and training materials.', stats: 'Professional' },
              { icon: GraduationCap, title: 'Educators', description: 'Custom voices for e-learning content, audiobooks, and educational videos.', stats: 'Education' },
            ].map((useCase, idx) => (
              <div key={idx} className="bg-white p-8 rounded-2xl border border-neutral-200 hover:shadow-xl transition-shadow duration-300">
                <div className="flex items-start gap-4 mb-4">
                  <div className="bg-orange-100 text-orange-600 w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0">
                    <useCase.icon size={24} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-xl font-semibold text-neutral-900">{useCase.title}</h3>
                      <span className="text-xs font-medium text-orange-600 bg-orange-100 px-3 py-1 rounded-full">{useCase.stats}</span>
                    </div>
                    <p className="text-neutral-600 leading-relaxed">{useCase.description}</p>
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
            <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-4">Frequently Asked Questions</h2>
            <p className="text-lg text-neutral-600">Everything about AI voice generation</p>
          </div>

          <div className="space-y-4">
            {[
              { question: 'What is AI voice generation?', answer: 'AI voice generation creates custom voice profiles with specific characteristics like age, gender, tone, and style based on your description.' },
              { question: 'Can I use these voices commercially?', answer: 'The voice profiles we generate are descriptions. For commercial use, you would need to use actual voice synthesis tools with proper licensing.' },
              { question: 'How detailed can I be?', answer: 'You can be very specific about voice characteristics including tone, pace, accent, emotion, and style. The more detailed your description, the better the profile.' },
              { question: 'What makes a good voice description?', answer: 'Include details about tone, emotion, pace, clarity, accent, and intended use. For example: "Warm, friendly female voice with a slight British accent, perfect for meditation apps."' },
              { question: 'Can I generate multiple variations?', answer: 'Yes! You can generate as many voice profiles as you need. Each generation can have different characteristics and styles.' },
            ].map((faq, idx) => (
              <details key={idx} className="bg-white p-6 rounded-xl border border-neutral-200 hover:shadow-md transition-shadow duration-200 group">
                <summary className="font-semibold text-neutral-900 cursor-pointer list-none flex items-center justify-between">
                  <span className="flex-1">{faq.question}</span>
                  <ChevronDown className="text-orange-600 transform group-open:rotate-180 transition-transform duration-200 flex-shrink-0 ml-4" size={20} />
                </summary>
                <p className="text-neutral-600 mt-4 leading-relaxed">{faq.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-gradient-to-br from-orange-500 to-purple-600 text-white">
        <div className="container mx-auto px-4 md:px-6 max-w-4xl text-center">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">Create Your Custom Voice Now</h2>
          <p className="text-lg md:text-xl text-orange-50 mb-8 max-w-2xl mx-auto">
            Generate professional AI voice profiles for your content - perfect for creators and businesses
          </p>
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="inline-flex items-center gap-3 bg-white text-orange-600 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-orange-50 transition-all duration-200 hover:scale-105 shadow-lg"
          >
            <Mic2 size={24} />
            Generate Voice - Free
          </button>
        </div>
      </section>

      {/* Login Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8 relative">
            <button onClick={() => setShowLoginModal(false)} className="absolute top-4 right-4 text-neutral-500 hover:text-neutral-700">
              <X size={24} />
            </button>
            <div className="text-center mb-6">
              <div className="bg-orange-100 text-orange-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mic2 size={32} />
              </div>
              <h3 className="text-2xl font-bold text-neutral-900 mb-2">Usage Limit Reached</h3>
              <p className="text-neutral-600">Create a free account for unlimited access</p>
            </div>
            <div className="space-y-3">
              <Link href="/signup" className="block w-full btn-primary btn-lg text-center">Sign Up - Free Forever</Link>
              <Link href="/login" className="block w-full btn-secondary btn-lg text-center">Log In</Link>
            </div>
            <p className="text-sm text-neutral-500 text-center mt-4">No credit card required. Get unlimited access instantly.</p>
          </div>
        </div>
      )}
    </div>
  );
}
