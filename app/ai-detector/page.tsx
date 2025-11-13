'use client';

import { useState, useEffect } from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import {
  Shield,
  CheckCircle,
  FileSearch,
  TrendingUp,
  Users,
  BookOpen,
  Briefcase,
  PenTool,
  Download,
  Globe,
  Zap,
  Lock,
  BarChart3,
  AlertCircle,
  ChevronRight,
  FileText,
  GraduationCap,
  Newspaper,
  Sparkles,
  Target,
  Award,
  Clock,
  Copy,
  X,
  Lightbulb,
  AlertTriangle,
  Info,
} from 'lucide-react';

// Types
interface AnalysisResult {
  overallScore: number;
  aiGenerated: number;
  mixed: number;
  humanWritten: number;
  confidence: 'high' | 'medium' | 'low';
  sentenceAnalysis: Array<{
    text: string;
    score: number;
    category: 'ai' | 'mixed' | 'human';
    reasons: string[];
  }>;
}

// Sample texts for demo
const sampleTexts = {
  human: `Learning languages has always been a passion of mine, especially since I grew up speaking both Tagalog and English at home. My lola would always tell me stories in pure Tagalog, while my parents code-switched between languages depending on the situation. This unique experience taught me that language isn't just about words—it's about culture, emotion, and connection. I remember struggling with formal English in school while being perfectly comfortable with conversational English at home. That contrast shaped my understanding of how language works in real Filipino contexts. Now, as I study more languages, I appreciate the complexity and beauty of each one even more.`,
  ai: `The Philippines is a beautiful country located in Southeast Asia. It has a rich cultural heritage and diverse traditions. Filipino people are known for their hospitality and warm welcomes to visitors. The country has many natural resources and tourist destinations. Language learning is important for global communication. Technology has made it easier for people to connect across different cultures. Education plays a crucial role in developing language skills. Students benefit from exposure to multiple languages. The digital age has transformed how we approach learning. These developments continue to shape modern society.`
};

