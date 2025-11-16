'use client';

import { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, Save, Eye, Code } from 'lucide-react';
import { SchemaMarkupEditor } from './SchemaMarkupEditor';
import { SEOPreviewPanel } from './SEOPreviewPanel';
import { SEOMetadataDB } from '@/lib/seo/api-client';

interface EnhancedSEOMetaFormProps {
  initialData?: Partial<SEOMetadataDB>;
  onSave: (data: any) => Promise<void>;
  pagePath?: string;
}

export function EnhancedSEOMetaForm({
  initialData,
  onSave,
  pagePath = '/',
}: EnhancedSEOMetaFormProps) {
  const [formData, setFormData] = useState({
    // Basic
    page_title: initialData?.page_title || '',
    meta_title: initialData?.meta_title || '',
    meta_description: initialData?.meta_description || '',
    meta_keywords: initialData?.meta_keywords || [],

    // Robots
    robots_index: initialData?.robots_index ?? true,
    robots_follow: initialData?.robots_follow ?? true,
    robots_noarchive: initialData?.robots_noarchive ?? false,
    robots_nosnippet: initialData?.robots_nosnippet ?? false,

    // URLs
    canonical_url: initialData?.canonical_url || '',

    // Open Graph
    og_title: initialData?.og_title || '',
    og_description: initialData?.og_description || '',
    og_image: initialData?.og_image || '',
    og_type: initialData?.og_type || 'website',

    // Twitter
    twitter_card: initialData?.twitter_card || 'summary_large_image',
    twitter_title: initialData?.twitter_title || '',
    twitter_description: initialData?.twitter_description || '',
    twitter_image: initialData?.twitter_image || '',

    // Schema
    schema_enabled: initialData?.schema_enabled ?? true,
    schema_types: initialData?.schema_types || [],
    schema_data: initialData?.schema_data || {},

    // Additional
    author: initialData?.author || '',
    section: initialData?.section || '',
    tags: initialData?.tags || [],
  });

  const [keywordInput, setKeywordInput] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(true);
  const [activeSection, setActiveSection] = useState('basic');

  const handleAddKeyword = () => {
    if (keywordInput.trim() && !formData.meta_keywords.includes(keywordInput.trim())) {
      setFormData({
        ...formData,
        meta_keywords: [...formData.meta_keywords, keywordInput.trim()],
      });
      setKeywordInput('');
    }
  };

  const handleRemoveKeyword = (keyword: string) => {
    setFormData({
      ...formData,
      meta_keywords: formData.meta_keywords.filter((k) => k !== keyword),
    });
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData({
        ...formData,
        tags: [...formData.tags, tagInput.trim()],
      });
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter((t) => t !== tag),
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

  const sections = [
    { id: 'basic', label: 'Basic Meta' },
    { id: 'opengraph', label: 'Open Graph' },
    { id: 'twitter', label: 'Twitter Card' },
    { id: 'schema', label: 'Schema Markup' },
    { id: 'advanced', label: 'Advanced' },
  ];

  const titleLength = formData.meta_title.length;
  const descLength = formData.meta_description.length;

  return (
    <div className="space-y-6">
      {/* Preview Toggle */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                activeSection === section.id
                  ? 'bg-orange-500 text-white'
                  : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
              }`}
            >
              {section.label}
            </button>
          ))}
        </div>
        <button
          onClick={() => setShowPreview(!showPreview)}
          className="px-3 py-1.5 text-sm bg-neutral-100 text-neutral-700 rounded-lg hover:bg-neutral-200 transition-colors flex items-center gap-2"
        >
          <Eye className="w-4 h-4" />
          {showPreview ? 'Hide' : 'Show'} Preview
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form */}
        <div>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Meta Section */}
            {activeSection === 'basic' && (
              <div className="bg-white rounded-xl border border-neutral-200 p-6 space-y-6">
                <h3 className="text-lg font-semibold text-neutral-900">Basic Meta Tags</h3>

                {/* Page Title */}
                <div>
                  <label className="block text-sm font-medium text-neutral-900 mb-2">
                    Page Title (Internal Reference)
                  </label>
                  <input
                    type="text"
                    value={formData.page_title}
                    onChange={(e) => setFormData({ ...formData, page_title: e.target.value })}
                    className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="Internal page title"
                  />
                </div>

                {/* Meta Title */}
                <div>
                  <label className="block text-sm font-medium text-neutral-900 mb-2">
                    Meta Title
                    <span className="text-orange-500 ml-1">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.meta_title}
                    onChange={(e) => setFormData({ ...formData, meta_title: e.target.value })}
                    className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
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
                        Optimal
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
                    value={formData.meta_description}
                    onChange={(e) =>
                      setFormData({ ...formData, meta_description: e.target.value })
                    }
                    rows={3}
                    className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
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
                        Optimal
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
                      onKeyPress={(e) =>
                        e.key === 'Enter' && (e.preventDefault(), handleAddKeyword())
                      }
                      className="flex-1 px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                      placeholder="Add keyword and press Enter"
                    />
                    <button
                      type="button"
                      onClick={handleAddKeyword}
                      className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
                    >
                      Add
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.meta_keywords.map((keyword) => (
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

                {/* Canonical URL */}
                <div>
                  <label className="block text-sm font-medium text-neutral-900 mb-2">
                    Canonical URL
                  </label>
                  <input
                    type="url"
                    value={formData.canonical_url}
                    onChange={(e) => setFormData({ ...formData, canonical_url: e.target.value })}
                    className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="https://example.com/page"
                  />
                </div>
              </div>
            )}

            {/* Open Graph Section */}
            {activeSection === 'opengraph' && (
              <div className="bg-white rounded-xl border border-neutral-200 p-6 space-y-6">
                <h3 className="text-lg font-semibold text-neutral-900">Open Graph Tags</h3>

                <div>
                  <label className="block text-sm font-medium text-neutral-900 mb-2">
                    OG Title
                  </label>
                  <input
                    type="text"
                    value={formData.og_title}
                    onChange={(e) => setFormData({ ...formData, og_title: e.target.value })}
                    className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="Leave empty to use meta title"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-900 mb-2">
                    OG Description
                  </label>
                  <textarea
                    value={formData.og_description}
                    onChange={(e) => setFormData({ ...formData, og_description: e.target.value })}
                    rows={2}
                    className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
                    placeholder="Leave empty to use meta description"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-900 mb-2">
                    OG Image URL
                  </label>
                  <input
                    type="url"
                    value={formData.og_image}
                    onChange={(e) => setFormData({ ...formData, og_image: e.target.value })}
                    className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="https://example.com/image.jpg (1200x630 recommended)"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-900 mb-2">
                    OG Type
                  </label>
                  <select
                    value={formData.og_type}
                    onChange={(e) => setFormData({ ...formData, og_type: e.target.value })}
                    className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="website">Website</option>
                    <option value="article">Article</option>
                    <option value="profile">Profile</option>
                    <option value="book">Book</option>
                  </select>
                </div>
              </div>
            )}

            {/* Twitter Section */}
            {activeSection === 'twitter' && (
              <div className="bg-white rounded-xl border border-neutral-200 p-6 space-y-6">
                <h3 className="text-lg font-semibold text-neutral-900">Twitter Card Tags</h3>

                <div>
                  <label className="block text-sm font-medium text-neutral-900 mb-2">
                    Twitter Card Type
                  </label>
                  <select
                    value={formData.twitter_card}
                    onChange={(e) => setFormData({ ...formData, twitter_card: e.target.value })}
                    className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="summary">Summary</option>
                    <option value="summary_large_image">Summary Large Image</option>
                    <option value="app">App</option>
                    <option value="player">Player</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-900 mb-2">
                    Twitter Title
                  </label>
                  <input
                    type="text"
                    value={formData.twitter_title}
                    onChange={(e) => setFormData({ ...formData, twitter_title: e.target.value })}
                    className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="Leave empty to use OG title or meta title"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-900 mb-2">
                    Twitter Description
                  </label>
                  <textarea
                    value={formData.twitter_description}
                    onChange={(e) =>
                      setFormData({ ...formData, twitter_description: e.target.value })
                    }
                    rows={2}
                    className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
                    placeholder="Leave empty to use OG description or meta description"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-900 mb-2">
                    Twitter Image URL
                  </label>
                  <input
                    type="url"
                    value={formData.twitter_image}
                    onChange={(e) => setFormData({ ...formData, twitter_image: e.target.value })}
                    className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
              </div>
            )}

            {/* Schema Section */}
            {activeSection === 'schema' && (
              <div className="bg-white rounded-xl border border-neutral-200 p-6">
                <h3 className="text-lg font-semibold text-neutral-900 mb-4">
                  Schema Markup (JSON-LD)
                </h3>
                <SchemaMarkupEditor
                  schemaData={formData.schema_data}
                  schemaTypes={formData.schema_types}
                  onChange={(data, types) =>
                    setFormData({ ...formData, schema_data: data, schema_types: types })
                  }
                />
              </div>
            )}

            {/* Advanced Section */}
            {activeSection === 'advanced' && (
              <div className="bg-white rounded-xl border border-neutral-200 p-6 space-y-6">
                <h3 className="text-lg font-semibold text-neutral-900">Advanced Options</h3>

                {/* Robots */}
                <div>
                  <label className="block text-sm font-medium text-neutral-900 mb-3">
                    Robots Directives
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.robots_index}
                        onChange={(e) =>
                          setFormData({ ...formData, robots_index: e.target.checked })
                        }
                        className="w-4 h-4 text-orange-600 rounded focus:ring-orange-500"
                      />
                      <span className="text-sm text-neutral-700">Index (allow in search results)</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.robots_follow}
                        onChange={(e) =>
                          setFormData({ ...formData, robots_follow: e.target.checked })
                        }
                        className="w-4 h-4 text-orange-600 rounded focus:ring-orange-500"
                      />
                      <span className="text-sm text-neutral-700">Follow links</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.robots_noarchive}
                        onChange={(e) =>
                          setFormData({ ...formData, robots_noarchive: e.target.checked })
                        }
                        className="w-4 h-4 text-orange-600 rounded focus:ring-orange-500"
                      />
                      <span className="text-sm text-neutral-700">No Archive (prevent cached copy)</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.robots_nosnippet}
                        onChange={(e) =>
                          setFormData({ ...formData, robots_nosnippet: e.target.checked })
                        }
                        className="w-4 h-4 text-orange-600 rounded focus:ring-orange-500"
                      />
                      <span className="text-sm text-neutral-700">No Snippet (no text preview)</span>
                    </label>
                  </div>
                </div>

                {/* Author & Section */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-900 mb-2">
                      Author
                    </label>
                    <input
                      type="text"
                      value={formData.author}
                      onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                      className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                      placeholder="Author name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-900 mb-2">
                      Section
                    </label>
                    <input
                      type="text"
                      value={formData.section}
                      onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                      className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                      placeholder="Article section"
                    />
                  </div>
                </div>

                {/* Tags */}
                <div>
                  <label className="block text-sm font-medium text-neutral-900 mb-2">Tags</label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                      className="flex-1 px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                      placeholder="Add tag and press Enter"
                    />
                    <button
                      type="button"
                      onClick={handleAddTag}
                      className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
                    >
                      Add
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tag)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          &times;
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div className="sticky bottom-0 bg-white border-t border-neutral-200 p-4 -mx-6 -mb-6 rounded-b-xl">
              <button
                type="submit"
                disabled={isSaving}
                className="w-full px-6 py-3 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Save className="w-5 h-5" />
                {isSaving ? 'Saving...' : 'Save SEO Settings'}
              </button>
            </div>
          </form>
        </div>

        {/* Preview */}
        {showPreview && (
          <div className="lg:sticky lg:top-6 lg:self-start">
            <SEOPreviewPanel
              metaTitle={formData.meta_title}
              metaDescription={formData.meta_description}
              ogTitle={formData.og_title}
              ogDescription={formData.og_description}
              ogImage={formData.og_image}
              twitterTitle={formData.twitter_title}
              twitterDescription={formData.twitter_description}
              twitterImage={formData.twitter_image}
              pagePath={pagePath}
            />
          </div>
        )}
      </div>
    </div>
  );
}
