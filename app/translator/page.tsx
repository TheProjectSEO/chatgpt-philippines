'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Languages,
  ArrowLeftRight,
  Copy,
  Check,
  Volume2,
  Globe,
  Zap,
  Shield,
  Sparkles,
  Users,
  Briefcase,
  GraduationCap,
  Plane,
  ChevronDown,
  ChevronRight,
  X,
  Star,
  Clock,
  TrendingUp,
  MessageSquare,
  FileText,
  Headphones,
  BookOpen,
  Search,
} from 'lucide-react';

// Language data with popular languages for Philippines
const languages = [
  { code: 'auto', name: 'Auto-detect', flag: '🌐', popular: true },
  { code: 'tl', name: 'Filipino (Tagalog)', flag: '🇵🇭', popular: true },
  { code: 'en', name: 'English', flag: '🇺🇸', popular: true },
  { code: 'es', name: 'Spanish', flag: '🇪🇸', popular: true },
  { code: 'zh-CN', name: 'Chinese (Simplified)', flag: '🇨🇳', popular: true },
  { code: 'zh-TW', name: 'Chinese (Traditional)', flag: '🇹🇼', popular: true },
  { code: 'ja', name: 'Japanese', flag: '🇯🇵', popular: true },
  { code: 'ko', name: 'Korean', flag: '🇰🇷', popular: true },
  { code: 'ar', name: 'Arabic', flag: '🇸🇦', popular: true },
  { code: 'fr', name: 'French', flag: '🇫🇷', popular: true },
  { code: 'de', name: 'German', flag: '🇩🇪', popular: true },
  { code: 'it', name: 'Italian', flag: '🇮🇹', popular: true },
  { code: 'pt', name: 'Portuguese', flag: '🇵🇹', popular: true },
  { code: 'ru', name: 'Russian', flag: '🇷🇺', popular: true },
  { code: 'hi', name: 'Hindi', flag: '🇮🇳', popular: true },
  { code: 'th', name: 'Thai', flag: '🇹🇭', popular: true },
  { code: 'vi', name: 'Vietnamese', flag: '🇻🇳', popular: true },
  { code: 'id', name: 'Indonesian', flag: '🇮🇩', popular: true },
  { code: 'ms', name: 'Malay', flag: '🇲🇾', popular: true },
  { code: 'nl', name: 'Dutch', flag: '🇳🇱', popular: true },
  { code: 'tr', name: 'Turkish', flag: '🇹🇷', popular: false },
  { code: 'pl', name: 'Polish', flag: '🇵🇱', popular: false },
  { code: 'uk', name: 'Ukrainian', flag: '🇺🇦', popular: false },
  { code: 'cs', name: 'Czech', flag: '🇨🇿', popular: false },
  { code: 'sv', name: 'Swedish', flag: '🇸🇪', popular: false },
  { code: 'da', name: 'Danish', flag: '🇩🇰', popular: false },
  { code: 'fi', name: 'Finnish', flag: '🇫🇮', popular: false },
  { code: 'no', name: 'Norwegian', flag: '🇳🇴', popular: false },
  { code: 'el', name: 'Greek', flag: '🇬🇷', popular: false },
  { code: 'he', name: 'Hebrew', flag: '🇮🇱', popular: false },
];

// Quick language pairs
const quickPairs = [
  { from: 'tl', to: 'en', label: 'Filipino → English' },
  { from: 'en', to: 'tl', label: 'English → Filipino' },
  { from: 'tl', to: 'es', label: 'Filipino → Spanish' },
  { from: 'en', to: 'ja', label: 'English → Japanese' },
  { from: 'en', to: 'ko', label: 'English → Korean' },
  { from: 'en', to: 'zh-CN', label: 'English → Chinese' },
];

// Sample texts
const sampleTexts: Record<string, string> = {
  tl: 'Magandang umaga! Kumusta ka? Gusto kong matuto ng iba pang mga wika upang mas mapalawak ang aking kaalaman at makaconnect sa mas maraming tao sa buong mundo.',
  en: 'Good morning! How are you? I want to learn other languages to expand my knowledge and connect with more people around the world.',
  es: '¡Buenos días! ¿Cómo estás? Quiero aprender otros idiomas para ampliar mis conocimientos y conectar con más personas en todo el mundo.',
  'zh-CN': '早上好！你好吗？我想学习其他语言以扩展我的知识并与世界各地的更多人建立联系。',
};

