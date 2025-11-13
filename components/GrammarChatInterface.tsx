'use client';

import { useState } from 'react';
import { Send, Sparkles, CheckCircle } from 'lucide-react';

export default function GrammarChatInterface() {
  const [text, setText] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const grammarPrompt = `Please check the following text for grammar, spelling, and punctuation errors. Provide clear corrections and explanations for any mistakes found. If the text is perfect, confirm that it's error-free.

Text to check:
`;

  const handleCheck = async () => {
    if (!text.trim()) return;

    setIsChecking(true);
    setResult(null);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [
            {
              role: 'user',
              content: grammarPrompt + text,
            },
          ],
          model: 'claude-3-5-sonnet-20241022',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to check grammar');
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let fullResponse = '';

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              if (data === '[DONE]') {
                break;
              }

              try {
                const parsed = JSON.parse(data);
                if (parsed.text) {
                  fullResponse += parsed.text;
                  setResult(fullResponse);
                }
              } catch (e) {
                // Ignore parsing errors
              }
            }
          }
        }
      }
    } catch (error) {
      console.error('Error checking grammar:', error);
      setResult('Sorry, there was an error checking your text. Please try again.');
    } finally {
      setIsChecking(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleCheck();
    }
  };

  const exampleTexts = [
    "The students was late to they're class because of the rain.",
    "I am agree with you're opinion about this matter.",
    "Please revert back to me as soon as possible.",
    "Me and my friend went to the mall yesterday."
  ];

  const handleExampleClick = (example: string) => {
    setText(example);
    setResult(null);
  };

  return (
    <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-6 h-6 text-white" />
            <h3 className="text-white font-bold text-lg">AI Grammar Checker</h3>
          </div>
          <div className="flex items-center space-x-2 text-white text-sm">
            <Sparkles className="w-4 h-4" />
            <span>Powered by AI</span>
          </div>
        </div>
      </div>

      {/* Input Area */}
      <div className="p-6">
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Enter or paste your text below
          </label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type or paste your text here... (Press Cmd/Ctrl + Enter to check)"
            className="w-full h-40 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none text-gray-900 placeholder-gray-400"
            disabled={isChecking}
          />
          <div className="flex items-center justify-between mt-2">
            <p className="text-sm text-gray-500">
              {text.length} characters
            </p>
            <p className="text-xs text-gray-400">
              Cmd/Ctrl + Enter to check
            </p>
          </div>
        </div>

        {/* Example Buttons */}
        {!result && text.length === 0 && (
          <div className="mb-4">
            <p className="text-sm font-medium text-gray-700 mb-2">Try these examples:</p>
            <div className="flex flex-wrap gap-2">
              {exampleTexts.map((example, index) => (
                <button
                  key={index}
                  onClick={() => handleExampleClick(example)}
                  className="text-xs px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors border border-gray-300"
                >
                  Example {index + 1}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Check Button */}
        <button
          onClick={handleCheck}
          disabled={isChecking || !text.trim()}
          className="w-full bg-emerald-600 text-white px-6 py-3 rounded-lg hover:bg-emerald-700 transition-colors font-semibold disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
        >
          {isChecking ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Checking Grammar...</span>
            </>
          ) : (
            <>
              <CheckCircle className="w-5 h-5" />
              <span>Check Grammar</span>
            </>
          )}
        </button>

        {/* Results */}
        {result && (
          <div className="mt-6 border-t border-gray-200 pt-6">
            <div className="flex items-center space-x-2 mb-4">
              <CheckCircle className="w-5 h-5 text-emerald-600" />
              <h4 className="font-bold text-gray-900">Grammar Check Results</h4>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-wrap">
                {result}
              </div>
            </div>
            <div className="mt-4 flex items-start space-x-2 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <Sparkles className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-gray-700">
                <p className="font-semibold text-blue-900 mb-1">Want unlimited checks?</p>
                <p>Sign up for free to save your history and check grammar anytime, anywhere.</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
        <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-gray-600">
          <div className="flex items-center space-x-1">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <span>100% Free</span>
          </div>
          <div className="flex items-center space-x-1">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <span>No Sign-up Required</span>
          </div>
          <div className="flex items-center space-x-1">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <span>Private & Secure</span>
          </div>
          <div className="flex items-center space-x-1">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <span>Instant Results</span>
          </div>
        </div>
      </div>
    </div>
  );
}
