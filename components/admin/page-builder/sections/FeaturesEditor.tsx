'use client';

import { FeaturesSection } from '@/types/page-content';
import { Plus, Trash2, ImageIcon } from 'lucide-react';
import { ImageUploader } from '../../ImageUploader';

interface FeaturesEditorProps {
  section: FeaturesSection;
  onChange: (section: FeaturesSection) => void;
}

export function FeaturesEditor({ section, onChange }: FeaturesEditorProps) {
  const updateData = (updates: Partial<FeaturesSection['data']>) => {
    onChange({
      ...section,
      data: { ...section.data, ...updates },
    });
  };

  const addFeature = () => {
    const newFeature = {
      id: `feature-${Date.now()}`,
      title: '',
      description: '',
      order: section.data.items.length,
    };
    updateData({ items: [...section.data.items, newFeature] });
  };

  const updateFeature = (id: string, updates: any) => {
    updateData({
      items: section.data.items.map((item) =>
        item.id === id ? { ...item, ...updates } : item
      ),
    });
  };

  const deleteFeature = (id: string) => {
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
          placeholder="Features"
          className="w-full px-3 py-2 border border-neutral-300 rounded-lg"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-2">
          Description
        </label>
        <textarea
          value={section.data.description || ''}
          onChange={(e) => updateData({ description: e.target.value })}
          rows={2}
          placeholder="Why choose us?"
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
            <option value="list">List</option>
            <option value="cards">Cards</option>
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
          </select>
        </div>
      </div>

      {/* Feature Items */}
      <div className="space-y-3 pt-4 border-t border-neutral-200">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-semibold text-neutral-900">Features</h4>
          <button
            onClick={addFeature}
            className="flex items-center gap-2 px-3 py-1.5 bg-orange-500 text-white text-sm rounded-lg hover:bg-orange-600"
          >
            <Plus className="w-4 h-4" />
            Add Feature
          </button>
        </div>

        {section.data.items.length === 0 ? (
          <div className="text-center py-8 text-neutral-500">
            <p>No features yet. Click "Add Feature" to create one.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {section.data.items.map((item, index) => (
              <div
                key={item.id}
                className="p-4 bg-neutral-50 rounded-lg border border-neutral-200 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-neutral-700">
                    Feature {index + 1}
                  </span>
                  <button
                    onClick={() => deleteFeature(item.id)}
                    className="p-1 text-red-600 hover:bg-red-50 rounded"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <input
                  type="text"
                  value={item.icon || ''}
                  onChange={(e) => updateFeature(item.id, { icon: e.target.value })}
                  placeholder="Icon name (e.g., zap, shield, star)"
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm"
                />

                {item.iconImage?.url ? (
                  <div className="relative">
                    <img
                      src={item.iconImage.url}
                      alt="Feature icon"
                      className="w-16 h-16 object-cover rounded"
                    />
                    <button
                      onClick={() => updateFeature(item.id, { iconImage: undefined })}
                      className="absolute top-0 right-0 p-1 bg-red-500 text-white text-xs rounded"
                    >
                      X
                    </button>
                  </div>
                ) : (
                  <ImageUploader
                    onUpload={(url) => updateFeature(item.id, { iconImage: { url } })}
                    label="Or upload icon image"
                  />
                )}

                <input
                  type="text"
                  value={item.title}
                  onChange={(e) => updateFeature(item.id, { title: e.target.value })}
                  placeholder="Feature title"
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg"
                />

                <textarea
                  value={item.description}
                  onChange={(e) => updateFeature(item.id, { description: e.target.value })}
                  rows={2}
                  placeholder="Feature description"
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg"
                />

                <input
                  type="text"
                  value={item.link || ''}
                  onChange={(e) => updateFeature(item.id, { link: e.target.value })}
                  placeholder="Link (optional)"
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm"
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
