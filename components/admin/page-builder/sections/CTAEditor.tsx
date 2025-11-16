'use client';

import { CTASection } from '@/types/page-content';
import { ImageUploader } from '../../ImageUploader';

interface CTAEditorProps {
  section: CTASection;
  onChange: (section: CTASection) => void;
}

export function CTAEditor({ section, onChange }: CTAEditorProps) {
  const updateData = (updates: Partial<CTASection['data']>) => {
    onChange({
      ...section,
      data: { ...section.data, ...updates },
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-2">
          Title *
        </label>
        <input
          type="text"
          value={section.data.title}
          onChange={(e) => updateData({ title: e.target.value })}
          placeholder="Ready to get started?"
          className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-2">
          Description
        </label>
        <textarea
          value={section.data.description || ''}
          onChange={(e) => updateData({ description: e.target.value })}
          rows={3}
          placeholder="Join thousands of users who are already..."
          className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-2">Layout</label>
        <select
          value={section.data.layout}
          onChange={(e) => updateData({ layout: e.target.value as any })}
          className="w-full px-3 py-2 border border-neutral-300 rounded-lg"
        >
          <option value="centered">Centered</option>
          <option value="split">Split (Text + Image)</option>
          <option value="banner">Full Width Banner</option>
        </select>
      </div>

      {/* Primary CTA */}
      <div className="p-4 bg-neutral-50 rounded-lg space-y-3">
        <h4 className="text-sm font-semibold text-neutral-900">Primary Button *</h4>
        <div className="grid grid-cols-2 gap-3">
          <input
            type="text"
            value={section.data.ctaPrimary.text}
            onChange={(e) =>
              updateData({
                ctaPrimary: { ...section.data.ctaPrimary, text: e.target.value },
              })
            }
            placeholder="Button text"
            className="px-3 py-2 border border-neutral-300 rounded-lg"
          />
          <input
            type="text"
            value={section.data.ctaPrimary.url}
            onChange={(e) =>
              updateData({
                ctaPrimary: { ...section.data.ctaPrimary, url: e.target.value },
              })
            }
            placeholder="Button URL"
            className="px-3 py-2 border border-neutral-300 rounded-lg"
          />
        </div>
        <select
          value={section.data.ctaPrimary.variant}
          onChange={(e) =>
            updateData({
              ctaPrimary: { ...section.data.ctaPrimary, variant: e.target.value as any },
            })
          }
          className="w-full px-3 py-2 border border-neutral-300 rounded-lg"
        >
          <option value="primary">Primary</option>
          <option value="secondary">Secondary</option>
          <option value="outline">Outline</option>
        </select>
      </div>

      {/* Secondary CTA */}
      <div className="p-4 bg-neutral-50 rounded-lg space-y-3">
        <h4 className="text-sm font-semibold text-neutral-900">
          Secondary Button (Optional)
        </h4>
        <div className="grid grid-cols-2 gap-3">
          <input
            type="text"
            value={section.data.ctaSecondary?.text || ''}
            onChange={(e) =>
              updateData({
                ctaSecondary: {
                  text: e.target.value,
                  url: section.data.ctaSecondary?.url || '',
                  variant: section.data.ctaSecondary?.variant || 'secondary',
                },
              })
            }
            placeholder="Button text"
            className="px-3 py-2 border border-neutral-300 rounded-lg"
          />
          <input
            type="text"
            value={section.data.ctaSecondary?.url || ''}
            onChange={(e) =>
              updateData({
                ctaSecondary: {
                  text: section.data.ctaSecondary?.text || '',
                  url: e.target.value,
                  variant: section.data.ctaSecondary?.variant || 'secondary',
                },
              })
            }
            placeholder="Button URL"
            className="px-3 py-2 border border-neutral-300 rounded-lg"
          />
        </div>
      </div>

      {/* Background Image */}
      {section.data.layout !== 'centered' && (
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">
            Background Image
          </label>
          {section.data.backgroundImage?.url ? (
            <div className="relative">
              <img
                src={section.data.backgroundImage.url}
                alt="CTA background"
                className="w-full h-48 object-cover rounded-lg"
              />
              <button
                onClick={() => updateData({ backgroundImage: undefined })}
                className="absolute top-2 right-2 px-3 py-1 bg-red-500 text-white text-sm rounded-lg"
              >
                Remove
              </button>
            </div>
          ) : (
            <ImageUploader
              onUpload={(url) => updateData({ backgroundImage: { url } })}
              label="Upload Image"
              aspectRatio="wide"
            />
          )}
        </div>
      )}
    </div>
  );
}
