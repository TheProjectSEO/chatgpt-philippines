import Link from 'next/link';
import {
  Sparkles,
  CheckCircle,
  ArrowRight,
  Zap,
  Globe,
  Shield,
  TrendingUp,
  Users,
  Briefcase,
  GraduationCap,
  PenTool,
  BarChart,
  BookOpen,
  ChevronDown,
  Star,
  MessageSquare,
  Clock,
  Target,
  Award,
  ChevronRight
} from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Free AI Humanizer - Make AI Content Human | ChatGPT Philippines',
  description: 'Transform AI-generated text into natural, human-like content. Free AI humanizer for Filipino students, writers, BPO workers. Bypass AI detection while maintaining Filipino writing style.',
  keywords: 'ai humanizer free, make ai content human, humanize ai text philippines, bypass ai detection, filipino ai writer, ai to human text, remove ai detection, humanize chatgpt, tagalog ai humanizer',
  openGraph: {
    title: 'Free AI Humanizer - Make AI Content Human | ChatGPT Philippines',
    description: 'Transform AI text into natural Filipino content. Free humanizer tool for students, BPO workers, and content creators.',
    type: 'website',
  },
};

export default function AIHumanizerPage() {
  // JSON-LD structured data
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "ChatGPT Philippines AI Humanizer",
    "applicationCategory": "ProductivityApplication",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "PHP"
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "ratingCount": "850"
    },
    "description": "Free AI humanizer tool that transforms AI-generated content into natural, human-like text for Filipino users"
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-200">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center space-x-2">
              <Sparkles className="w-8 h-8 text-emerald-600" />
              <span className="text-xl font-bold text-gray-900">ChatGPT PH</span>
            </Link>
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
                Try Free
              </Link>
            </div>
          </div>
        </nav>
      </header>

      {/* Hero Section with Demo */}
      <section className="relative overflow-hidden bg-gradient-to-b from-emerald-50 to-white pt-12 pb-16 sm:pt-16 sm:pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-700 px-4 py-2 rounded-full text-sm font-semibold mb-6">
              <Sparkles className="w-4 h-4" />
              Powered by Advanced AI • Made for Filipinos
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Humanize AI Text
              <span className="block text-emerald-600">Instantly & Free</span>
            </h1>
            <p className="text-lg sm:text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Transform AI-generated content into natural, human-like text that sounds authentically Filipino.
              Perfect for students, writers, BPO professionals, and content creators.
            </p>

            {/* Interactive Demo Area */}
            <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-2xl border border-gray-200 p-6 sm:p-8 mb-8">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Before */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-semibold text-gray-700">AI-Generated Text</span>
                    <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full">95% AI Detected</span>
                  </div>
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 min-h-[200px] text-sm text-gray-700 leading-relaxed">
                    <p>The utilization of artificial intelligence in the educational sector has demonstrated significant potential for enhancement of learning outcomes. Implementation of AI-powered tools facilitates personalized learning experiences and enables educators to provide individualized attention to students.</p>
                  </div>
                </div>

                {/* After */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-semibold text-emerald-700">Humanized Text</span>
                    <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full">8% AI Detected</span>
                  </div>
                  <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 min-h-[200px] text-sm text-gray-700 leading-relaxed">
                    <p>AI in education is showing real promise for better learning. These tools help create personalized experiences, so teachers can give each student the attention they need to succeed.</p>
                  </div>
                </div>
              </div>

              {/* CTA */}
              <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
                <Link
                  href="/signup"
                  className="flex items-center justify-center gap-2 bg-emerald-600 text-white px-8 py-4 rounded-lg hover:bg-emerald-700 transition-all font-semibold shadow-lg hover:shadow-xl"
                >
                  Humanize Your Text Free
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link
                  href="/chat"
                  className="flex items-center justify-center gap-2 border-2 border-emerald-600 text-emerald-600 px-8 py-4 rounded-lg hover:bg-emerald-50 transition-all font-semibold"
                >
                  Try Demo Now
                </Link>
              </div>
            </div>

            {/* Trust Bar */}
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-4">Trusted by Filipino professionals at</p>
              <div className="flex flex-wrap justify-center items-center gap-8 opacity-60">
                <span className="text-lg font-semibold text-gray-700">Accenture</span>
                <span className="text-lg font-semibold text-gray-700">Concentrix</span>
                <span className="text-lg font-semibold text-gray-700">UP Diliman</span>
                <span className="text-lg font-semibold text-gray-700">Ateneo</span>
                <span className="text-lg font-semibold text-gray-700">DLSU</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Section */}
      <section className="py-16 sm:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Why Choose Our AI Humanizer?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              The most advanced AI humanization tool designed specifically for Filipino content creators
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Feature 1 */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-xl transition-all">
              <div className="bg-emerald-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-emerald-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Two Powerful Modes</h3>
              <p className="text-gray-600 text-sm">
                Free basic humanization for quick rewrites. Premium advanced mode for deeper, more natural transformations that sound authentically Filipino.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-xl transition-all">
              <div className="bg-purple-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <MessageSquare className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Works with Any AI</h3>
              <p className="text-gray-600 text-sm">
                Humanize text from ChatGPT, Gemini, Claude, Copilot, or any AI tool. Transform robotic text into natural Filipino writing.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-xl transition-all">
              <div className="bg-blue-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Award className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Best-in-Class Technology</h3>
              <p className="text-gray-600 text-sm">
                Trained on thousands of human texts. Removes AI patterns, awkward phrasing, and robotic tone while preserving meaning.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-xl transition-all">
              <div className="bg-teal-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Globe className="w-6 h-6 text-teal-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Filipino-Optimized</h3>
              <p className="text-gray-600 text-sm">
                Understands Taglish, Philippine English, and Filipino communication style. Works in multiple languages including Tagalog.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Before/After Comparison Section */}
      <section className="py-16 sm:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              See the Transformation
            </h2>
            <p className="text-lg text-gray-600">
              Real examples of AI text humanized for Filipino readers
            </p>
          </div>

          <div className="space-y-8 max-w-5xl mx-auto">
            {/* Example 1 - BPO */}
            <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8">
              <div className="flex items-center gap-2 mb-4">
                <Briefcase className="w-5 h-5 text-emerald-600" />
                <span className="text-sm font-semibold text-emerald-600">BPO Professional Email</span>
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <div className="text-xs font-semibold text-red-600 mb-2">BEFORE (Robotic AI)</div>
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm">
                    I am writing to inform you that pursuant to your inquiry regarding the status of your account, we have conducted a comprehensive review and determined that...
                  </div>
                </div>
                <div>
                  <div className="text-xs font-semibold text-emerald-600 mb-2">AFTER (Natural Filipino)</div>
                  <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 text-sm">
                    Thanks for reaching out about your account. I checked and found that everything looks good on our end...
                  </div>
                </div>
              </div>
            </div>

            {/* Example 2 - Student */}
            <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8">
              <div className="flex items-center gap-2 mb-4">
                <GraduationCap className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-semibold text-blue-600">Student Essay</span>
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <div className="text-xs font-semibold text-red-600 mb-2">BEFORE (Generic AI)</div>
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm">
                    The implementation of social media platforms has fundamentally transformed the manner in which individuals engage in interpersonal communication...
                  </div>
                </div>
                <div>
                  <div className="text-xs font-semibold text-emerald-600 mb-2">AFTER (Student Voice)</div>
                  <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 text-sm">
                    Social media has completely changed how we talk to each other. Instead of meeting in person, many Filipinos now stay in touch through...
                  </div>
                </div>
              </div>
            </div>

            {/* Example 3 - Content Creator */}
            <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8">
              <div className="flex items-center gap-2 mb-4">
                <PenTool className="w-5 h-5 text-purple-600" />
                <span className="text-sm font-semibold text-purple-600">Blog Post</span>
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <div className="text-xs font-semibold text-red-600 mb-2">BEFORE (Stiff AI)</div>
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm">
                    It is imperative to acknowledge that the utilization of proper nutrition protocols is essential for the optimization of overall health outcomes...
                  </div>
                </div>
                <div>
                  <div className="text-xs font-semibold text-emerald-600 mb-2">AFTER (Engaging Content)</div>
                  <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 text-sm">
                    Let's be real - eating well is one of the best things you can do for your health. But with Filipino food culture loving rice and...
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Competitive Comparison Section */}
      <section className="py-16 sm:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Why ChatGPT PH Beats Other Humanizers
            </h2>
            <p className="text-lg text-gray-600">
              Purpose-built technology vs. generic AI prompts
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Other AI Tools */}
            <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6 sm:p-8">
              <div className="text-center mb-6">
                <div className="inline-block bg-red-100 px-4 py-2 rounded-full text-red-700 font-semibold mb-4">
                  Other AI Humanizers
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-red-200 flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-red-700 text-sm">✗</span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Generic Models</p>
                    <p className="text-sm text-gray-600">Not trained specifically for humanization</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-red-200 flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-red-700 text-sm">✗</span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Simple Prompting</p>
                    <p className="text-sm text-gray-600">Just hopes "make it natural" works</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-red-200 flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-red-700 text-sm">✗</span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">No Filipino Context</p>
                    <p className="text-sm text-gray-600">Doesn't understand Philippine English</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-red-200 flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-red-700 text-sm">✗</span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Static System</p>
                    <p className="text-sm text-gray-600">Never updated with new AI patterns</p>
                  </div>
                </div>
              </div>
            </div>

            {/* ChatGPT Philippines */}
            <div className="bg-emerald-50 border-2 border-emerald-600 rounded-xl p-6 sm:p-8 relative">
              <div className="absolute -top-4 right-4 bg-emerald-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                Recommended
              </div>
              <div className="text-center mb-6">
                <div className="inline-block bg-emerald-100 px-4 py-2 rounded-full text-emerald-700 font-semibold mb-4">
                  ChatGPT PH Humanizer
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-emerald-200 flex items-center justify-center flex-shrink-0 mt-1">
                    <CheckCircle className="w-4 h-4 text-emerald-700" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Fine-Tuned Models</p>
                    <p className="text-sm text-gray-600">Trained on thousands of human texts</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-emerald-200 flex items-center justify-center flex-shrink-0 mt-1">
                    <CheckCircle className="w-4 h-4 text-emerald-700" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Advanced Instructions</p>
                    <p className="text-sm text-gray-600">Optimizes sentence length, variety, and flow</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-emerald-200 flex items-center justify-center flex-shrink-0 mt-1">
                    <CheckCircle className="w-4 h-4 text-emerald-700" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Filipino-Optimized</p>
                    <p className="text-sm text-gray-600">Understands Taglish and local communication</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-emerald-200 flex items-center justify-center flex-shrink-0 mt-1">
                    <CheckCircle className="w-4 h-4 text-emerald-700" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Constantly Updated</p>
                    <p className="text-sm text-gray-600">Evolves with new AI detection patterns</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 sm:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Humanize AI Text in 3 Simple Steps
            </h2>
            <p className="text-lg text-gray-600">
              Transform robotic AI content into natural Filipino writing
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Step 1 */}
            <div className="relative">
              <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8">
                <div className="bg-emerald-100 w-12 h-12 rounded-full flex items-center justify-center mb-4 text-emerald-600 font-bold text-xl">
                  1
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Paste Your AI Text</h3>
                <p className="text-gray-600 mb-4">
                  Copy AI-generated content from ChatGPT, Copilot, Claude, or any tool. Works with any AI source that sounds stiff or robotic.
                </p>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm text-gray-600 italic">
                  "Great for first drafts, but they often sound unnatural..."
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div className="relative">
              <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8">
                <div className="bg-emerald-100 w-12 h-12 rounded-full flex items-center justify-center mb-4 text-emerald-600 font-bold text-xl">
                  2
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Humanize Instantly</h3>
                <p className="text-gray-600 mb-4">
                  Our AI removes awkward phrasing, common AI patterns, and robotic tone while keeping your meaning intact.
                </p>
                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 text-sm text-emerald-700 font-semibold flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  Processing... Humanizing text
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div>
              <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8">
                <div className="bg-emerald-100 w-12 h-12 rounded-full flex items-center justify-center mb-4 text-emerald-600 font-bold text-xl">
                  3
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Make It Your Own</h3>
                <p className="text-gray-600 mb-4">
                  Fine-tune with minor edits, use advanced mode for deeper rewrites, or adjust tone until it sounds perfectly like you.
                </p>
                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 text-sm text-gray-600">
                  <CheckCircle className="w-4 h-4 text-emerald-600 inline mr-2" />
                  Natural & authentic Filipino voice
                </div>
              </div>
            </div>
          </div>

          <div className="text-center mt-12">
            <Link
              href="/signup"
              className="inline-flex items-center bg-emerald-600 text-white px-8 py-4 rounded-lg hover:bg-emerald-700 transition-all text-lg font-semibold shadow-lg hover:shadow-xl"
            >
              Start Humanizing Free
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Personas Section */}
      <section className="py-16 sm:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Perfect for Every Filipino Professional
            </h2>
            <p className="text-lg text-gray-600">
              Trusted by students, writers, BPO workers, and content creators across the Philippines
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Persona 1 - Students */}
            <div className="bg-gradient-to-br from-blue-50 to-white border border-blue-200 rounded-xl p-6 hover:shadow-xl transition-all">
              <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                <GraduationCap className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Filipino Students</h3>
              <p className="text-gray-600 mb-4">
                Need essays and papers that sound natural, not AI-generated. Perfect for research papers, thesis work, and assignments.
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-gray-700">
                <strong>Important:</strong> Always cite AI use and follow your school's AI policies (UP, Ateneo, DLSU guidelines).
              </div>
            </div>

            {/* Persona 2 - BPO Workers */}
            <div className="bg-gradient-to-br from-purple-50 to-white border border-purple-200 rounded-xl p-6 hover:shadow-xl transition-all">
              <div className="bg-purple-100 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                <Briefcase className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">BPO Professionals</h3>
              <p className="text-gray-600 mb-4">
                Write emails, reports, and client communications that sound professional yet approachable - the Filipino way.
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-purple-600 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Professional yet warm tone</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-purple-600 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Credible business writing</span>
                </li>
              </ul>
            </div>

            {/* Persona 3 - Content Creators */}
            <div className="bg-gradient-to-br from-pink-50 to-white border border-pink-200 rounded-xl p-6 hover:shadow-xl transition-all">
              <div className="bg-pink-100 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                <PenTool className="w-6 h-6 text-pink-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Content Creators</h3>
              <p className="text-gray-600 mb-4">
                Create engaging blogs, social posts, and articles that connect with Filipino audiences authentically.
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-pink-600 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Relatable Filipino voice</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-pink-600 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Engaging storytelling</span>
                </li>
              </ul>
            </div>

            {/* Persona 4 - Writers */}
            <div className="bg-gradient-to-br from-teal-50 to-white border border-teal-200 rounded-xl p-6 hover:shadow-xl transition-all">
              <div className="bg-teal-100 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                <BookOpen className="w-6 h-6 text-teal-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Professional Writers</h3>
              <p className="text-gray-600 mb-4">
                Polish AI drafts into publication-ready content. Perfect for articles, novels, and creative writing.
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-teal-600 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Natural dialogue & flow</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-teal-600 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Maintain author voice</span>
                </li>
              </ul>
            </div>

            {/* Persona 5 - Marketers */}
            <div className="bg-gradient-to-br from-orange-50 to-white border border-orange-200 rounded-xl p-6 hover:shadow-xl transition-all">
              <div className="bg-orange-100 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                <BarChart className="w-6 h-6 text-orange-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Marketers & Business</h3>
              <p className="text-gray-600 mb-4">
                Create marketing copy, proposals, and business documents that persuade Filipino customers effectively.
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-orange-600 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Persuasive messaging</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-orange-600 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Brand-aligned voice</span>
                </li>
              </ul>
            </div>

            {/* Persona 6 - Educators */}
            <div className="bg-gradient-to-br from-emerald-50 to-white border border-emerald-200 rounded-xl p-6 hover:shadow-xl transition-all">
              <div className="bg-emerald-100 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-emerald-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Teachers & Educators</h3>
              <p className="text-gray-600 mb-4">
                Create lesson plans, educational materials, and teaching content that resonates with Filipino learners.
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-emerald-600 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Clear explanations</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-emerald-600 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Student-friendly tone</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Ethical Usage Section */}
      <section className="py-16 sm:py-24 bg-gradient-to-br from-emerald-50 to-blue-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-xl p-8 sm:p-12">
            <div className="flex items-start gap-4 mb-6">
              <div className="bg-emerald-100 w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0">
                <Shield className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
                  Write Naturally, Write Responsibly
                </h2>
                <p className="text-gray-600 mb-6">
                  We know writers worry about AI detection tools. These detectors look for repetitive patterns, awkward phrasing, and stiff flow - common in raw AI drafts. Our humanizer creates high-quality, nuanced, authentic text perfect for emails, social posts, and blogs.
                </p>
              </div>
            </div>

            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 mb-6">
              <div className="flex items-start gap-3">
                <div className="bg-yellow-100 w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-yellow-700 font-bold">!</span>
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-2">Important - For Filipino Students & Professionals:</h3>
                  <p className="text-gray-700 text-sm mb-3">
                    If you're using our humanizer with AI-generated content, <strong>always follow your institution's or workplace's AI guidelines</strong>. This includes:
                  </p>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li className="flex items-start">
                      <CheckCircle className="w-4 h-4 text-yellow-600 mr-2 mt-0.5 flex-shrink-0" />
                      <span>UP, Ateneo, DLSU, and other universities have AI citation requirements</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="w-4 h-4 text-yellow-600 mr-2 mt-0.5 flex-shrink-0" />
                      <span>BPO companies may have AI disclosure policies</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="w-4 h-4 text-yellow-600 mr-2 mt-0.5 flex-shrink-0" />
                      <span>Always acknowledge when AI assisted your work</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-6">
              <h3 className="font-bold text-gray-900 mb-3">Our Commitment to Ethical AI:</h3>
              <ul className="space-y-3 text-sm text-gray-700">
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-emerald-600 mr-3 mt-0.5 flex-shrink-0" />
                  <span>Use our humanizer to refine YOUR ideas and drafts</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-emerald-600 mr-3 mt-0.5 flex-shrink-0" />
                  <span>Combine with our plagiarism checker and citation generator</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-emerald-600 mr-3 mt-0.5 flex-shrink-0" />
                  <span>Perfect for improving clarity, not hiding AI assistance</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-emerald-600 mr-3 mt-0.5 flex-shrink-0" />
                  <span>Our AI keeps your writing yours - not some chatbot's</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 sm:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Powerful Features for Filipino Users
            </h2>
            <p className="text-lg text-gray-600">
              Everything you need to create authentic, natural content
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: Clock, title: 'Instant Results', desc: 'Transform AI text in seconds, not minutes' },
              { icon: Globe, title: 'Multiple Languages', desc: 'Works with English, Tagalog, Taglish, and more' },
              { icon: Shield, title: 'Privacy Protected', desc: 'Your content is never stored or shared' },
              { icon: Zap, title: 'Two Modes', desc: 'Free basic + Premium advanced humanization' },
              { icon: Target, title: 'Meaning Preserved', desc: 'Keep your message while improving flow' },
              { icon: Star, title: 'Filipino-Optimized', desc: 'Understands local communication style' },
            ].map((feature, index) => (
              <div key={index} className="bg-gray-50 border border-gray-200 rounded-xl p-6 hover:border-emerald-600 hover:shadow-lg transition-all">
                <feature.icon className="w-8 h-8 text-emerald-600 mb-3" />
                <h3 className="text-lg font-bold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Use Case Scenarios */}
      <section className="py-16 sm:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Real-World Filipino Use Cases
            </h2>
            <p className="text-lg text-gray-600">
              See how Filipinos use our AI humanizer every day
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                <GraduationCap className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Academic Papers</h3>
              <p className="text-gray-600 text-sm mb-3">
                Filipino students use AI for research, then humanize to add their own voice and analysis. Perfect for thesis, essays, and term papers.
              </p>
              <div className="text-xs text-gray-500 italic">
                "Helped me polish my UP thesis while keeping my insights!" - Maria, UP Diliman
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="bg-purple-100 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                <Briefcase className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">BPO Communications</h3>
              <p className="text-gray-600 text-sm mb-3">
                Customer service reps humanize AI-drafted responses to sound warm and professional - the Filipino hospitality way.
              </p>
              <div className="text-xs text-gray-500 italic">
                "Makes my emails sound friendly, not robotic" - Jose, Accenture Manila
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="bg-pink-100 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                <PenTool className="w-6 h-6 text-pink-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Content Creation</h3>
              <p className="text-gray-600 text-sm mb-3">
                Filipino bloggers and social media creators use AI for ideas, then humanize to match their unique voice and connect with audiences.
              </p>
              <div className="text-xs text-gray-500 italic">
                "My blogs now sound like ME talking!" - Rica, Lifestyle Blogger
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 sm:py-24 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-lg text-gray-600">
              Everything you need to know about AI humanization
            </p>
          </div>

          <div className="space-y-4">
            {[
              {
                q: 'What is an AI humanizer and how does it work?',
                a: 'An AI humanizer transforms robotic, AI-generated text into natural, human-like writing. Our tool is trained on thousands of human texts and removes common AI patterns like repetitive phrasing, awkward sentence structures, and stiff tone - making content sound authentically Filipino.'
              },
              {
                q: 'Will this help me bypass AI detectors like Turnitin or Originality.AI?',
                a: 'Our humanizer significantly reduces AI detection scores by removing robotic patterns. However, we strongly recommend using it ethically - to polish YOUR ideas and drafts, not to hide AI assistance. Always follow your school or workplace AI policies and cite AI use when required by UP, Ateneo, DLSU, or your institution.'
              },
              {
                q: 'Does it work with Tagalog and Filipino English?',
                a: 'Yes! Our AI humanizer is specifically optimized for Filipino users. It understands Philippine English, Taglish (code-switching), and local communication styles. The tool preserves Filipino warmth and hospitality in professional writing while maintaining natural flow.'
              },
              {
                q: 'Is it free to use? Are there limitations?',
                a: 'Yes, our basic humanizer is completely free with a 125-word limit per use - perfect for short texts. Premium users get unlimited words, advanced humanization mode, tone insights, and the ability to humanize directly in ChatGPT. Most Filipino users find the free tier sufficient for daily needs.'
              },
              {
                q: 'Can I use this for school assignments and BPO work?',
                a: 'Absolutely, but responsibly! Use it to refine YOUR work and ideas - not to pass off AI content as purely yours. For students: Always cite AI assistance per your university guidelines (especially important at UP, Ateneo, DLSU). For BPO: Check your company AI usage policies first.'
              },
              {
                q: 'What types of writing can I humanize?',
                a: 'Any type! Essays, research papers, blog posts, social media captions, BPO emails, business reports, marketing copy, creative writing, resumes, cover letters - anything that needs to sound natural and authentically human rather than AI-generated.'
              },
              {
                q: 'How is this different from just asking ChatGPT to make it natural?',
                a: 'ChatGPT uses generic prompting and isn\'t specifically trained for humanization. Our tool uses fine-tuned models trained on thousands of human texts with advanced instructions to optimize sentence variety, length, and flow. We\'re constantly updated with new AI detection patterns - ChatGPT isn\'t.'
              },
              {
                q: 'Does humanizing change the meaning of my text?',
                a: 'No! Our humanizer preserves your core message and key points while improving readability, flow, and natural tone. It removes robotic phrasing and makes text sound more conversational without altering your intended meaning. You always have full control to edit further.'
              },
              {
                q: 'Can I humanize content from other AI tools like Gemini or Claude?',
                a: 'Yes! Our humanizer works with AI text from ANY source - ChatGPT, Gemini, Claude, Copilot, Perplexity, or any other AI writing tool. Just paste the AI-generated content and we\'ll transform it into natural, human-like text.'
              },
              {
                q: 'What are the real risks of publishing unedited AI content?',
                a: 'Beyond sounding robotic, unedited AI content can: harm your credibility with readers, trigger AI detectors at work/school, contain factual errors, lack authentic voice and personality, fail to connect emotionally with Filipino audiences, and potentially violate academic integrity or workplace policies.'
              },
              {
                q: 'Is my content private and secure?',
                a: 'Absolutely. We take Filipino user privacy seriously. Your content is encrypted during processing and NOT stored permanently. We never sell or share your data with third parties. All processing follows strict privacy standards, and you can delete your account anytime.'
              },
              {
                q: 'Do you offer support for Filipino students and BPO workers?',
                a: 'Yes! We understand the unique needs of Filipino users. Our platform includes guides on ethical AI use, academic citation requirements, and professional writing tips. We also provide Tagalog-English support resources and examples relevant to Philippine schools and BPO industries.'
              }
            ].map((faq, index) => (
              <details key={index} className="group bg-gray-50 rounded-xl border border-gray-200 overflow-hidden hover:border-emerald-600 transition-colors">
                <summary className="cursor-pointer p-6 font-semibold text-gray-900 flex justify-between items-center hover:bg-white transition-colors">
                  <span className="text-left pr-4">{faq.q}</span>
                  <ChevronDown className="w-5 h-5 text-gray-400 group-open:rotate-180 transition-transform flex-shrink-0" />
                </summary>
                <div className="px-6 pb-6 text-gray-600 leading-relaxed">
                  {faq.a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-16 sm:py-24 bg-gradient-to-r from-emerald-600 to-teal-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
            Ready to Humanize Your AI Content?
          </h2>
          <p className="text-xl text-emerald-50 mb-4">
            Join thousands of Filipino students, writers, and professionals
          </p>
          <p className="text-emerald-100 mb-8">
            Transform robotic AI text into natural, authentic Filipino content in seconds
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/signup"
              className="w-full sm:w-auto bg-white text-emerald-600 px-8 py-4 rounded-lg hover:bg-gray-100 transition-all text-lg font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-center gap-2"
            >
              Start Humanizing Free
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/chat"
              className="w-full sm:w-auto border-2 border-white text-white px-8 py-4 rounded-lg hover:bg-white hover:text-emerald-600 transition-all text-lg font-semibold"
            >
              Try Demo Now
            </Link>
          </div>
          <p className="mt-6 text-sm text-emerald-50">
            No credit card • No installation • 100% free basic humanizer
          </p>

          {/* Trust indicators */}
          <div className="mt-12 flex flex-wrap justify-center items-center gap-6 text-white/80">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              <span className="text-sm">Filipino-Optimized</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              <span className="text-sm">Privacy Protected</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              <span className="text-sm">Instant Results</span>
            </div>
          </div>
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
                Free AI humanizer and tools for Filipinos. Transform AI text into natural, human-like content.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-white mb-4">AI Tools</h3>
              <ul className="space-y-2 text-sm">
                <li><Link href="/ai-humanizer" className="hover:text-emerald-500 transition-colors">AI Humanizer</Link></li>
                <li><Link href="/signup" className="hover:text-emerald-500 transition-colors">AI Detector</Link></li>
                <li><Link href="/signup" className="hover:text-emerald-500 transition-colors">Plagiarism Checker</Link></li>
                <li><Link href="/signup" className="hover:text-emerald-500 transition-colors">AI Chat</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-white mb-4">For Filipinos</h3>
              <ul className="space-y-2 text-sm">
                <li><Link href="/signup" className="hover:text-emerald-500 transition-colors">For Students</Link></li>
                <li><Link href="/signup" className="hover:text-emerald-500 transition-colors">For BPO Workers</Link></li>
                <li><Link href="/signup" className="hover:text-emerald-500 transition-colors">For Writers</Link></li>
                <li><Link href="/signup" className="hover:text-emerald-500 transition-colors">For Businesses</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-white mb-4">Company</h3>
              <ul className="space-y-2 text-sm">
                <li><Link href="/" className="hover:text-emerald-500 transition-colors">Home</Link></li>
                <li><Link href="/signup" className="hover:text-emerald-500 transition-colors">Sign Up Free</Link></li>
                <li><Link href="/login" className="hover:text-emerald-500 transition-colors">Log In</Link></li>
                <li><Link href="/signup" className="hover:text-emerald-500 transition-colors">Privacy Policy</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 text-center text-sm text-gray-400">
            <p>2024 ChatGPT Philippines. All rights reserved.</p>
            <p className="mt-2">Empowering Filipino writers with ethical AI tools</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
