'use client';

import { useState } from 'react';
import { Plus, Edit, Trash2, ChevronDown } from 'lucide-react';
import { Dialog } from '../components/Dialog';

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  order: number;
}

export default function FAQsManager() {
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null);
  const [editingFAQ, setEditingFAQ] = useState<FAQ | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isNewFAQModalOpen, setIsNewFAQModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [formData, setFormData] = useState({
    question: '',
    answer: '',
    category: 'General',
    order: 1,
  });

  // TODO: Replace with actual data from database
  const faqs: FAQ[] = [
    {
      id: '1',
      question: 'How do I use the paraphrasing tool?',
      answer:
        'Simply paste your text into the input box, select your preferred paraphrasing mode, and click the "Paraphrase" button. The AI will generate a rephrased version of your text.',
      category: 'Paraphraser',
      order: 1,
    },
    {
      id: '2',
      question: 'Is ChatGPT Philippines free to use?',
      answer:
        'Yes, ChatGPT Philippines is completely free to use. We offer all our AI tools at no cost to support Filipino students and professionals.',
      category: 'General',
      order: 1,
    },
    {
      id: '3',
      question: 'Can I use the translator for Tagalog?',
      answer:
        'Absolutely! Our translator supports Tagalog and many other Filipino languages. It can translate to and from English with high accuracy.',
      category: 'Translator',
      order: 1,
    },
  ];

  const categories = ['All', 'General', 'Paraphraser', 'Translator', 'Grammar Checker'];

  const filteredFAQs =
    selectedCategory === 'All'
      ? faqs
      : faqs.filter((faq) => faq.category === selectedCategory);

  const handleEditClick = (faq: FAQ) => {
    setEditingFAQ(faq);
    setFormData({
      question: faq.question,
      answer: faq.answer,
      category: faq.category,
      order: faq.order,
    });
    setIsEditModalOpen(true);
  };

  const handleNewFAQClick = () => {
    setEditingFAQ(null);
    setFormData({
      question: '',
      answer: '',
      category: 'General',
      order: 1,
    });
    setIsNewFAQModalOpen(true);
  };

  const handleSaveFAQ = () => {
    // TODO: Implement actual save to database
    console.log('Saving FAQ:', formData);
    alert(
      editingFAQ
        ? 'FAQ updated successfully!'
        : 'New FAQ created successfully!'
    );
    setIsEditModalOpen(false);
    setIsNewFAQModalOpen(false);
  };

  const handleDeleteClick = (faq: FAQ) => {
    if (confirm(`Are you sure you want to delete this FAQ?`)) {
      // TODO: Implement actual delete from database
      console.log('Deleting FAQ:', faq.id);
      alert('FAQ deleted successfully!');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900 mb-2">FAQs</h1>
          <p className="text-neutral-600">Manage frequently asked questions</p>
        </div>
        <button
          onClick={handleNewFAQClick}
          className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
        >
          <Plus className="w-5 h-5" />
          New FAQ
        </button>
      </div>

      {/* FAQs List */}
      <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
        <div className="divide-y divide-neutral-200">
          {filteredFAQs.map((faq) => (
            <div key={faq.id} className="p-6">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="inline-flex px-2 py-1 text-xs font-medium bg-orange-100 text-orange-700 rounded-full">
                      {faq.category}
                    </span>
                    <span className="text-sm text-neutral-500">Order: {faq.order}</span>
                  </div>
                  <button
                    onClick={() =>
                      setExpandedFAQ(expandedFAQ === faq.id ? null : faq.id)
                    }
                    className="w-full text-left"
                  >
                    <div className="flex items-start justify-between">
                      <h3 className="text-lg font-semibold text-neutral-900 pr-4">
                        {faq.question}
                      </h3>
                      <ChevronDown
                        className={`w-5 h-5 text-neutral-500 flex-shrink-0 transition-transform ${
                          expandedFAQ === faq.id ? 'rotate-180' : ''
                        }`}
                      />
                    </div>
                  </button>
                  {expandedFAQ === faq.id && (
                    <p className="mt-3 text-neutral-600 leading-relaxed">
                      {faq.answer}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <button
                    onClick={() => handleEditClick(faq)}
                    className="p-2 text-neutral-600 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                    aria-label="Edit FAQ"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteClick(faq)}
                    className="p-2 text-neutral-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    aria-label="Delete FAQ"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Category Filter */}
      <div className="bg-white rounded-xl border border-neutral-200 p-6">
        <h3 className="text-lg font-semibold text-neutral-900 mb-4">
          Categories
        </h3>
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                selectedCategory === category
                  ? 'bg-orange-500 text-white'
                  : 'bg-neutral-100 text-neutral-700 hover:bg-orange-100 hover:text-orange-700'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Edit FAQ Modal */}
      <Dialog
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit FAQ"
        maxWidth="2xl"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSaveFAQ();
          }}
          className="space-y-6"
        >
          <div>
            <label
              htmlFor="edit-category"
              className="block text-sm font-medium text-neutral-700 mb-2"
            >
              Category
            </label>
            <select
              id="edit-category"
              value={formData.category}
              onChange={(e) =>
                setFormData({ ...formData, category: e.target.value })
              }
              className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="General">General</option>
              <option value="Paraphraser">Paraphraser</option>
              <option value="Translator">Translator</option>
              <option value="Grammar Checker">Grammar Checker</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="edit-question"
              className="block text-sm font-medium text-neutral-700 mb-2"
            >
              Question
            </label>
            <input
              id="edit-question"
              type="text"
              value={formData.question}
              onChange={(e) =>
                setFormData({ ...formData, question: e.target.value })
              }
              className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="Enter the question"
              required
            />
          </div>

          <div>
            <label
              htmlFor="edit-answer"
              className="block text-sm font-medium text-neutral-700 mb-2"
            >
              Answer
            </label>
            <textarea
              id="edit-answer"
              value={formData.answer}
              onChange={(e) =>
                setFormData({ ...formData, answer: e.target.value })
              }
              rows={5}
              className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
              placeholder="Enter the answer"
              required
            />
          </div>

          <div>
            <label
              htmlFor="edit-order"
              className="block text-sm font-medium text-neutral-700 mb-2"
            >
              Display Order
            </label>
            <input
              id="edit-order"
              type="number"
              min="1"
              value={formData.order}
              onChange={(e) =>
                setFormData({ ...formData, order: parseInt(e.target.value) })
              }
              className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
            <p className="mt-1 text-sm text-neutral-500">
              Lower numbers appear first in the list
            </p>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-200">
            <button
              type="button"
              onClick={() => setIsEditModalOpen(false)}
              className="px-4 py-2 text-neutral-700 bg-neutral-100 rounded-lg hover:bg-neutral-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
            >
              Save Changes
            </button>
          </div>
        </form>
      </Dialog>

      {/* New FAQ Modal */}
      <Dialog
        isOpen={isNewFAQModalOpen}
        onClose={() => setIsNewFAQModalOpen(false)}
        title="Create New FAQ"
        maxWidth="2xl"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSaveFAQ();
          }}
          className="space-y-6"
        >
          <div>
            <label
              htmlFor="new-category"
              className="block text-sm font-medium text-neutral-700 mb-2"
            >
              Category
            </label>
            <select
              id="new-category"
              value={formData.category}
              onChange={(e) =>
                setFormData({ ...formData, category: e.target.value })
              }
              className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="General">General</option>
              <option value="Paraphraser">Paraphraser</option>
              <option value="Translator">Translator</option>
              <option value="Grammar Checker">Grammar Checker</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="new-question"
              className="block text-sm font-medium text-neutral-700 mb-2"
            >
              Question
            </label>
            <input
              id="new-question"
              type="text"
              value={formData.question}
              onChange={(e) =>
                setFormData({ ...formData, question: e.target.value })
              }
              className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="Enter the question"
              required
            />
          </div>

          <div>
            <label
              htmlFor="new-answer"
              className="block text-sm font-medium text-neutral-700 mb-2"
            >
              Answer
            </label>
            <textarea
              id="new-answer"
              value={formData.answer}
              onChange={(e) =>
                setFormData({ ...formData, answer: e.target.value })
              }
              rows={5}
              className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
              placeholder="Enter the answer"
              required
            />
          </div>

          <div>
            <label
              htmlFor="new-order"
              className="block text-sm font-medium text-neutral-700 mb-2"
            >
              Display Order
            </label>
            <input
              id="new-order"
              type="number"
              min="1"
              value={formData.order}
              onChange={(e) =>
                setFormData({ ...formData, order: parseInt(e.target.value) })
              }
              className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
            <p className="mt-1 text-sm text-neutral-500">
              Lower numbers appear first in the list
            </p>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-200">
            <button
              type="button"
              onClick={() => setIsNewFAQModalOpen(false)}
              className="px-4 py-2 text-neutral-700 bg-neutral-100 rounded-lg hover:bg-neutral-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
            >
              Create FAQ
            </button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
