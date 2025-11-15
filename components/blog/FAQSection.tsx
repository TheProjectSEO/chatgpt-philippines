'use client';

import { ChevronDown } from 'lucide-react';
import { FAQItem } from '@/types/blog';

interface FAQSectionProps {
  faqs: FAQItem[];
}

export default function FAQSection({ faqs }: FAQSectionProps) {
  if (!faqs || faqs.length === 0) return null;

  return (
    <section className="mt-16 mb-12">
      <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-8">
        Frequently Asked Questions
      </h2>
      <div className="space-y-4">
        {faqs.map((faq, idx) => (
          <details
            key={idx}
            className="bg-white p-6 rounded-xl border border-neutral-200 hover:shadow-md transition-shadow duration-200 group"
          >
            <summary className="font-semibold text-neutral-900 cursor-pointer list-none flex items-center justify-between">
              <span className="flex-1 pr-4">{faq.question}</span>
              <ChevronDown
                className="text-orange-600 transform group-open:rotate-180 transition-transform duration-200 flex-shrink-0"
                size={20}
              />
            </summary>
            <p className="text-neutral-600 mt-4 leading-relaxed">
              {faq.answer}
            </p>
          </details>
        ))}
      </div>
    </section>
  );
}
