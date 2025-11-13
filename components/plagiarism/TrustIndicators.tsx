export default function TrustIndicators() {
  const institutions = [
    'University of the Philippines',
    'Ateneo de Manila',
    'De La Salle University',
    'University of Santo Tomas',
    'Far Eastern University',
    'Polytechnic University',
  ];

  const databases = [
    { name: 'Academic Journals', count: '500M+' },
    { name: 'Web Pages', count: '50B+' },
    { name: 'Books & Publications', count: '10M+' },
    { name: 'Student Papers', count: '100M+' },
  ];

  return (
    <section className="py-16 bg-white border-y border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Trusted By Philippine Institutions */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Trusted by Top Philippine Universities
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Used by thousands of students and faculty members across the Philippines
          </p>
        </div>

        {/* Institution Logos/Names */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 mb-16">
          {institutions.map((institution) => (
            <div
              key={institution}
              className="flex items-center justify-center p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-emerald-300 hover:shadow-md transition-all duration-200"
            >
              <span className="text-sm font-medium text-gray-700 text-center leading-tight">
                {institution}
              </span>
            </div>
          ))}
        </div>

        {/* Database Coverage */}
        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-8 md:p-12">
          <h3 className="text-2xl font-bold text-gray-900 text-center mb-8">
            Comprehensive Database Coverage
          </h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {databases.map((db) => (
              <div
                key={db.name}
                className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow duration-200"
              >
                <div className="text-3xl font-bold text-emerald-600 mb-2">{db.count}</div>
                <div className="text-sm font-medium text-gray-700">{db.name}</div>
                <div className="mt-3 h-2 bg-emerald-100 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-600 rounded-full" style={{ width: '100%' }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid md:grid-cols-3 gap-8 mt-12">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 rounded-full mb-4">
              <svg className="w-8 h-8 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
              </svg>
            </div>
            <div className="text-3xl font-bold text-gray-900">10,000+</div>
            <div className="text-gray-600 mt-1">Active Users</div>
          </div>

          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-teal-100 rounded-full mb-4">
              <svg className="w-8 h-8 text-teal-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="text-3xl font-bold text-gray-900">50,000+</div>
            <div className="text-gray-600 mt-1">Papers Checked</div>
          </div>

          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-cyan-100 rounded-full mb-4">
              <svg className="w-8 h-8 text-cyan-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="text-3xl font-bold text-gray-900">99.8%</div>
            <div className="text-gray-600 mt-1">Accuracy Rate</div>
          </div>
        </div>
      </div>
    </section>
  );
}
