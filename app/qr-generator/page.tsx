'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Download, ChevronRight, X, QrCode, Sparkles, FileText, Zap, Shield } from 'lucide-react';

export default function QRGeneratorPage() {
  const [input, setInput] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [guestGenerations, setGuestGenerations] = useState(0);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const MAX_FREE_GENERATIONS = 10;

  useEffect(() => {
    const loadRateLimit = async () => {
      try {
        const response = await fetch('/api/rate-limit', { method: 'GET' });
        if (response.ok) {
          const rateLimit = await response.json();
          setGuestGenerations(Math.max(0, MAX_FREE_GENERATIONS - rateLimit.count));
          if (rateLimit.blocked) setShowLoginModal(true);
        }
      } catch (error) {
        console.error('Failed to load rate limit:', error);
      }
    };
    loadRateLimit();
  }, []);

  const handleGenerate = async () => {
    if (!input.trim()) {
      alert('Please enter text or URL');
      return;
    }

    if (guestGenerations <= 0) {
      setShowLoginModal(true);
      return;
    }

    setIsGenerating(true);

    try {
      const rateLimitResponse = await fetch('/api/rate-limit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'increment' }),
      });

      if (rateLimitResponse.ok) {
        const rateLimit = await rateLimitResponse.json();
        setGuestGenerations(Math.max(0, MAX_FREE_GENERATIONS - rateLimit.count));
        if (rateLimit.blocked) {
          setShowLoginModal(true);
          setIsGenerating(false);
          return;
        }
      }

      const response = await fetch('/api/qr-generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: input }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 429) {
          setShowLoginModal(true);
          setGuestGenerations(0);
          alert(data.message || 'Generation limit reached. Please sign up to continue.');
          return;
        }
        throw new Error(data.error || 'Generation failed');
      }

      setQrCodeUrl(data.qrCode);

    } catch (error: any) {
      console.error('Generation error:', error);
      alert(error.message || 'Failed to generate. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (!qrCodeUrl) return;
    const link = document.createElement('a');
    link.href = qrCodeUrl;
    link.download = 'qr-code.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const loadSample = () => {
    setInput('https://heygpt.ph');
  };

  return (
    <div className="min-h-screen bg-white">
      <section className="relative bg-gradient-to-br from-pink-50 via-white to-rose-50 pt-24 pb-16 md:pt-32 md:pb-24">
        <div className="container mx-auto px-4 md:px-6 max-w-7xl">
          <div className="flex items-center gap-2 text-sm text-neutral-600 mb-6">
            <Link href="/" className="hover:text-primary-600 transition-colors">Home</Link>
            <ChevronRight size={16} />
            <span className="text-neutral-800 font-medium">QR Code Generator</span>
          </div>

          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-pink-100 text-pink-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <QrCode size={18} />
              <span>Free QR Code Generator</span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-neutral-900 mb-6 leading-tight">
              Free QR Code Generator -{' '}
              <span className="bg-gradient-to-r from-pink-500 to-rose-600 bg-clip-text text-transparent">
                Instant QR Codes
              </span>
            </h1>

            <p className="text-lg md:text-xl text-neutral-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              Create QR codes instantly for URLs, text, Wi-Fi, vCards, and more. Download high-quality PNG images for free.
            </p>

            <div className="flex flex-wrap justify-center gap-8 md:gap-12 mb-8">
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-pink-600">100K+</div>
                <div className="text-sm text-neutral-600">QR Codes Created</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-pink-600">10</div>
                <div className="text-sm text-neutral-600">Free Daily</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-pink-600">HD</div>
                <div className="text-sm text-neutral-600">Quality</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4 md:px-6 max-w-7xl">
          <div className="bg-white rounded-2xl shadow-lg border border-neutral-200 overflow-hidden">
            <div className="p-6 space-y-4 border-b border-neutral-200">
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium text-neutral-700">Enter Text or URL</label>
                <button onClick={loadSample} className="text-sm text-pink-600 hover:text-pink-700">Load sample</button>
              </div>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Enter URL, text, phone number, email, or any content..."
                className="w-full h-32 p-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 resize-none"
              />
            </div>

            <div className="p-6 bg-neutral-50">
              <div className="flex items-center justify-between mb-4">
                <label className="text-sm font-medium text-neutral-700">QR Code</label>
                {qrCodeUrl && (
                  <button onClick={handleDownload} className="flex items-center gap-2 px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors">
                    <Download size={18} />
                    Download
                  </button>
                )}
              </div>

              <div className="w-full min-h-96 flex items-center justify-center p-8 bg-white border border-neutral-300 rounded-lg">
                {isGenerating ? (
                  <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600 mb-3"></div>
                    <p className="text-neutral-600">Generating QR code...</p>
                  </div>
                ) : qrCodeUrl ? (
                  <div className="text-center">
                    <img src={qrCodeUrl} alt="QR Code" className="mx-auto w-64 h-64" />
                    <p className="text-sm text-neutral-500 mt-4">Scan with your phone camera</p>
                  </div>
                ) : (
                  <p className="text-neutral-400">Your QR code will appear here...</p>
                )}
              </div>
              <canvas ref={canvasRef} style={{ display: 'none' }} />
            </div>

            <div className="border-t border-neutral-200 p-6 bg-neutral-50">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-sm text-neutral-600">
                  Guest generations remaining: <span className="font-semibold text-pink-600">{guestGenerations}</span>
                </div>
                <button
                  onClick={handleGenerate}
                  disabled={isGenerating || !input.trim()}
                  className="w-full sm:w-auto btn-primary btn-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isGenerating ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Generating...
                    </>
                  ) : (
                    <>
                      <QrCode size={20} />
                      Generate QR Code
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-neutral-50">
        <div className="container mx-auto px-4 md:px-6 max-w-7xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-4">Why Use Our QR Generator?</h2>
            <p className="text-lg text-neutral-600 max-w-2xl mx-auto">Professional QR codes in seconds</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-neutral-200">
              <div className="bg-pink-100 text-pink-600 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Sparkles size={24} />
              </div>
              <h3 className="text-xl font-semibold text-neutral-900 mb-2">Instant Creation</h3>
              <p className="text-neutral-600">Generate QR codes in seconds</p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-neutral-200">
              <div className="bg-rose-100 text-rose-600 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <FileText size={24} />
              </div>
              <h3 className="text-xl font-semibold text-neutral-900 mb-2">High Quality</h3>
              <p className="text-neutral-600">Download HD PNG images ready to print</p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-neutral-200">
              <div className="bg-purple-100 text-purple-600 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Zap size={24} />
              </div>
              <h3 className="text-xl font-semibold text-neutral-900 mb-2">No Sign Up</h3>
              <p className="text-neutral-600">Create QR codes without registration</p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-neutral-200">
              <div className="bg-orange-100 text-orange-600 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Shield size={24} />
              </div>
              <h3 className="text-xl font-semibold text-neutral-900 mb-2">All Types</h3>
              <p className="text-neutral-600">URLs, text, vCards, Wi-Fi, and more</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-gradient-to-br from-pink-500 to-rose-600 text-white">
        <div className="container mx-auto px-4 md:px-6 max-w-4xl text-center">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">Create Your QR Code Now</h2>
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="inline-flex items-center gap-3 bg-white text-pink-600 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-pink-50 transition-all duration-200"
          >
            <QrCode size={24} />
            Generate QR Code - Free Forever
          </button>
        </div>
      </section>

      {showLoginModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8 relative">
            <button onClick={() => setShowLoginModal(false)} className="absolute top-4 right-4">
              <X size={24} />
            </button>
            <div className="text-center mb-6">
              <div className="bg-pink-100 text-pink-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <QrCode size={32} />
              </div>
              <h3 className="text-2xl font-bold text-neutral-900 mb-2">Generation Limit Reached</h3>
              <p className="text-neutral-600">Create a free account for unlimited QR codes</p>
            </div>
            <div className="space-y-3">
              <Link href="/signup" className="block w-full btn-primary btn-lg text-center">
                Sign Up - Free Forever
              </Link>
              <Link href="/login" className="block w-full btn-secondary btn-lg text-center">
                Log In
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
