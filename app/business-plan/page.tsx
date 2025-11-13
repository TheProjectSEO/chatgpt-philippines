'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Briefcase, Copy, Check, ChevronDown, ChevronRight, X, Sparkles, TrendingUp, Users, FileText, Zap, Shield } from 'lucide-react';

const industries = ['Technology', 'Retail', 'Food & Beverage', 'Healthcare', 'Education', 'Real Estate', 'Manufacturing', 'Services', 'E-commerce', 'Consulting'];
const sections = ['Full Plan', 'Executive Summary', 'Market Analysis', 'Marketing Strategy', 'Financial Projections', 'Operations Plan'];

export default function BusinessPlanPage() {
  const [businessIdea, setBusinessIdea] = useState('');
  const [industry, setIndustry] = useState('Technology');
  const [targetMarket, setTargetMarket] = useState('');
  const [section, setSection] = useState('Full Plan');
  const [businessPlan, setBusinessPlan] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [guestGenerations, setGuestGenerations] = useState(0);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showIndustryDropdown, setShowIndustryDropdown] = useState(false);
  const [showSectionDropdown, setShowSectionDropdown] = useState(false);

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
    if (!businessIdea.trim() || !targetMarket.trim()) {
      alert('Please provide business idea and target market');
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

      const response = await fetch('/api/business-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessIdea,
          industry,
          targetMarket,
          section: section.toLowerCase().replace(' ', '-'),
        }),
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

      setBusinessPlan(data.businessPlan);

    } catch (error: any) {
      console.error('Generation error:', error);
      alert(error.message || 'Failed to generate. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = async () => {
    if (!businessPlan) return;
    try {
      await navigator.clipboard.writeText(businessPlan);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const loadSample = () => {
    setBusinessIdea('AI-powered tutoring platform that connects students with personalized learning assistants');
    setTargetMarket('High school and college students aged 15-25 in urban areas');
  };

  return (
    <div className="min-h-screen bg-white">
      <section className="relative bg-gradient-to-br from-orange-50 via-white to-purple-50 pt-24 pb-16 md:pt-32 md:pb-24">
        <div className="container mx-auto px-4 md:px-6 max-w-7xl">
          <div className="flex items-center gap-2 text-sm text-neutral-600 mb-6">
            <Link href="/" className="hover:text-primary-600 transition-colors">Home</Link>
            <ChevronRight size={16} />
            <span className="text-neutral-800 font-medium">Business Plan Generator</span>
          </div>

          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Briefcase size={18} />
              <span>Professional Business Plans</span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-neutral-900 mb-6 leading-tight">
              AI Business Plan Generator -{' '}
              <span className="bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent">
                Launch Faster
              </span>
            </h1>

            <p className="text-lg md:text-xl text-neutral-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              Create comprehensive business plans with market analysis, financial projections, and growth strategies.
            </p>

            <div className="flex flex-wrap justify-center gap-8 md:gap-12 mb-8">
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-orange-600">10K+</div>
                <div className="text-sm text-neutral-600">Plans</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-orange-600">10+</div>
                <div className="text-sm text-neutral-600">Industries</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-orange-600">Free</div>
                <div className="text-sm text-neutral-600">Forever</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4 md:px-6 max-w-7xl">
          <div className="bg-white rounded-2xl shadow-lg border border-neutral-200 overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-2 border-b border-neutral-200">
              <div className="relative border-b md:border-b-0 md:border-r border-neutral-200">
                <button onClick={() => setShowIndustryDropdown(!showIndustryDropdown)} className="w-full flex items-center justify-between gap-3 p-4 hover:bg-neutral-50 transition-colors">
                  <span className="font-medium text-neutral-800">{industry}</span>
                  <ChevronDown size={20} className="text-neutral-500" />
                </button>
                {showIndustryDropdown && (
                  <div className="absolute top-full left-0 right-0 bg-white border border-neutral-200 rounded-b-lg shadow-xl z-50 max-h-96 overflow-y-auto">
                    {industries.map((ind) => (
                      <button key={ind} onClick={() => { setIndustry(ind); setShowIndustryDropdown(false); }} className="w-full text-left px-4 py-3 hover:bg-orange-50 transition-colors">{ind}</button>
                    ))}
                  </div>
                )}
              </div>

              <div className="relative">
                <button onClick={() => setShowSectionDropdown(!showSectionDropdown)} className="w-full flex items-center justify-between gap-3 p-4 hover:bg-neutral-50 transition-colors">
                  <span className="font-medium text-neutral-800">{section}</span>
                  <ChevronDown size={20} className="text-neutral-500" />
                </button>
                {showSectionDropdown && (
                  <div className="absolute top-full left-0 right-0 bg-white border border-neutral-200 rounded-b-lg shadow-xl z-50">
                    {sections.map((sec) => (
                      <button key={sec} onClick={() => { setSection(sec); setShowSectionDropdown(false); }} className="w-full text-left px-4 py-3 hover:bg-orange-50 transition-colors">{sec}</button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="p-6 space-y-4 border-b border-neutral-200">
              <div>
                <label className="text-sm font-medium text-neutral-700 mb-2 flex justify-between">
                  <span>Business Idea</span>
                  <button onClick={loadSample} className="text-sm text-orange-600 hover:text-orange-700">Load sample</button>
                </label>
                <textarea value={businessIdea} onChange={(e) => setBusinessIdea(e.target.value)} placeholder="Describe your business idea..." className="w-full h-24 p-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none" />
              </div>
              <div>
                <label className="text-sm font-medium text-neutral-700 mb-2 block">Target Market</label>
                <input type="text" value={targetMarket} onChange={(e) => setTargetMarket(e.target.value)} placeholder="Who are your customers?" className="w-full p-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500" />
              </div>
            </div>

            <div className="p-6 bg-neutral-50">
              <div className="flex items-center justify-between mb-4">
                <label className="text-sm font-medium text-neutral-700">Business Plan</label>
                {businessPlan && (
                  <button onClick={handleCopy} className="p-2 rounded-lg hover:bg-white transition-colors">
                    {copied ? <Check size={18} className="text-green-600" /> : <Copy size={18} className="text-neutral-600" />}
                  </button>
                )}
              </div>

              <div className="w-full h-96 p-4 bg-white border border-neutral-300 rounded-lg overflow-y-auto">
                {isGenerating ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mb-3"></div>
                      <p className="text-neutral-600">Creating your business plan...</p>
                    </div>
                  </div>
                ) : businessPlan ? (
                  <p className="text-neutral-800 whitespace-pre-wrap" style={{ fontSize: '16px' }}>{businessPlan}</p>
                ) : (
                  <p className="text-neutral-400">Your business plan will appear here...</p>
                )}
              </div>
            </div>

            <div className="border-t border-neutral-200 p-6 bg-neutral-50">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-sm text-neutral-600">
                  Guest generations remaining: <span className="font-semibold text-orange-600">{guestGenerations}</span>
                </div>
                <button onClick={handleGenerate} disabled={isGenerating || !businessIdea.trim() || !targetMarket.trim()} className="w-full sm:w-auto btn-primary btn-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
                  {isGenerating ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Generating...
                    </>
                  ) : (
                    <>
                      <Briefcase size={20} />
                      Generate Plan
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-gradient-to-br from-orange-500 to-orange-600 text-white">
        <div className="container mx-auto px-4 md:px-6 max-w-4xl text-center">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">Create Your Business Plan Now</h2>
          <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="inline-flex items-center gap-3 bg-white text-orange-600 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-orange-50 transition-all duration-200">
            <Briefcase size={24} />
            Generate Plan - Free Forever
          </button>
        </div>
      </section>

      {showLoginModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8 relative">
            <button onClick={() => setShowLoginModal(false)} className="absolute top-4 right-4"><X size={24} /></button>
            <div className="text-center mb-6">
              <div className="bg-orange-100 text-orange-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Briefcase size={32} />
              </div>
              <h3 className="text-2xl font-bold text-neutral-900 mb-2">Generation Limit Reached</h3>
              <p className="text-neutral-600">Create a free account for unlimited business plans</p>
            </div>
            <div className="space-y-3">
              <Link href="/signup" className="block w-full btn-primary btn-lg text-center">Sign Up - Free Forever</Link>
              <Link href="/login" className="block w-full btn-secondary btn-lg text-center">Log In</Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
