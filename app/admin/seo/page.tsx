'use client';

import { useState } from 'react';
import { SEOMetaForm, SEOMetaData } from '../components/SEOMetaForm';
import { Search, CheckCircle, AlertCircle } from 'lucide-react';

interface PageSEO {
  id: string;
  title: string;
  slug: string;
  seoScore: number;
  metaData: SEOMetaData;
}

export default function SEOManager() {
  const [selectedPage, setSelectedPage] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // TODO: Replace with actual data from database
  const pages: PageSEO[] = [
    {
      id: '1',
      title: 'Paraphraser Tool',
      slug: '/paraphraser',
      seoScore: 92,
      metaData: {
        metaTitle: 'Free Paraphrasing Tool - ChatGPT Philippines',
        metaDescription:
          'Rephrase and rewrite text instantly with our AI-powered paraphrasing tool. Free, fast, and perfect for Filipino students and professionals.',
        keywords: ['paraphraser', 'paraphrasing tool', 'ai paraphraser', 'filipino'],
      },
    },
    {
      id: '2',
      title: 'AI Chat Assistant',
      slug: '/chat',
      seoScore: 88,
      metaData: {
        metaTitle: 'Free AI Chat Assistant - ChatGPT Philippines',
        metaDescription:
          'Chat with AI for free. Get instant answers, creative writing help, and more with our Filipino-friendly AI assistant.',
        keywords: ['ai chat', 'chatgpt', 'ai assistant', 'free chat'],
      },
    },
    {
      id: '3',
      title: 'Grammar Checker',
      slug: '/grammar-checker',
      seoScore: 65,
      metaData: {
        metaTitle: 'Grammar Checker',
        metaDescription: 'Check your grammar',
        keywords: ['grammar'],
      },
    },
  ];

  const filteredPages = pages.filter((page) =>
    page.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSaveSEO = async (data: SEOMetaData) => {
    // TODO: Implement save functionality
    console.log('Saving SEO data:', data);
    alert('SEO data saved successfully!');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-neutral-900 mb-2">SEO Manager</h1>
        <p className="text-neutral-600">Optimize your pages for search engines</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pages List */}
        <div className="lg:col-span-1 space-y-4">
          {/* Search */}
          <div className="bg-white rounded-xl border border-neutral-200 p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search pages..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Page List */}
          <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
            <div className="divide-y divide-neutral-200">
              {filteredPages.map((page) => (
                <button
                  key={page.id}
                  onClick={() => setSelectedPage(page.id)}
                  className={`w-full text-left p-4 hover:bg-neutral-50 transition-colors ${
                    selectedPage === page.id ? 'bg-orange-50' : ''
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="font-medium text-neutral-900">{page.title}</div>
                    <div
                      className={`flex items-center gap-1 text-sm ${
                        page.seoScore >= 80
                          ? 'text-green-600'
                          : page.seoScore >= 60
                          ? 'text-yellow-600'
                          : 'text-red-600'
                      }`}
                    >
                      {page.seoScore >= 80 ? (
                        <CheckCircle className="w-4 h-4" />
                      ) : (
                        <AlertCircle className="w-4 h-4" />
                      )}
                      {page.seoScore}
                    </div>
                  </div>
                  <div className="text-sm text-neutral-600">{page.slug}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* SEO Form */}
        <div className="lg:col-span-2">
          {selectedPage ? (
            <div className="bg-white rounded-xl border border-neutral-200 p-6">
              <h2 className="text-xl font-bold text-neutral-900 mb-6">
                Edit SEO - {pages.find((p) => p.id === selectedPage)?.title}
              </h2>
              <SEOMetaForm
                initialData={pages.find((p) => p.id === selectedPage)?.metaData}
                onSave={handleSaveSEO}
              />
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-neutral-200 p-12 text-center">
              <div className="text-neutral-400 mb-2">
                <Search className="w-12 h-12 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-neutral-900 mb-1">
                Select a Page
              </h3>
              <p className="text-neutral-600">
                Choose a page from the list to edit its SEO settings
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
