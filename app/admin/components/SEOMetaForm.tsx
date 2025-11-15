'use client';

import { useState } from 'react';
import { AlertCircle, CheckCircle } from 'lucide-react';

interface SEOMetaFormProps {
  initialData?: SEOMetaData;
  onSave: (data: SEOMetaData) => Promise<void>;
}

export interface SEOMetaData {
  metaTitle: string;
  metaDescription: string;
  keywords: string[];
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  canonicalUrl?: string;
  noIndex?: boolean;
  noFollow?: boolean;
}

export function SEOMetaForm({ initialData, onSave }: SEOMetaFormProps) {
  const [formData, setFormData] = useState<SEOMetaData>(
    initialData || {
      metaTitle: '',
      metaDescription: '',
      keywords: [],
      noIndex: false,
      noFollow: false,
    }
  );
  const [isSaving, setIsSaving] = useState(false);
  const [keywordInput, setKeywordInput] = useState('');

  const handleAddKeyword = () => {
    if (keywordInput.trim() && !formData.keywords.includes(keywordInput.trim())) {
      setFormData({
        ...formData,
        keywords: [...formData.keywords, keywordInput.trim()],
      });
      setKeywordInput('');
    }
  };

  const handleRemoveKeyword = (keyword: string) => {
    setFormData({
      ...formData,
      keywords: formData.keywords.filter((k) => k !== keyword),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onSave(formData);
    } finally {
      setIsSaving(false);
    }
  };

  const titleLength = formData.metaTitle.length;
  const descLength = formData.metaDescription.length;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Meta Title */}
      <div>
        <label className="block text-sm font-medium text-neutral-900 mb-2">
          Meta Title
          <span className="text-orange-500 ml-1">*</span>
        </label>
        <input
          type="text"
          value={formData.metaTitle}
          onChange={(e) => setFormData({ ...formData, metaTitle: e.target.value })}
          className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          placeholder="Enter meta title (50-60 characters recommended)"
          required
        />
        <div className="mt-2 flex items-center justify-between text-sm">
          <span
            className={`${
              titleLength >= 50 && titleLength <= 60
                ? 'text-green-600'
                : titleLength > 60
                ? 'text-orange-600'
                : 'text-neutral-500'
            }`}
          >
            {titleLength} characters
          </span>
          {titleLength >= 50 && titleLength <= 60 && (
            <span className="flex items-center gap-1 text-green-600">
              <CheckCircle className="w-4 h-4" />
              Optimal length
            </span>
          )}
          {titleLength > 60 && (
            <span className="flex items-center gap-1 text-orange-600">
              <AlertCircle className="w-4 h-4" />
              Too long
            </span>
          )}
        </div>
      </div>

      {/* Meta Description */}
      <div>
        <label className="block text-sm font-medium text-neutral-900 mb-2">
          Meta Description
          <span className="text-orange-500 ml-1">*</span>
        </label>
        <textarea
          value={formData.metaDescription}
          onChange={(e) => setFormData({ ...formData, metaDescription: e.target.value })}
          rows={3}
          className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
          placeholder="Enter meta description (150-160 characters recommended)"
          required
        />
        <div className="mt-2 flex items-center justify-between text-sm">
          <span
            className={`${
              descLength >= 150 && descLength <= 160
                ? 'text-green-600'
                : descLength > 160
                ? 'text-orange-600'
                : 'text-neutral-500'
            }`}
          >
            {descLength} characters
          </span>
          {descLength >= 150 && descLength <= 160 && (
            <span className="flex items-center gap-1 text-green-600">
              <CheckCircle className="w-4 h-4" />
              Optimal length
            </span>
          )}
          {descLength > 160 && (
            <span className="flex items-center gap-1 text-orange-600">
              <AlertCircle className="w-4 h-4" />
              Too long
            </span>
          )}
        </div>
      </div>

      {/* Keywords */}
      <div>
        <label className="block text-sm font-medium text-neutral-900 mb-2">
          Keywords
        </label>
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            value={keywordInput}
            onChange={(e) => setKeywordInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddKeyword())}
            className="flex-1 px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            placeholder="Add keyword and press Enter"
          />
          <button
            type="button"
            onClick={handleAddKeyword}
            className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
          >
            Add
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {formData.keywords.map((keyword) => (
            <span
              key={keyword}
              className="inline-flex items-center gap-2 px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm"
            >
              {keyword}
              <button
                type="button"
                onClick={() => handleRemoveKeyword(keyword)}
                className="text-orange-600 hover:text-orange-800"
              >
                &times;
              </button>
            </span>
          ))}
        </div>
      </div>

      {/* Open Graph */}
      <div className="pt-6 border-t border-neutral-200">
        <h3 className="text-lg font-semibold text-neutral-900 mb-4">
          Open Graph (Social Media)
        </h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-900 mb-2">
              OG Title
            </label>
            <input
              type="text"
              value={formData.ogTitle || ''}
              onChange={(e) => setFormData({ ...formData, ogTitle: e.target.value })}
              className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="Leave empty to use meta title"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-900 mb-2">
              OG Description
            </label>
            <textarea
              value={formData.ogDescription || ''}
              onChange={(e) => setFormData({ ...formData, ogDescription: e.target.value })}
              rows={2}
              className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
              placeholder="Leave empty to use meta description"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-900 mb-2">
              OG Image URL
            </label>
            <input
              type="url"
              value={formData.ogImage || ''}
              onChange={(e) => setFormData({ ...formData, ogImage: e.target.value })}
              className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="https://example.com/image.jpg"
            />
          </div>
        </div>
      </div>

      {/* Advanced Options */}
      <div className="pt-6 border-t border-neutral-200">
        <h3 className="text-lg font-semibold text-neutral-900 mb-4">
          Advanced Options
        </h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-900 mb-2">
              Canonical URL
            </label>
            <input
              type="url"
              value={formData.canonicalUrl || ''}
              onChange={(e) => setFormData({ ...formData, canonicalUrl: e.target.value })}
              className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="https://example.com/page"
            />
          </div>

          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.noIndex || false}
                onChange={(e) => setFormData({ ...formData, noIndex: e.target.checked })}
                className="w-4 h-4 text-orange-600 rounded focus:ring-orange-500"
              />
              <span className="text-sm text-neutral-700">No Index</span>
            </label>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.noFollow || false}
                onChange={(e) => setFormData({ ...formData, noFollow: e.target.checked })}
                className="w-4 h-4 text-orange-600 rounded focus:ring-orange-500"
              />
              <span className="text-sm text-neutral-700">No Follow</span>
            </label>
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <div className="pt-6 border-t border-neutral-200">
        <button
          type="submit"
          disabled={isSaving}
          className="w-full px-6 py-3 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSaving ? 'Saving...' : 'Save SEO Settings'}
        </button>
      </div>
    </form>
  );
}
