'use client';

import { Message as MessageType } from '@/lib/types';
import ReactMarkdown from 'react-markdown';

interface MessageProps {
  message: MessageType;
}

export default function Message({ message }: MessageProps) {
  const isUser = message.role === 'user';

  return (
    <div className={`w-full py-6 ${isUser ? 'bg-white' : 'bg-gray-50'} border-b border-gray-100`}>
      <div className="max-w-3xl mx-auto px-4 flex gap-4">
        {/* Avatar */}
        <div className={`flex-shrink-0 w-8 h-8 rounded-sm flex items-center justify-center text-white font-medium ${
          isUser ? 'bg-[#19c37d]' : 'bg-[#19c37d]'
        }`}>
          {isUser ? 'U' : 'AI'}
        </div>

        {/* Message Content */}
        <div className="flex-1 pt-1">
          {isUser ? (
            <p className="text-gray-800 whitespace-pre-wrap break-words">{message.content}</p>
          ) : (
            <div className="markdown-content text-gray-800">
              <ReactMarkdown>{message.content}</ReactMarkdown>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
