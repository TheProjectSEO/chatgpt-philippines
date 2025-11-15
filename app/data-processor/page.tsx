'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Database,
  BarChart3,
  Copy,
  Check,
  ChevronRight,
  ChevronDown,
  X,
  Brain,
  AlertCircle,
  AlertTriangle,
  Info,
  Zap,
  TrendingUp,
  FileText,
  Loader2,
  CheckCircle2,
} from 'lucide-react';

interface Issue {
  critical: string[];
  warning: string[];
  info: string[];
}

interface ProcessResult {
  analysis: string;
  thinking?: string;
  qualityScore: number;
  issues: Issue;
  toolsUsed?: Array<{ name: string; input: any }>;
  usage?: {
    input_tokens: number;
    output_tokens: number;
  };
}

// Sample data templates
const SAMPLE_JSON = `[
  {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "age": 28,
    "city": "New York"
  },
  {
    "id": 2,
    "name": "Jane Smith",
    "email": "jane@example.com",
    "age": 32,
    "city": "San Francisco"
  }
]`;

const SAMPLE_CSV = `id,name,email,age,city
1,John Doe,john@example.com,28,New York
2,Jane Smith,jane@example.com,32,San Francisco
3,Bob Johnson,bob@example.com,45,Chicago`;

// Severity badge component
const SeverityBadge = ({ severity }: { severity: string }) => {
  const config = {
    critical: { bg: 'bg-red-100', text: 'text-red-700', icon: AlertCircle },
    warning: { bg: 'bg-yellow-100', text: 'text-yellow-700', icon: AlertTriangle },
    info: { bg: 'bg-blue-100', text: 'text-blue-700', icon: Info },
  };

  const severityLower = severity.toLowerCase();
  const { bg, text, icon: Icon } = config[severityLower as keyof typeof config] || config.info;

  return (
    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${bg} ${text}`}>
      <Icon size={14} />
      {severity}
    </span>
  );
};

// Quality score badge component
const QualityScoreBadge = ({ score }: { score: number }) => {
  let color = 'text-red-600 bg-red-50 border-red-200';
  if (score >= 80) color = 'text-green-600 bg-green-50 border-green-200';
  else if (score >= 60) color = 'text-yellow-600 bg-yellow-50 border-yellow-200';
  else if (score >= 40) color = 'text-orange-600 bg-orange-50 border-orange-200';

  return (
    <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border-2 ${color} font-semibold`}>
      <BarChart3 size={20} />
      <span>Quality Score: {score}/100</span>
    </div>
  );
};

