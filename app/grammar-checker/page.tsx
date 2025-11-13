import Link from 'next/link';
import type { Metadata } from 'next';
import {
  CheckCircle,
  Sparkles,
  Globe,
  Zap,
  Shield,
  Award,
  BookOpen,
  Users,
  TrendingUp,
  FileText,
  MessageSquare,
  ChevronRight,
  Star,
  Languages,
  GraduationCap,
  Briefcase,
  Send,
  Clock
} from 'lucide-react';
import GrammarChatInterface from '@/components/GrammarChatInterface';

export const metadata: Metadata = {
  title: 'Free Grammar Checker Philippines - Check Grammar Online with AI',
  description: 'Free AI-powered grammar checker for Filipino users. Check grammar, spelling, punctuation instantly. Perfect for students, BPO workers, OFWs. Supports Tagalog-English.',
  keywords: 'grammar checker philippines, free grammar check, tagalog grammar, english grammar checker, BPO grammar tool, OFW writing assistant, filipino grammar checker, spelling checker, punctuation checker',
  openGraph: {
    title: 'Free Grammar Checker Philippines - AI Grammar & Spelling Check',
    description: 'Free grammar checker for Filipinos. Check grammar, spelling, punctuation with AI. Perfect for students, professionals, BPO workers.',
    type: 'website',
  },
};

