import Link from 'next/link';
import {
  Sparkles,
  MessageSquare,
  Image,
  Mic,
  Search,
  Shield,
  Users,
  CheckCircle,
  Globe,
  FileText,
  PenTool,
  Presentation,
  BookOpen,
  BarChart,
  Languages,
  Star,
  Zap,
  Lock,
  ChevronRight
} from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Free ChatGPT Philippines - AI Chat, Generator & Tools',
  description: 'Free ChatGPT Philippines powered by Claude AI. Image generator, translator, detector, character AI, plagiarism checker, and more AI tools for Filipino users.',
  keywords: 'ChatGPT Philippines, free AI chat, image generator, AI detector, translate Tagalog, GPT chat, Perplexity AI, character AI, plagiarism checker, AI tools',
  openGraph: {
    title: 'Free ChatGPT Philippines - AI Chat, Generator & Tools',
    description: 'Free AI-powered tools for Filipinos: chat, generate images, translate, check plagiarism, and more.',
    type: 'website',
  },
};

export default function Home() {
  // JSON-LD structured data for SEO
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "ChatGPT Philippines",
    "description": "Free AI-powered ChatGPT for Filipino users. Chat, generate images, translate languages, check plagiarism, and access powerful AI tools.",
    "url": "https://chatgpt-philippines.com",
    "applicationCategory": "ProductivityApplication",
    "operatingSystem": "Web",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "PHP"
    },
    "featureList": [
      "AI Chat",
      "Image Generator",
      "Language Translator",
      "AI Detector",
      "Plagiarism Checker",
      "Character AI",
      "Content Makers",
      "Perplexity AI"
    ],
    "inLanguage": ["en", "tl"],
    "availableLanguage": ["English", "Tagalog", "Spanish"],
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "ratingCount": "1250"
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      {/* Header/Navigation */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-200">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-8 h-8 text-emerald-600" />
              <span className="text-xl font-bold text-gray-900">ChatGPT PH</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/login"
                className="text-gray-700 hover:text-gray-900 font-medium text-sm sm:text-base"
              >
                Log In
              </Link>
              <Link
                href="/signup"
                className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors font-medium text-sm sm:text-base"
              >
                Sign Up Free
              </Link>
            </div>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-emerald-50 to-white pt-16 pb-20 sm:pt-24 sm:pb-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Free AI ChatGPT for
              <span className="block text-emerald-600">Filipinos</span>
            </h1>
            <p className="text-lg sm:text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Unlock powerful AI tools completely free. Chat, generate images, translate languages,
              check plagiarism, and more — powered by advanced AI technology.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                href="/signup"
                className="w-full sm:w-auto bg-emerald-600 text-white px-8 py-4 rounded-lg hover:bg-emerald-700 transition-all text-lg font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                Start Free Now
              </Link>
              <Link
                href="/login"
                className="w-full sm:w-auto border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-lg hover:border-emerald-600 hover:text-emerald-600 transition-all text-lg font-semibold"
              >
                Try Without Sign Up
              </Link>
            </div>
            <p className="mt-6 text-sm text-gray-500">
              No credit card required • Instant access • Privacy protected
            </p>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-emerald-200 rounded-full opacity-20 blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-200 rounded-full opacity-20 blur-3xl"></div>
        </div>
      </section>

      {/* Key Features Bar */}
      <section className="py-8 bg-gray-50 border-y border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="flex flex-col items-center">
              <Zap className="w-8 h-8 text-emerald-600 mb-2" />
              <p className="text-sm font-semibold text-gray-900">Instant Access</p>
            </div>
            <div className="flex flex-col items-center">
              <Lock className="w-8 h-8 text-emerald-600 mb-2" />
              <p className="text-sm font-semibold text-gray-900">100% Secure</p>
            </div>
            <div className="flex flex-col items-center">
              <Star className="w-8 h-8 text-emerald-600 mb-2" />
              <p className="text-sm font-semibold text-gray-900">Free Forever</p>
            </div>
            <div className="flex flex-col items-center">
              <Globe className="w-8 h-8 text-emerald-600 mb-2" />
              <p className="text-sm font-semibold text-gray-900">For Filipinos</p>
            </div>
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="py-16 sm:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Powerful AI Tools at Your Fingertips
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Everything you need to work smarter, create faster, and achieve more with AI
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Detector */}
            <div className="group bg-white border border-gray-200 rounded-xl p-6 hover:shadow-xl transition-all hover:-translate-y-1">
              <div className="bg-emerald-100 w-14 h-14 rounded-lg flex items-center justify-center mb-4 group-hover:bg-emerald-600 transition-colors">
                <Shield className="w-7 h-7 text-emerald-600 group-hover:text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">AI Detector</h3>
              <p className="text-gray-600 mb-4">
                Detect AI-generated content, verify authenticity, and ensure human-quality writing with our advanced detector.
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-emerald-600 mr-2 mt-0.5 flex-shrink-0" />
                  <span>AI content detection</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-emerald-600 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Human eyes verification</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-emerald-600 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Authenticity scoring</span>
                </li>
              </ul>
            </div>

            {/* Generator */}
            <div className="group bg-white border border-gray-200 rounded-xl p-6 hover:shadow-xl transition-all hover:-translate-y-1">
              <div className="bg-purple-100 w-14 h-14 rounded-lg flex items-center justify-center mb-4 group-hover:bg-purple-600 transition-colors">
                <Image className="w-7 h-7 text-purple-600 group-hover:text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">AI Generator</h3>
              <p className="text-gray-600 mb-4">
                Create stunning visuals, voices, and art with our powerful AI generators. From images to audio.
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-purple-600 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Image & photo generator</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-purple-600 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Art & picture creator</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-purple-600 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Voice generation</span>
                </li>
              </ul>
            </div>

            {/* Perplexity AI */}
            <div className="group bg-white border border-gray-200 rounded-xl p-6 hover:shadow-xl transition-all hover:-translate-y-1">
              <div className="bg-blue-100 w-14 h-14 rounded-lg flex items-center justify-center mb-4 group-hover:bg-blue-600 transition-colors">
                <Search className="w-7 h-7 text-blue-600 group-hover:text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Perplexity AI Chat</h3>
              <p className="text-gray-600 mb-4">
                Advanced AI search and chat capabilities. Compare Perplexity AI vs ChatGPT and get the best of both.
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Smart search & research</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Real-time information</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Source citations</span>
                </li>
              </ul>
            </div>

            {/* Characters AI */}
            <div className="group bg-white border border-gray-200 rounded-xl p-6 hover:shadow-xl transition-all hover:-translate-y-1">
              <div className="bg-pink-100 w-14 h-14 rounded-lg flex items-center justify-center mb-4 group-hover:bg-pink-600 transition-colors">
                <Users className="w-7 h-7 text-pink-600 group-hover:text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Character AI</h3>
              <p className="text-gray-600 mb-4">
                Create and chat with AI characters. Roleplay, practice conversations, or just have fun with AI companions.
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-pink-600 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Custom AI characters</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-pink-600 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Roleplay scenarios</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-pink-600 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Interactive conversations</span>
                </li>
              </ul>
            </div>

            {/* Checker */}
            <div className="group bg-white border border-gray-200 rounded-xl p-6 hover:shadow-xl transition-all hover:-translate-y-1">
              <div className="bg-orange-100 w-14 h-14 rounded-lg flex items-center justify-center mb-4 group-hover:bg-orange-600 transition-colors">
                <FileText className="w-7 h-7 text-orange-600 group-hover:text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">AI Checker</h3>
              <p className="text-gray-600 mb-4">
                Check your content for AI generation, grammar errors, and plagiarism. Ensure originality and quality.
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-orange-600 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Plagiarism checker</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-orange-600 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Grammarly AI integration</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-orange-600 mr-2 mt-0.5 flex-shrink-0" />
                  <span>AI content verification</span>
                </li>
              </ul>
            </div>

            {/* Translate */}
            <div className="group bg-white border border-gray-200 rounded-xl p-6 hover:shadow-xl transition-all hover:-translate-y-1">
              <div className="bg-teal-100 w-14 h-14 rounded-lg flex items-center justify-center mb-4 group-hover:bg-teal-600 transition-colors">
                <Languages className="w-7 h-7 text-teal-600 group-hover:text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">AI Translator</h3>
              <p className="text-gray-600 mb-4">
                Translate between Tagalog, Spanish, English, and more. Context-aware translations that sound natural.
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-teal-600 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Tagalog translation</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-teal-600 mr-2 mt-0.5 flex-shrink-0" />
                  <span>100+ languages support</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-teal-600 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Context-aware results</span>
                </li>
              </ul>
            </div>

            {/* Makers */}
            <div className="group bg-white border border-gray-200 rounded-xl p-6 hover:shadow-xl transition-all hover:-translate-y-1">
              <div className="bg-indigo-100 w-14 h-14 rounded-lg flex items-center justify-center mb-4 group-hover:bg-indigo-600 transition-colors">
                <Presentation className="w-7 h-7 text-indigo-600 group-hover:text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Content Makers</h3>
              <p className="text-gray-600 mb-4">
                Create logos, presentations, quizzes, and infographics instantly. Professional designs in minutes.
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-indigo-600 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Logo & PPT maker</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-indigo-600 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Quiz & review creator</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-indigo-600 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Infographic designer</span>
                </li>
              </ul>
            </div>

            {/* GPT Features */}
            <div className="group bg-white border border-gray-200 rounded-xl p-6 hover:shadow-xl transition-all hover:-translate-y-1">
              <div className="bg-emerald-100 w-14 h-14 rounded-lg flex items-center justify-center mb-4 group-hover:bg-emerald-600 transition-colors">
                <PenTool className="w-7 h-7 text-emerald-600 group-hover:text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">GPT Writer</h3>
              <p className="text-gray-600 mb-4">
                Advanced writing assistant with essay writer, content generator, and prompt optimization for all needs.
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-emerald-600 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Essay & article writer</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-emerald-600 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Content humanization</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-emerald-600 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Smart prompt optimization</span>
                </li>
              </ul>
            </div>

            {/* Chat & More */}
            <div className="group bg-white border border-gray-200 rounded-xl p-6 hover:shadow-xl transition-all hover:-translate-y-1">
              <div className="bg-cyan-100 w-14 h-14 rounded-lg flex items-center justify-center mb-4 group-hover:bg-cyan-600 transition-colors">
                <MessageSquare className="w-7 h-7 text-cyan-600 group-hover:text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">GPT Chat & More</h3>
              <p className="text-gray-600 mb-4">
                Full ChatGPT experience with AI chat, code writing, data analysis, and countless other powerful features.
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-cyan-600 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Natural conversations</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-cyan-600 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Code generation & debug</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-cyan-600 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Data analysis & insights</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="text-center mt-12">
            <Link
              href="/signup"
              className="inline-flex items-center bg-emerald-600 text-white px-8 py-4 rounded-lg hover:bg-emerald-700 transition-all text-lg font-semibold shadow-lg hover:shadow-xl"
            >
              Try All Features Free
              <ChevronRight className="ml-2 w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 sm:py-24 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-lg text-gray-600">
              Everything you need to know about ChatGPT Philippines
            </p>
          </div>

          <div className="space-y-6">
            {/* FAQ Item 1 */}
            <details className="group bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <summary className="cursor-pointer p-6 font-semibold text-gray-900 flex justify-between items-center hover:bg-gray-50 transition-colors">
                <span>What happens when I sign up for ChatGPT Philippines?</span>
                <ChevronRight className="w-5 h-5 text-gray-400 group-open:rotate-90 transition-transform" />
              </summary>
              <div className="px-6 pb-6 text-gray-600">
                When you sign up, you'll get instant access to all our AI tools completely free. You'll create a secure account where you can save your chat history, access advanced features, and enjoy personalized AI assistance. The signup process takes less than 30 seconds, and you can start using ChatGPT, image generators, translators, and all other tools immediately.
              </div>
            </details>

            {/* FAQ Item 2 */}
            <details className="group bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <summary className="cursor-pointer p-6 font-semibold text-gray-900 flex justify-between items-center hover:bg-gray-50 transition-colors">
                <span>What happens when I log in?</span>
                <ChevronRight className="w-5 h-5 text-gray-400 group-open:rotate-90 transition-transform" />
              </summary>
              <div className="px-6 pb-6 text-gray-600">
                Logging in gives you access to your personalized dashboard where you can view your chat history, saved conversations, and continue previous projects. All your data is securely stored and synced across devices. You'll also get access to your usage statistics and can manage your preferences. The platform remembers your settings and preferences for a seamless experience every time you visit.
              </div>
            </details>

            {/* FAQ Item 3 */}
            <details className="group bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <summary className="cursor-pointer p-6 font-semibold text-gray-900 flex justify-between items-center hover:bg-gray-50 transition-colors">
                <span>How is my data stored and protected?</span>
                <ChevronRight className="w-5 h-5 text-gray-400 group-open:rotate-90 transition-transform" />
              </summary>
              <div className="px-6 pb-6 text-gray-600">
                We take your privacy seriously. Your data is encrypted and stored securely following industry best practices. We don't store your conversations permanently unless you choose to save them. All data processing follows our strict privacy policy, and we never sell or share your personal information with third parties. You have full control over your data and can delete your account and all associated data at any time.
              </div>
            </details>

            {/* FAQ Item 4 */}
            <details className="group bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <summary className="cursor-pointer p-6 font-semibold text-gray-900 flex justify-between items-center hover:bg-gray-50 transition-colors">
                <span>Is ChatGPT Philippines really free? What's the catch?</span>
                <ChevronRight className="w-5 h-5 text-gray-400 group-open:rotate-90 transition-transform" />
              </summary>
              <div className="px-6 pb-6 text-gray-600">
                Yes, it's completely free! We believe AI should be accessible to everyone, especially Filipino users. Our free tier includes access to GPT chat, image generation, translation, plagiarism checking, and many other tools. There are reasonable daily usage limits to ensure fair access for all users. In the future, we may offer premium features for power users, but the core functionality will always remain free.
              </div>
            </details>

            {/* FAQ Item 5 */}
            <details className="group bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <summary className="cursor-pointer p-6 font-semibold text-gray-900 flex justify-between items-center hover:bg-gray-50 transition-colors">
                <span>What's the difference between ChatGPT and Perplexity AI?</span>
                <ChevronRight className="w-5 h-5 text-gray-400 group-open:rotate-90 transition-transform" />
              </summary>
              <div className="px-6 pb-6 text-gray-600">
                ChatGPT excels at conversational AI, content creation, coding, and creative tasks. Perplexity AI specializes in research and information retrieval with source citations. Our platform gives you access to both capabilities, allowing you to use the best tool for your specific need. Whether you need creative writing or factual research with sources, we've got you covered.
              </div>
            </details>

            {/* FAQ Item 6 */}
            <details className="group bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <summary className="cursor-pointer p-6 font-semibold text-gray-900 flex justify-between items-center hover:bg-gray-50 transition-colors">
                <span>What are the usage limits for free accounts?</span>
                <ChevronRight className="w-5 h-5 text-gray-400 group-open:rotate-90 transition-transform" />
              </summary>
              <div className="px-6 pb-6 text-gray-600">
                Free accounts get generous daily limits on all features: unlimited chat conversations, image generation, translations, and tool usage. These limits are designed to be more than enough for typical daily use. Limits reset every 24 hours. If you need more, you can always check our premium options, but most users find the free tier sufficient for their needs.
              </div>
            </details>

            {/* FAQ Item 7 */}
            <details className="group bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <summary className="cursor-pointer p-6 font-semibold text-gray-900 flex justify-between items-center hover:bg-gray-50 transition-colors">
                <span>Can I use this for school, work, or business?</span>
                <ChevronRight className="w-5 h-5 text-gray-400 group-open:rotate-90 transition-transforms" />
              </summary>
              <div className="px-6 pb-6 text-gray-600">
                Absolutely! ChatGPT Philippines is perfect for students, freelancers, professionals, and businesses. Use it for essay writing, research, creating presentations, generating marketing content, code development, translation services, and much more. However, always review and verify AI-generated content before submitting important work, and follow your institution's or company's AI usage policies.
              </div>
            </details>

            {/* FAQ Item 8 */}
            <details className="group bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <summary className="cursor-pointer p-6 font-semibold text-gray-900 flex justify-between items-center hover:bg-gray-50 transition-colors">
                <span>How accurate is the AI detector and plagiarism checker?</span>
                <ChevronRight className="w-5 h-5 text-gray-400 group-open:rotate-90 transition-transform" />
              </summary>
              <div className="px-6 pb-6 text-gray-600">
                Our AI detector and plagiarism checker use advanced algorithms to provide high accuracy rates. The AI detector can identify AI-generated content with good reliability, while the plagiarism checker compares your text against billions of web pages. However, no tool is 100% perfect, so we recommend using them as guides rather than absolute judgments. Always apply human judgment when evaluating results.
              </div>
            </details>

            {/* FAQ Item 9 */}
            <details className="group bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <summary className="cursor-pointer p-6 font-semibold text-gray-900 flex justify-between items-center hover:bg-gray-50 transition-colors">
                <span>Does the translator support Tagalog and other Philippine languages?</span>
                <ChevronRight className="w-5 h-5 text-gray-400 group-open:rotate-90 transition-transform" />
              </summary>
              <div className="px-6 pb-6 text-gray-600">
                Yes! Our AI translator has excellent support for Tagalog and English, providing context-aware translations that sound natural. We also support Spanish, Cebuano, and 100+ other languages. The AI understands cultural context and local expressions, making translations more accurate than traditional tools. It's perfect for personal use, business communications, or learning new languages.
              </div>
            </details>

            {/* FAQ Item 10 */}
            <details className="group bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <summary className="cursor-pointer p-6 font-semibold text-gray-900 flex justify-between items-center hover:bg-gray-50 transition-colors">
                <span>What makes ChatGPT Philippines different from other AI chat platforms?</span>
                <ChevronRight className="w-5 h-5 text-gray-400 group-open:rotate-90 transition-transform" />
              </summary>
              <div className="px-6 pb-6 text-gray-600">
                ChatGPT Philippines is specifically designed for Filipino users with features tailored to local needs. We offer all tools in one platform: chat, image generation, translation, plagiarism checking, and more. Our platform is 100% free with no hidden fees, provides excellent Tagalog support, and understands Philippine context and culture. Plus, we prioritize data privacy and don't require credit card information.
              </div>
            </details>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-24 bg-gradient-to-r from-emerald-600 to-teal-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
            Ready to Experience the Power of AI?
          </h2>
          <p className="text-xl text-emerald-50 mb-8">
            Join thousands of Filipinos already using ChatGPT Philippines for free
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/signup"
              className="w-full sm:w-auto bg-white text-emerald-600 px-8 py-4 rounded-lg hover:bg-gray-100 transition-all text-lg font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              Get Started Free
            </Link>
            <Link
              href="/login"
              className="w-full sm:w-auto border-2 border-white text-white px-8 py-4 rounded-lg hover:bg-white hover:text-emerald-600 transition-all text-lg font-semibold"
            >
              Log In
            </Link>
          </div>
          <p className="mt-6 text-sm text-emerald-50">
            No credit card • No installation • Start in 30 seconds
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Sparkles className="w-6 h-6 text-emerald-500" />
                <span className="text-lg font-bold text-white">ChatGPT PH</span>
              </div>
              <p className="text-sm text-gray-400">
                Free AI tools for Filipinos. Chat, create, translate, and more with advanced AI technology.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-white mb-4">Features</h3>
              <ul className="space-y-2 text-sm">
                <li><Link href="/signup" className="hover:text-emerald-500 transition-colors">AI Chat</Link></li>
                <li><Link href="/signup" className="hover:text-emerald-500 transition-colors">Image Generator</Link></li>
                <li><Link href="/signup" className="hover:text-emerald-500 transition-colors">Translator</Link></li>
                <li><Link href="/signup" className="hover:text-emerald-500 transition-colors">AI Detector</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-white mb-4">Company</h3>
              <ul className="space-y-2 text-sm">
                <li><Link href="/signup" className="hover:text-emerald-500 transition-colors">About Us</Link></li>
                <li><Link href="/signup" className="hover:text-emerald-500 transition-colors">Privacy Policy</Link></li>
                <li><Link href="/signup" className="hover:text-emerald-500 transition-colors">Terms of Service</Link></li>
                <li><Link href="/signup" className="hover:text-emerald-500 transition-colors">Contact</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-white mb-4">Get Started</h3>
              <ul className="space-y-2 text-sm">
                <li><Link href="/signup" className="hover:text-emerald-500 transition-colors">Sign Up Free</Link></li>
                <li><Link href="/login" className="hover:text-emerald-500 transition-colors">Log In</Link></li>
                <li><Link href="/signup" className="hover:text-emerald-500 transition-colors">Features</Link></li>
                <li><Link href="/signup" className="hover:text-emerald-500 transition-colors">FAQ</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 text-center text-sm text-gray-400">
            <p>2024 ChatGPT Philippines. All rights reserved. Powered by Claude AI.</p>
            <p className="mt-2">Made with love for Filipinos</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