export default function DataProcessorPage() {
  const [data, setData] = useState('');
  const [format, setFormat] = useState<'json' | 'csv'>('json');
  const [result, setResult] = useState<ProcessResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showThinking, setShowThinking] = useState(false);
  const [copied, setCopied] = useState(false);
  const [guestUses, setGuestUses] = useState(10);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [charCount, setCharCount] = useState(0);

  const MAX_FREE_USES = 10;
  const MAX_CHARS = 20000;

  // Load rate limit on mount
  useEffect(() => {
    const loadRateLimit = async () => {
      try {
        const response = await fetch('/api/rate-limit', { method: 'GET' });
        if (response.ok) {
          const rateLimit = await response.json();
          const remaining = Math.max(0, MAX_FREE_USES - rateLimit.count);
          setGuestUses(remaining);
        }
      } catch (error) {
        console.error('Failed to load rate limit:', error);
      }
    };
    loadRateLimit();
  }, []);

  // Update character count
  useEffect(() => {
    setCharCount(data.length);
  }, [data]);

  const handleProcess = async () => {
    if (!data.trim()) {
      alert('Please enter data to analyze');
      return;
    }

    if (guestUses <= 0) {
      setShowLoginModal(true);
      return;
    }

    setIsProcessing(true);
    setResult(null);

    try {
      // Check rate limit
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
          setIsProcessing(false);
          return;
        }
      }

      const response = await fetch('/api/data-processor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data, format }),
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.message || 'Data processing failed');
      }

      setResult(responseData);
    } catch (error: any) {
      console.error('Processing error:', error);
      alert(error.message || 'Failed to process data. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCopy = async () => {
    if (!result) return;

    try {
      await navigator.clipboard.writeText(result.analysis);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const loadSample = () => {
    setData(format === 'json' ? SAMPLE_JSON : SAMPLE_CSV);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-orange-50 via-white to-amber-50 pt-24 pb-16 md:pt-32 md:pb-24">
        <div className="container mx-auto px-4 md:px-6 max-w-7xl">
          <div className="flex items-center gap-2 text-sm text-neutral-600 mb-6">
            <Link href="/" className="hover:text-primary-600 transition-colors">
              Home
            </Link>
            <ChevronRight size={16} />
            <span className="text-neutral-800 font-medium">Data Processor</span>
          </div>

          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Database size={18} />
              <span>AI-Powered Data Analysis with Extended Thinking</span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-neutral-900 mb-6 leading-tight">
              Data Processor{' '}
              <span className="bg-gradient-to-r from-orange-500 to-amber-600 bg-clip-text text-transparent">
                with Deep Insights
              </span>
            </h1>

            <p className="text-lg md:text-xl text-neutral-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              Analyze structured data for quality issues, patterns, and optimization opportunities.
              Get actionable insights with database recommendations and statistical analysis.
            </p>

            <div className="flex flex-wrap justify-center gap-8 md:gap-12 mb-8">
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-orange-600">12K</div>
                <div className="text-sm text-neutral-600">Thinking Tokens</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-orange-600">4</div>
                <div className="text-sm text-neutral-600">Analysis Categories</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-orange-600">20K</div>
                <div className="text-sm text-neutral-600">Character Limit</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Interface */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4 md:px-6 max-w-5xl">
          <div className="bg-white rounded-2xl shadow-lg border border-neutral-200 overflow-hidden">
            <div className="p-6 md:p-8">
              <h2 className="text-2xl font-bold text-neutral-900 mb-6">Analyze Your Data</h2>

              <div className="space-y-6">
                {/* Format Selector */}
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Data Format *
                  </label>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setFormat('json')}
                      className={`flex-1 px-4 py-3 rounded-lg border-2 transition-all ${
                        format === 'json'
                          ? 'border-orange-500 bg-orange-50 text-orange-700'
                          : 'border-neutral-300 hover:border-orange-300'
                      }`}
                    >
                      <div className="font-semibold">JSON</div>
                      <div className="text-xs text-neutral-600">Array or object</div>
                    </button>
                    <button
                      onClick={() => setFormat('csv')}
                      className={`flex-1 px-4 py-3 rounded-lg border-2 transition-all ${
                        format === 'csv'
                          ? 'border-orange-500 bg-orange-50 text-orange-700'
                          : 'border-neutral-300 hover:border-orange-300'
                      }`}
                    >
                      <div className="font-semibold">CSV</div>
                      <div className="text-xs text-neutral-600">Comma-separated</div>
                    </button>
                  </div>
                </div>

                {/* Data Input */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-neutral-700">
                      Data to Analyze *
                    </label>
                    <button
                      onClick={loadSample}
                      className="text-sm text-orange-600 hover:text-orange-700 font-medium"
                    >
                      Load Sample
                    </button>
                  </div>
                  <textarea
                    value={data}
                    onChange={(e) => {
                      if (e.target.value.length <= MAX_CHARS) {
                        setData(e.target.value);
                      }
                    }}
                    placeholder={`Paste your ${format.toUpperCase()} data here...`}
                    className="w-full h-96 px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none font-mono text-sm"
                    spellCheck={false}
                  />
                  <div className="flex justify-between items-center text-sm text-neutral-500 mt-2">
                    <span>{charCount.toLocaleString()} / {MAX_CHARS.toLocaleString()} characters</span>
                    <span className="text-xs">
                      {format === 'json' ? 'Valid JSON required' : 'CSV with headers'}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4">
                  <div className="text-sm text-neutral-600">
                    Guest uses remaining: <span className="font-semibold text-orange-600">{guestUses}</span>
                  </div>
                  <button
                    onClick={handleProcess}
                    disabled={isProcessing || !data.trim()}
                    className="w-full sm:w-auto bg-gradient-to-r from-orange-500 to-amber-600 text-white px-8 py-3 rounded-lg font-semibold hover:from-orange-600 hover:to-amber-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 size={20} className="animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <BarChart3 size={20} />
                        Process Data
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Results Section */}
            {result && (
              <div className="border-t border-neutral-200 p-6 md:p-8 bg-neutral-50">
                {/* Thinking Process (Collapsible) */}
                {result.thinking && (
                  <div className="mb-6">
                    <button
                      onClick={() => setShowThinking(!showThinking)}
                      className="flex items-center justify-between w-full bg-orange-50 border border-orange-200 rounded-lg p-4 hover:bg-orange-100 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <Brain className="text-orange-600" size={20} />
                        <span className="font-semibold text-orange-900">Thinking Process</span>
                      </div>
                      <ChevronDown
                        size={20}
                        className={`text-orange-600 transition-transform ${showThinking ? 'rotate-180' : ''}`}
                      />
                    </button>
                    {showThinking && (
                      <div className="mt-2 bg-white border border-orange-200 rounded-lg p-4">
                        <pre className="text-sm text-neutral-700 whitespace-pre-wrap font-mono">
                          {result.thinking}
                        </pre>
                      </div>
                    )}
                  </div>
                )}

                {/* Quality Score */}
                <div className="mb-6">
                  <div className="flex items-center justify-center">
                    <QualityScoreBadge score={result.qualityScore} />
                  </div>
                </div>

                {/* Tools Used */}
                {result.toolsUsed && result.toolsUsed.length > 0 && (
                  <div className="mb-6">
                    <div className="flex items-center gap-2 mb-3">
                      <Zap className="text-orange-600" size={18} />
                      <span className="text-sm font-semibold text-neutral-900">Database Tools Used</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {result.toolsUsed.map((tool, idx) => (
                        <div
                          key={idx}
                          className="bg-orange-50 text-orange-700 px-3 py-1 rounded-full text-sm border border-orange-200"
                        >
                          {tool.name}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Issues by Severity */}
                {(result.issues.critical.length > 0 ||
                  result.issues.warning.length > 0 ||
                  result.issues.info.length > 0) && (
                  <div className="mb-6">
                    <div className="flex items-center gap-2 mb-3">
                      <AlertTriangle className="text-orange-600" size={18} />
                      <span className="text-sm font-semibold text-neutral-900">Issues Found</span>
                    </div>
                    <div className="space-y-2">
                      {result.issues.critical.map((issue, idx) => (
                        <div key={idx} className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
                          <SeverityBadge severity="Critical" />
                          <span className="text-sm text-neutral-700 flex-1">{issue}</span>
                        </div>
                      ))}
                      {result.issues.warning.map((issue, idx) => (
                        <div key={idx} className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex items-start gap-2">
                          <SeverityBadge severity="Warning" />
                          <span className="text-sm text-neutral-700 flex-1">{issue}</span>
                        </div>
                      ))}
                      {result.issues.info.map((issue, idx) => (
                        <div key={idx} className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-start gap-2">
                          <SeverityBadge severity="Info" />
                          <span className="text-sm text-neutral-700 flex-1">{issue}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Full Analysis */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-semibold text-neutral-900">Complete Analysis</h3>
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
                  <div className="bg-white border border-neutral-300 rounded-lg p-6">
                    <div className="prose max-w-none">
                      <pre className="text-neutral-800 whitespace-pre-wrap font-sans leading-relaxed">
                        {result.analysis}
                      </pre>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Analysis Categories */}
      <section className="py-16 md:py-24 bg-neutral-50">
        <div className="container mx-auto px-4 md:px-6 max-w-7xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-4">
              What We Analyze
            </h2>
            <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
              Comprehensive data analysis across multiple dimensions
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: CheckCircle2,
                title: 'Data Quality',
                description: 'Completeness, consistency, accuracy, missing values, duplicates',
                color: 'text-green-600',
                bg: 'bg-green-50',
              },
              {
                icon: Database,
                title: 'Structure Analysis',
                description: 'Schema design, data types, relationships, dependencies',
                color: 'text-blue-600',
                bg: 'bg-blue-50',
              },
              {
                icon: TrendingUp,
                title: 'Statistical Insights',
                description: 'Patterns, trends, anomalies, outliers, distributions',
                color: 'text-purple-600',
                bg: 'bg-purple-50',
              },
              {
                icon: Zap,
                title: 'Optimization',
                description: 'Indexing, normalization, query optimization, best practices',
                color: 'text-orange-600',
                bg: 'bg-orange-50',
              },
            ].map((category, idx) => (
              <div
                key={idx}
                className="bg-white p-6 rounded-xl border border-neutral-200 hover:shadow-lg transition-shadow duration-200"
              >
                <div className={`${category.bg} ${category.color} w-12 h-12 rounded-lg flex items-center justify-center mb-4`}>
                  <category.icon size={24} />
                </div>
                <h3 className="text-xl font-semibold text-neutral-900 mb-2">{category.title}</h3>
                <p className="text-neutral-600">{category.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-4 md:px-6 max-w-7xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-4">
              Advanced Data Analysis
            </h2>
            <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
              Powered by Claude Sonnet 4 with extended thinking and database tools
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Brain,
                title: 'Extended Thinking',
                description: '12,000 tokens of deep reasoning for complex data patterns',
                color: 'text-orange-600',
                bg: 'bg-orange-50',
              },
              {
                icon: Database,
                title: 'Database Tools',
                description: 'Query and analyze with Supabase database integration',
                color: 'text-blue-600',
                bg: 'bg-blue-50',
              },
              {
                icon: FileText,
                title: 'Multiple Formats',
                description: 'Support for JSON arrays, objects, and CSV data',
                color: 'text-purple-600',
                bg: 'bg-purple-50',
              },
              {
                icon: BarChart3,
                title: 'Quality Scoring',
                description: 'Automated data quality assessment with 0-100 score',
                color: 'text-green-600',
                bg: 'bg-green-50',
              },
              {
                icon: AlertCircle,
                title: 'Issue Detection',
                description: 'Categorized issues by severity: Critical, Warning, Info',
                color: 'text-red-600',
                bg: 'bg-red-50',
              },
              {
                icon: TrendingUp,
                title: 'Actionable Insights',
                description: 'Specific recommendations with optimization strategies',
                color: 'text-indigo-600',
                bg: 'bg-indigo-50',
              },
            ].map((feature, idx) => (
              <div
                key={idx}
                className="bg-white p-6 rounded-xl border border-neutral-200 hover:shadow-lg transition-shadow duration-200"
              >
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
                <Database size={32} />
              </div>
              <h3 className="text-2xl font-bold text-neutral-900 mb-2">Usage Limit Reached</h3>
              <p className="text-neutral-600">Create a free account for unlimited data analysis</p>
            </div>

            <div className="space-y-3">
              <Link
                href="/signup"
                className="block w-full bg-gradient-to-r from-orange-500 to-amber-600 text-white px-6 py-3 rounded-lg font-semibold text-center hover:from-orange-600 hover:to-amber-700 transition-all"
              >
                Sign Up - Free Forever
              </Link>
              <Link
                href="/login"
                className="block w-full bg-white border border-neutral-300 text-neutral-700 px-6 py-3 rounded-lg font-semibold text-center hover:bg-neutral-50 transition-colors"
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