export default function TranslatorPage() {
  const [sourceText, setSourceText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [sourceLang, setSourceLang] = useState('auto');
  const [targetLang, setTargetLang] = useState('en');
  const [isTranslating, setIsTranslating] = useState(false);
  const [charCount, setCharCount] = useState(0);
  const [copied, setCopied] = useState(false);
  const [guestTranslations, setGuestTranslations] = useState(10);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showSourceDropdown, setShowSourceDropdown] = useState(false);
  const [showTargetDropdown, setShowTargetDropdown] = useState(false);
  const [sourceSearch, setSourceSearch] = useState('');
  const [targetSearch, setTargetSearch] = useState('');

  const maxChars = 5000;

  // Update character count
  useEffect(() => {
    setCharCount(sourceText.length);
  }, [sourceText]);

  // Filter languages based on search
  const getFilteredLanguages = (search: string) => {
    if (!search) return languages;
    return languages.filter(lang =>
      lang.name.toLowerCase().includes(search.toLowerCase())
    );
  };

  // Get language by code
  const getLanguage = (code: string) => {
    return languages.find(lang => lang.code === code) || languages[0];
  };

  // Handle translation
  const handleTranslate = async () => {
    if (!sourceText.trim()) {
      alert('Please enter text to translate');
      return;
    }

    if (guestTranslations <= 0) {
      setShowLoginModal(true);
      return;
    }

    setIsTranslating(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Mock translation (in production, this would call an actual translation API)
    const mockTranslations: Record<string, string> = {
      'tl-en': 'Good morning! How are you? I want to learn other languages to expand my knowledge and connect with more people around the world.',
      'en-tl': 'Magandang umaga! Kumusta ka? Gusto kong matuto ng iba pang mga wika upang mas mapalawak ang aking kaalaman at makaconnect sa mas maraming tao sa buong mundo.',
      'en-es': '¡Buenos días! ¿Cómo estás? Quiero aprender otros idiomas para ampliar mis conocimientos y conectar con más personas en todo el mundo.',
      'tl-es': '¡Buenos días! ¿Cómo estás? Quiero aprender otros idiomas para ampliar mis conocimientos y conectar con más personas en todo el mundo.',
    };

    const key = `${sourceLang}-${targetLang}`;
    setTranslatedText(mockTranslations[key] || `[Translation of: ${sourceText}]`);
    setGuestTranslations(prev => prev - 1);
    setIsTranslating(false);
  };

  // Swap languages
  const handleSwapLanguages = () => {
    if (sourceLang === 'auto') return;

    const tempLang = sourceLang;
    const tempText = sourceText;

    setSourceLang(targetLang);
    setTargetLang(tempLang);
    setSourceText(translatedText);
    setTranslatedText(tempText);
  };

  // Copy to clipboard
  const handleCopy = async () => {
    if (!translatedText) return;

    try {
      await navigator.clipboard.writeText(translatedText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  // Load sample text
  const loadSampleText = () => {
    const sampleLang = sourceLang === 'auto' ? 'tl' : sourceLang;
    setSourceText(sampleTexts[sampleLang] || sampleTexts.en);
  };

  // Set quick pair
  const setQuickPair = (from: string, to: string) => {
    setSourceLang(from);
    setTargetLang(to);
    setSourceText('');
    setTranslatedText('');
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
            <span className="text-neutral-800 font-medium">AI Translator</span>
          </div>

          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Languages size={18} />
              <span>100+ Languages Supported</span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-neutral-900 mb-6 leading-tight">
              AI Translator - 100+ Languages{' '}
              <span className="bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent">
                Instantly
              </span>
            </h1>

            <p className="text-lg md:text-xl text-neutral-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              Translate between Filipino, English, and 100+ languages with AI accuracy.
              Perfect for OFWs, students, and businesses in the Philippines.
            </p>

            {/* Stats */}
            <div className="flex flex-wrap justify-center gap-8 md:gap-12 mb-8">
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-orange-600">1M+</div>
                <div className="text-sm text-neutral-600">Translations</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-orange-600">100+</div>
                <div className="text-sm text-neutral-600">Languages</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-orange-600">Free</div>
                <div className="text-sm text-neutral-600">Forever</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Language Pairs */}
      <section className="py-8 border-b border-neutral-200 bg-neutral-50">
        <div className="container mx-auto px-4 md:px-6 max-w-7xl">
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <span className="text-sm font-medium text-neutral-700">Quick translate:</span>
            {quickPairs.map((pair, idx) => (
              <button
                key={idx}
                onClick={() => setQuickPair(pair.from, pair.to)}
                className="text-sm px-4 py-2 rounded-full bg-white border border-neutral-300 hover:border-orange-500 hover:text-orange-600 transition-all duration-200"
              >
                {pair.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Main Translator Interface */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4 md:px-6 max-w-7xl">
          <div className="bg-white rounded-2xl shadow-lg border border-neutral-200 overflow-hidden">
            {/* Language Selection Bar */}
            <div className="grid grid-cols-1 md:grid-cols-3 border-b border-neutral-200">
              {/* Source Language */}
              <div className="relative border-b md:border-b-0 md:border-r border-neutral-200">
                <button
                  onClick={() => setShowSourceDropdown(!showSourceDropdown)}
                  className="w-full flex items-center justify-between gap-3 p-4 hover:bg-neutral-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{getLanguage(sourceLang).flag}</span>
                    <span className="font-medium text-neutral-800">
                      {getLanguage(sourceLang).name}
                    </span>
                  </div>
                  <ChevronDown size={20} className="text-neutral-500" />
                </button>

                {/* Source Language Dropdown */}
                {showSourceDropdown && (
                  <div className="absolute top-full left-0 right-0 bg-white border border-neutral-200 rounded-b-lg shadow-xl z-50 max-h-96 overflow-hidden">
                    <div className="p-3 border-b border-neutral-200 sticky top-0 bg-white">
                      <div className="relative">
                        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                        <input
                          type="text"
                          placeholder="Search languages..."
                          value={sourceSearch}
                          onChange={(e) => setSourceSearch(e.target.value)}
                          className="w-full pl-10 pr-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                    <div className="overflow-y-auto max-h-80">
                      {getFilteredLanguages(sourceSearch).map((lang) => (
                        <button
                          key={lang.code}
                          onClick={() => {
                            setSourceLang(lang.code);
                            setShowSourceDropdown(false);
                            setSourceSearch('');
                          }}
                          className="w-full flex items-center gap-3 px-4 py-3 hover:bg-orange-50 transition-colors"
                        >
                          <span className="text-2xl">{lang.flag}</span>
                          <span className="text-neutral-800">{lang.name}</span>
                          {lang.popular && (
                            <Star size={14} className="text-orange-500 ml-auto" fill="currentColor" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Swap Button */}
              <div className="flex items-center justify-center p-4 bg-neutral-50">
                <button
                  onClick={handleSwapLanguages}
                  disabled={sourceLang === 'auto'}
                  className="p-3 rounded-full bg-white border-2 border-orange-500 text-orange-600 hover:bg-orange-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105"
                  title="Swap languages"
                >
                  <ArrowLeftRight size={20} />
                </button>
              </div>

              {/* Target Language */}
              <div className="relative border-t md:border-t-0 md:border-l border-neutral-200">
                <button
                  onClick={() => setShowTargetDropdown(!showTargetDropdown)}
                  className="w-full flex items-center justify-between gap-3 p-4 hover:bg-neutral-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{getLanguage(targetLang).flag}</span>
                    <span className="font-medium text-neutral-800">
                      {getLanguage(targetLang).name}
                    </span>
                  </div>
                  <ChevronDown size={20} className="text-neutral-500" />
                </button>

                {/* Target Language Dropdown */}
                {showTargetDropdown && (
                  <div className="absolute top-full left-0 right-0 bg-white border border-neutral-200 rounded-b-lg shadow-xl z-50 max-h-96 overflow-hidden">
                    <div className="p-3 border-b border-neutral-200 sticky top-0 bg-white">
                      <div className="relative">
                        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                        <input
                          type="text"
                          placeholder="Search languages..."
                          value={targetSearch}
                          onChange={(e) => setTargetSearch(e.target.value)}
                          className="w-full pl-10 pr-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                    <div className="overflow-y-auto max-h-80">
                      {getFilteredLanguages(targetSearch).filter(lang => lang.code !== 'auto').map((lang) => (
                        <button
                          key={lang.code}
                          onClick={() => {
                            setTargetLang(lang.code);
                            setShowTargetDropdown(false);
                            setTargetSearch('');
                          }}
                          className="w-full flex items-center gap-3 px-4 py-3 hover:bg-orange-50 transition-colors"
                        >
                          <span className="text-2xl">{lang.flag}</span>
                          <span className="text-neutral-800">{lang.name}</span>
                          {lang.popular && (
                            <Star size={14} className="text-orange-500 ml-auto" fill="currentColor" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Translation Panels */}
            <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-neutral-200">
              {/* Source Text Panel */}
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <label className="text-sm font-medium text-neutral-700">
                    Enter text to translate
                  </label>
                  <button
                    onClick={loadSampleText}
                    className="text-sm text-orange-600 hover:text-orange-700 font-medium"
                  >
                    Load sample
                  </button>
                </div>

                <textarea
                  value={sourceText}
                  onChange={(e) => {
                    if (e.target.value.length <= maxChars) {
                      setSourceText(e.target.value);
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
                  {sourceText && (
                    <button
                      onClick={() => {
                        setSourceText('');
                        setTranslatedText('');
                      }}
                      className="text-sm text-neutral-500 hover:text-neutral-700"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>

              {/* Translation Output Panel */}
              <div className="p-6 bg-neutral-50">
                <div className="flex items-center justify-between mb-4">
                  <label className="text-sm font-medium text-neutral-700">
                    Translation
                  </label>
                  {translatedText && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleCopy}
                        className="p-2 rounded-lg hover:bg-white transition-colors"
                        title="Copy translation"
                      >
                        {copied ? (
                          <Check size={18} className="text-green-600" />
                        ) : (
                          <Copy size={18} className="text-neutral-600" />
                        )}
                      </button>
                      <button
                        className="p-2 rounded-lg hover:bg-white transition-colors"
                        title="Listen (coming soon)"
                      >
                        <Volume2 size={18} className="text-neutral-600" />
                      </button>
                    </div>
                  )}
                </div>

                <div className="w-full h-64 p-4 bg-white border border-neutral-300 rounded-lg overflow-y-auto">
                  {isTranslating ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mb-3"></div>
                        <p className="text-neutral-600">Translating...</p>
                      </div>
                    </div>
                  ) : translatedText ? (
                    <p className="text-neutral-800 whitespace-pre-wrap" style={{ fontSize: '16px' }}>
                      {translatedText}
                    </p>
                  ) : (
                    <p className="text-neutral-400">Translation will appear here...</p>
                  )}
                </div>

                <div className="mt-3 text-sm text-neutral-500">
                  {!isTranslating && translatedText && (
                    <span>{translatedText.length} characters</span>
                  )}
                </div>
              </div>
            </div>

            {/* Action Bar */}
            <div className="border-t border-neutral-200 p-6 bg-neutral-50">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-sm text-neutral-600">
                  Guest translations remaining: <span className="font-semibold text-orange-600">{guestTranslations}</span>
                </div>
                <button
                  onClick={handleTranslate}
                  disabled={isTranslating || !sourceText.trim()}
                  className="w-full sm:w-auto btn-primary btn-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isTranslating ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Translating...
                    </>
                  ) : (
                    <>
                      <Languages size={20} />
                      Translate Now
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
              Why Use Our AI Translator?
            </h2>
            <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
              Powered by advanced AI to deliver accurate, context-aware translations
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Globe,
                title: '100+ Languages',
                description: 'Translate between all major world languages instantly',
                color: 'text-blue-600',
                bg: 'bg-blue-50',
              },
              {
                icon: Sparkles,
                title: 'AI-Powered',
                description: 'Context-aware translations that understand nuance',
                color: 'text-purple-600',
                bg: 'bg-purple-50',
              },
              {
                icon: Zap,
                title: 'Instant Results',
                description: 'Get your translations in seconds, not minutes',
                color: 'text-orange-600',
                bg: 'bg-orange-50',
              },
              {
                icon: Shield,
                title: 'Free Forever',
                description: 'Unlimited translations with no hidden costs',
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

      {/* Popular Languages Grid */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 md:px-6 max-w-7xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-4">
              Popular Languages
            </h2>
            <p className="text-lg text-neutral-600">
              Translate to and from the most widely spoken languages
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {languages.filter(lang => lang.popular && lang.code !== 'auto').map((lang) => (
              <button
                key={lang.code}
                onClick={() => {
                  if (sourceLang === 'auto') {
                    setSourceLang('en');
                  }
                  setTargetLang(lang.code);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="flex flex-col items-center gap-3 p-6 bg-white rounded-xl border border-neutral-200 hover:border-orange-500 hover:shadow-md transition-all duration-200"
              >
                <span className="text-4xl">{lang.flag}</span>
                <span className="text-sm font-medium text-neutral-800 text-center">
                  {lang.name}
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="py-16 md:py-24 bg-gradient-to-br from-orange-50 to-purple-50">
        <div className="container mx-auto px-4 md:px-6 max-w-7xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-4">
              Perfect For Filipino Users
            </h2>
            <p className="text-lg text-neutral-600">
              Built with the Philippine context in mind
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                icon: Users,
                title: 'OFWs & Families',
                description: 'Stay connected with loved ones abroad. Translate messages, emails, and documents to communicate with family members working overseas.',
                stats: '2M+ OFWs',
              },
              {
                icon: GraduationCap,
                title: 'Students & Researchers',
                description: 'Access global knowledge by translating research papers, academic articles, and study materials from any language into Filipino or English.',
                stats: 'All levels',
              },
              {
                icon: Briefcase,
                title: 'BPO & Business',
                description: 'Handle international clients seamlessly. Translate emails, contracts, and business documents quickly and accurately.',
                stats: '1.3M workers',
              },
              {
                icon: Plane,
                title: 'Travelers & Tourists',
                description: 'Plan your trips confidently. Translate travel guides, menus, signs, and communicate with locals in any destination.',
                stats: 'Worldwide',
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

      {/* How It Works */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 md:px-6 max-w-7xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-4">
              How It Works
            </h2>
            <p className="text-lg text-neutral-600">
              Three simple steps to translate any text
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: '1',
                title: 'Paste Your Text',
                description: 'Copy and paste the text you want to translate. Supports up to 5,000 characters at once.',
                icon: FileText,
              },
              {
                step: '2',
                title: 'Select Languages',
                description: 'Choose your source and target languages from 100+ options. Use auto-detect for unknown languages.',
                icon: Languages,
              },
              {
                step: '3',
                title: 'Get Translation',
                description: 'Click translate and receive your accurate AI-powered translation instantly. Copy or listen to results.',
                icon: Sparkles,
              },
            ].map((step, idx) => (
              <div key={idx} className="relative">
                {idx < 2 && (
                  <div className="hidden md:block absolute top-12 left-1/2 w-full h-0.5 bg-gradient-to-r from-orange-500 to-purple-500 opacity-20" />
                )}
                <div className="relative bg-white p-8 rounded-2xl border border-neutral-200 hover:shadow-lg transition-shadow duration-200">
                  <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold mb-4 mx-auto">
                    {step.step}
                  </div>
                  <div className="text-center">
                    <step.icon className="w-8 h-8 text-orange-600 mx-auto mb-3" />
                    <h3 className="text-xl font-semibold text-neutral-900 mb-3">
                      {step.title}
                    </h3>
                    <p className="text-neutral-600 leading-relaxed">
                      {step.description}
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
              Everything you need to know about our AI translator
            </p>
          </div>

          <div className="space-y-4">
            {[
              {
                question: 'How accurate are the translations?',
                answer: 'Our AI-powered translator provides highly accurate translations by understanding context, idioms, and cultural nuances. For best results with technical or legal documents, we recommend professional human review.',
              },
              {
                question: 'Can I translate documents?',
                answer: 'Currently, you can translate text up to 5,000 characters at a time. For document translation, simply copy and paste the text. We are working on adding direct document upload support soon.',
              },
              {
                question: 'Does it work offline?',
                answer: 'The translator requires an internet connection to access our AI translation engine. This ensures you always get the most accurate and up-to-date translations.',
              },
              {
                question: 'What languages are supported?',
                answer: 'We support 100+ languages including Filipino (Tagalog), English, Spanish, Chinese, Japanese, Korean, Arabic, French, German, and many more. All major world languages are available.',
              },
              {
                question: 'Is it really free?',
                answer: 'Yes! Our translator is completely free to use with unlimited translations. Guest users get 10 free translations, then you can create a free account for unlimited access.',
              },
              {
                question: 'Can I translate Taglish or mixed languages?',
                answer: 'Yes! Our AI can handle code-switching and mixed languages common in Filipino communication. It understands Taglish and can translate it accurately to other languages.',
              },
              {
                question: 'How is this different from Google Translate?',
                answer: 'Our translator is specifically optimized for Filipino users and understands local context better. It handles Taglish, Filipino idioms, and cultural references more accurately than generic translators.',
              },
              {
                question: 'Is my text private and secure?',
                answer: 'Yes, we take privacy seriously. Your translations are processed securely and are not stored permanently. We do not share your text with third parties.',
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
            Start Translating Now
          </h2>
          <p className="text-lg md:text-xl text-orange-50 mb-8 max-w-2xl mx-auto">
            Join thousands of Filipinos using our AI translator for work, study, and daily communication
          </p>
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="inline-flex items-center gap-3 bg-white text-orange-600 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-orange-50 transition-all duration-200 hover:scale-105 shadow-lg"
          >
            <Languages size={24} />
            Translate Now - Free Forever
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
                <Languages size={32} />
              </div>
              <h3 className="text-2xl font-bold text-neutral-900 mb-2">
                Translation Limit Reached
              </h3>
              <p className="text-neutral-600">
                Create a free account for unlimited translations
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
              No credit card required. Get unlimited translations instantly.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
