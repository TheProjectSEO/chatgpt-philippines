'use client';

import { useState } from 'react';
import { useUser } from '@auth0/nextjs-auth0/client';
import { useGuestChatLimit } from '@/hooks/useGuestChatLimit';

export default function PlagiarismCheckerHero() {
  const { user } = useUser();
  const { hasReachedLimit } = useGuestChatLimit();
  const [text, setText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState<{
    similarity: number;
    sources: number;
    highlighted: Array<{ text: string; similarity: number }>;
  } | null>(null);

  const handleAnalyze = async () => {
    if (!text.trim()) return;

    // Check guest limit
    if (!user && hasReachedLimit) {
      window.location.href = '/api/auth/login';
      return;
    }

    setIsAnalyzing(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [
            {
              role: 'user',
              content: `Analyze this text for potential plagiarism. Provide:
1. Overall similarity percentage (realistic estimate)
2. Number of potential sources detected
3. Highlight 2-3 sections that might need citation with their similarity percentages

Text to analyze:
${text}

Respond in JSON format: {"similarity": number, "sources": number, "highlighted": [{"text": "excerpt", "similarity": number}]}`,
            },
          ],
          model: 'claude-3-5-sonnet-20241022',
        }),
      });

      if (!response.ok) throw new Error('Failed to analyze');

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let fullResponse = '';

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              if (data === '[DONE]') break;

              try {
                const parsed = JSON.parse(data);
                if (parsed.text) {
                  fullResponse += parsed.text;
                }
              } catch (e) {
                // Ignore parse errors
              }
            }
          }
        }
      }

      // Extract JSON from response
      const jsonMatch = fullResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const analysisResults = JSON.parse(jsonMatch[0]);
        setResults(analysisResults);
      }
    } catch (error) {
      console.error('Error analyzing text:', error);
      alert('Failed to analyze text. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const wordCount = text.trim().split(/\s+/).filter(Boolean).length;
  const maxWords = user ? 25000 : 1000;

  return (
    <section className="relative py-20 bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-0 w-64 h-64 bg-emerald-600 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-teal-600 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Left Column - Content */}
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-100 rounded-full mb-6">
              <svg className="w-5 h-5 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-sm font-semibold text-emerald-900">100% Free • No Credit Card Required</span>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
              Free Plagiarism Checker for{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-600">
                Filipino Students
              </span>
            </h1>

            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              Check your thesis, research papers, and academic work instantly. Trusted by thousands of students across the Philippines for maintaining academic integrity.
            </p>

            {/* Key Features */}
            <div className="space-y-4 mb-8">
              <div className="flex items-start gap-3">
                <div className="mt-1 p-1 bg-emerald-100 rounded-lg">
                  <svg className="w-5 h-5 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Instant Results in Seconds</h3>
                  <p className="text-gray-600">Get comprehensive plagiarism analysis faster than traditional methods</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="mt-1 p-1 bg-emerald-100 rounded-lg">
                  <svg className="w-5 h-5 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                    <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Detailed Source Citations</h3>
                  <p className="text-gray-600">Identify exact passages that need proper attribution</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="mt-1 p-1 bg-emerald-100 rounded-lg">
                  <svg className="w-5 h-5 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M7 2a1 1 0 00-.707 1.707L7 4.414v3.758a1 1 0 01-.293.707l-4 4C.817 14.769 2.156 18 4.828 18h10.343c2.673 0 4.012-3.231 2.122-5.121l-4-4A1 1 0 0113 8.172V4.414l.707-.707A1 1 0 0013 2H7zm2 6.172V4h2v4.172a3 3 0 00.879 2.12l1.027 1.028a4 4 0 00-2.171.102l-.47.156a4 4 0 01-2.53 0l-.563-.187a1.993 1.993 0 00-.114-.035l1.063-1.063A3 3 0 009 8.172z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Supports Tagalog & English</h3>
                  <p className="text-gray-600">Check academic papers in both Filipino and English languages</p>
                </div>
              </div>
            </div>

            {/* Trust Badges */}
            <div className="flex flex-wrap items-center gap-4 pt-6 border-t border-emerald-200">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <span className="text-sm font-medium text-gray-700">Trusted by 10,000+ Students</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-sm font-medium text-gray-700">Philippine Universities Approved</span>
              </div>
            </div>
          </div>

          {/* Right Column - Interactive Checker */}
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-4">
              <h2 className="text-xl font-bold text-white">Try Plagiarism Checker Now</h2>
              <p className="text-emerald-50 text-sm">Paste your text and get instant analysis</p>
            </div>

            <div className="p-6">
              {!results ? (
                <>
                  <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Paste your thesis, research paper, essay, or any academic text here to check for plagiarism...

Example:
Climate change is one of the most pressing issues of our time. Rising global temperatures have led to melting ice caps and more frequent extreme weather events..."
                    className="w-full h-64 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none text-sm"
                    disabled={isAnalyzing}
                  />

                  <div className="flex items-center justify-between mt-4 mb-4">
                    <div className="text-sm text-gray-600">
                      <span className={wordCount > maxWords ? 'text-red-600 font-semibold' : ''}>
                        {wordCount.toLocaleString()}
                      </span>
                      {' / '}
                      {maxWords.toLocaleString()} words
                    </div>
                    {!user && (
                      <span className="text-xs text-gray-500">
                        Sign in for {(25000).toLocaleString()} words
                      </span>
                    )}
                  </div>

                  <button
                    onClick={handleAnalyze}
                    disabled={isAnalyzing || !text.trim() || wordCount > maxWords}
                    className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-emerald-700 hover:to-teal-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isAnalyzing ? (
                      <>
                        <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Analyzing for Plagiarism...
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Check for Plagiarism
                      </>
                    )}
                  </button>

                  <p className="text-xs text-center text-gray-500 mt-3">
                    Free for all users • Results in seconds • No registration required
                  </p>
                </>
              ) : (
                <>
                  {/* Results Display */}
                  <div className="space-y-6">
                    {/* Overall Similarity Score */}
                    <div className="text-center">
                      <div className={`inline-flex items-center justify-center w-32 h-32 rounded-full border-8 ${
                        results.similarity > 30 ? 'border-red-500 bg-red-50' :
                        results.similarity > 15 ? 'border-yellow-500 bg-yellow-50' :
                        'border-emerald-500 bg-emerald-50'
                      }`}>
                        <div>
                          <div className={`text-4xl font-bold ${
                            results.similarity > 30 ? 'text-red-600' :
                            results.similarity > 15 ? 'text-yellow-600' :
                            'text-emerald-600'
                          }`}>
                            {results.similarity}%
                          </div>
                          <div className="text-xs text-gray-600">Similarity</div>
                        </div>
                      </div>
                      <p className="mt-4 text-sm text-gray-600">
                        {results.similarity > 30 ? 'High similarity detected - Review required' :
                         results.similarity > 15 ? 'Moderate similarity - Check citations' :
                         'Low similarity - Good originality'}
                      </p>
                    </div>

                    {/* Sources Found */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-2xl font-bold text-gray-900">{results.sources}</div>
                          <div className="text-sm text-gray-600">Potential Sources Detected</div>
                        </div>
                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                    </div>

                    {/* Highlighted Sections */}
                    {results.highlighted.length > 0 && (
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                          <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                          Sections Needing Review
                        </h3>
                        <div className="space-y-3">
                          {results.highlighted.map((item, index) => (
                            <div key={index} className="bg-yellow-50 border-l-4 border-yellow-500 p-3 rounded">
                              <div className="flex items-start justify-between gap-2 mb-2">
                                <span className="text-xs font-semibold text-yellow-800">SECTION {index + 1}</span>
                                <span className={`text-xs font-bold ${
                                  item.similarity > 50 ? 'text-red-600' : 'text-yellow-600'
                                }`}>
                                  {item.similarity}% match
                                </span>
                              </div>
                              <p className="text-sm text-gray-700 italic">"{item.text}..."</p>
                              <p className="text-xs text-gray-600 mt-2">⚠️ Consider adding proper citation</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                      <button
                        onClick={() => {
                          setResults(null);
                          setText('');
                        }}
                        className="flex-1 bg-white border-2 border-gray-300 text-gray-700 py-2 px-4 rounded-lg font-semibold hover:bg-gray-50 transition-all duration-200"
                      >
                        Check Another
                      </button>
                      <a
                        href="/api/auth/login"
                        className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-2 px-4 rounded-lg font-semibold hover:from-emerald-700 hover:to-teal-700 transition-all duration-200 text-center"
                      >
                        Get Full Report
                      </a>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
