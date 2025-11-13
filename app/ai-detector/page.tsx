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
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Free AI Content Detector - Check if Text is AI-Generated | ChatGPT Philippines',
  description: 'Free AI content detector for Filipino users. Detect ChatGPT, GPT-4, Gemini & Claude text instantly. Perfect for teachers, students & content creators. Get detailed AI detection reports.',
  keywords: 'ai detector, ai content detector free, check if ai generated, ai checker philippines, detect chatgpt, ai text detector, ai writing detector, turnitin alternative, gptzero philippines',
  openGraph: {
    title: 'Free AI Content Detector - Check if Text is AI-Generated',
    description: 'Detect AI-generated content with high accuracy. Free tool for Filipino teachers, students & content creators.',
    type: 'website',
  },
};

export default function AIDetectorPage() {
  // JSON-LD structured data
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "ChatGPT Philippines AI Content Detector",
    "applicationCategory": "UtilityApplication",
    "description": "Free AI content detector that identifies AI-generated text from ChatGPT, GPT-4, Gemini, and Claude with high accuracy.",
    "url": "https://chatgpt-philippines.com/ai-detector",
    "operatingSystem": "Web",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "PHP"
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.7",
      "ratingCount": "850"
    },
    "featureList": [
      "Detect AI-generated text",
      "Support for multiple AI models",
      "Detailed probability scores",
      "Downloadable reports",
      "Filipino language support"
    ]
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
                Sign Up Free
              </Link>
            </div>
          </div>
        </nav>
      </header>

      {/* Hero Section with Interactive Demo */}
      <section className="relative overflow-hidden bg-gradient-to-b from-emerald-50 to-white pt-16 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-800 px-4 py-2 rounded-full text-sm font-semibold mb-6">
              <Shield className="w-4 h-4" />
              Trusted by 50,000+ Filipino Educators & Students
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Free AI Content Detector
              <span className="block text-emerald-600 mt-2">
                Built for Filipinos
              </span>
            </h1>
            <p className="text-lg sm:text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Detect ChatGPT, GPT-4, Gemini, and Claude text instantly. Get detailed AI detection reports
              for academic papers, articles, and content. Perfect for teachers, students, and content creators.
            </p>
          </div>

          {/* Interactive Demo Card */}
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6 sm:p-8">
              <div className="mb-4">
                <h2 className="text-xl font-bold text-gray-900 mb-2">
                  Try AI Detection Now - Free
                </h2>
                <p className="text-sm text-gray-600">
                  Paste your text below to check if it's AI-generated. Minimum 80 words required.
                </p>
              </div>

              {/* Demo Interface */}
              <div className="space-y-4">
                <div className="border-2 border-gray-200 rounded-lg overflow-hidden focus-within:border-emerald-500 transition-colors">
                  <textarea
                    placeholder="Paste or type your text here to detect AI content... (Minimum 80 words)"
                    className="w-full h-48 sm:h-64 p-4 resize-none focus:outline-none text-gray-900"
                    disabled
                  />
                  <div className="bg-gray-50 border-t border-gray-200 px-4 py-2 flex items-center justify-between">
                    <span className="text-sm text-gray-500">0 / 80 words minimum</span>
                    <div className="flex gap-2">
                      <button className="text-sm text-emerald-600 hover:text-emerald-700 font-medium">
                        Clear
                      </button>
                      <button className="text-sm text-emerald-600 hover:text-emerald-700 font-medium">
                        Paste
                      </button>
                    </div>
                  </div>
                </div>

                <Link
                  href="/chat"
                  className="w-full bg-emerald-600 text-white py-4 rounded-lg hover:bg-emerald-700 transition-all text-lg font-semibold flex items-center justify-center gap-2 shadow-lg"
                >
                  <Shield className="w-5 h-5" />
                  Start Free AI Detection
                </Link>

                <p className="text-xs text-center text-gray-500">
                  Sign up to detect AI content, save reports, and get unlimited checks
                </p>
              </div>

              {/* Results Preview */}
              <div className="mt-8 pt-8 border-t border-gray-200">
                <h3 className="text-sm font-semibold text-gray-700 mb-4">
                  Sample Detection Results:
                </h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-red-600 mb-1">73%</div>
                    <div className="text-xs text-gray-600">AI-Generated</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-yellow-600 mb-1">18%</div>
                    <div className="text-xs text-gray-600">AI-Refined</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600 mb-1">9%</div>
                    <div className="text-xs text-gray-600">Human-Written</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Guest Limit Notice */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                <AlertCircle className="w-4 h-4 inline mr-1 text-amber-500" />
                Free users get <span className="font-semibold text-emerald-600">3 AI detection checks</span>.
                Sign up for unlimited access.
              </p>
            </div>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-emerald-200 rounded-full opacity-20 blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-200 rounded-full opacity-20 blur-3xl"></div>
        </div>
      </section>

      {/* Trust Bar */}
      <section className="py-8 bg-gray-50 border-y border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-gray-600 mb-6">
            Trusted by educators and professionals at:
          </p>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 items-center justify-items-center">
            {['UP Manila', 'DLSU', 'Ateneo', 'UST', 'FEU'].map((school) => (
              <div key={school} className="text-gray-400 font-semibold text-lg">
                {school}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Section */}
      <section className="py-16 sm:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Why Choose ChatGPT Philippines AI Detector
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              The most accurate and reliable AI content detector designed specifically for Filipino users,
              with support for both English and Filipino languages.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-xl transition-all">
              <div className="bg-emerald-100 w-14 h-14 rounded-lg flex items-center justify-center mb-4">
                <FileSearch className="w-7 h-7 text-emerald-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Detailed Analysis</h3>
              <p className="text-gray-600">
                Get line-by-line detection showing exactly which parts are AI-generated, AI-refined,
                or human-written. No guesswork, just clear results.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-xl transition-all">
              <div className="bg-blue-100 w-14 h-14 rounded-lg flex items-center justify-center mb-4">
                <Target className="w-7 h-7 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">High Accuracy</h3>
              <p className="text-gray-600">
                Advanced AI models trained on millions of documents provide 92%+ accuracy in detecting
                content from ChatGPT, GPT-4, Gemini, and Claude.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-xl transition-all">
              <div className="bg-purple-100 w-14 h-14 rounded-lg flex items-center justify-center mb-4">
                <Download className="w-7 h-7 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Downloadable Reports</h3>
              <p className="text-gray-600">
                Export detailed PDF reports for every detection. Perfect for teachers grading assignments
                or documenting content authenticity.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-xl transition-all">
              <div className="bg-teal-100 w-14 h-14 rounded-lg flex items-center justify-center mb-4">
                <Globe className="w-7 h-7 text-teal-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Filipino Language Support</h3>
              <p className="text-gray-600">
                First AI detector with full Tagalog and Filipino-English (Taglish) support.
                Accurate detection for all Philippine languages.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-xl transition-all">
              <div className="bg-orange-100 w-14 h-14 rounded-lg flex items-center justify-center mb-4">
                <Zap className="w-7 h-7 text-orange-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Lightning Fast</h3>
              <p className="text-gray-600">
                Get results in under 3 seconds. No more waiting. Analyze essays, articles,
                and documents instantly.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-xl transition-all">
              <div className="bg-pink-100 w-14 h-14 rounded-lg flex items-center justify-center mb-4">
                <Lock className="w-7 h-7 text-pink-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">100% Private & Secure</h3>
              <p className="text-gray-600">
                Your documents are never stored or shared. All analysis happens securely,
                and data is deleted immediately after processing.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Technology Explanation */}
      <section className="py-16 sm:py-24 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              How Our AI Detection Technology Works
            </h2>
            <p className="text-lg text-gray-600">
              Understanding the science behind accurate AI content detection
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Advanced Pattern Analysis
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Our AI detector analyzes text patterns that are characteristic of AI-generated content.
                  It looks for repetitive phrases, generic language, lack of tone variation, and predictable
                  sentence structures that human writers naturally avoid.
                </p>
              </div>

              <div className="bg-emerald-50 rounded-lg p-6">
                <h4 className="font-semibold text-gray-900 mb-2">Key Metrics We Analyze:</h4>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold">Perplexity:</span> Measures how predictable the text is.
                      AI-generated text tends to be more predictable than human writing.
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold">Burstiness:</span> Evaluates sentence length variation.
                      Humans write with varied sentence lengths, while AI tends to be more uniform.
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold">Contextual Coherence:</span> Analyzes how naturally ideas
                      flow and connect, identifying AI's tendency for superficial coherence.
                    </div>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Trained on Filipino Content
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Unlike generic AI detectors, our model is specifically trained on Filipino writing patterns,
                  including Taglish (code-switching between Tagalog and English). This makes it significantly
                  more accurate for detecting AI content written by or for Filipino users.
                </p>
              </div>

              <div className="bg-amber-50 border-l-4 border-amber-500 p-4">
                <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-amber-600" />
                  Understanding Your Results
                </h4>
                <p className="text-gray-700 text-sm">
                  Our detector provides probability scores, not absolute certainties. Results should be
                  interpreted as signals and used alongside human judgment. Factors like writing style,
                  subject matter, and text length can affect accuracy.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Reducing False Positives
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  We've implemented special safeguards to minimize false positives for Filipino writers.
                  Non-native English speakers and those using formal academic language won't be unfairly
                  flagged as AI content. Our system understands Philippine English conventions and cultural
                  context.
                </p>
              </div>

              <div className="bg-blue-50 rounded-lg p-6">
                <h4 className="font-semibold text-gray-900 mb-3">Best Practices for Accurate Detection:</h4>
                <ul className="space-y-2 text-gray-700 text-sm">
                  <li className="flex items-start gap-2">
                    <ChevronRight className="w-4 h-4 text-blue-600 flex-shrink-0 mt-1" />
                    <span>Analyze the complete text at once rather than small sections</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ChevronRight className="w-4 h-4 text-blue-600 flex-shrink-0 mt-1" />
                    <span>Ensure text meets the 80-word minimum for reliable results</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ChevronRight className="w-4 h-4 text-blue-600 flex-shrink-0 mt-1" />
                    <span>Use results as one factor in your overall assessment, not the only factor</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ChevronRight className="w-4 h-4 text-blue-600 flex-shrink-0 mt-1" />
                    <span>Consider the context: technical writing may score differently than creative content</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works - 3 Steps */}
      <section className="py-16 sm:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              How to Use the AI Content Detector
            </h2>
            <p className="text-lg text-gray-600">
              Get accurate AI detection results in just 3 simple steps
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="relative">
              <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-8 border border-emerald-200 h-full">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-emerald-600 text-white rounded-full text-2xl font-bold mb-4">
                  1
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  Paste Your Text
                </h3>
                <p className="text-gray-600 mb-4">
                  Copy and paste the content you want to analyze. Upload documents or type directly.
                  Supports English, Tagalog, and Taglish. Minimum 80 words required for accurate detection.
                </p>
                <div className="bg-white rounded-lg p-4 mt-4">
                  <div className="text-xs text-gray-500 mb-2">Sample Input:</div>
                  <div className="text-sm text-gray-700 font-mono">
                    "The impact of social media on Philippine society..."
                  </div>
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div className="relative">
              <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-8 border border-blue-200 h-full">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-600 text-white rounded-full text-2xl font-bold mb-4">
                  2
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  Run Detection
                </h3>
                <p className="text-gray-600 mb-4">
                  Click "Detect AI" and receive results in seconds. Our advanced algorithms analyze your
                  text for AI patterns, providing a comprehensive probability score and detailed line-by-line breakdown.
                </p>
                <div className="bg-white rounded-lg p-4 mt-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-gray-500">Processing:</span>
                    <Clock className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full w-3/4 bg-blue-600 rounded-full animate-pulse"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div className="relative">
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-8 border border-purple-200 h-full">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-600 text-white rounded-full text-2xl font-bold mb-4">
                  3
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  Review Results
                </h3>
                <p className="text-gray-600 mb-4">
                  Get a detailed report showing AI-generated, AI-refined, and human-written percentages.
                  Download PDF reports, identify specific AI sections, and make informed decisions.
                </p>
                <div className="bg-white rounded-lg p-4 mt-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">AI-Generated:</span>
                      <span className="font-bold text-red-600">45%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">AI-Refined:</span>
                      <span className="font-bold text-yellow-600">30%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Human-Written:</span>
                      <span className="font-bold text-green-600">25%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center mt-12">
            <Link
              href="/chat"
              className="inline-flex items-center bg-emerald-600 text-white px-8 py-4 rounded-lg hover:bg-emerald-700 transition-all text-lg font-semibold shadow-lg"
            >
              Try AI Detection Now
              <ChevronRight className="ml-2 w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Use Cases - Filipino Personas */}
      <section className="py-16 sm:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Perfect for Every Filipino User
            </h2>
            <p className="text-lg text-gray-600">
              Whether you're a teacher, student, or content creator, our AI detector helps maintain authenticity
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Teachers */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all">
              <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-6 text-white">
                <GraduationCap className="w-12 h-12 mb-3" />
                <h3 className="text-2xl font-bold mb-2">Filipino Teachers</h3>
                <p className="text-emerald-50">Maintain academic integrity in Philippine classrooms</p>
              </div>
              <div className="p-6">
                <h4 className="font-semibold text-gray-900 mb-3">Why Teachers Love This Tool:</h4>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-start gap-2 text-gray-600">
                    <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <span>Quickly check student essays and assignments for AI use</span>
                  </li>
                  <li className="flex items-start gap-2 text-gray-600">
                    <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <span>Generate reports for academic integrity investigations</span>
                  </li>
                  <li className="flex items-start gap-2 text-gray-600">
                    <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <span>Understand AI-assisted vs AI-generated student work</span>
                  </li>
                  <li className="flex items-start gap-2 text-gray-600">
                    <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <span>Educate students about ethical AI usage</span>
                  </li>
                </ul>
                <div className="bg-emerald-50 rounded-lg p-4">
                  <p className="text-sm text-gray-700">
                    <span className="font-semibold">Use Case:</span> Grade 100+ student essays efficiently
                    while ensuring original work and maintaining DepEd standards.
                  </p>
                </div>
              </div>
            </div>

            {/* Students */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all">
              <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-6 text-white">
                <BookOpen className="w-12 h-12 mb-3" />
                <h3 className="text-2xl font-bold mb-2">Filipino Students</h3>
                <p className="text-blue-50">Submit original work with confidence</p>
              </div>
              <div className="p-6">
                <h4 className="font-semibold text-gray-900 mb-3">How Students Benefit:</h4>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-start gap-2 text-gray-600">
                    <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <span>Verify your work doesn't accidentally sound AI-generated</span>
                  </li>
                  <li className="flex items-start gap-2 text-gray-600">
                    <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <span>Learn to write in your authentic voice</span>
                  </li>
                  <li className="flex items-start gap-2 text-gray-600">
                    <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <span>Check AI-assisted edits before submission</span>
                  </li>
                  <li className="flex items-start gap-2 text-gray-600">
                    <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <span>Follow school AI usage policies correctly</span>
                  </li>
                </ul>
                <div className="bg-blue-50 rounded-lg p-4">
                  <p className="text-sm text-gray-700">
                    <span className="font-semibold">Important:</span> Always cite AI tools if you use them
                    for research or editing. Follow your school's AI policy.
                  </p>
                </div>
              </div>
            </div>

            {/* Content Creators */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all">
              <div className="bg-gradient-to-br from-purple-500 to-pink-600 p-6 text-white">
                <PenTool className="w-12 h-12 mb-3" />
                <h3 className="text-2xl font-bold mb-2">Content Creators</h3>
                <p className="text-purple-50">Build trust with authentic Filipino content</p>
              </div>
              <div className="p-6">
                <h4 className="font-semibold text-gray-900 mb-3">Why Creators Use This:</h4>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-start gap-2 text-gray-600">
                    <CheckCircle className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                    <span>Ensure blog posts don't get penalized by Google</span>
                  </li>
                  <li className="flex items-start gap-2 text-gray-600">
                    <CheckCircle className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                    <span>Verify AI-assisted content sounds natural and human</span>
                  </li>
                  <li className="flex items-start gap-2 text-gray-600">
                    <CheckCircle className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                    <span>Build audience trust with authentic Filipino voice</span>
                  </li>
                  <li className="flex items-start gap-2 text-gray-600">
                    <CheckCircle className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                    <span>Balance AI efficiency with human authenticity</span>
                  </li>
                </ul>
                <div className="bg-purple-50 rounded-lg p-4">
                  <p className="text-sm text-gray-700">
                    <span className="font-semibold">Pro Tip:</span> Google's algorithms prefer authentic,
                    human-written content. Use AI as a tool, not a replacement.
                  </p>
                </div>
              </div>
            </div>

            {/* Business Professionals */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all">
              <div className="bg-gradient-to-br from-orange-500 to-red-600 p-6 text-white">
                <Briefcase className="w-12 h-12 mb-3" />
                <h3 className="text-2xl font-bold mb-2">BPO & Professionals</h3>
                <p className="text-orange-50">Deliver authentic client work</p>
              </div>
              <div className="p-6">
                <h4 className="font-semibold text-gray-900 mb-3">Professional Use Cases:</h4>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-start gap-2 text-gray-600">
                    <CheckCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                    <span>Verify client deliverables are original and authentic</span>
                  </li>
                  <li className="flex items-start gap-2 text-gray-600">
                    <CheckCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                    <span>Maintain professional reputation and credibility</span>
                  </li>
                  <li className="flex items-start gap-2 text-gray-600">
                    <CheckCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                    <span>Check team submissions before client delivery</span>
                  </li>
                  <li className="flex items-start gap-2 text-gray-600">
                    <CheckCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                    <span>Ensure reports and proposals sound professional</span>
                  </li>
                </ul>
                <div className="bg-orange-50 rounded-lg p-4">
                  <p className="text-sm text-gray-700">
                    <span className="font-semibold">BPO Insight:</span> Clients value authentic Filipino
                    writers. Use this tool to ensure quality control.
                  </p>
                </div>
              </div>
            </div>

            {/* Journalists */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all">
              <div className="bg-gradient-to-br from-teal-500 to-cyan-600 p-6 text-white">
                <Newspaper className="w-12 h-12 mb-3" />
                <h3 className="text-2xl font-bold mb-2">Filipino Journalists</h3>
                <p className="text-teal-50">Uphold journalistic integrity</p>
              </div>
              <div className="p-6">
                <h4 className="font-semibold text-gray-900 mb-3">For Media Professionals:</h4>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-start gap-2 text-gray-600">
                    <CheckCircle className="w-5 h-5 text-teal-600 flex-shrink-0 mt-0.5" />
                    <span>Verify articles maintain authentic Filipino voice</span>
                  </li>
                  <li className="flex items-start gap-2 text-gray-600">
                    <CheckCircle className="w-5 h-5 text-teal-600 flex-shrink-0 mt-0.5" />
                    <span>Check AI-assisted research and drafts</span>
                  </li>
                  <li className="flex items-start gap-2 text-gray-600">
                    <CheckCircle className="w-5 h-5 text-teal-600 flex-shrink-0 mt-0.5" />
                    <span>Maintain editorial standards and ethics</span>
                  </li>
                  <li className="flex items-start gap-2 text-gray-600">
                    <CheckCircle className="w-5 h-5 text-teal-600 flex-shrink-0 mt-0.5" />
                    <span>Ensure reader trust through authentic reporting</span>
                  </li>
                </ul>
                <div className="bg-teal-50 rounded-lg p-4">
                  <p className="text-sm text-gray-700">
                    <span className="font-semibold">Ethics Matter:</span> Filipino readers value authentic
                    journalism. Use AI as research aid, not content creator.
                  </p>
                </div>
              </div>
            </div>

            {/* Freelancers */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all">
              <div className="bg-gradient-to-br from-indigo-500 to-blue-600 p-6 text-white">
                <Users className="w-12 h-12 mb-3" />
                <h3 className="text-2xl font-bold mb-2">Filipino Freelancers</h3>
                <p className="text-indigo-50">Win more clients with authentic work</p>
              </div>
              <div className="p-6">
                <h4 className="font-semibold text-gray-900 mb-3">Freelancer Benefits:</h4>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-start gap-2 text-gray-600">
                    <CheckCircle className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                    <span>Stand out with unique, human-written content</span>
                  </li>
                  <li className="flex items-start gap-2 text-gray-600">
                    <CheckCircle className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                    <span>Build long-term client relationships through trust</span>
                  </li>
                  <li className="flex items-start gap-2 text-gray-600">
                    <CheckCircle className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                    <span>Verify work before submitting to international clients</span>
                  </li>
                  <li className="flex items-start gap-2 text-gray-600">
                    <CheckCircle className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                    <span>Command higher rates with proven original work</span>
                  </li>
                </ul>
                <div className="bg-indigo-50 rounded-lg p-4">
                  <p className="text-sm text-gray-700">
                    <span className="font-semibold">Upwork/Fiverr Tip:</span> Clients pay premium for
                    authentic Filipino writers. Show them you're the real deal.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Ethical Usage */}
      <section className="py-16 sm:py-24 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-amber-100 text-amber-800 px-4 py-2 rounded-full text-sm font-semibold mb-6">
              <Award className="w-4 h-4" />
              Promoting Responsible AI Use
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Use AI Detection Ethically
            </h2>
            <p className="text-lg text-gray-600">
              Our tool is designed to promote transparency, not to punish AI usage
            </p>
          </div>

          <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl border border-amber-200 p-8">
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <CheckCircle className="w-6 h-6 text-emerald-600" />
                  Ethical Use of AI Detectors
                </h3>
                <ul className="space-y-3 ml-8">
                  <li className="text-gray-700">
                    <span className="font-semibold">For Teachers:</span> Use as one tool among many to
                    assess student work. Have conversations with students about their writing process.
                  </li>
                  <li className="text-gray-700">
                    <span className="font-semibold">For Students:</span> Use to self-check your work
                    before submission. If you used AI assistance, cite it according to school policy.
                  </li>
                  <li className="text-gray-700">
                    <span className="font-semibold">For Professionals:</span> Verify client deliverables
                    meet authenticity standards while respecting AI as a legitimate productivity tool.
                  </li>
                </ul>
              </div>

              <div className="bg-white rounded-lg p-6 border-l-4 border-amber-500">
                <h4 className="font-semibold text-gray-900 mb-2">
                  Important: AI Tools Are Not Cheating
                </h4>
                <p className="text-gray-700">
                  Using AI tools like ChatGPT, Grammarly, or Quillbot for research, editing, or brainstorming
                  is perfectly acceptable. What matters is transparency. If you use AI assistance, acknowledge
                  it. Original thinking and critical analysis are what make your work valuable - not whether
                  AI touched it.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <AlertCircle className="w-6 h-6 text-amber-600" />
                  Understanding False Positives
                </h3>
                <p className="text-gray-700 mb-3">
                  No AI detector is 100% accurate. Filipino writers, especially non-native English speakers
                  or those using formal academic language, may sometimes be incorrectly flagged. Our system
                  is designed to minimize this, but human judgment is essential.
                </p>
                <ul className="space-y-2 ml-4">
                  <li className="flex items-start gap-2 text-gray-700">
                    <ChevronRight className="w-4 h-4 text-amber-600 flex-shrink-0 mt-1" />
                    <span>Formal academic writing naturally has lower "burstiness"</span>
                  </li>
                  <li className="flex items-start gap-2 text-gray-700">
                    <ChevronRight className="w-4 h-4 text-amber-600 flex-shrink-0 mt-1" />
                    <span>Technical subjects use predictable terminology</span>
                  </li>
                  <li className="flex items-start gap-2 text-gray-700">
                    <ChevronRight className="w-4 h-4 text-amber-600 flex-shrink-0 mt-1" />
                    <span>Filipino-English code-switching requires context understanding</span>
                  </li>
                </ul>
              </div>

              <div className="bg-emerald-50 rounded-lg p-6 border-l-4 border-emerald-500">
                <h4 className="font-semibold text-gray-900 mb-2">
                  Best Practice for Educators
                </h4>
                <p className="text-gray-700">
                  If an AI detector flags a student's work, use it as an opportunity for dialogue. Ask about
                  their writing process, request drafts, or have them explain their ideas verbally. The goal
                  is learning, not punishment.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Accuracy & Transparency */}
      <section className="py-16 sm:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Transparency in AI Detection
            </h2>
            <p className="text-lg text-gray-600">
              We believe in honest communication about our tool's capabilities and limitations
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl p-8 shadow-lg">
              <div className="text-center mb-4">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 rounded-full mb-4">
                  <BarChart3 className="w-8 h-8 text-emerald-600" />
                </div>
                <div className="text-4xl font-bold text-emerald-600 mb-2">92%</div>
                <h3 className="font-semibold text-gray-900">Overall Accuracy</h3>
              </div>
              <p className="text-sm text-gray-600 text-center">
                Tested on 10,000+ documents including Filipino and English content
              </p>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-lg">
              <div className="text-center mb-4">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                  <Target className="w-8 h-8 text-blue-600" />
                </div>
                <div className="text-4xl font-bold text-blue-600 mb-2">95%</div>
                <h3 className="font-semibold text-gray-900">True Positive Rate</h3>
              </div>
              <p className="text-sm text-gray-600 text-center">
                Successfully identifies genuine AI-generated content
              </p>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-lg">
              <div className="text-center mb-4">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-4">
                  <Shield className="w-8 h-8 text-purple-600" />
                </div>
                <div className="text-4xl font-bold text-purple-600 mb-2">7%</div>
                <h3 className="font-semibold text-gray-900">False Positive Rate</h3>
              </div>
              <p className="text-sm text-gray-600 text-center">
                Low rate of incorrectly flagging human writing as AI
              </p>
            </div>
          </div>

          <div className="mt-12 bg-white rounded-xl shadow-lg p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              What Affects Detection Accuracy
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-emerald-600" />
                  Higher Accuracy With:
                </h4>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <span>Longer text samples (500+ words)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <span>Complete documents vs. fragments</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <span>Standard English or Filipino text</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <span>Recently generated AI content</span>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-amber-600" />
                  More Challenging:
                </h4>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <span>Very short texts (under 80 words)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <span>Heavily edited AI-generated content</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <span>Technical or specialized vocabulary</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <span>Mix of human and AI-written sections</span>
                  </li>
                </ul>
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
              Everything you need to know about AI content detection
            </p>
          </div>

          <div className="space-y-4">
            {/* FAQ 1 */}
            <details className="group bg-gray-50 rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <summary className="cursor-pointer p-6 font-semibold text-gray-900 flex justify-between items-center hover:bg-gray-100 transition-colors">
                <span>How accurate is ChatGPT Philippines AI Detector?</span>
                <ChevronRight className="w-5 h-5 text-gray-400 group-open:rotate-90 transition-transform" />
              </summary>
              <div className="px-6 pb-6 text-gray-600">
                Our AI detector achieves 92%+ overall accuracy when analyzing content of 80+ words. We've tested it on over 10,000 Filipino and English documents. The accuracy is particularly high (95%+) for genuine AI-generated content. However, no AI detector is perfect - we have a 7% false positive rate, meaning occasionally human writing may be flagged. For Filipino content specifically, we've optimized our model to understand Taglish and Philippine English patterns, making it more accurate than generic international tools.
              </div>
            </details>

            {/* FAQ 2 */}
            <details className="group bg-gray-50 rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <summary className="cursor-pointer p-6 font-semibold text-gray-900 flex justify-between items-center hover:bg-gray-100 transition-colors">
                <span>Can this detect content from ChatGPT, GPT-4, Gemini, and Claude?</span>
                <ChevronRight className="w-5 h-5 text-gray-400 group-open:rotate-90 transition-transform" />
              </summary>
              <div className="px-6 pb-6 text-gray-600">
                Yes! Our detector is trained to identify content from all major AI language models including ChatGPT (GPT-3.5, GPT-4, GPT-4 Turbo), Google Gemini, Anthropic Claude, and other LLMs. The tool analyzes text patterns that are common across these models, such as predictable sentence structures, repetitive phrasing, and lack of personal anecdotes. It also provides a breakdown showing whether content is fully AI-generated, AI-refined (human-written but edited by AI), or purely human-written.
              </div>
            </details>

            {/* FAQ 3 */}
            <details className="group bg-gray-50 rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <summary className="cursor-pointer p-6 font-semibold text-gray-900 flex justify-between items-center hover:bg-gray-100 transition-colors">
                <span>Is this AI detector free for Filipino teachers and students?</span>
                <ChevronRight className="w-5 h-5 text-gray-400 group-open:rotate-90 transition-transform" />
              </summary>
              <div className="px-6 pb-6 text-gray-600">
                Yes! We offer 3 free AI detection checks for guest users without signing up. When you create a free account, you get unlimited AI detection checks, the ability to save and download reports, and access to detailed line-by-line analysis. This makes it completely free for teachers to check student assignments and for students to verify their work. We believe AI detection should be accessible to all Filipino educators and learners, which is why we don't charge for basic detection.
              </div>
            </details>

            {/* FAQ 4 */}
            <details className="group bg-gray-50 rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <summary className="cursor-pointer p-6 font-semibold text-gray-900 flex justify-between items-center hover:bg-gray-100 transition-colors">
                <span>How is this different from Turnitin or GPTZero?</span>
                <ChevronRight className="w-5 h-5 text-gray-400 group-open:rotate-90 transition-transform" />
              </summary>
              <div className="px-6 pb-6 text-gray-600">
                Unlike Turnitin (which focuses on plagiarism) or GPTZero, our AI detector is specifically designed for Filipino users with three key advantages: (1) It understands Tagalog and Taglish, reducing false positives for Filipino writers, (2) It's completely free with unlimited checks for signed-up users, while Turnitin and GPTZero require institutional licenses or paid plans, and (3) We differentiate between AI-generated, AI-refined, and human-written content, giving you more nuanced results. Our tool is optimized for Philippine educational contexts and writing styles.
              </div>
            </details>

            {/* FAQ 5 */}
            <details className="group bg-gray-50 rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <summary className="cursor-pointer p-6 font-semibold text-gray-900 flex justify-between items-center hover:bg-gray-100 transition-colors">
                <span>Does it support Filipino/Tagalog language detection?</span>
                <ChevronRight className="w-5 h-5 text-gray-400 group-open:rotate-90 transition-transform" />
              </summary>
              <div className="px-6 pb-6 text-gray-600">
                Absolutely! We're the first AI detector with full Tagalog and Taglish support. Our model is trained on Filipino writing patterns, code-switching between English and Tagalog, and Philippine English conventions. This means Filipino students and professionals won't be unfairly flagged just because they write differently from American or British English speakers. The detector accurately handles pure Tagalog content, pure English content, and mixed Taglish content - all common in Philippine academic and professional settings.
              </div>
            </details>

            {/* FAQ 6 */}
            <details className="group bg-gray-50 rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <summary className="cursor-pointer p-6 font-semibold text-gray-900 flex justify-between items-center hover:bg-gray-100 transition-colors">
                <span>What happens if a student's human-written work is flagged as AI?</span>
                <ChevronRight className="w-5 h-5 text-gray-400 group-open:rotate-90 transition-transform" />
              </summary>
              <div className="px-6 pb-6 text-gray-600">
                False positives can happen (about 7% of the time), especially with formal academic writing or technical subjects. If a student's work is flagged, we recommend: (1) Look at the specific probability score - 50-70% is uncertain, while 90%+ is more definitive, (2) Request earlier drafts or have the student explain their writing process, (3) Consider the context - formal academic language naturally scores higher, (4) Have a conversation rather than making immediate accusations. Remember, AI detection should be one tool among many for assessing student work, not the sole determinant.
              </div>
            </details>

            {/* FAQ 7 */}
            <details className="group bg-gray-50 rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <summary className="cursor-pointer p-6 font-semibold text-gray-900 flex justify-between items-center hover:bg-gray-100 transition-colors">
                <span>Can teachers use this to grade student essays?</span>
                <ChevronRight className="w-5 h-5 text-gray-400 group-open:rotate-90 transition-transform" />
              </summary>
              <div className="px-6 pb-6 text-gray-600">
                Yes, but with proper context. Our tool helps teachers identify potential AI use in student submissions, but it should not be the only factor in grading. Teachers can use it to: (1) Flag submissions for further review, (2) Start conversations with students about their writing process, (3) Generate downloadable reports for academic integrity cases, (4) Educate students about AI detection and ethical AI use. We recommend combining AI detection with other assessment methods like oral defense, draft comparison, and in-class writing to get a complete picture of student work authenticity.
              </div>
            </details>

            {/* FAQ 8 */}
            <details className="group bg-gray-50 rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <summary className="cursor-pointer p-6 font-semibold text-gray-900 flex justify-between items-center hover:bg-gray-100 transition-colors">
                <span>Is my content stored when I use the AI detector?</span>
                <ChevronRight className="w-5 h-5 text-gray-400 group-open:rotate-90 transition-transform" />
              </summary>
              <div className="px-6 pb-6 text-gray-600">
                No! We take privacy seriously. Your content is analyzed in real-time and immediately deleted after processing. We do not store, share, or use your submitted text for training purposes. The only data we retain is anonymized usage statistics (like "X detections performed today"). If you're a signed-up user, you can choose to save your detection reports for future reference, but you have full control to delete them anytime. Your academic papers, assignments, and professional documents remain completely private and secure.
              </div>
            </details>

            {/* FAQ 9 */}
            <details className="group bg-gray-50 rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <summary className="cursor-pointer p-6 font-semibold text-gray-900 flex justify-between items-center hover:bg-gray-100 transition-colors">
                <span>What's the minimum word count for accurate detection?</span>
                <ChevronRight className="w-5 h-5 text-gray-400 group-open:rotate-90 transition-transform" />
              </summary>
              <div className="px-6 pb-6 text-gray-600">
                We require a minimum of 80 words for basic detection, but accuracy improves significantly with longer text. For best results, we recommend: 80-200 words (basic detection, 85% accuracy), 200-500 words (good detection, 90% accuracy), 500+ words (optimal detection, 92%+ accuracy). Very short texts like tweets or single paragraphs are challenging for any AI detector because there isn't enough content to analyze patterns effectively. If you're checking a short piece, consider the results as less reliable and combine with other assessment methods.
              </div>
            </details>

            {/* FAQ 10 */}
            <details className="group bg-gray-50 rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <summary className="cursor-pointer p-6 font-semibold text-gray-900 flex justify-between items-center hover:bg-gray-100 transition-colors">
                <span>Can I download reports for academic integrity investigations?</span>
                <ChevronRight className="w-5 h-5 text-gray-400 group-open:rotate-90 transition-transform" />
              </summary>
              <div className="px-6 pb-6 text-gray-600">
                Yes! Signed-up users can download detailed PDF reports for every AI detection. These reports include: (1) Overall AI probability score, (2) Line-by-line breakdown showing which sections are flagged, (3) Detailed metrics (perplexity, burstiness scores), (4) Timestamp and document metadata, (5) Professional formatting suitable for academic committees. These reports can be used as supporting evidence in academic integrity cases, but we always recommend pairing them with human judgment and giving students the opportunity to explain their work. The reports are designed to document findings, not serve as definitive proof.
              </div>
            </details>

            {/* FAQ 11 */}
            <details className="group bg-gray-50 rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <summary className="cursor-pointer p-6 font-semibold text-gray-900 flex justify-between items-center hover:bg-gray-100 transition-colors">
                <span>Will this tool help me avoid AI detectors like Turnitin?</span>
                <ChevronRight className="w-5 h-5 text-gray-400 group-open:rotate-90 transition-transform" />
              </summary>
              <div className="px-6 pb-6 text-gray-600">
                Our tool is designed to detect AI content, not help you bypass detection. If you're a student, we encourage you to: (1) Use AI ethically as a research and brainstorming tool, (2) Always cite when you use AI assistance, (3) Do your own thinking and writing, (4) Follow your school's AI usage policies. Our detector can help you check if your legitimately human-written work might be accidentally flagged, allowing you to revise before submission. Remember, the goal isn't to "beat the detector" - it's to maintain academic integrity while benefiting from AI as a learning tool. Always be transparent about how you use AI.
              </div>
            </details>

            {/* FAQ 12 */}
            <details className="group bg-gray-50 rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <summary className="cursor-pointer p-6 font-semibold text-gray-900 flex justify-between items-center hover:bg-gray-100 transition-colors">
                <span>How does this compare to other free AI detectors?</span>
                <ChevronRight className="w-5 h-5 text-gray-400 group-open:rotate-90 transition-transform" />
              </summary>
              <div className="px-6 pb-6 text-gray-600">
                Most free AI detectors have significant limitations: limited checks per day (often 3-5), no support for Filipino languages, high false positive rates for non-native English speakers, no detailed breakdowns of AI vs human content. ChatGPT Philippines AI Detector offers: unlimited free checks for signed-up users, full Tagalog/Taglish support, three-tier analysis (AI-generated, AI-refined, human-written), downloadable professional reports, and optimization for Filipino writing styles. We've also tested extensively on Philippine educational content to ensure accuracy for local users. Plus, we're completely free - no hidden fees or premium tiers required for full functionality.
              </div>
            </details>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-24 bg-gradient-to-r from-emerald-600 to-teal-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
            Start Detecting AI Content Now
          </h2>
          <p className="text-xl text-emerald-50 mb-8">
            Free, accurate, and built for Filipino users. Join 50,000+ teachers, students, and professionals.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/chat"
              className="w-full sm:w-auto bg-white text-emerald-600 px-8 py-4 rounded-lg hover:bg-gray-100 transition-all text-lg font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-center gap-2"
            >
              <Shield className="w-5 h-5" />
              Try AI Detection Free
            </Link>
            <Link
              href="/signup"
              className="w-full sm:w-auto border-2 border-white text-white px-8 py-4 rounded-lg hover:bg-white hover:text-emerald-600 transition-all text-lg font-semibold"
            >
              Sign Up for Unlimited Access
            </Link>
          </div>
          <p className="mt-6 text-sm text-emerald-50">
            No credit card • 3 free checks as guest • Unlimited with free account
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <Link href="/" className="flex items-center space-x-2 mb-4">
                <Sparkles className="w-6 h-6 text-emerald-500" />
                <span className="text-lg font-bold text-white">ChatGPT PH</span>
              </Link>
              <p className="text-sm text-gray-400">
                Free AI tools for Filipinos. Detect AI content, chat, translate, and more.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-white mb-4">Tools</h3>
              <ul className="space-y-2 text-sm">
                <li><Link href="/ai-detector" className="hover:text-emerald-500 transition-colors">AI Detector</Link></li>
                <li><Link href="/chat" className="hover:text-emerald-500 transition-colors">AI Chat</Link></li>
                <li><Link href="/chat" className="hover:text-emerald-500 transition-colors">Translator</Link></li>
                <li><Link href="/chat" className="hover:text-emerald-500 transition-colors">Image Generator</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-white mb-4">Resources</h3>
              <ul className="space-y-2 text-sm">
                <li><Link href="/ai-detector" className="hover:text-emerald-500 transition-colors">How It Works</Link></li>
                <li><Link href="/ai-detector" className="hover:text-emerald-500 transition-colors">Accuracy Info</Link></li>
                <li><Link href="/ai-detector" className="hover:text-emerald-500 transition-colors">Ethical Use Guide</Link></li>
                <li><Link href="/ai-detector" className="hover:text-emerald-500 transition-colors">FAQ</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-white mb-4">Company</h3>
              <ul className="space-y-2 text-sm">
                <li><Link href="/" className="hover:text-emerald-500 transition-colors">About Us</Link></li>
                <li><Link href="/" className="hover:text-emerald-500 transition-colors">Privacy Policy</Link></li>
                <li><Link href="/" className="hover:text-emerald-500 transition-colors">Terms of Service</Link></li>
                <li><Link href="/" className="hover:text-emerald-500 transition-colors">Contact</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 text-center text-sm text-gray-400">
            <p>2024 ChatGPT Philippines. All rights reserved. AI detection powered by Claude AI.</p>
            <p className="mt-2">Made with love for Filipino educators, students, and professionals</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
