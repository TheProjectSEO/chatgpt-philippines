'use client';

import { useState } from 'react';
import { Search, Share2, MessageSquare, Monitor, Smartphone } from 'lucide-react';

interface SEOPreviewPanelProps {
  metaTitle: string;
  metaDescription: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImage?: string;
  pagePath: string;
}

export function SEOPreviewPanel({
  metaTitle,
  metaDescription,
  ogTitle,
  ogDescription,
  ogImage,
  twitterTitle,
  twitterDescription,
  twitterImage,
  pagePath,
}: SEOPreviewPanelProps) {
  const [activeTab, setActiveTab] = useState<'google' | 'facebook' | 'twitter'>('google');
  const [deviceView, setDeviceView] = useState<'desktop' | 'mobile'>('desktop');

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://chatgpt-philippines.com';
  const fullUrl = `${siteUrl}${pagePath}`;

  // Use OG values or fall back to meta values
  const displayOgTitle = ogTitle || metaTitle;
  const displayOgDescription = ogDescription || metaDescription;
  const displayOgImage = ogImage || `${siteUrl}/og-image.png`;

  const displayTwitterTitle = twitterTitle || ogTitle || metaTitle;
  const displayTwitterDescription = twitterDescription || ogDescription || metaDescription;
  const displayTwitterImage = twitterImage || ogImage || `${siteUrl}/og-image.png`;

  return (
    <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
      {/* Header */}
      <div className="bg-neutral-50 px-4 py-3 border-b border-neutral-200">
        <div className="flex items-center justify-between">
          <h3 className="font-medium text-neutral-900">SEO Preview</h3>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setDeviceView('desktop')}
              className={`p-2 rounded-lg transition-colors ${
                deviceView === 'desktop'
                  ? 'bg-orange-100 text-orange-700'
                  : 'text-neutral-600 hover:bg-neutral-100'
              }`}
              title="Desktop view"
            >
              <Monitor className="w-4 h-4" />
            </button>
            <button
              onClick={() => setDeviceView('mobile')}
              className={`p-2 rounded-lg transition-colors ${
                deviceView === 'mobile'
                  ? 'bg-orange-100 text-orange-700'
                  : 'text-neutral-600 hover:bg-neutral-100'
              }`}
              title="Mobile view"
            >
              <Smartphone className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-neutral-200">
        <button
          onClick={() => setActiveTab('google')}
          className={`flex-1 px-4 py-3 text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
            activeTab === 'google'
              ? 'text-orange-700 border-b-2 border-orange-500'
              : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50'
          }`}
        >
          <Search className="w-4 h-4" />
          Google
        </button>
        <button
          onClick={() => setActiveTab('facebook')}
          className={`flex-1 px-4 py-3 text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
            activeTab === 'facebook'
              ? 'text-orange-700 border-b-2 border-orange-500'
              : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50'
          }`}
        >
          <Share2 className="w-4 h-4" />
          Facebook
        </button>
        <button
          onClick={() => setActiveTab('twitter')}
          className={`flex-1 px-4 py-3 text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
            activeTab === 'twitter'
              ? 'text-orange-700 border-b-2 border-orange-500'
              : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          Twitter
        </button>
      </div>

      {/* Preview Content */}
      <div className="p-6">
        {activeTab === 'google' && (
          <GooglePreview
            title={metaTitle}
            description={metaDescription}
            url={fullUrl}
            deviceView={deviceView}
          />
        )}
        {activeTab === 'facebook' && (
          <FacebookPreview
            title={displayOgTitle}
            description={displayOgDescription}
            image={displayOgImage}
            url={fullUrl}
            deviceView={deviceView}
          />
        )}
        {activeTab === 'twitter' && (
          <TwitterPreview
            title={displayTwitterTitle}
            description={displayTwitterDescription}
            image={displayTwitterImage}
            url={fullUrl}
            deviceView={deviceView}
          />
        )}
      </div>
    </div>
  );
}

// ============================================================================
// Google Preview Component
// ============================================================================

function GooglePreview({
  title,
  description,
  url,
  deviceView,
}: {
  title: string;
  description: string;
  url: string;
  deviceView: 'desktop' | 'mobile';
}) {
  const displayUrl = url.replace(/^https?:\/\//, '').replace(/\/$/, '');
  const maxWidth = deviceView === 'mobile' ? 'max-w-sm' : 'max-w-2xl';

  return (
    <div className={`${maxWidth} mx-auto`}>
      <div className="space-y-1">
        {/* URL */}
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-neutral-200 flex items-center justify-center text-xs font-bold text-neutral-600">
            C
          </div>
          <div className="text-sm text-neutral-700">{displayUrl}</div>
        </div>

        {/* Title */}
        <h3 className="text-xl text-blue-600 hover:underline cursor-pointer line-clamp-1">
          {title || 'Page Title'}
        </h3>

        {/* Description */}
        <p className="text-sm text-neutral-700 line-clamp-2">
          {description || 'Meta description will appear here...'}
        </p>
      </div>

      {/* Character counts */}
      <div className="mt-4 pt-4 border-t border-neutral-200 space-y-2 text-xs text-neutral-600">
        <div className="flex justify-between">
          <span>Title length:</span>
          <span className={title.length > 60 ? 'text-orange-600 font-medium' : ''}>
            {title.length} / 60 characters
          </span>
        </div>
        <div className="flex justify-between">
          <span>Description length:</span>
          <span className={description.length > 160 ? 'text-orange-600 font-medium' : ''}>
            {description.length} / 160 characters
          </span>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Facebook Preview Component
// ============================================================================

function FacebookPreview({
  title,
  description,
  image,
  url,
  deviceView,
}: {
  title: string;
  description: string;
  image: string;
  url: string;
  deviceView: 'desktop' | 'mobile';
}) {
  const displayUrl = url.replace(/^https?:\/\//, '').toUpperCase();
  const maxWidth = deviceView === 'mobile' ? 'max-w-sm' : 'max-w-lg';

  return (
    <div className={`${maxWidth} mx-auto`}>
      <div className="border border-neutral-300 rounded-lg overflow-hidden bg-white">
        {/* Image */}
        <div className="aspect-[1.91/1] bg-neutral-200 relative">
          {image ? (
            <img src={image} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-neutral-400">
              No image
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-3 bg-neutral-50">
          <div className="text-xs text-neutral-500 uppercase mb-1">{displayUrl}</div>
          <h4 className="font-semibold text-neutral-900 line-clamp-2 mb-1">
            {title || 'OG Title'}
          </h4>
          <p className="text-sm text-neutral-600 line-clamp-2">
            {description || 'OG Description will appear here...'}
          </p>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Twitter Preview Component
// ============================================================================

function TwitterPreview({
  title,
  description,
  image,
  url,
  deviceView,
}: {
  title: string;
  description: string;
  image: string;
  url: string;
  deviceView: 'desktop' | 'mobile';
}) {
  const displayUrl = url.replace(/^https?:\/\//, '');
  const maxWidth = deviceView === 'mobile' ? 'max-w-sm' : 'max-w-lg';

  return (
    <div className={`${maxWidth} mx-auto`}>
      <div className="border border-neutral-300 rounded-2xl overflow-hidden bg-white">
        {/* Image */}
        <div className="aspect-[2/1] bg-neutral-200 relative">
          {image ? (
            <img src={image} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-neutral-400">
              No image
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-3">
          <h4 className="font-semibold text-neutral-900 line-clamp-1 mb-1">
            {title || 'Twitter Title'}
          </h4>
          <p className="text-sm text-neutral-600 line-clamp-2 mb-2">
            {description || 'Twitter description will appear here...'}
          </p>
          <div className="text-xs text-neutral-500">{displayUrl}</div>
        </div>
      </div>
    </div>
  );
}
