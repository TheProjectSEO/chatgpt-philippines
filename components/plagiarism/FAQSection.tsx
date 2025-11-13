'use client';

import { useState } from 'react';

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      question: 'How accurate is the plagiarism checker for Filipino students?',
      answer: 'Our AI-powered plagiarism checker has a 99.8% accuracy rate and is specifically trained on Filipino academic content. It scans over 50 billion web pages, 500 million academic papers, and understands both English and Filipino language contexts. It is trusted by major Philippine universities including UP, Ateneo, and DLSU.'
    },
    {
      question: 'Can I check my thesis or research paper in Tagalog or Taglish?',
      answer: 'Yes! Our plagiarism checker fully supports Filipino/Tagalog, English, and Taglish (mixed Filipino-English) content. It understands code-switching and can detect plagiarism in multilingual academic papers, which is common in Philippine education.'
    },
    {
      question: 'How does the free version compare to paid plagiarism checkers?',
      answer: 'Our free version allows up to 1,000 words per check with basic plagiarism detection. Signed-in users get 25,000 words per check, detailed reports, citation suggestions, and unlimited checks. Unlike other services that charge per check, we offer generous free limits perfect for students.'
    },
    {
      question: 'What file formats can I upload for checking?',
      answer: 'You can upload .docx (Microsoft Word), .pdf (PDF documents), .txt (text files), and .html files. You can also directly paste text. The maximum file size is 10MB, which accommodates most thesis and research papers.'
    },
    {
      question: 'Will my thesis or paper be stored or shared?',
      answer: 'No. Your documents are encrypted and processed securely. We do not store your content in our database or share it with third parties. Your academic work remains completely private and confidential. Documents are automatically deleted after processing.'
    },
    {
      question: 'How long does a plagiarism check take?',
      answer: 'Most checks complete in 30-60 seconds, depending on document length. Our AI-powered system is significantly faster than traditional plagiarism checkers that can take 15-30 minutes. You will get instant results with highlighted sections and similarity scores.'
    },
    {
      question: 'Does this work for checking student papers if I am a teacher?',
      answer: 'Absolutely! Teachers can check multiple student papers efficiently. You can create a teacher account to access batch checking, student management features, and detailed reports that can be shared with students. Many Philippine university professors use our tool for grading.'
    },
    {
      question: 'Can I use this for BPO content writing work?',
      answer: 'Yes! Our plagiarism checker is perfect for BPO professionals creating content for clients. It helps ensure all articles, blog posts, and marketing materials are original. You can generate professional reports to share with clients as proof of originality.'
    },
    {
      question: 'What citation styles are supported?',
      answer: 'We support all major citation styles used in Philippine universities: APA (most common), MLA, Chicago, Harvard, and Vancouver. The tool can automatically generate citations in your preferred format for any detected sources.'
    },
    {
      question: 'How is this different from Turnitin?',
      answer: 'Unlike Turnitin which requires institutional subscriptions, our tool is accessible to individual students for free. We offer comparable accuracy with Filipino language support, faster processing, and more affordable premium options. Perfect for students whose schools do not provide Turnitin access.'
    },
    {
      question: 'Can I check the same paper multiple times?',
      answer: 'Yes! You can check your paper as many times as needed during the writing and revision process. We encourage multiple checks as you add citations and make revisions. There is no limit on re-checking the same document.'
    },
    {
      question: 'What percentage of similarity is acceptable for Philippine universities?',
      answer: 'Most Philippine universities accept 15-20% similarity for undergraduate papers and 10-15% for graduate theses. However, this varies by institution. Our tool highlights all matches so you can review each one - some citations and references are expected and acceptable.'
    },
  ];

  return (
    <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-xl text-gray-600">
            Everything you need to know about our plagiarism checker
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="bg-white rounded-xl shadow-md border-2 border-gray-200 hover:border-emerald-300 transition-all duration-200"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full px-6 py-5 text-left flex items-center justify-between gap-4"
              >
                <span className="font-bold text-gray-900 text-lg pr-4">
                  {faq.question}
                </span>
                <svg
                  className={`w-6 h-6 text-emerald-600 flex-shrink-0 transition-transform duration-200 ${
                    openIndex === index ? 'transform rotate-180' : ''
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              <div
                className={`overflow-hidden transition-all duration-200 ${
                  openIndex === index ? 'max-h-96' : 'max-h-0'
                }`}
              >
                <div className="px-6 pb-5 text-gray-600 leading-relaxed">
                  {faq.answer}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Contact Support */}
        <div className="mt-16 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl p-8 text-center border border-emerald-200">
          <h3 className="text-2xl font-bold text-gray-900 mb-3">
            Still Have Questions?
          </h3>
          <p className="text-gray-600 mb-6">
            Our support team is here to help Filipino students and professionals
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="mailto:support@chatgpt.com.ph"
              className="inline-flex items-center justify-center gap-2 bg-white text-emerald-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-all duration-200 border-2 border-emerald-200"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Email Support
            </a>
            <a
              href="/api/auth/login"
              className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-emerald-700 hover:to-teal-700 transition-all duration-200 shadow-md"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              Live Chat Support
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
