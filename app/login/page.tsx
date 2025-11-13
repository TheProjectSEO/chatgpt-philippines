export default function Login() {
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
            Welcome Back
          </h1>
          <p className="text-gray-600 text-center mb-8">
            Sign in to ChatGPT Philippines
          </p>

          {/* Login Button */}
          <a
            href="/api/auth/login"
            className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-lg font-semibold hover:opacity-90 transition-opacity"
          >
            Sign In with Auth0
          </a>

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">
                New to ChatGPT Philippines?
              </span>
            </div>
          </div>

          {/* Sign Up Link */}
          <a
            href="/signup"
            className="w-full flex items-center justify-center gap-3 border-2 border-gray-300 text-gray-700 py-3 px-6 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
          >
            Create Account
          </a>

          {/* Features */}
          <div className="mt-8 pt-8 border-t border-gray-200">
            <p className="text-sm text-gray-600 mb-4 text-center">
              Why sign in?
            </p>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 text-sm text-gray-600">
                <span className="text-green-600 mt-0.5">✓</span>
                <span>Save and access your chat history across devices</span>
              </li>
              <li className="flex items-start gap-3 text-sm text-gray-600">
                <span className="text-green-600 mt-0.5">✓</span>
                <span>Get 10 free AI queries to get started</span>
              </li>
              <li className="flex items-start gap-3 text-sm text-gray-600">
                <span className="text-green-600 mt-0.5">✓</span>
                <span>Personalized AI assistance for Filipino freelancers</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-gray-600 mt-6">
          By signing in, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
}
