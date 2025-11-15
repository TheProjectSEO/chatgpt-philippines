'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Wrench,
  ChevronDown,
  ChevronRight,
  Check,
  X,
  Loader2,
  BarChart3,
  Table,
  FileSpreadsheet,
  TrendingUp
} from 'lucide-react';

interface ToolExecutionBlockProps {
  toolName: string;
  status: 'running' | 'complete' | 'failed';
  progress?: number;
  result?: any;
  error?: string;
}

const TOOL_ICONS: Record<string, any> = {
  analyzeData: BarChart3,
  suggestVisualizations: TrendingUp,
  loadFile: FileSpreadsheet,
  processData: Table,
  default: Wrench
};

export default function ToolExecutionBlock({
  toolName,
  status,
  progress = 0,
  result,
  error
}: ToolExecutionBlockProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const ToolIcon = TOOL_ICONS[toolName] || TOOL_ICONS.default;

  return (
    <div className="mb-2">
      <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded overflow-hidden">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-between p-3 hover:bg-[#202020] transition-colors"
        >
          <div className="flex items-center gap-2">
            {isExpanded ? (
              <ChevronDown className="w-3.5 h-3.5 text-[#666666]" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5 text-[#666666]" />
            )}
            <ToolIcon className="w-3.5 h-3.5 text-[#B4B4B4]" />
            <span className="text-sm text-[#E8E8E8]">
              {toolName.replace(/([A-Z])/g, ' $1').trim()}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {status === 'running' && (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              >
                <Loader2 className="w-3.5 h-3.5 text-[#CC785C]" />
              </motion.div>
            )}
            {status === 'complete' && (
              <Check className="w-3.5 h-3.5 text-[#4CAF50]" />
            )}
            {status === 'failed' && (
              <X className="w-3.5 h-3.5 text-[#F44336]" />
            )}
          </div>
        </button>

        {status === 'running' && (
          <div className="px-3 pb-3">
            <div className="w-full bg-[#0D0D0D] rounded-full h-1 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                className="h-full bg-[#CC785C] rounded-full"
              />
            </div>
          </div>
        )}

        <AnimatePresence>
          {isExpanded && (result || error) && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden border-t border-[#2A2A2A]"
            >
              <div className="p-3">
                {error ? (
                  <div className="text-xs text-[#F44336] bg-[#2A1515] p-2 rounded border border-[#3A2020]">
                    {error}
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="text-xs text-[#666666] font-medium">Input:</div>
                    <pre className="text-xs text-[#B4B4B4] bg-[#0D0D0D] p-2 rounded overflow-x-auto">
                      {toolName}()
                    </pre>
                    <div className="text-xs text-[#666666] font-medium mt-2">Result:</div>
                    <pre className="text-xs text-[#B4B4B4] bg-[#0D0D0D] p-2 rounded overflow-x-auto">
                      {typeof result === 'string' ? result : JSON.stringify(result, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
