'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Wrench,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  XCircle,
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

  const statusConfig = {
    running: {
      color: 'blue',
      icon: Loader2,
      text: 'Running',
      bgClass: 'bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800'
    },
    complete: {
      color: 'green',
      icon: CheckCircle2,
      text: 'Complete',
      bgClass: 'bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800'
    },
    failed: {
      color: 'red',
      icon: XCircle,
      text: 'Failed',
      bgClass: 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800'
    }
  };

  const config = statusConfig[status];
  const StatusIcon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className={`mb-3 rounded-lg border ${config.bgClass} overflow-hidden`}
    >
      <div className="p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1">
            <ToolIcon className={`w-4 h-4 text-${config.color}-600 dark:text-${config.color}-400`} />
            <span className="font-medium text-sm text-gray-900 dark:text-gray-100">
              {toolName.replace(/([A-Z])/g, ' $1').trim()}
            </span>
            <div className="flex items-center gap-2">
              {status === 'running' && (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                >
                  <StatusIcon className={`w-4 h-4 text-${config.color}-600 dark:text-${config.color}-400`} />
                </motion.div>
              )}
              {status === 'complete' && (
                <StatusIcon className={`w-4 h-4 text-${config.color}-600 dark:text-${config.color}-400`} />
              )}
              {status === 'failed' && (
                <StatusIcon className={`w-4 h-4 text-${config.color}-600 dark:text-${config.color}-400`} />
              )}
              <span className={`text-xs font-medium text-${config.color}-700 dark:text-${config.color}-300`}>
                {config.text}
              </span>
            </div>
          </div>

          {(result || error) && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
            >
              {isExpanded ? (
                <ChevronUp className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              ) : (
                <ChevronDown className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              )}
            </button>
          )}
        </div>

        {status === 'running' && (
          <div className="mt-2">
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                className={`h-full bg-gradient-to-r from-${config.color}-500 to-${config.color}-600 rounded-full`}
              />
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              {progress}% complete
            </p>
          </div>
        )}

        <AnimatePresence>
          {isExpanded && (result || error) && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                {error ? (
                  <div className="text-sm text-red-700 dark:text-red-300 bg-red-100 dark:bg-red-900/30 p-2 rounded">
                    {error}
                  </div>
                ) : (
                  <pre className="text-xs text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 p-2 rounded overflow-x-auto">
                    {typeof result === 'string' ? result : JSON.stringify(result, null, 2)}
                  </pre>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
