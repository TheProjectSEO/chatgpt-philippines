'use client';

import { useState } from 'react';
import { Code, Plus, Trash2, AlertCircle, CheckCircle } from 'lucide-react';

interface SchemaMarkupEditorProps {
  schemaData: any;
  schemaTypes: string[];
  onChange: (data: any, types: string[]) => void;
}

const AVAILABLE_SCHEMA_TYPES = [
  'WebPage',
  'Article',
  'BlogPosting',
  'NewsArticle',
  'Organization',
  'Person',
  'Product',
  'SoftwareApplication',
  'FAQPage',
  'HowTo',
  'BreadcrumbList',
  'VideoObject',
  'ImageObject',
  'Review',
  'AggregateRating',
  'LocalBusiness',
  'Event',
];

export function SchemaMarkupEditor({
  schemaData,
  schemaTypes,
  onChange,
}: SchemaMarkupEditorProps) {
  const [jsonInput, setJsonInput] = useState(
    JSON.stringify(schemaData || {}, null, 2)
  );
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'form' | 'json'>('form');

  const handleTypeToggle = (type: string) => {
    const newTypes = schemaTypes.includes(type)
      ? schemaTypes.filter((t) => t !== type)
      : [...schemaTypes, type];
    onChange(schemaData, newTypes);
  };

  const handleJsonChange = (value: string) => {
    setJsonInput(value);
    try {
      const parsed = JSON.parse(value);
      setJsonError(null);
      onChange(parsed, schemaTypes);
    } catch (err: any) {
      setJsonError(err.message);
    }
  };

  const handleAddTemplate = (type: string) => {
    const templates: Record<string, any> = {
      WebPage: {
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: '',
        description: '',
        url: '',
        inLanguage: 'en-PH',
      },
      Article: {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: '',
        description: '',
        image: '',
        author: {
          '@type': 'Person',
          name: '',
        },
        publisher: {
          '@type': 'Organization',
          name: 'ChatGPT Philippines',
          logo: {
            '@type': 'ImageObject',
            url: '',
          },
        },
        datePublished: '',
        dateModified: '',
      },
      Organization: {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: 'ChatGPT Philippines',
        url: 'https://chatgpt-philippines.com',
        logo: {
          '@type': 'ImageObject',
          url: '',
        },
        description: '',
        sameAs: [],
      },
      SoftwareApplication: {
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        name: '',
        description: '',
        applicationCategory: 'WebApplication',
        operatingSystem: 'Any',
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'USD',
        },
      },
      FAQPage: {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: [
          {
            '@type': 'Question',
            name: '',
            acceptedAnswer: {
              '@type': 'Answer',
              text: '',
            },
          },
        ],
      },
      BreadcrumbList: {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: '',
            item: '',
          },
        ],
      },
    };

    const template = templates[type] || {};
    const newData = Array.isArray(schemaData)
      ? [...schemaData, template]
      : schemaData && Object.keys(schemaData).length > 0
      ? [schemaData, template]
      : template;

    setJsonInput(JSON.stringify(newData, null, 2));
    onChange(newData, schemaTypes);
  };

  const validateSchema = () => {
    try {
      const parsed = JSON.parse(jsonInput);
      const issues: string[] = [];

      if (Array.isArray(parsed)) {
        parsed.forEach((schema, index) => {
          if (!schema['@context']) {
            issues.push(`Schema ${index + 1}: Missing @context`);
          }
          if (!schema['@type']) {
            issues.push(`Schema ${index + 1}: Missing @type`);
          }
        });
      } else {
        if (!parsed['@context']) {
          issues.push('Missing @context');
        }
        if (!parsed['@type']) {
          issues.push('Missing @type');
        }
      }

      return issues;
    } catch (err) {
      return ['Invalid JSON'];
    }
  };

  const validationIssues = validateSchema();

  return (
    <div className="space-y-4">
      {/* View Mode Toggle */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setViewMode('form')}
          className={`px-4 py-2 text-sm rounded-lg transition-colors ${
            viewMode === 'form'
              ? 'bg-orange-500 text-white'
              : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
          }`}
        >
          Form View
        </button>
        <button
          onClick={() => setViewMode('json')}
          className={`px-4 py-2 text-sm rounded-lg transition-colors ${
            viewMode === 'json'
              ? 'bg-orange-500 text-white'
              : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
          }`}
        >
          <Code className="w-4 h-4 inline mr-1" />
          JSON Editor
        </button>
      </div>

      {viewMode === 'form' ? (
        <>
          {/* Schema Types Selection */}
          <div>
            <label className="block text-sm font-medium text-neutral-900 mb-3">
              Schema Types
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {AVAILABLE_SCHEMA_TYPES.map((type) => (
                <button
                  key={type}
                  onClick={() => handleTypeToggle(type)}
                  className={`px-3 py-2 text-sm rounded-lg border transition-colors ${
                    schemaTypes.includes(type)
                      ? 'bg-orange-50 border-orange-500 text-orange-700'
                      : 'bg-white border-neutral-300 text-neutral-700 hover:bg-neutral-50'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Quick Templates */}
          <div>
            <label className="block text-sm font-medium text-neutral-900 mb-3">
              Add Schema Template
            </label>
            <div className="flex flex-wrap gap-2">
              {['WebPage', 'Article', 'Organization', 'SoftwareApplication', 'FAQPage'].map(
                (type) => (
                  <button
                    key={type}
                    onClick={() => handleAddTemplate(type)}
                    className="px-3 py-2 text-sm bg-neutral-100 text-neutral-700 rounded-lg hover:bg-neutral-200 transition-colors flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    {type}
                  </button>
                )
              )}
            </div>
          </div>
        </>
      ) : null}

      {/* JSON Editor */}
      {viewMode === 'json' && (
        <div>
          <label className="block text-sm font-medium text-neutral-900 mb-2">
            JSON-LD Schema Markup
          </label>
          <textarea
            value={jsonInput}
            onChange={(e) => handleJsonChange(e.target.value)}
            rows={20}
            className={`w-full px-4 py-3 font-mono text-sm bg-neutral-900 text-green-400 rounded-lg focus:outline-none focus:ring-2 resize-none ${
              jsonError ? 'ring-2 ring-red-500' : 'focus:ring-orange-500'
            }`}
            placeholder='{"@context": "https://schema.org", "@type": "WebPage", ...}'
          />
          {jsonError && (
            <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-900">Invalid JSON</p>
                <p className="text-xs text-red-700">{jsonError}</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Validation */}
      {validationIssues.length > 0 ? (
        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-yellow-900 mb-1">
                Schema Validation Issues
              </p>
              <ul className="space-y-1">
                {validationIssues.map((issue, index) => (
                  <li key={index} className="text-xs text-yellow-700">• {issue}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg flex items-start gap-2">
          <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-green-700">Schema markup is valid</p>
        </div>
      )}

      {/* Info */}
      <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-800">
          Schema markup helps search engines understand your content better. Test your markup
          using{' '}
          <a
            href="https://search.google.com/test/rich-results"
            target="_blank"
            rel="noopener noreferrer"
            className="underline font-medium"
          >
            Google's Rich Results Test
          </a>
          .
        </p>
      </div>
    </div>
  );
}