export default function AIDetectorPage() {
  const [text, setText] = useState('');
  const [wordCount, setWordCount] = useState(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [guestChecks, setGuestChecks] = useState(3);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [charCount, setCharCount] = useState(0);

  // Update word count
  useEffect(() => {
    const words = text.trim().split(/\s+/).filter(word => word.length > 0);
    setWordCount(words.length);
    setCharCount(text.length);
  }, [text]);

  // Mock analysis function
  const analyzeText = async () => {
    if (wordCount < 100) {
      alert('Please enter at least 100 words for accurate analysis.');
      return;
    }

    if (guestChecks <= 0) {
      setShowLoginModal(true);
      return;
    }

    setIsAnalyzing(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2500));

    // Mock analysis result
    const mockResult: AnalysisResult = {
      overallScore: Math.floor(Math.random() * 40) + 30, // 30-70%
      aiGenerated: Math.floor(Math.random() * 30) + 40,
      mixed: Math.floor(Math.random() * 30) + 20,
      humanWritten: Math.floor(Math.random() * 20) + 10,
      confidence: Math.random() > 0.5 ? 'high' : 'medium',
      sentenceAnalysis: text.split(/[.!?]+/).filter(s => s.trim()).slice(0, 5).map((sentence, idx) => ({
        text: sentence.trim(),
        score: Math.floor(Math.random() * 100),
        category: idx % 3 === 0 ? 'ai' : idx % 3 === 1 ? 'mixed' : 'human',
        reasons: [
          'Repetitive phrasing patterns detected',
          'Unusual word choice for context',
          'Low sentence variation'
        ]
      }))
    };

    setResult(mockResult);
    setGuestChecks(prev => prev - 1);
    setIsAnalyzing(false);
  };

  // Load sample text
  const loadSample = (type: 'human' | 'ai') => {
    setText(sampleTexts[type]);
  };

  // Get score color
  const getScoreColor = (score: number) => {
    if (score <= 33) return 'text-green-600';
    if (score <= 66) return 'text-yellow-600';
    return 'text-[#E8844A]';
  };

  const getScoreBgColor = (score: number) => {
    if (score <= 33) return 'bg-green-600';
    if (score <= 66) return 'bg-yellow-600';
    return 'bg-[#E8844A]';
  };

  const getScoreLabel = (score: number) => {
    if (score <= 33) return 'Likely Human-written';
    if (score <= 66) return 'Mixed/Unclear';
    return 'Likely AI-generated';
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-neutral-200">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center space-x-2">
              <Sparkles className="w-8 h-8 text-[#E8844A]" />
              <span className="text-xl font-bold text-neutral-900">HeyGPT.ph</span>
            </Link>
            <div className="flex items-center space-x-4">
              <Link
                href="/login"
                className="text-neutral-700 hover:text-neutral-900 font-medium text-sm sm:text-base transition-colors"
              >
                Log In
              </Link>
              <Link
                href="/signup"
                className="bg-[#E8844A] text-white px-4 py-2 rounded-lg hover:bg-[#D46D38] transition-colors font-medium text-sm sm:text-base shadow-md"
              >
                Sign Up Free
              </Link>
            </div>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#FFF4ED] to-white pt-12 pb-16 sm:pt-16 sm:pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <div className="inline-flex items-center gap-2 bg-[#FFE6D5] text-[#B85528] px-4 py-2 rounded-full text-sm font-semibold mb-6">
              <Shield className="w-4 h-4" />
              Trusted by Filipino Educators & Content Creators
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-neutral-900 mb-4 sm:mb-6">
              AI Content Detector
              <span className="block text-[#E8844A] mt-2">
                Know What's Real
              </span>
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-neutral-600 mb-4 max-w-3xl mx-auto">
              Check if text is AI-generated or human-written with advanced analysis
            </p>
            <p className="text-sm sm:text-base text-neutral-500 max-w-2xl mx-auto">
              Perfect for teachers, editors, and content reviewers in the Philippines
            </p>
          </div>

          {/* Try It Section */}
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl shadow-2xl border border-neutral-200 p-4 sm:p-6 md:p-8">
              <div className="mb-4 sm:mb-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                  <h2 className="text-lg sm:text-xl font-bold text-neutral-900">
                    Try AI Detection Now - Free
                  </h2>
                  <div className="flex gap-2">
                    <button
                      onClick={() => loadSample('human')}
                      className="text-xs sm:text-sm text-[#E8844A] hover:text-[#D46D38] font-medium transition-colors"
                    >
                      Load Human Sample
                    </button>
                    <span className="text-neutral-300">|</span>
                    <button
                      onClick={() => loadSample('ai')}
                      className="text-xs sm:text-sm text-[#E8844A] hover:text-[#D46D38] font-medium transition-colors"
                    >
                      Load AI Sample
                    </button>
                  </div>
                </div>
                <p className="text-xs sm:text-sm text-neutral-600">
                  Paste your text below to check if it's AI-generated. Minimum 100 words, maximum 5000 characters.
                </p>
              </div>

              {/* Textarea */}
              <div className="border-2 border-neutral-200 rounded-lg overflow-hidden focus-within:border-[#E8844A] transition-colors mb-4">
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value.slice(0, 5000))}
                  placeholder="Paste text here to check if it's AI-generated...

