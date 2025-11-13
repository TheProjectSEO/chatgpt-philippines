export default function Signup() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center">
              <span className="text-white font-bold text-3xl">PH</span>
            </div>
          </div>

          {/* Title */}
          <h1 className="text-3xl font-bold text-center mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Get Started Free
          </h1>
          <p className="text-gray-600 text-center mb-8">
            Create your ChatGPT Philippines account
          </p>

          {/* Sign Up Button */}
          <a
            href="/api/auth/signup"
            className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-lg font-semibold hover:opacity-90 transition-opacity"
          >
            Sign Up with Auth0
          </a>

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">
                Already have an account?
              </span>
            </div>
          </div>

          {/* Sign In Link */}
          <a
            href="/login"
            className="w-full flex items-center justify-center gap-3 border-2 border-gray-300 text-gray-700 py-3 px-6 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
          >
            Sign In
          </a>

          {/* Features */}
          <div className="mt-8 pt-8 border-t border-gray-200">
            <p className="text-sm text-gray-600 mb-4 text-center font-semibold">
              What you get:
            </p>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 text-sm text-gray-600">
                <span className="text-blue-600 text-lg">💬</span>
                <span>Unlimited chat conversations powered by Claude AI</span>
              </li>
              <li className="flex items-start gap-3 text-sm text-gray-600">
                <span className="text-purple-600 text-lg">💻</span>
                <span>Specialized prompts for Filipino freelancers</span>
              </li>
              <li className="flex items-start gap-3 text-sm text-gray-600">
                <span className="text-green-600 text-lg">📊</span>
                <span>Save and organize your chat history</span>
              </li>
              <li className="flex items-start gap-3 text-sm text-gray-600">
                <span className="text-orange-600 text-lg">🎯</span>
                <span>10 free queries to get started</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-gray-600 mt-6">
          By creating an account, you agree to our{' '}
          <a href="#" className="text-blue-600 hover:underline">Terms of Service</a>
          {' '}and{' '}
          <a href="#" className="text-blue-600 hover:underline">Privacy Policy</a>
        </p>
      </div>
    </div>
  );
}
