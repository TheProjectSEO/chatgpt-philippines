'use client';

import { HeroSection } from '@/types/page-content';
import { ImageUploader } from '../../ImageUploader';
import { Upload } from 'lucide-react';

interface HeroEditorProps {
  section: HeroSection;
  onChange: (section: HeroSection) => void;
}

export function HeroEditor({ section, onChange }: HeroEditorProps) {
  const updateData = (updates: Partial<HeroSection['data']>) => {
    onChange({
      ...section,
      data: { ...section.data, ...updates },
    });
  };

  return (
    <div className="space-y-4">
      {/* Headline */}
      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-2">
          Headline *
        </label>
        <input
          type="text"
          value={section.data.headline}
          onChange={(e) => updateData({ headline: e.target.value })}
          className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
          placeholder="Enter your compelling headline"
        />
      </div>

      {/* Subheadline */}
      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-2">
          Subheadline
        </label>
        <input
          type="text"
          value={section.data.subheadline || ''}
          onChange={(e) => updateData({ subheadline: e.target.value })}
          className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
          placeholder="Supporting text for your headline"
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-2">
          Description
        </label>
        <textarea
          value={section.data.description || ''}
          onChange={(e) => updateData({ description: e.target.value })}
          rows={3}
          className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
          placeholder="Detailed description of your offer or message"
        />
      </div>

      {/* Alignment */}
      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-2">
          Text Alignment
        </label>
        <div className="flex gap-2">
          {(['left', 'center', 'right'] as const).map((align) => (
            <button
              key={align}
              onClick={() => updateData({ alignment: align })}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                section.data.alignment === align
                  ? 'bg-orange-500 text-white'
                  : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
              }`}
            >
              {align.charAt(0).toUpperCase() + align.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Primary CTA */}
      <div className="p-4 bg-neutral-50 rounded-lg space-y-3">
        <h4 className="text-sm font-semibold text-neutral-900">Primary Call-to-Action</h4>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-neutral-700 mb-1">
              Button Text
            </label>
            <input
              type="text"
              value={section.data.ctaPrimary?.text || ''}
              onChange={(e) =>
                updateData({
                  ctaPrimary: {
                    ...section.data.ctaPrimary,
                    text: e.target.value,
                    url: section.data.ctaPrimary?.url || '',
                    variant: section.data.ctaPrimary?.variant || 'primary',
                  },
                })
              }
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="Get Started"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-700 mb-1">
              Button URL
            </label>
            <input
              type="text"
              value={section.data.ctaPrimary?.url || ''}
              onChange={(e) =>
                updateData({
                  ctaPrimary: {
                    ...section.data.ctaPrimary,
                    text: section.data.ctaPrimary?.text || '',
                    url: e.target.value,
                    variant: section.data.ctaPrimary?.variant || 'primary',
                  },
                })
              }
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="/signup"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-neutral-700 mb-1">
            Button Style
          </label>
          <select
            value={section.data.ctaPrimary?.variant || 'primary'}
            onChange={(e) =>
              updateData({
                ctaPrimary: {
                  ...section.data.ctaPrimary,
                  text: section.data.ctaPrimary?.text || '',
                  url: section.data.ctaPrimary?.url || '',
                  variant: e.target.value as any,
                },
              })
            }
            className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="primary">Primary</option>
            <option value="secondary">Secondary</option>
            <option value="outline">Outline</option>
            <option value="ghost">Ghost</option>
          </select>
        </div>
      </div>

      {/* Secondary CTA */}
      <div className="p-4 bg-neutral-50 rounded-lg space-y-3">
        <h4 className="text-sm font-semibold text-neutral-900">
          Secondary Call-to-Action (Optional)
        </h4>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-neutral-700 mb-1">
              Button Text
            </label>
            <input
              type="text"
              value={section.data.ctaSecondary?.text || ''}
              onChange={(e) =>
                updateData({
                  ctaSecondary: {
                    ...section.data.ctaSecondary,
                    text: e.target.value,
                    url: section.data.ctaSecondary?.url || '',
                    variant: section.data.ctaSecondary?.variant || 'secondary',
                  },
                })
              }
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="Learn More"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-700 mb-1">
              Button URL
            </label>
            <input
              type="text"
              value={section.data.ctaSecondary?.url || ''}
              onChange={(e) =>
                updateData({
                  ctaSecondary: {
                    ...section.data.ctaSecondary,
                    text: section.data.ctaSecondary?.text || '',
                    url: e.target.value,
                    variant: section.data.ctaSecondary?.variant || 'secondary',
                  },
                })
              }
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="/about"
            />
          </div>
        </div>
      </div>

      {/* Background Image */}
      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-2">
          Background Image
        </label>
        {section.data.backgroundImage?.url ? (
          <div className="relative">
            <img
              src={section.data.backgroundImage.url}
              alt="Hero background"
              className="w-full h-48 object-cover rounded-lg"
            />
            <button
              onClick={() => updateData({ backgroundImage: undefined })}
              className="absolute top-2 right-2 px-3 py-1 bg-red-500 text-white text-sm rounded-lg hover:bg-red-600"
            >
              Remove
            </button>
          </div>
        ) : (
          <div className="border-2 border-dashed border-neutral-300 rounded-lg p-8 text-center">
            <Upload className="w-8 h-8 text-neutral-400 mx-auto mb-2" />
            <p className="text-sm text-neutral-600 mb-3">
              Upload a background image
            </p>
            <ImageUploader
              onUpload={(url) => updateData({ backgroundImage: { url } })}
              label="Choose Image"
              aspectRatio="wide"
            />
          </div>
        )}
      </div>

      {/* Overlay Settings */}
      {section.data.backgroundImage && (
        <div className="p-4 bg-neutral-50 rounded-lg space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold text-neutral-900">Overlay</h4>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={section.data.overlay?.enabled || false}
                onChange={(e) =>
                  updateData({
                    overlay: {
                      enabled: e.target.checked,
                      color: section.data.overlay?.color || '#000000',
                      opacity: section.data.overlay?.opacity || 0.5,
                    },
                  })
                }
                className="rounded border-neutral-300"
              />
              <span className="text-sm text-neutral-700">Enable overlay</span>
            </label>
          </div>

          {section.data.overlay?.enabled && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">
                  Overlay Color
                </label>
                <input
                  type="color"
                  value={section.data.overlay.color}
                  onChange={(e) =>
                    updateData({
                      overlay: {
                        ...section.data.overlay!,
                        color: e.target.value,
                      },
                    })
                  }
                  className="w-full h-10 rounded-lg border border-neutral-300"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">
                  Opacity ({Math.round((section.data.overlay.opacity || 0.5) * 100)}%)
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={section.data.overlay.opacity}
                  onChange={(e) =>
                    updateData({
                      overlay: {
                        ...section.data.overlay!,
                        opacity: parseFloat(e.target.value),
                      },
                    })
                  }
                  className="w-full"
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