export default function GrammarCheckerPage() {
  // Structured data for SEO
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "Grammar Checker Philippines",
    "description": "Free AI-powered grammar checker for Filipino users. Check grammar, spelling, and punctuation instantly with advanced AI technology.",
    "url": "https://chatgpt-philippines.com/grammar-checker",
    "applicationCategory": "ProductivityApplication",
    "operatingSystem": "Web",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "PHP"
    },
    "featureList": [
      "Grammar checking",
      "Spelling correction",
      "Punctuation checking",
      "Tagalog-English support",
      "Real-time checking",
      "Contextual suggestions"
    ],
    "inLanguage": ["en", "tl"],
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.9",
      "ratingCount": "850"
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
                Sign Up Free
              </Link>
            </div>
          </div>
        </nav>
      </header>

      {/* Hero Section with Interactive Grammar Checker */}
      <section className="relative overflow-hidden bg-gradient-to-b from-emerald-50 to-white pt-12 pb-16 sm:pt-16 sm:pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Free Grammar Checker
              <span className="block text-emerald-600">for Filipinos</span>
            </h1>
            <p className="text-lg sm:text-xl text-gray-600 mb-4 max-w-3xl mx-auto">
              Check your grammar, spelling, and punctuation instantly with AI. Perfect for students,
              BPO workers, OFWs, and professionals. No sign-up required.
            </p>
            <p className="text-sm text-gray-500 max-w-2xl mx-auto">
              Supports Filipino-English, Tagalog, and detects common mistakes made by Filipino speakers
            </p>
          </div>

          {/* Interactive Grammar Checker */}
          <div className="max-w-4xl mx-auto">
            <GrammarChatInterface />
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-emerald-200 rounded-full opacity-20 blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-200 rounded-full opacity-20 blur-3xl"></div>
        </div>
      </section>

      {/* Trust Indicators */}
      <section className="py-8 bg-gray-50 border-y border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-gray-600 mb-6 font-medium">Trusted by Filipino professionals and students at</p>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6 items-center justify-items-center">
            <div className="text-gray-600 font-semibold text-lg">University of the Philippines</div>
            <div className="text-gray-600 font-semibold text-lg">Ateneo de Manila</div>
            <div className="text-gray-600 font-semibold text-lg">DLSU</div>
            <div className="text-gray-600 font-semibold text-lg">Concentrix</div>
            <div className="text-gray-600 font-semibold text-lg">Accenture PH</div>
          </div>
        </div>
      </section>

      {/* Key Benefits */}
      <section className="py-16 sm:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Why Filipino Users Love Our Grammar Checker
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Designed specifically for Filipino English speakers with common errors and local context in mind
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Benefit 1 */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-xl transition-all">
              <div className="bg-emerald-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-emerald-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">AI-Powered & Fast</h3>
              <p className="text-gray-600">
                Advanced AI detects errors instantly as you type. Get accurate corrections in seconds, not minutes.
              </p>
            </div>

            {/* Benefit 2 */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-xl transition-all">
              <div className="bg-blue-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <CheckCircle className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Comprehensive Checking</h3>
              <p className="text-gray-600">
                Grammar, spelling, punctuation, word choice, and sentence structure - all checked in one go.
              </p>
            </div>

            {/* Benefit 3 */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-xl transition-all">
              <div className="bg-purple-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Languages className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Filipino-English Context</h3>
              <p className="text-gray-600">
                Understands common Filipino-English patterns, Taglish, and mistakes Filipino speakers typically make.
              </p>
            </div>

            {/* Benefit 4 */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-xl transition-all">
              <div className="bg-orange-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Globe className="w-6 h-6 text-orange-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Multiple Languages</h3>
              <p className="text-gray-600">
                Check English, Filipino/Tagalog, Spanish, and more. Perfect for multilingual Filipinos.
              </p>
            </div>

            {/* Benefit 5 */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-xl transition-all">
              <div className="bg-green-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Award className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">100% Free Forever</h3>
              <p className="text-gray-600">
                Unlimited grammar checks, no hidden fees, no credit card required. Always free for Filipinos.
              </p>
            </div>

            {/* Benefit 6 */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-xl transition-all">
              <div className="bg-pink-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-pink-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Private & Secure</h3>
              <p className="text-gray-600">
                Your text is processed securely and never stored or shared. Complete privacy guaranteed.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 sm:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Check Your Grammar in 3 Simple Steps
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Professional grammar checking made easy for everyone
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="bg-white rounded-xl p-8 shadow-lg">
              <div className="bg-emerald-600 w-12 h-12 rounded-full flex items-center justify-center mb-4 text-white text-xl font-bold">
                1
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Paste Your Text</h3>
              <p className="text-gray-600 mb-4">
                Simply paste or type your text in the checker above. Works with essays, emails, reports, or any writing.
              </p>
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <p className="text-sm text-gray-600">Example: Emails, essays, reports, social media posts, business letters</p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="bg-white rounded-xl p-8 shadow-lg">
              <div className="bg-emerald-600 w-12 h-12 rounded-full flex items-center justify-center mb-4 text-white text-xl font-bold">
                2
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Review Errors</h3>
              <p className="text-gray-600 mb-4">
                AI instantly highlights grammar, spelling, and punctuation errors with clear explanations.
              </p>
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <p className="text-sm text-gray-600">See real-time corrections with context and suggestions</p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="bg-white rounded-xl p-8 shadow-lg">
              <div className="bg-emerald-600 w-12 h-12 rounded-full flex items-center justify-center mb-4 text-white text-xl font-bold">
                3
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Apply & Learn</h3>
              <p className="text-gray-600 mb-4">
                Accept corrections with one click and learn from mistakes to improve your writing skills.
              </p>
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <p className="text-sm text-gray-600">Build better writing habits over time</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Use Cases for Philippines */}
      <section className="py-16 sm:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Perfect for Every Filipino
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Whether you're a student, professional, or content creator - we've got you covered
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Students */}
            <div className="bg-gradient-to-br from-blue-50 to-white border border-blue-200 rounded-xl p-6 hover:shadow-xl transition-all">
              <GraduationCap className="w-12 h-12 text-blue-600 mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">Students & Researchers</h3>
              <p className="text-gray-600 mb-4">
                Perfect for essays, thesis papers, research projects, and academic assignments. Ensure your writing meets UP, DLSU, or Ateneo standards.
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Academic essay checking</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Thesis & dissertation review</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Research paper polishing</span>
                </li>
              </ul>
            </div>

            {/* BPO Workers */}
            <div className="bg-gradient-to-br from-emerald-50 to-white border border-emerald-200 rounded-xl p-6 hover:shadow-xl transition-all">
              <MessageSquare className="w-12 h-12 text-emerald-600 mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">BPO Professionals</h3>
              <p className="text-gray-600 mb-4">
                Write flawless customer emails, reports, and communications. Maintain professional standards in every message.
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-emerald-600 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Customer email perfection</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-emerald-600 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Business report accuracy</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-emerald-600 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Professional communication</span>
                </li>
              </ul>
            </div>

            {/* OFWs */}
            <div className="bg-gradient-to-br from-purple-50 to-white border border-purple-200 rounded-xl p-6 hover:shadow-xl transition-all">
              <Send className="w-12 h-12 text-purple-600 mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">OFWs & Remote Workers</h3>
              <p className="text-gray-600 mb-4">
                Communicate confidently with international clients and colleagues. Perfect English every time.
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-purple-600 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Professional job applications</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-purple-600 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Client communication</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-purple-600 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Visa & document letters</span>
                </li>
              </ul>
            </div>

            {/* Business Professionals */}
            <div className="bg-gradient-to-br from-orange-50 to-white border border-orange-200 rounded-xl p-6 hover:shadow-xl transition-all">
              <Briefcase className="w-12 h-12 text-orange-600 mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">Business Professionals</h3>
              <p className="text-gray-600 mb-4">
                Create polished business documents, proposals, and presentations that impress clients and partners.
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-orange-600 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Business proposals & reports</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-orange-600 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Professional presentations</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-orange-600 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Executive communications</span>
                </li>
              </ul>
            </div>

            {/* Content Creators */}
            <div className="bg-gradient-to-br from-pink-50 to-white border border-pink-200 rounded-xl p-6 hover:shadow-xl transition-all">
              <FileText className="w-12 h-12 text-pink-600 mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">Content Creators & Bloggers</h3>
              <p className="text-gray-600 mb-4">
                Polish your blog posts, social media content, and articles. Professional writing builds audience trust.
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-pink-600 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Blog post perfection</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-pink-600 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Social media captions</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-pink-600 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Newsletter writing</span>
                </li>
              </ul>
            </div>

            {/* Freelancers */}
            <div className="bg-gradient-to-br from-teal-50 to-white border border-teal-200 rounded-xl p-6 hover:shadow-xl transition-all">
              <Users className="w-12 h-12 text-teal-600 mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">Freelancers & Entrepreneurs</h3>
              <p className="text-gray-600 mb-4">
                Deliver error-free work to clients. Professional writing wins more projects and builds reputation.
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-teal-600 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Client deliverables</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-teal-600 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Project proposals</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-teal-600 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Marketing copy</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Common Filipino-English Errors Examples */}
      <section className="py-16 sm:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Common Mistakes We Catch
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Our AI understands Filipino-English patterns and catches these typical errors instantly
            </p>
          </div>

          <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Error Type</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Wrong</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Correct</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">Subject-Verb Agreement</td>
                  <td className="px-6 py-4 text-sm text-red-600">The students was late.</td>
                  <td className="px-6 py-4 text-sm text-green-600">The students were late.</td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">Preposition Use</td>
                  <td className="px-6 py-4 text-sm text-red-600">I am agree with you.</td>
                  <td className="px-6 py-4 text-sm text-green-600">I agree with you.</td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">Article Usage</td>
                  <td className="px-6 py-4 text-sm text-red-600">I go to school everyday.</td>
                  <td className="px-6 py-4 text-sm text-green-600">I go to school every day.</td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">Verb Tense</td>
                  <td className="px-6 py-4 text-sm text-red-600">I will went there yesterday.</td>
                  <td className="px-6 py-4 text-sm text-green-600">I went there yesterday.</td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">Word Confusion</td>
                  <td className="px-6 py-4 text-sm text-red-600">Your going to be late.</td>
                  <td className="px-6 py-4 text-sm text-green-600">You're going to be late.</td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">Redundancy</td>
                  <td className="px-6 py-4 text-sm text-red-600">Please revert back to me.</td>
                  <td className="px-6 py-4 text-sm text-green-600">Please revert to me.</td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">Comma Splice</td>
                  <td className="px-6 py-4 text-sm text-red-600">I like coffee, I drink it daily.</td>
                  <td className="px-6 py-4 text-sm text-green-600">I like coffee; I drink it daily.</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="max-w-4xl mx-auto mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
            <p className="text-gray-700">
              <span className="font-semibold">Pro tip:</span> Our grammar checker goes beyond these examples - it checks context, tone, clarity, and provides suggestions to make your writing more professional and natural.
            </p>
          </div>
        </div>
      </section>

      {/* Features Deep Dive */}
      <section className="py-16 sm:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Everything You Need in One Grammar Checker
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Comprehensive writing assistance beyond basic grammar checking
            </p>
          </div>

          <div className="space-y-16">
            {/* Feature 1: Grammar Correction */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Perfect Your Grammar</h3>
                <p className="text-gray-600 mb-6">
                  Confused about "affect" vs "effect"? Unsure about "their", "there", or "they're"? Our AI catches these tricky grammar mistakes that even native speakers struggle with.
                </p>
                <p className="text-gray-600 mb-6">
                  The grammar checker understands context and provides clear explanations, so you not only fix errors but learn to avoid them in the future. Perfect for Filipino speakers mastering English grammar rules.
                </p>
                <Link href="/signup" className="text-emerald-600 font-semibold hover:text-emerald-700 inline-flex items-center">
                  Start checking grammar <ChevronRight className="w-4 h-4 ml-1" />
                </Link>
              </div>
              <div className="bg-gray-50 rounded-xl p-8 border border-gray-200">
                <div className="space-y-4">
                  <div className="bg-white p-4 rounded-lg border border-red-200">
                    <p className="text-sm text-gray-600 mb-2">Incorrect:</p>
                    <p className="text-gray-900">The report <span className="text-red-600 line-through">affect</span> our decision.</p>
                  </div>
                  <div className="bg-white p-4 rounded-lg border border-green-200">
                    <p className="text-sm text-gray-600 mb-2">Correct:</p>
                    <p className="text-gray-900">The report <span className="text-green-600 font-semibold">affects</span> our decision.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Feature 2: Spelling Correction */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div className="order-2 lg:order-1 bg-gray-50 rounded-xl p-8 border border-gray-200">
                <div className="space-y-4">
                  <div className="bg-white p-4 rounded-lg border border-red-200">
                    <p className="text-sm text-gray-600 mb-2">Misspelled:</p>
                    <p className="text-gray-900">I <span className="text-red-600 line-through">recieved</span> your email.</p>
                  </div>
                  <div className="bg-white p-4 rounded-lg border border-green-200">
                    <p className="text-sm text-gray-600 mb-2">Correct:</p>
                    <p className="text-gray-900">I <span className="text-green-600 font-semibold">received</span> your email.</p>
                  </div>
                </div>
              </div>
              <div className="order-1 lg:order-2">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Catch Every Spelling Error</h3>
                <p className="text-gray-600 mb-6">
                  Especially good at catching homophones (words that sound the same but are spelled differently). Our AI spelling checker understands context to suggest the right word.
                </p>
                <p className="text-gray-600 mb-6">
                  Unlike basic spell checkers, ours catches Filipino-English hybrid words and common Taglish spelling mistakes. Perfect for both formal and informal writing.
                </p>
                <Link href="/signup" className="text-emerald-600 font-semibold hover:text-emerald-700 inline-flex items-center">
                  Fix spelling errors <ChevronRight className="w-4 h-4 ml-1" />
                </Link>
              </div>
            </div>

            {/* Feature 3: Punctuation */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Master Punctuation Rules</h3>
                <p className="text-gray-600 mb-6">
                  Comma splices, missing semicolons, incorrect apostrophes - our punctuation checker catches them all. Stop second-guessing where to put that comma.
                </p>
                <p className="text-gray-600 mb-6">
                  Get clear explanations for complex punctuation rules. Learn when to use commas, semicolons, colons, and dashes correctly in professional writing.
                </p>
                <Link href="/signup" className="text-emerald-600 font-semibold hover:text-emerald-700 inline-flex items-center">
                  Check punctuation <ChevronRight className="w-4 h-4 ml-1" />
                </Link>
              </div>
              <div className="bg-gray-50 rounded-xl p-8 border border-gray-200">
                <div className="space-y-4">
                  <div className="bg-white p-4 rounded-lg border border-red-200">
                    <p className="text-sm text-gray-600 mb-2">Incorrect:</p>
                    <p className="text-gray-900">Its a beautiful day<span className="text-red-600">.</span></p>
                  </div>
                  <div className="bg-white p-4 rounded-lg border border-green-200">
                    <p className="text-sm text-gray-600 mb-2">Correct:</p>
                    <p className="text-gray-900"><span className="text-green-600 font-semibold">It's</span> a beautiful day<span className="text-green-600 font-semibold">!</span></p>
                  </div>
                </div>
              </div>
            </div>

            {/* Feature 4: All-in-One */}
            <div className="bg-gradient-to-br from-emerald-50 to-blue-50 rounded-2xl p-8 lg:p-12 border border-emerald-200">
              <div className="max-w-3xl mx-auto text-center">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Fix Everything with One Click</h3>
                <p className="text-gray-600 mb-6">
                  Why juggle multiple tools when you can have grammar checking, spell checking, and punctuation correction all in one place? Our AI analyzes your entire text simultaneously and provides comprehensive feedback.
                </p>
                <p className="text-gray-600 mb-8">
                  Save time, reduce hassle, and improve your writing faster with our all-in-one grammar checker designed for Filipino users.
                </p>
                <Link
                  href="/signup"
                  className="inline-flex items-center bg-emerald-600 text-white px-8 py-4 rounded-lg hover:bg-emerald-700 transition-all text-lg font-semibold shadow-lg hover:shadow-xl"
                >
                  Try It Free Now
                  <ChevronRight className="ml-2 w-5 h-5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 sm:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              What Filipino Users Say
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Trusted by thousands of students, professionals, and writers across the Philippines
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Testimonial 1 */}
            <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-700 mb-4">
                "As a BPO agent, I need to write perfect emails to clients. This grammar checker catches mistakes I would have missed. Game changer for my job!"
              </p>
              <div className="flex items-center">
                <div className="w-10 h-10 bg-emerald-600 rounded-full flex items-center justify-center text-white font-bold mr-3">
                  M
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Maria Santos</p>
                  <p className="text-sm text-gray-600">Customer Support, Concentrix</p>
                </div>
              </div>
            </div>

            {/* Testimonial 2 */}
            <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-700 mb-4">
                "I'm a UP student and this helped me improve my thesis paper so much. It catches errors and explains why - so I learn and don't repeat mistakes. Highly recommended!"
              </p>
              <div className="flex items-center">
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold mr-3">
                  J
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Juan Reyes</p>
                  <p className="text-sm text-gray-600">Student, UP Diliman</p>
                </div>
              </div>
            </div>

            {/* Testimonial 3 */}
            <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-700 mb-4">
                "I'm an OFW in Dubai. This tool helps me write professional emails to my boss and colleagues. My English has improved so much thanks to the explanations!"
              </p>
              <div className="flex items-center">
                <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold mr-3">
                  A
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Angela Cruz</p>
                  <p className="text-sm text-gray-600">OFW, Dubai</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 sm:py-24 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-lg text-gray-600">
              Everything you need to know about our grammar checker
            </p>
          </div>

          <div className="space-y-4">
            {/* FAQ 1 */}
            <details className="group bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
              <summary className="cursor-pointer p-6 font-semibold text-gray-900 flex justify-between items-center hover:bg-gray-100 transition-colors">
                <span>Is the grammar checker really free?</span>
                <ChevronRight className="w-5 h-5 text-gray-400 group-open:rotate-90 transition-transform" />
              </summary>
              <div className="px-6 pb-6 text-gray-600">
                Yes, completely free! You can check unlimited text with no word limits, no sign-up requirements, and no hidden fees. We believe grammar checking should be accessible to all Filipino users. While we may offer premium features in the future, the core grammar checking will always remain 100% free.
              </div>
            </details>

            {/* FAQ 2 */}
            <details className="group bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
              <summary className="cursor-pointer p-6 font-semibold text-gray-900 flex justify-between items-center hover:bg-gray-100 transition-colors">
                <span>Does it work for Tagalog and Filipino-English?</span>
                <ChevronRight className="w-5 h-5 text-gray-400 group-open:rotate-90 transition-transform" />
              </summary>
              <div className="px-6 pb-6 text-gray-600">
                Yes! Our AI is specifically trained to understand Filipino-English patterns, common Taglish expressions, and mistakes that Filipino speakers typically make. It can check pure English text, Filipino/Tagalog text, and mixed Taglish content. The checker understands the context and provides culturally-relevant suggestions.
              </div>
            </details>

            {/* FAQ 3 */}
            <details className="group bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
              <summary className="cursor-pointer p-6 font-semibold text-gray-900 flex justify-between items-center hover:bg-gray-100 transition-colors">
                <span>How accurate is the grammar checker?</span>
                <ChevronRight className="w-5 h-5 text-gray-400 group-open:rotate-90 transition-transform" />
              </summary>
              <div className="px-6 pb-6 text-gray-600">
                Our AI-powered grammar checker has high accuracy rates, catching 95%+ of common grammar, spelling, and punctuation errors. It uses advanced language models that understand context, not just rules. However, no tool is 100% perfect - we always recommend reviewing suggestions and using your judgment, especially for creative or technical writing.
              </div>
            </details>

            {/* FAQ 4 */}
            <details className="group bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
              <summary className="cursor-pointer p-6 font-semibold text-gray-900 flex justify-between items-center hover:bg-gray-100 transition-colors">
                <span>Can I use this for academic papers and thesis?</span>
                <ChevronRight className="w-5 h-5 text-gray-400 group-open:rotate-90 transition-transform" />
              </summary>
              <div className="px-6 pb-6 text-gray-600">
                Absolutely! Many students from UP, Ateneo, DLSU, and other Philippine universities use our grammar checker for essays, research papers, and thesis work. It helps ensure your academic writing meets professional standards. However, always follow your institution's academic integrity policies and cite any AI assistance if required.
              </div>
            </details>

            {/* FAQ 5 */}
            <details className="group bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
              <summary className="cursor-pointer p-6 font-semibold text-gray-900 flex justify-between items-center hover:bg-gray-100 transition-colors">
                <span>Is my text stored or shared when I use the checker?</span>
                <ChevronRight className="w-5 h-5 text-gray-400 group-open:rotate-90 transition-transform" />
              </summary>
              <div className="px-6 pb-6 text-gray-600">
                No, your privacy is guaranteed. Your text is processed securely and is not stored on our servers. We don't save, share, or use your content for any purpose. Each grammar check is completely private and confidential. You can safely check sensitive documents, confidential emails, or personal writing without worry.
              </div>
            </details>

            {/* FAQ 6 */}
            <details className="group bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
              <summary className="cursor-pointer p-6 font-semibold text-gray-900 flex justify-between items-center hover:bg-gray-100 transition-colors">
                <span>What makes this better than other grammar checkers?</span>
                <ChevronRight className="w-5 h-5 text-gray-400 group-open:rotate-90 transition-transform" />
              </summary>
              <div className="px-6 pb-6 text-gray-600">
                Unlike generic tools, we're built specifically for Filipino users. Our AI understands Filipino-English patterns, common mistakes by Filipino speakers, and Taglish expressions. It's 100% free with no word limits (unlike Grammarly's free tier). Plus, it provides clear explanations so you learn while fixing errors. And it's designed with Philippine internet speeds in mind - fast and lightweight.
              </div>
            </details>

            {/* FAQ 7 */}
            <details className="group bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
              <summary className="cursor-pointer p-6 font-semibold text-gray-900 flex justify-between items-center hover:bg-gray-100 transition-colors">
                <span>Can I use this for BPO work and professional emails?</span>
                <ChevronRight className="w-5 h-5 text-gray-400 group-open:rotate-90 transition-transform" />
              </summary>
              <div className="px-6 pb-6 text-gray-600">
                Yes, perfect for BPO work! Many call center and customer support agents use our tool to ensure their emails, reports, and communications are error-free. It helps maintain professional standards and catches mistakes before sending to clients or supervisors. Check emails, reports, chat messages, and any business communication.
              </div>
            </details>

            {/* FAQ 8 */}
            <details className="group bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
              <summary className="cursor-pointer p-6 font-semibold text-gray-900 flex justify-between items-center hover:bg-gray-100 transition-colors">
                <span>Does it check for plagiarism too?</span>
                <ChevronRight className="w-5 h-5 text-gray-400 group-open:rotate-90 transition-transform" />
              </summary>
              <div className="px-6 pb-6 text-gray-600">
                The grammar checker focuses on grammar, spelling, and punctuation. For plagiarism checking, we have a separate dedicated tool. You can use both tools together for comprehensive writing quality checks. Check grammar first, then run plagiarism check to ensure your work is both well-written and original.
              </div>
            </details>

            {/* FAQ 9 */}
            <details className="group bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
              <summary className="cursor-pointer p-6 font-semibold text-gray-900 flex justify-between items-center hover:bg-gray-100 transition-colors">
                <span>How do I get the most out of the grammar checker?</span>
                <ChevronRight className="w-5 h-5 text-gray-400 group-open:rotate-90 transition-transform" />
              </summary>
              <div className="px-6 pb-6 text-gray-600">
                1) Paste your complete text for better context analysis. 2) Read the explanations to understand why something is wrong. 3) Use it regularly to learn patterns and improve your writing skills. 4) Check important documents multiple times. 5) Combine with plagiarism checker for academic work. 6) Save frequently-made mistakes to avoid them in the future.
              </div>
            </details>

            {/* FAQ 10 */}
            <details className="group bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
              <summary className="cursor-pointer p-6 font-semibold text-gray-900 flex justify-between items-center hover:bg-gray-100 transition-colors">
                <span>Can I use this on my phone or tablet?</span>
                <ChevronRight className="w-5 h-5 text-gray-400 group-open:rotate-90 transition-transform" />
              </summary>
              <div className="px-6 pb-6 text-gray-600">
                Yes! Our grammar checker is fully responsive and works great on mobile phones and tablets. Whether you're using Android or iOS, you can check grammar on the go. The interface adapts to your screen size for easy mobile use. Perfect for checking texts, emails, and documents anywhere, anytime.
              </div>
            </details>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-24 bg-gradient-to-r from-emerald-600 to-teal-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
            Start Writing Better Today
          </h2>
          <p className="text-xl text-emerald-50 mb-8">
            Join thousands of Filipino students and professionals using our free grammar checker
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/signup"
              className="w-full sm:w-auto bg-white text-emerald-600 px-8 py-4 rounded-lg hover:bg-gray-100 transition-all text-lg font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              Get Started Free
            </Link>
            <Link
              href="#"
              onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              className="w-full sm:w-auto border-2 border-white text-white px-8 py-4 rounded-lg hover:bg-white hover:text-emerald-600 transition-all text-lg font-semibold"
            >
              Try It Now
            </Link>
          </div>
          <p className="mt-6 text-sm text-emerald-50">
            No credit card • No installation • 100% Free Forever
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
                Free AI-powered grammar checker and writing tools designed for Filipino users.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-white mb-4">Tools</h3>
              <ul className="space-y-2 text-sm">
                <li><Link href="/grammar-checker" className="hover:text-emerald-500 transition-colors">Grammar Checker</Link></li>
                <li><Link href="/signup" className="hover:text-emerald-500 transition-colors">Plagiarism Checker</Link></li>
                <li><Link href="/signup" className="hover:text-emerald-500 transition-colors">AI Detector</Link></li>
                <li><Link href="/signup" className="hover:text-emerald-500 transition-colors">Translator</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-white mb-4">Resources</h3>
              <ul className="space-y-2 text-sm">
                <li><Link href="/signup" className="hover:text-emerald-500 transition-colors">Grammar Guide</Link></li>
                <li><Link href="/signup" className="hover:text-emerald-500 transition-colors">Writing Tips</Link></li>
                <li><Link href="/signup" className="hover:text-emerald-500 transition-colors">Blog</Link></li>
                <li><Link href="/signup" className="hover:text-emerald-500 transition-colors">Help Center</Link></li>
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
          </div>

          <div className="border-t border-gray-800 pt-8 text-center text-sm text-gray-400">
            <p>2024 ChatGPT Philippines. All rights reserved. Made with love for Filipinos.</p>
            <p className="mt-2">Powered by advanced AI technology</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
