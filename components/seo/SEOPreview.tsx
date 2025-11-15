'use client';

/**
 * SEO Preview Component
 *
 * Visual preview of how the page will appear in:
 * - Google Search Results
 * - Facebook/Open Graph shares
 * - Twitter Card shares
 *
 * Useful for CMS admin panels and content creation tools.
 */

import { useState } from 'react';
import { SEOPreview as SEOPreviewType, GooglePreview, FacebookPreview, TwitterPreview } from '@/lib/seo/types';

interface SEOPreviewProps {
  title: string;
  description: string;
  url?: string;
  image?: string;
  siteName?: string;
  twitterHandle?: string;
  breadcrumbs?: string[];
}

export default function SEOPreview({
  title,
  description,
  url = 'https://chatgpt-philippines.com',
  image = 'https://chatgpt-philippines.com/og-image.png',
  siteName = 'ChatGPT Philippines',
  twitterHandle = '@chatgptph',
  breadcrumbs = [],
}: SEOPreviewProps) {
  const [activeTab, setActiveTab] = useState<'google' | 'facebook' | 'twitter'>('google');

  // Truncate text to match platform limits
  const truncate = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength - 3) + '...';
  };

  const googleTitle = truncate(title, 60);
  const googleDescription = truncate(description, 160);
  const twitterTitle = truncate(title, 70);
  const twitterDescription = truncate(description, 200);

  return (
    <div className="w-full max-w-4xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Tab Navigation */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab('google')}
          className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
            activeTab === 'google'
              ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
          }`}
        >
          <div className="flex items-center justify-center gap-2">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" />
            </svg>
            Google
          </div>
        </button>
        <button
          onClick={() => setActiveTab('facebook')}
          className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
            activeTab === 'facebook'
              ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
          }`}
        >
          <div className="flex items-center justify-center gap-2">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
            Facebook
          </div>
        </button>
        <button
          onClick={() => setActiveTab('twitter')}
          className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
            activeTab === 'twitter'
              ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
          }`}
        >
          <div className="flex items-center justify-center gap-2">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
            </svg>
            Twitter
          </div>
        </button>
      </div>

      {/* Preview Content */}
      <div className="p-8 bg-gray-50 min-h-[400px]">
        {/* Google Preview */}
        {activeTab === 'google' && (
          <div className="space-y-3">
            <div className="text-xs text-gray-600 mb-2">Preview as it would appear in Google Search</div>
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              {breadcrumbs.length > 0 && (
                <div className="flex items-center gap-1 text-xs text-gray-600 mb-2">
                  {breadcrumbs.map((crumb, index) => (
                    <span key={index} className="flex items-center">
                      {index > 0 && <span className="mx-1">›</span>}
                      <span>{crumb}</span>
                    </span>
                  ))}
                </div>
              )}
              <div className="text-blue-600 text-xl hover:underline cursor-pointer font-medium mb-1">
                {googleTitle}
              </div>
              <div className="text-green-700 text-sm mb-2">{url}</div>
              <div className="text-gray-600 text-sm leading-relaxed">
                {googleDescription}
              </div>
            </div>
            <div className="mt-4 text-xs text-gray-500">
              Title: {title.length}/60 characters {title.length > 60 && <span className="text-orange-500">(truncated)</span>}
              <br />
              Description: {description.length}/160 characters {description.length > 160 && <span className="text-orange-500">(truncated)</span>}
            </div>
          </div>
        )}

        {/* Facebook Preview */}
        {activeTab === 'facebook' && (
          <div className="space-y-3">
            <div className="text-xs text-gray-600 mb-2">Preview as it would appear on Facebook</div>
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden max-w-[500px]">
              {image && (
                <div className="aspect-[1.91/1] bg-gray-200 relative">
                  <img
                    src={image}
                    alt={title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="p-4 border-t border-gray-200">
                <div className="text-xs text-gray-500 uppercase mb-1">{new URL(url).hostname}</div>
                <div className="text-gray-900 font-semibold text-base mb-1 line-clamp-2">
                  {title}
                </div>
                <div className="text-gray-600 text-sm line-clamp-2">
                  {truncate(description, 300)}
                </div>
              </div>
            </div>
            <div className="mt-4 text-xs text-gray-500">
              Recommended image size: 1200x630px
              <br />
              Current title length: {title.length} characters
            </div>
          </div>
        )}

        {/* Twitter Preview */}
        {activeTab === 'twitter' && (
          <div className="space-y-3">
            <div className="text-xs text-gray-600 mb-2">Preview as it would appear on Twitter</div>
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden max-w-[500px]">
              {image && (
                <div className="aspect-[2/1] bg-gray-200 relative">
                  <img
                    src={image}
                    alt={title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="p-4">
                <div className="text-gray-900 font-semibold text-base mb-1 line-clamp-2">
                  {twitterTitle}
                </div>
                <div className="text-gray-600 text-sm mb-2 line-clamp-2">
                  {twitterDescription}
                </div>
                <div className="flex items-center gap-1 text-gray-500 text-xs">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                    <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
                  </svg>
                  {new URL(url).hostname}
                </div>
              </div>
            </div>
            <div className="mt-4 text-xs text-gray-500">
              Title: {title.length}/70 characters {title.length > 70 && <span className="text-orange-500">(truncated)</span>}
              <br />
              Description: {description.length}/200 characters {description.length > 200 && <span className="text-orange-500">(truncated)</span>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
