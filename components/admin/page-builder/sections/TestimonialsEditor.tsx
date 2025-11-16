'use client';

import { TestimonialsSection } from '@/types/page-content';
import { Plus, Trash2, Star } from 'lucide-react';
import { ImageUploader } from '../../ImageUploader';

interface TestimonialsEditorProps {
  section: TestimonialsSection;
  onChange: (section: TestimonialsSection) => void;
}

export function TestimonialsEditor({ section, onChange }: TestimonialsEditorProps) {
  const updateData = (updates: Partial<TestimonialsSection['data']>) => {
    onChange({
      ...section,
      data: { ...section.data, ...updates },
    });
  };

  const addTestimonial = () => {
    const newItem = {
      id: `testimonial-${Date.now()}`,
      quote: '',
      author: '',
      order: section.data.items.length,
    };
    updateData({ items: [...section.data.items, newItem] });
  };

  const updateTestimonial = (id: string, updates: any) => {
    updateData({
      items: section.data.items.map((item) =>
        item.id === id ? { ...item, ...updates } : item
      ),
    });
  };

  const deleteTestimonial = (id: string) => {
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
          placeholder="What Our Customers Say"
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
            <option value="carousel">Carousel</option>
            <option value="grid">Grid</option>
            <option value="masonry">Masonry</option>
          </select>
        </div>

        <div>
          <label className="flex items-center gap-2 mt-7">
            <input
              type="checkbox"
              checked={section.data.showRating || false}
              onChange={(e) => updateData({ showRating: e.target.checked })}
              className="rounded"
            />
            <span className="text-sm text-neutral-700">Show ratings</span>
          </label>
        </div>
      </div>

      {/* Testimonial Items */}
      <div className="space-y-3 pt-4 border-t border-neutral-200">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-semibold text-neutral-900">Testimonials</h4>
          <button
            onClick={addTestimonial}
            className="flex items-center gap-2 px-3 py-1.5 bg-orange-500 text-white text-sm rounded-lg hover:bg-orange-600"
          >
            <Plus className="w-4 h-4" />
            Add Testimonial
          </button>
        </div>

        {section.data.items.map((item, index) => (
          <div
            key={item.id}
            className="p-4 bg-neutral-50 rounded-lg border border-neutral-200 space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-neutral-700">
                Testimonial {index + 1}
              </span>
              <button
                onClick={() => deleteTestimonial(item.id)}
                className="p-1 text-red-600 hover:bg-red-50 rounded"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <textarea
              value={item.quote}
              onChange={(e) => updateTestimonial(item.id, { quote: e.target.value })}
              rows={3}
              placeholder="Customer quote..."
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg"
            />

            <div className="grid grid-cols-2 gap-3">
              <input
                type="text"
                value={item.author}
                onChange={(e) => updateTestimonial(item.id, { author: e.target.value })}
                placeholder="Author name"
                className="px-3 py-2 border border-neutral-300 rounded-lg"
              />
              <input
                type="text"
                value={item.role || ''}
                onChange={(e) => updateTestimonial(item.id, { role: e.target.value })}
                placeholder="Role/Title"
                className="px-3 py-2 border border-neutral-300 rounded-lg"
              />
            </div>

            <input
              type="text"
              value={item.company || ''}
              onChange={(e) => updateTestimonial(item.id, { company: e.target.value })}
              placeholder="Company name"
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm"
            />

            {section.data.showRating && (
              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">
                  Rating
                </label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <button
                      key={rating}
                      onClick={() => updateTestimonial(item.id, { rating })}
                      className={`p-1 ${
                        (item.rating || 0) >= rating
                          ? 'text-yellow-500'
                          : 'text-neutral-300'
                      }`}
                    >
                      <Star className="w-5 h-5 fill-current" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {item.image?.url ? (
              <div className="relative inline-block">
                <img
                  src={item.image.url}
                  alt={item.author}
                  className="w-16 h-16 rounded-full object-cover"
                />
                <button
                  onClick={() => updateTestimonial(item.id, { image: undefined })}
                  className="absolute top-0 right-0 p-1 bg-red-500 text-white text-xs rounded-full"
                >
                  X
                </button>
              </div>
            ) : (
              <ImageUploader
                onUpload={(url) => updateTestimonial(item.id, { image: { url } })}
                label="Upload author photo"
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
