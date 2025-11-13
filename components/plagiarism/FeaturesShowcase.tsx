export default function FeaturesShowcase() {
  const features = [
    {
      title: 'Citation Assistance',
      description: 'Automatically generate citations in APA, MLA, Chicago, and Harvard formats. Ensure proper attribution for all sources detected in your paper.',
      image: '📚',
      details: [
        'Multiple citation styles',
        'Auto-format generation',
        'Bibliography creation',
        'In-text citation support'
      ]
    },
    {
      title: 'Comprehensive Reports',
      description: 'Download detailed PDF reports showing similarity percentages, source URLs, and highlighted text sections for easy review and correction.',
      image: '📊',
      details: [
        'PDF export functionality',
        'Highlighted matches',
        'Source attribution',
        'Historical comparisons'
      ]
    },
    {
      title: 'Real-Time Scanning',
      description: 'Check your document as you write. Our AI analyzes text in real-time, alerting you to potential plagiarism before final submission.',
      image: '⚡',
      details: [
        'Live text analysis',
        'Instant alerts',
        'Progressive checking',
        'Edit tracking'
      ]
    },
    {
      title: 'Side-by-Side Comparison',
      description: 'View your text alongside similar sources. Easily identify exact matches and make informed decisions about citations and paraphrasing.',
      image: '⚖️',
      details: [
        'Split-screen view',
        'Match highlighting',
        'Source linking',
        'Contextual review'
      ]
    },
    {
      title: 'Grammar Integration',
      description: 'Beyond plagiarism, check grammar, spelling, and style. Improve your writing quality while ensuring originality in one comprehensive tool.',
      image: '✍️',
      details: [
        'Grammar checking',
        'Style suggestions',
        'Spelling correction',
        'Writing enhancement'
      ]
    },
    {
      title: 'Secure Document Storage',
      description: 'Your documents are encrypted and stored securely. Access your plagiarism history anytime and track improvements across multiple submissions.',
      image: '🔒',
      details: [
        'End-to-end encryption',
        'Cloud storage',
        'Version history',
        'Privacy guaranteed'
      ]
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Powerful Features for Complete Protection
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Everything you need to ensure academic integrity and original content
          </p>
        </div>

        <div className="space-y-12">
          {features.map((feature, index) => (
            <div
              key={index}
              className={`flex flex-col ${
                index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'
              } gap-8 lg:gap-12 items-center`}
            >
              {/* Feature Image/Icon */}
              <div className="flex-1 w-full">
                <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-12 flex items-center justify-center border-2 border-emerald-200 shadow-lg">
                  <div className="text-8xl md:text-9xl">{feature.image}</div>
                </div>
              </div>

              {/* Feature Content */}
              <div className="flex-1 w-full">
                <h3 className="text-3xl font-bold text-gray-900 mb-4">
                  {feature.title}
                </h3>
                <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                  {feature.description}
                </p>

                <ul className="grid sm:grid-cols-2 gap-3">
                  {feature.details.map((detail, dIndex) => (
                    <li key={dIndex} className="flex items-start gap-2">
                      <svg className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="text-gray-700">{detail}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        {/* Additional Feature Highlights */}
        <div className="mt-20 grid md:grid-cols-3 gap-8">
          <div className="bg-white rounded-xl p-6 shadow-lg border-2 border-gray-200">
            <div className="text-4xl mb-4">🌐</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Multi-Language Support</h3>
            <p className="text-gray-600">
              Check documents in English, Filipino, and other Philippine languages with native accuracy.
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg border-2 border-gray-200">
            <div className="text-4xl mb-4">📱</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Mobile Access</h3>
            <p className="text-gray-600">
              Use on any device - desktop, laptop, tablet, or smartphone. Check papers on the go.
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg border-2 border-gray-200">
            <div className="text-4xl mb-4">👥</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Team Collaboration</h3>
            <p className="text-gray-600">
              Share reports with advisers, review peers' work, and collaborate on group projects.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
