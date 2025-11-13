export default function PersonasSection() {
  const personas = [
    {
      title: 'Filipino Students',
      description: 'Check your thesis, research papers, and essays for plagiarism before submission. Meet university requirements with confidence.',
      useCase: 'Thesis Defense Preparation',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
      benefits: [
        'Check unlimited papers',
        'Thesis-ready reports',
        'Citation suggestions',
        'Mobile-friendly'
      ],
    },
    {
      title: 'Teachers & Professors',
      description: 'Detect plagiarism in student submissions efficiently. Maintain academic integrity across multiple classes and sections.',
      useCase: 'Grade Multiple Papers',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path d="M12 14l9-5-9-5-9 5 9 5z" />
          <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
        </svg>
      ),
      benefits: [
        'Batch checking',
        'Detailed reports',
        'Save past checks',
        'Export results'
      ],
    },
    {
      title: 'BPO Professionals',
      description: 'Ensure content originality for clients. Verify articles, blog posts, and marketing materials before delivery.',
      useCase: 'Client Content Verification',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
      benefits: [
        'Fast turnaround',
        'Professional reports',
        'Team accounts',
        'Priority support'
      ],
    },
    {
      title: 'Content Writers',
      description: 'Protect your reputation and maintain originality. Check blog posts, articles, and web content before publishing.',
      useCase: 'Blog & Article Verification',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      ),
      benefits: [
        'SEO-friendly checks',
        'Multiple formats',
        'History tracking',
        'API access'
      ],
    },
    {
      title: 'Researchers',
      description: 'Verify research papers, journal submissions, and grant proposals. Ensure compliance with publication standards.',
      useCase: 'Journal Submission Prep',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
      ),
      benefits: [
        'Academic database scan',
        'Citation formatting',
        'Collaboration tools',
        'Version control'
      ],
    },
    {
      title: 'Businesses',
      description: 'Protect your brand with original content. Check marketing materials, white papers, and business documents.',
      useCase: 'Marketing Material Check',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
      benefits: [
        'Brand protection',
        'Team collaboration',
        'Custom workflows',
        'Enterprise support'
      ],
    },
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Who Uses Our Plagiarism Checker?
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Trusted by diverse professionals across the Philippines for maintaining content integrity
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {personas.map((persona, index) => (
            <div
              key={index}
              className="group bg-gradient-to-br from-white to-gray-50 rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border-2 border-gray-200 hover:border-emerald-300"
            >
              {/* Icon */}
              <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-xl mb-6 text-white group-hover:scale-110 transition-transform duration-300">
                {persona.icon}
              </div>

              {/* Title & Description */}
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                {persona.title}
              </h3>
              <p className="text-gray-600 mb-4 leading-relaxed">
                {persona.description}
              </p>

              {/* Use Case Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-50 rounded-lg mb-4">
                <svg className="w-4 h-4 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-sm font-semibold text-emerald-900">{persona.useCase}</span>
              </div>

              {/* Benefits List */}
              <ul className="space-y-2">
                {persona.benefits.map((benefit, bIndex) => (
                  <li key={bIndex} className="flex items-center gap-2 text-sm text-gray-600">
                    <svg className="w-4 h-4 text-emerald-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    {benefit}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Testimonial Box */}
        <div className="mt-16 bg-gradient-to-r from-emerald-50 via-teal-50 to-cyan-50 rounded-2xl p-8 md:p-12 border border-emerald-200">
          <div className="flex flex-col md:flex-row items-start gap-6">
            <div className="flex-shrink-0">
              <svg className="w-12 h-12 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="flex-1">
              <blockquote className="text-lg md:text-xl text-gray-700 italic mb-4">
                "As a thesis adviser at UP Diliman, I use ChatGPT Philippines Plagiarism Checker to verify all my students' work. It's fast, accurate, and catches issues that would take me hours to find manually."
              </blockquote>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-full flex items-center justify-center text-white font-bold">
                  MC
                </div>
                <div>
                  <div className="font-bold text-gray-900">Maria Cruz, PhD</div>
                  <div className="text-sm text-gray-600">Professor, UP Diliman</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
