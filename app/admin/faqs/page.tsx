'use client';

import { useState } from 'react';
import { Plus, Edit, Trash2, ChevronDown } from 'lucide-react';

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  order: number;
}

export default function FAQsManager() {
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null);

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900 mb-2">FAQs</h1>
          <p className="text-neutral-600">Manage frequently asked questions</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors">
          <Plus className="w-5 h-5" />
          New FAQ
        </button>
      </div>

      {/* FAQs List */}
      <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
        <div className="divide-y divide-neutral-200">
          {faqs.map((faq) => (
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
                  <button className="p-2 text-neutral-600 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button className="p-2 text-neutral-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
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
          {['All', 'General', 'Paraphraser', 'Translator', 'Grammar Checker'].map(
            (category) => (
              <button
                key={category}
                className="px-4 py-2 bg-neutral-100 text-neutral-700 rounded-lg hover:bg-orange-100 hover:text-orange-700 transition-colors"
              >
                {category}
              </button>
            )
          )}
        </div>
      </div>
    </div>
  );
}