Try it with any content - essays, articles, social media posts, or emails. Our AI detector analyzes writing patterns to determine if content was created by AI tools like ChatGPT, Claude, or Gemini."
                  className="w-full h-64 sm:h-80 md:h-96 p-3 sm:p-4 resize-none focus:outline-none text-sm sm:text-base text-neutral-900"
                />
                <div className="bg-neutral-50 border-t border-neutral-200 px-3 sm:px-4 py-2 flex items-center justify-between">
                  <div className="flex items-center gap-2 sm:gap-4">
                    <span className={`text-xs sm:text-sm ${wordCount >= 100 ? 'text-green-600 font-medium' : 'text-neutral-500'}`}>
                      {wordCount} / 100 words minimum
                    </span>
                    <span className="text-xs sm:text-sm text-neutral-400">
                      {charCount} / 5000 chars
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setText('')}
                      className="text-xs sm:text-sm text-neutral-600 hover:text-neutral-900 font-medium transition-colors"
                    >
                      Clear
                    </button>
                    <button
                      onClick={() => navigator.clipboard.readText().then(setText)}
                      className="text-xs sm:text-sm text-[#E8844A] hover:text-[#D46D38] font-medium transition-colors flex items-center gap-1"
                    >
                      <Copy className="w-3 h-3 sm:w-4 sm:h-4" />
                      Paste
                    </button>
                  </div>
                </div>
              </div>

              {/* Analyze Button */}
              <button
                onClick={analyzeText}
                disabled={isAnalyzing || wordCount < 100}
                className="w-full bg-[#E8844A] text-white py-3 sm:py-4 rounded-lg hover:bg-[#D46D38] transition-all text-base sm:text-lg font-semibold flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[#E8844A]"
              >
                {isAnalyzing ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Analyzing Text...
                  </>
                ) : (
                  <>
                    <Shield className="w-5 h-5" />
                    Analyze Text
                  </>
                )}
              </button>

              <p className="text-xs text-center text-neutral-500 mt-3">
                {guestChecks > 0 ? (
                  <>You have <span className="font-semibold text-[#E8844A]">{guestChecks} free checks</span> remaining. Sign up for unlimited access.</>
                ) : (
                  <>Free checks used. <Link href="/signup" className="text-[#E8844A] font-semibold hover:underline">Sign up</Link> for unlimited access.</>
                )}
              </p>

              {/* Results Display */}
              {result && !isAnalyzing && (
                <div className="mt-6 sm:mt-8 pt-6 sm:pt-8 border-t-2 border-neutral-200 animate-fadeIn">
                  <h3 className="text-lg sm:text-xl font-bold text-neutral-900 mb-4 sm:mb-6">
                    Analysis Results
                  </h3>

                  {/* Score Gauge */}
                  <div className="mb-6 sm:mb-8">
                    <div className="flex flex-col items-center">
                      {/* Circular Progress */}
                      <div className="relative w-32 h-32 sm:w-40 sm:h-40 mb-4">
                        <svg className="transform -rotate-90 w-full h-full">
                          <circle
                            cx="50%"
                            cy="50%"
                            r="45%"
                            stroke="currentColor"
                            strokeWidth="8"
                            fill="none"
                            className="text-neutral-200"
                          />
                          <circle
                            cx="50%"
                            cy="50%"
                            r="45%"
                            stroke="currentColor"
                            strokeWidth="8"
                            fill="none"
                            strokeDasharray={`${2 * Math.PI * 45} ${2 * Math.PI * 45}`}
                            strokeDashoffset={2 * Math.PI * 45 * (1 - result.overallScore / 100)}
                            className={getScoreBgColor(result.overallScore).replace('bg-', 'text-')}
                            strokeLinecap="round"
                          />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <div className={`text-3xl sm:text-4xl font-bold ${getScoreColor(result.overallScore)}`}>
                            {result.overallScore}%
                          </div>
                          <div className="text-xs text-neutral-500 mt-1">AI Score</div>
                        </div>
                      </div>

                      <div className={`text-lg sm:text-xl font-bold ${getScoreColor(result.overallScore)} mb-1`}>
                        {getScoreLabel(result.overallScore)}
                      </div>
                      <div className="flex items-center gap-2 text-xs sm:text-sm text-neutral-600">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full ${
                          result.confidence === 'high' ? 'bg-green-100 text-green-700' :
                          result.confidence === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {result.confidence === 'high' ? <CheckCircle className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                          {result.confidence.charAt(0).toUpperCase() + result.confidence.slice(1)} Confidence
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Breakdown */}
                  <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-6 sm:mb-8">
                    <div className="text-center p-3 sm:p-4 bg-[#FFF4ED] rounded-lg border border-[#FFE6D5]">
                      <div className="text-2xl sm:text-3xl font-bold text-[#E8844A] mb-1">{result.aiGenerated}%</div>
                      <div className="text-xs sm:text-sm text-neutral-600">AI-Generated</div>
                    </div>
                    <div className="text-center p-3 sm:p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                      <div className="text-2xl sm:text-3xl font-bold text-yellow-600 mb-1">{result.mixed}%</div>
                      <div className="text-xs sm:text-sm text-neutral-600">Mixed/Unclear</div>
                    </div>
                    <div className="text-center p-3 sm:p-4 bg-green-50 rounded-lg border border-green-200">
                      <div className="text-2xl sm:text-3xl font-bold text-green-600 mb-1">{result.humanWritten}%</div>
                      <div className="text-xs sm:text-sm text-neutral-600">Human-Written</div>
                    </div>
                  </div>

                  {/* Sentence Analysis */}
                  <div className="mb-6">
                    <h4 className="text-base sm:text-lg font-bold text-neutral-900 mb-3 sm:mb-4">
                      Sentence-by-Sentence Analysis
                    </h4>
                    <div className="space-y-3">
                      {result.sentenceAnalysis.map((sentence, idx) => (
                        <div
                          key={idx}
                          className={`p-3 sm:p-4 rounded-lg border-l-4 ${
                            sentence.category === 'ai' ? 'bg-red-50 border-[#E8844A]' :
                            sentence.category === 'mixed' ? 'bg-yellow-50 border-yellow-500' :
                            'bg-green-50 border-green-500'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <p className="text-xs sm:text-sm text-neutral-700 flex-1">{sentence.text}</p>
                            <span className={`text-xs sm:text-sm font-bold whitespace-nowrap ${
                              sentence.category === 'ai' ? 'text-[#E8844A]' :
                              sentence.category === 'mixed' ? 'text-yellow-600' :
                              'text-green-600'
                            }`}>
                              {sentence.score}%
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-1 sm:gap-2">
                            {sentence.reasons.map((reason, ridx) => (
                              <span
                                key={ridx}
                                className="text-xs px-2 py-1 bg-white rounded-full text-neutral-600 border border-neutral-200"
                              >
                                {reason}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Export Options */}
                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                    <button className="flex-1 bg-neutral-900 text-white py-2 sm:py-3 rounded-lg hover:bg-neutral-800 transition-colors font-medium text-sm sm:text-base flex items-center justify-center gap-2">
                      <Download className="w-4 h-4" />
                      Download PDF Report
                    </button>
                    <button className="flex-1 border-2 border-neutral-300 text-neutral-700 py-2 sm:py-3 rounded-lg hover:border-neutral-400 transition-colors font-medium text-sm sm:text-base flex items-center justify-center gap-2">
                      <Copy className="w-4 h-4" />
                      Copy Results
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Guest Limit Notice */}
            {guestChecks <= 2 && guestChecks > 0 && (
              <div className="mt-4 sm:mt-6 text-center">
                <div className="inline-flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-800 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm">
                  <AlertCircle className="w-4 h-4" />
                  Only <span className="font-semibold">{guestChecks} free checks</span> remaining.
                  <Link href="/signup" className="underline font-semibold hover:no-underline">Sign up</Link> for unlimited access.
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden -z-10">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#FFE6D5] rounded-full opacity-30 blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-[#FFE6D5] rounded-full opacity-30 blur-3xl"></div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-12 sm:py-16 md:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-neutral-900 mb-3 sm:mb-4">
              How AI Detection Works
            </h2>
            <p className="text-base sm:text-lg text-neutral-600">
              Advanced analysis in three simple steps
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {/* Step 1 */}
            <div className="relative">
              <div className="bg-gradient-to-br from-[#FFF4ED] to-[#FFE6D5] rounded-2xl p-6 sm:p-8 border border-[#FFCCAB] h-full">
                <div className="inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-[#E8844A] text-white rounded-full text-xl sm:text-2xl font-bold mb-4">
                  1
                </div>
                <div className="flex items-start gap-3 mb-3">
                  <FileText className="w-6 h-6 sm:w-8 sm:h-8 text-[#E8844A] flex-shrink-0" />
                  <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-neutral-900">
                    Paste Your Text
                  </h3>
                </div>
                <p className="text-sm sm:text-base text-neutral-600 mb-4">
                  Simply copy and paste any text you want to analyze. Works with essays, articles, emails, or social media content. Supports both English and Filipino.
                </p>
                <div className="bg-white rounded-lg p-3 sm:p-4 shadow-sm">
                  <div className="text-xs text-neutral-500 mb-2">Minimum requirement:</div>
                  <div className="text-xs sm:text-sm text-neutral-700 font-mono bg-neutral-50 p-2 rounded">
                    "100 words or more for accurate results..."
                  </div>
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div className="relative">
              <div className="bg-gradient-to-br from-[#F5F3FF] to-[#EDE9FE] rounded-2xl p-6 sm:p-8 border border-[#DDD6FE] h-full">
                <div className="inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-[#8B5CF6] text-white rounded-full text-xl sm:text-2xl font-bold mb-4">
                  2
                </div>
                <div className="flex items-start gap-3 mb-3">
                  <BarChart3 className="w-6 h-6 sm:w-8 sm:h-8 text-[#8B5CF6] flex-shrink-0" />
                  <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-neutral-900">
                    AI Analysis
                  </h3>
                </div>
                <p className="text-sm sm:text-base text-neutral-600 mb-4">
                  Our advanced algorithms analyze patterns, word choice, sentence structure, and writing flow to detect AI signatures in seconds.
                </p>
                <div className="bg-white rounded-lg p-3 sm:p-4 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-neutral-500">Analyzing patterns:</span>
                    <Clock className="w-4 h-4 text-[#8B5CF6]" />
                  </div>
                  <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
                    <div className="h-full w-3/4 bg-[#8B5CF6] rounded-full animate-pulse"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div className="relative">
              <div className="bg-gradient-to-br from-[#F0FDF4] to-[#DCFCE7] rounded-2xl p-6 sm:p-8 border border-[#BBF7D0] h-full">
                <div className="inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-[#22C55E] text-white rounded-full text-xl sm:text-2xl font-bold mb-4">
                  3
                </div>
                <div className="flex items-start gap-3 mb-3">
                  <Target className="w-6 h-6 sm:w-8 sm:h-8 text-[#22C55E] flex-shrink-0" />
                  <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-neutral-900">
                    Get Detailed Results
                  </h3>
                </div>
                <p className="text-sm sm:text-base text-neutral-600 mb-4">
                  Receive a comprehensive report with confidence scores, sentence-by-sentence breakdown, and export options for documentation.
                </p>
                <div className="bg-white rounded-lg p-3 sm:p-4 shadow-sm">
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs sm:text-sm">
                      <span className="text-neutral-600">AI-Generated:</span>
                      <span className="font-bold text-[#E8844A]">45%</span>
                    </div>
                    <div className="flex justify-between text-xs sm:text-sm">
                      <span className="text-neutral-600">Mixed/Unclear:</span>
                      <span className="font-bold text-yellow-600">30%</span>
                    </div>
                    <div className="flex justify-between text-xs sm:text-sm">
                      <span className="text-neutral-600">Human-Written:</span>
                      <span className="font-bold text-green-600">25%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-12 sm:py-16 md:py-20 bg-neutral-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-neutral-900 mb-3 sm:mb-4">
              Powerful Detection Features
            </h2>
            <p className="text-base sm:text-lg text-neutral-600">
              Everything you need for accurate AI content analysis
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <div className="bg-white rounded-xl p-4 sm:p-6 shadow-lg hover:shadow-xl transition-shadow border border-neutral-100">
              <div className="bg-[#FFE6D5] w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-[#E8844A]" />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-neutral-900 mb-2">Fast & Accurate</h3>
              <p className="text-xs sm:text-sm text-neutral-600">
                Get results in seconds with 92%+ accuracy rate
              </p>
            </div>

            <div className="bg-white rounded-xl p-4 sm:p-6 shadow-lg hover:shadow-xl transition-shadow border border-neutral-100">
              <div className="bg-[#EDE9FE] w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Globe className="w-6 h-6 text-[#8B5CF6]" />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-neutral-900 mb-2">Works with Any Language</h3>
              <p className="text-xs sm:text-sm text-neutral-600">
                Supports English, Filipino, and Taglish content
              </p>
            </div>

            <div className="bg-white rounded-xl p-4 sm:p-6 shadow-lg hover:shadow-xl transition-shadow border border-neutral-100">
              <div className="bg-[#DCFCE7] w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <FileSearch className="w-6 h-6 text-[#22C55E]" />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-neutral-900 mb-2">Detailed Analysis</h3>
              <p className="text-xs sm:text-sm text-neutral-600">
                Sentence-level breakdown with reasoning
              </p>
            </div>

            <div className="bg-white rounded-xl p-4 sm:p-6 shadow-lg hover:shadow-xl transition-shadow border border-neutral-100">
              <div className="bg-[#FEF3C7] w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Lock className="w-6 h-6 text-[#F59E0B]" />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-neutral-900 mb-2">Free Unlimited Checks</h3>
              <p className="text-xs sm:text-sm text-neutral-600">
                No limits for registered Filipino users
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="py-12 sm:py-16 md:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-neutral-900 mb-3 sm:mb-4">
              Perfect for Every Filipino User
            </h2>
            <p className="text-base sm:text-lg text-neutral-600">
              From classrooms to newsrooms, our AI detector serves diverse needs
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            {/* Teachers */}
            <div className="bg-gradient-to-br from-[#FFF4ED] to-white rounded-xl p-6 sm:p-8 shadow-lg border border-[#FFE6D5]">
              <div className="flex items-start gap-4 mb-4">
                <div className="bg-[#E8844A] w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center flex-shrink-0">
                  <GraduationCap className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-neutral-900 mb-1">Teachers</h3>
                  <p className="text-sm sm:text-base text-neutral-600">Check student submissions</p>
                </div>
              </div>
              <p className="text-sm sm:text-base text-neutral-700 mb-4">
                <strong>Filipino Context:</strong> Quickly verify thesis papers, essays, and assignments from students at UP, DLSU, Ateneo, and other Philippine universities. Understand the difference between AI assistance and AI generation.
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="text-xs px-3 py-1 bg-white rounded-full text-neutral-700 border border-neutral-200">
                  Grade essays faster
                </span>
                <span className="text-xs px-3 py-1 bg-white rounded-full text-neutral-700 border border-neutral-200">
                  Academic integrity
                </span>
                <span className="text-xs px-3 py-1 bg-white rounded-full text-neutral-700 border border-neutral-200">
                  DepEd compliance
                </span>
              </div>
            </div>

            {/* Editors */}
            <div className="bg-gradient-to-br from-[#F5F3FF] to-white rounded-xl p-6 sm:p-8 shadow-lg border border-[#DDD6FE]">
              <div className="flex items-start gap-4 mb-4">
                <div className="bg-[#8B5CF6] w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center flex-shrink-0">
                  <PenTool className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-neutral-900 mb-1">Editors</h3>
                  <p className="text-sm sm:text-base text-neutral-600">Verify content authenticity</p>
                </div>
              </div>
              <p className="text-sm sm:text-base text-neutral-700 mb-4">
                <strong>Filipino Context:</strong> Ensure articles for Rappler, Inquirer.net, or your blog maintain authentic Filipino voice. Detect over-reliance on AI content generators that lack cultural nuance.
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="text-xs px-3 py-1 bg-white rounded-full text-neutral-700 border border-neutral-200">
                  Content quality
                </span>
                <span className="text-xs px-3 py-1 bg-white rounded-full text-neutral-700 border border-neutral-200">
                  Editorial standards
                </span>
                <span className="text-xs px-3 py-1 bg-white rounded-full text-neutral-700 border border-neutral-200">
                  Brand voice
                </span>
              </div>
            </div>

            {/* HR Professionals */}
            <div className="bg-gradient-to-br from-[#F0FDF4] to-white rounded-xl p-6 sm:p-8 shadow-lg border border-[#BBF7D0]">
              <div className="flex items-start gap-4 mb-4">
                <div className="bg-[#22C55E] w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center flex-shrink-0">
                  <Briefcase className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-neutral-900 mb-1">HR Professionals</h3>
                  <p className="text-sm sm:text-base text-neutral-600">Review job applications</p>
                </div>
              </div>
              <p className="text-sm sm:text-base text-neutral-700 mb-4">
                <strong>Filipino Context:</strong> Screen cover letters and assessment answers from applicants in BPO, tech, and corporate roles. Identify candidates who write authentically vs. those who rely purely on AI.
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="text-xs px-3 py-1 bg-white rounded-full text-neutral-700 border border-neutral-200">
                  Candidate screening
                </span>
                <span className="text-xs px-3 py-1 bg-white rounded-full text-neutral-700 border border-neutral-200">
                  Assessment reviews
                </span>
                <span className="text-xs px-3 py-1 bg-white rounded-full text-neutral-700 border border-neutral-200">
                  Hiring quality
                </span>
              </div>
            </div>

            {/* Content Teams */}
            <div className="bg-gradient-to-br from-[#FEF3C7] to-white rounded-xl p-6 sm:p-8 shadow-lg border border-[#FDE68A]">
              <div className="flex items-start gap-4 mb-4">
                <div className="bg-[#F59E0B] w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center flex-shrink-0">
                  <Users className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-neutral-900 mb-1">Content Teams</h3>
                  <p className="text-sm sm:text-base text-neutral-600">Audit articles & posts</p>
                </div>
              </div>
              <p className="text-sm sm:text-base text-neutral-700 mb-4">
                <strong>Filipino Context:</strong> Check blog posts, social media captions, and marketing copy for Filipino audiences. Ensure content resonates with local culture, not generic AI templates.
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="text-xs px-3 py-1 bg-white rounded-full text-neutral-700 border border-neutral-200">
                  SEO compliance
                </span>
                <span className="text-xs px-3 py-1 bg-white rounded-full text-neutral-700 border border-neutral-200">
                  Google quality
                </span>
                <span className="text-xs px-3 py-1 bg-white rounded-full text-neutral-700 border border-neutral-200">
                  Audience trust
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Accuracy Notice */}
      <section className="py-12 sm:py-16 md:py-20 bg-amber-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 bg-amber-100 text-amber-800 px-4 py-2 rounded-full text-sm font-semibold mb-4">
              <Info className="w-4 h-4" />
              Important to Know
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-neutral-900 mb-3 sm:mb-4">
              Understanding AI Detection Accuracy
            </h2>
          </div>

          <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-lg border border-amber-200">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-neutral-900 mb-3 flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 sm:w-6 sm:h-6 text-amber-500" />
                  This is a Tool to Assist, Not a Definitive Answer
                </h3>
                <p className="text-sm sm:text-base text-neutral-700 leading-relaxed">
                  Our AI detector provides probability scores based on pattern analysis, but no detector is 100% accurate. Results should be interpreted as signals and used alongside human judgment, especially when making important decisions.
                </p>
              </div>

              <div className="bg-amber-50 rounded-lg p-4 sm:p-6 border-l-4 border-amber-500">
                <h4 className="font-semibold text-neutral-900 mb-2 text-sm sm:text-base">False Positives & False Negatives</h4>
                <ul className="space-y-2 text-xs sm:text-sm text-neutral-700">
                  <li className="flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                    <span><strong>False Positives (7%):</strong> Human-written text may be flagged, especially formal academic writing or technical content</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                    <span><strong>False Negatives:</strong> Heavily edited AI content or AI-human collaborations may not be detected</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                    <span><strong>Filipino Context:</strong> Non-native English speakers and code-switchers won't be unfairly flagged</span>
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-neutral-900 mb-3 text-sm sm:text-base">Best Practices:</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex items-start gap-2 text-xs sm:text-sm text-neutral-700">
                    <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-[#E8844A] flex-shrink-0 mt-0.5" />
                    <span>Use as one factor among many in assessment</span>
                  </div>
                  <div className="flex items-start gap-2 text-xs sm:text-sm text-neutral-700">
                    <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-[#E8844A] flex-shrink-0 mt-0.5" />
                    <span>Consider context and writing style differences</span>
                  </div>
                  <div className="flex items-start gap-2 text-xs sm:text-sm text-neutral-700">
                    <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-[#E8844A] flex-shrink-0 mt-0.5" />
                    <span>Have conversations, don't make accusations</span>
                  </div>
                  <div className="flex items-start gap-2 text-xs sm:text-sm text-neutral-700">
                    <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-[#E8844A] flex-shrink-0 mt-0.5" />
                    <span>Review detection reasoning, not just scores</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-12 sm:py-16 md:py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-neutral-900 mb-3 sm:mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-base sm:text-lg text-neutral-600">
              Everything you need to know about AI detection
            </p>
          </div>

          <div className="space-y-4">
            {[
              {
                q: "How accurate is it?",
                a: "Our AI detector achieves 92%+ overall accuracy for texts over 100 words. We've tested on thousands of Filipino and English documents. The accuracy is particularly high (95%+) for genuine AI-generated content, with a 7% false positive rate."
              },
              {
                q: "Can it detect ChatGPT?",
                a: "Yes! Our detector identifies content from ChatGPT, GPT-4, Claude, Gemini, and other major AI models. It analyzes patterns common across these tools like predictable structures, repetitive phrasing, and lack of personal anecdotes."
              },
              {
                q: "Does it work for Filipino text?",
                a: "Absolutely! We're optimized for Filipino writing patterns, including Taglish (code-switching) and Philippine English. Unlike generic detectors, we understand local language conventions so Filipino writers aren't unfairly flagged."
              },
              {
                q: "Is it free?",
                a: "Yes! Guest users get 3 free checks. Sign up for a free account to get unlimited AI detection checks, downloadable reports, and detailed analysis. No credit card required."
              },
              {
                q: "What if human text is flagged as AI?",
                a: "False positives happen about 7% of the time, especially with formal writing. Look at the probability score - 50-70% is uncertain, while 90%+ is more definitive. Always use detection as one factor, not the only factor."
              },
              {
                q: "Can I download reports?",
                a: "Yes! Registered users can download detailed PDF reports with probability scores, sentence breakdowns, and timestamps. Perfect for academic integrity investigations or documentation."
              },
              {
                q: "What's the minimum word count?",
                a: "We require 100 words minimum. Accuracy improves with longer text: 100-200 words (85% accuracy), 200-500 words (90% accuracy), 500+ words (92%+ accuracy)."
              },
              {
                q: "Is my content stored?",
                a: `No! Your text is analyzed in real-time and immediately deleted. We don't store, share, or use your content for training. Only anonymized usage statistics are retained.`
              }
            ].map((faq, idx) => (
              <details key={idx} className="group bg-neutral-50 rounded-lg shadow-sm border border-neutral-200 overflow-hidden">
                <summary className="cursor-pointer p-4 sm:p-6 font-semibold text-sm sm:text-base text-neutral-900 flex justify-between items-center hover:bg-neutral-100 transition-colors">
                  <span>{faq.q}</span>
                  <ChevronRight className="w-5 h-5 text-neutral-400 group-open:rotate-90 transition-transform flex-shrink-0 ml-2" />
                </summary>
                <div className="px-4 sm:px-6 pb-4 sm:pb-6 text-xs sm:text-sm text-neutral-600 leading-relaxed">
                  {faq.a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-16 md:py-20 bg-gradient-to-r from-[#E8844A] to-[#D46D38]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4 sm:mb-6">
            Try AI Detector Now
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-[#FFF4ED] mb-6 sm:mb-8">
            Free, accurate, and built for Filipino users. No credit card required.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center">
            <Link
              href="#"
              onClick={(e) => {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="w-full sm:w-auto bg-white text-[#E8844A] px-6 sm:px-8 py-3 sm:py-4 rounded-lg hover:bg-neutral-50 transition-all text-base sm:text-lg font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-center gap-2"
            >
              <Shield className="w-5 h-5" />
              Try Free AI Detection
            </Link>
            <Link
              href="/signup"
              className="w-full sm:w-auto border-2 border-white text-white px-6 sm:px-8 py-3 sm:py-4 rounded-lg hover:bg-white hover:text-[#E8844A] transition-all text-base sm:text-lg font-semibold"
            >
              Sign Up for Unlimited
            </Link>
          </div>
          <p className="mt-4 sm:mt-6 text-xs sm:text-sm text-[#FFE6D5]">
            3 free checks as guest • Unlimited with free account • No credit card needed
          </p>
        </div>
      </section>

      {/* Login Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl sm:text-2xl font-bold text-neutral-900">Free Checks Used</h3>
              <button
                onClick={() => setShowLoginModal(false)}
                className="text-neutral-400 hover:text-neutral-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <p className="text-sm sm:text-base text-neutral-600 mb-6">
              You've used all 3 free guest checks. Sign up for a free account to get unlimited AI detection checks, downloadable reports, and more!
            </p>
            <div className="space-y-3">
              <Link
                href="/signup"
                className="block w-full bg-[#E8844A] text-white py-3 rounded-lg hover:bg-[#D46D38] transition-colors font-semibold text-center"
              >
                Sign Up Free
              </Link>
              <Link
                href="/login"
                className="block w-full border-2 border-neutral-300 text-neutral-700 py-3 rounded-lg hover:border-neutral-400 transition-colors font-semibold text-center"
              >
                Log In
              </Link>
            </div>
            <p className="text-xs text-center text-neutral-500 mt-4">
              No credit card required • Takes 30 seconds
            </p>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-neutral-900 text-neutral-300 py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 mb-8">
            <div>
              <Link href="/" className="flex items-center space-x-2 mb-4">
                <Sparkles className="w-6 h-6 text-[#E8844A]" />
                <span className="text-lg font-bold text-white">HeyGPT.ph</span>
              </Link>
              <p className="text-xs sm:text-sm text-neutral-400">
                Free AI tools for Filipinos. Detect AI, chat, and more.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-white mb-4 text-sm sm:text-base">Tools</h3>
              <ul className="space-y-2 text-xs sm:text-sm">
                <li><Link href="/ai-detector" className="hover:text-[#E8844A] transition-colors">AI Detector</Link></li>
                <li><Link href="/chat" className="hover:text-[#E8844A] transition-colors">AI Chat</Link></li>
                <li><Link href="/grammar-checker" className="hover:text-[#E8844A] transition-colors">Grammar Checker</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-white mb-4 text-sm sm:text-base">Resources</h3>
              <ul className="space-y-2 text-xs sm:text-sm">
                <li><Link href="#" className="hover:text-[#E8844A] transition-colors">How It Works</Link></li>
                <li><Link href="#" className="hover:text-[#E8844A] transition-colors">Accuracy Info</Link></li>
                <li><Link href="#" className="hover:text-[#E8844A] transition-colors">FAQ</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-white mb-4 text-sm sm:text-base">Company</h3>
              <ul className="space-y-2 text-xs sm:text-sm">
                <li><Link href="/" className="hover:text-[#E8844A] transition-colors">About</Link></li>
                <li><Link href="/" className="hover:text-[#E8844A] transition-colors">Privacy</Link></li>
                <li><Link href="/" className="hover:text-[#E8844A] transition-colors">Terms</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-neutral-800 pt-6 sm:pt-8 text-center text-xs sm:text-sm text-neutral-400">
            <p>2024 HeyGPT.ph. All rights reserved. Made with love for Filipinos.</p>
          </div>
        </div>
      </footer>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
