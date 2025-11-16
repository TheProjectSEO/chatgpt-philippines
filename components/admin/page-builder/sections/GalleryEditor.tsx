'use client';

import { GallerySection } from '@/types/page-content';
import { Plus, Trash2 } from 'lucide-react';
import { ImageUploader } from '../../ImageUploader';

interface GalleryEditorProps {
  section: GallerySection;
  onChange: (section: GallerySection) => void;
}

export function GalleryEditor({ section, onChange }: GalleryEditorProps) {
  const updateData = (updates: Partial<GallerySection['data']>) => {
    onChange({
      ...section,
      data: { ...section.data, ...updates },
    });
  };

  const addImage = () => {
    const newItem = {
      id: `gallery-${Date.now()}`,
      image: { url: '' },
      order: section.data.items.length,
    };
    updateData({ items: [...section.data.items, newItem] });
  };

  const updateImage = (id: string, updates: any) => {
    updateData({
      items: section.data.items.map((item) =>
        item.id === id ? { ...item, ...updates } : item
      ),
    });
  };

  const deleteImage = (id: string) => {
    updateData({
      items: section.data.items.filter((item) => item.id !== id),
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-2">
          Section Title
        </label>
        <input
          type="text"
          value={section.data.title || ''}
          onChange={(e) => updateData({ title: e.target.value })}
          placeholder="Gallery"
          className="w-full px-3 py-2 border border-neutral-300 rounded-lg"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">Layout</label>
          <select
            value={section.data.layout}
            onChange={(e) => updateData({ layout: e.target.value as any })}
            className="w-full px-3 py-2 border border-neutral-300 rounded-lg"
          >
            <option value="grid">Grid</option>
            <option value="masonry">Masonry</option>
            <option value="carousel">Carousel</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">Columns</label>
          <select
            value={section.data.columns}
            onChange={(e) => updateData({ columns: parseInt(e.target.value) as any })}
            className="w-full px-3 py-2 border border-neutral-300 rounded-lg"
          >
            <option value={2}>2</option>
            <option value={3}>3</option>
            <option value={4}>4</option>
            <option value={5}>5</option>
          </select>
        </div>
      </div>

      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={section.data.enableLightbox || false}
          onChange={(e) => updateData({ enableLightbox: e.target.checked })}
          className="rounded"
        />
        <span className="text-sm text-neutral-700">Enable lightbox on click</span>
      </label>

      {/* Gallery Items */}
      <div className="space-y-3 pt-4 border-t border-neutral-200">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-semibold text-neutral-900">Images</h4>
          <button
            onClick={addImage}
            className="flex items-center gap-2 px-3 py-1.5 bg-orange-500 text-white text-sm rounded-lg hover:bg-orange-600"
          >
            <Plus className="w-4 h-4" />
            Add Image
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {section.data.items.map((item, index) => (
            <div
              key={item.id}
              className="p-3 bg-neutral-50 rounded-lg border border-neutral-200 space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-neutral-700">
                  Image {index + 1}
                </span>
                <button
                  onClick={() => deleteImage(item.id)}
                  className="p-1 text-red-600 hover:bg-red-50 rounded"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>

              {item.image.url ? (
                <img
                  src={item.image.url}
                  alt={item.caption || `Gallery image ${index + 1}`}
                  className="w-full h-32 object-cover rounded"
                />
              ) : (
                <ImageUploader
                  onUpload={(url) => updateImage(item.id, { image: { url } })}
                  label="Upload"
                />
              )}

              <input
                type="text"
                value={item.caption || ''}
                onChange={(e) => updateImage(item.id, { caption: e.target.value })}
                placeholder="Caption"
                className="w-full px-2 py-1 border border-neutral-300 rounded text-sm"
              />

              <input
                type="text"
                value={item.link || ''}
                onChange={(e) => updateImage(item.id, { link: e.target.value })}
                placeholder="Link (optional)"
                className="w-full px-2 py-1 border border-neutral-300 rounded text-sm"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
