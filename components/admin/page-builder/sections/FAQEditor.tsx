'use client';

import { FAQSection } from '@/types/page-content';
import { Plus, Trash2, GripVertical } from 'lucide-react';

interface FAQEditorProps {
  section: FAQSection;
  onChange: (section: FAQSection) => void;
}

export function FAQEditor({ section, onChange }: FAQEditorProps) {
  const updateData = (updates: Partial<FAQSection['data']>) => {
    onChange({
      ...section,
      data: { ...section.data, ...updates },
    });
  };

  const addFAQ = () => {
    const newFAQ = {
      id: `faq-${Date.now()}`,
      question: '',
      answer: '',
      order: section.data.items.length,
    };
    updateData({ items: [...section.data.items, newFAQ] });
  };

  const updateFAQ = (id: string, updates: any) => {
    updateData({
      items: section.data.items.map((item) =>
        item.id === id ? { ...item, ...updates } : item
      ),
    });
  };

  const deleteFAQ = (id: string) => {
    updateData({
      items: section.data.items.filter((item) => item.id !== id),
    });
  };

  return (
    <div className="space-y-4">
      {/* Section Header */}
      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-2">
          Section Title
        </label>
        <input
          type="text"
          value={section.data.title || ''}
          onChange={(e) => updateData({ title: e.target.value })}
          placeholder="Frequently Asked Questions"
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
          rows={2}
          placeholder="Optional description for the FAQ section"
          className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
        />
      </div>

      {/* Layout Options */}
      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-2">Layout</label>
        <select
          value={section.data.layout}
          onChange={(e) => updateData({ layout: e.target.value as any })}
          className="w-full px-3 py-2 border border-neutral-300 rounded-lg"
        >
          <option value="accordion">Accordion</option>
          <option value="grid">Grid</option>
          <option value="list">List</option>
        </select>
      </div>

      {/* Schema Toggle */}
      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={section.data.enableSchema}
          onChange={(e) => updateData({ enableSchema: e.target.checked })}
          className="rounded border-neutral-300"
        />
        <span className="text-sm text-neutral-700">Enable FAQ Schema Markup (SEO)</span>
      </label>

      {/* FAQ Items */}
      <div className="space-y-3 pt-4 border-t border-neutral-200">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-semibold text-neutral-900">FAQ Items</h4>
          <button
            onClick={addFAQ}
            className="flex items-center gap-2 px-3 py-1.5 bg-orange-500 text-white text-sm rounded-lg hover:bg-orange-600"
          >
            <Plus className="w-4 h-4" />
            Add FAQ
          </button>
        </div>

        {section.data.items.length === 0 ? (
          <div className="text-center py-8 text-neutral-500">
            <p>No FAQ items yet. Click "Add FAQ" to create one.</p>
          </div>
        ) : (
          section.data.items.map((item, index) => (
            <div
              key={item.id}
              className="p-4 bg-neutral-50 rounded-lg border border-neutral-200 space-y-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <GripVertical className="w-4 h-4 text-neutral-400" />
                  <span className="text-sm font-medium text-neutral-700">
                    Question {index + 1}
                  </span>
                </div>
                <button
                  onClick={() => deleteFAQ(item.id)}
                  className="p-1 text-red-600 hover:bg-red-50 rounded"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <input
                type="text"
                value={item.question}
                onChange={(e) => updateFAQ(item.id, { question: e.target.value })}
                placeholder="Enter your question"
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg"
              />

              <textarea
                value={item.answer}
                onChange={(e) => updateFAQ(item.id, { answer: e.target.value })}
                rows={3}
                placeholder="Enter the answer"
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg"
              />
            </div>
          ))
        )}
      </div>
    </div>
  );
}
