'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronRight } from 'lucide-react';

interface ThinkingBlockProps {
  content: string;
  isComplete?: boolean;
}

export default function ThinkingBlock({ content, isComplete = false }: ThinkingBlockProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="mb-2">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-2 text-xs text-[#666666] hover:text-[#B4B4B4] transition-colors py-1"
      >
        {isExpanded ? (
          <ChevronDown className="w-3 h-3" />
        ) : (
          <ChevronRight className="w-3 h-3" />
        )}
        <span className="font-medium">
          {isComplete ? 'Extended Thinking' : 'Thinking...'}
        </span>
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="overflow-hidden"
          >
            <div className="mt-1 pl-5 pr-2 py-2 bg-[#1A1A1A] rounded border border-[#2A2A2A]">
              <div className="text-xs text-[#B4B4B4] leading-relaxed whitespace-pre-wrap">
                {content ? (
                  <TypewriterText text={content} isComplete={isComplete} />
                ) : (
                  <motion.span
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    Analyzing your request...
                  </motion.span>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function TypewriterText({ text, isComplete }: { text: string; isComplete: boolean }) {
  const [displayedText, setDisplayedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  // Typewriter effect
  useState(() => {
    if (isComplete) {
      setDisplayedText(text);
      return;
    }

    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayedText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, 20); // 20ms per character for smooth typing

      return () => clearTimeout(timeout);
    }
  });

  return (
    <span>
      {displayedText}
      {!isComplete && currentIndex < text.length && (
        <motion.span
          animate={{ opacity: [1, 0] }}
          transition={{ duration: 0.5, repeat: Infinity }}
          className="inline-block w-1 h-4 bg-blue-600 dark:bg-blue-400 ml-0.5"
        />
      )}
    </span>
  );
}
