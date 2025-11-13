export default function IntegrationCapabilities() {
  const integrations = [
    {
      name: 'Google Docs',
      description: 'Check your documents directly within Google Docs. No need to export or copy-paste.',
      icon: '📄',
      available: true,
    },
    {
      name: 'Microsoft Word',
      description: 'Seamless integration with Word Online and desktop. Check papers as you write.',
      icon: '📝',
      available: true,
    },
    {
      name: 'Canvas LMS',
      description: 'Integrate with Canvas Learning Management System used by Philippine universities.',
      icon: '🎓',
      available: true,
    },
    {
      name: 'Google Classroom',
      description: 'Teachers can check assignments directly from Google Classroom submissions.',
      icon: '🏫',
      available: true,
    },
  ];

  const workflows = [
    {
      title: 'For Students',
      steps: [
        'Write your thesis or paper in Google Docs/Word',
        'Click "Check Plagiarism" in the toolbar',
        'Review results and add citations',
        'Export final paper with confidence'
      ],
      color: 'emerald',
    },
    {
      title: 'For Teachers',
      steps: [
        'Receive student submissions via LMS',
        'Batch check multiple papers at once',
        'Review detailed reports for each student',
        'Provide feedback with highlighted sections'
      ],
      color: 'teal',
    },
    {
      title: 'For Professionals',
      steps: [
        'Upload content from any source',
        'Schedule automatic checks for ongoing projects',
        'Share reports with team or clients',
        'Maintain content library with history'
      ],
      color: 'cyan',
    },
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Works With Your Favorite Tools
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Seamless integration with the platforms Filipino students and professionals use every day
          </p>
        </div>

        {/* Integration Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
          {integrations.map((integration, index) => (
            <div
              key={index}
              className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-gray-200 hover:border-emerald-300"
            >
              <div className="text-5xl mb-4">{integration.icon}</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {integration.name}
              </h3>
              <p className="text-gray-600 text-sm mb-4">
                {integration.description}
              </p>
              {integration.available && (
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 rounded-full">
                  <svg className="w-4 h-4 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-xs font-semibold text-emerald-900">Available Now</span>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Workflow Examples */}
        <div className="mb-16">
          <h3 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Streamlined Workflows for Everyone
          </h3>

          <div className="grid lg:grid-cols-3 gap-8">
            {workflows.map((workflow, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl p-8 shadow-xl border-2 border-gray-200"
              >
                <div className={`inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-${workflow.color}-600 to-${workflow.color}-700 rounded-xl mb-6 text-white font-bold text-lg`}>
                  {index + 1}
                </div>
                <h4 className="text-2xl font-bold text-gray-900 mb-6">
                  {workflow.title}
                </h4>
                <ol className="space-y-4">
                  {workflow.steps.map((step, sIndex) => (
                    <li key={sIndex} className="flex items-start gap-3">
                      <div className={`flex-shrink-0 w-6 h-6 bg-${workflow.color}-100 rounded-full flex items-center justify-center`}>
                        <span className={`text-${workflow.color}-600 text-sm font-bold`}>{sIndex + 1}</span>
                      </div>
                      <span className="text-gray-700 leading-relaxed">{step}</span>
                    </li>
                  ))}
                </ol>
              </div>
            ))}
          </div>
        </div>

        {/* API Access */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl p-8 md:p-12 text-white">
          <div className="flex flex-col lg:flex-row items-center gap-8">
            <div className="flex-1">
              <h3 className="text-3xl font-bold mb-4">
                API Access for Developers
              </h3>
              <p className="text-emerald-50 text-lg mb-6">
                Build custom integrations with our powerful API. Perfect for institutions,
                learning management systems, and content platforms.
              </p>
              <ul className="space-y-3 mb-6">
                <li className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>RESTful API with comprehensive documentation</span>
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Webhook support for real-time notifications</span>
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Rate limits suitable for enterprise use</span>
                </li>
              </ul>
              <a
                href="/api/auth/login"
                className="inline-flex items-center gap-2 bg-white text-emerald-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-all duration-200 shadow-lg"
              >
                View API Documentation
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>
            <div className="flex-shrink-0">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <pre className="text-emerald-50 text-sm font-mono">
{`{
  "text": "Your content...",
  "language": "en",
  "format": "markdown"
}

// Response
{
  "similarity": 15,
  "sources": 3,
  "matches": [...]
}`}
                </pre>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
