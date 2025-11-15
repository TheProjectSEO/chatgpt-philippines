'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send,
  Paperclip,
  Menu,
  X,
  BarChart3,
  Sparkles,
  MessageCircle,
  TrendingUp
} from 'lucide-react';
import ThinkingBlock from '@/components/data-viz/ThinkingBlock';
import ToolExecutionBlock from '@/components/data-viz/ToolExecutionBlock';
import ChartDisplay from '@/components/data-viz/ChartDisplay';
import FileUploadZone from '@/components/data-viz/FileUploadZone';
import ExportButtons from '@/components/data-viz/ExportButtons';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  thinking?: string;
  thinkingComplete?: boolean;
  tools?: ToolExecution[];
  charts?: ChartData[];
  timestamp: Date;
}

interface ToolExecution {
  id: string;
  name: string;
  status: 'running' | 'complete' | 'failed';
  progress: number;
  result?: any;
  error?: string;
}

interface ChartData {
  id: string;
  type: 'bar' | 'line' | 'pie' | 'doughnut';
  title: string;
  data: any;
}

interface UploadedFile {
  name: string;
  size: number;
  rows: number;
  columns: number;
  preview: any[];
  file: File;
}

export default function DataVizAgentPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleFileUpload = (file: File, preview: any) => {
    setUploadedFile({
      name: file.name,
      size: file.size,
      rows: preview.totalRows,
      columns: preview.headers.length,
      preview: preview.preview,
      file
    });

    // Add a system message about the file
    const fileMessage: Message = {
      id: Date.now().toString(),
      role: 'assistant',
      content: `File uploaded successfully! I can see ${preview.totalRows} rows and ${preview.headers.length} columns (${preview.headers.join(', ')}). What would you like me to analyze?`,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, fileMessage]);
  };

  const handleRemoveFile = () => {
    setUploadedFile(null);
  };

  const handleSendMessage = async () => {
    if (!input.trim() && !uploadedFile) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Simulate AI response with streaming
    setTimeout(() => {
      simulateAIResponse(userMessage.content);
    }, 500);
  };

  const simulateAIResponse = async (userInput: string) => {
    const messageId = Date.now().toString();

    // Create initial message with thinking
    const aiMessage: Message = {
      id: messageId,
      role: 'assistant',
      content: '',
      thinking: 'Analyzing your request...\n\nI can see you want to analyze the data. Let me process this step by step.',
      thinkingComplete: false,
      tools: [],
      charts: [],
      timestamp: new Date()
    };

    setMessages(prev => [...prev, aiMessage]);

    // Simulate thinking completion
    setTimeout(() => {
      setMessages(prev => prev.map(msg =>
        msg.id === messageId
          ? {
              ...msg,
              thinking: 'Analyzing your request...\n\nI can see you want to analyze the data. Let me process this step by step.\n\nFirst, I\'ll load and validate the data structure.\nThen I\'ll perform statistical analysis.\nFinally, I\'ll suggest the best visualizations based on the data patterns.',
              thinkingComplete: true
            }
          : msg
      ));

      // Start tool execution
      simulateToolExecution(messageId);
    }, 2000);
  };

  const simulateToolExecution = async (messageId: string) => {
    // Tool 1: Analyze Data
    const tool1: ToolExecution = {
      id: '1',
      name: 'analyzeData',
      status: 'running',
      progress: 0
    };

    setMessages(prev => prev.map(msg =>
      msg.id === messageId ? { ...msg, tools: [tool1] } : msg
    ));

    // Simulate progress
    for (let progress = 0; progress <= 100; progress += 20) {
      await new Promise(resolve => setTimeout(resolve, 300));
      setMessages(prev => prev.map(msg =>
        msg.id === messageId
          ? {
              ...msg,
              tools: msg.tools?.map(t =>
                t.id === '1' ? { ...t, progress } : t
              )
            }
          : msg
      ));
    }

    // Complete tool 1
    setMessages(prev => prev.map(msg =>
      msg.id === messageId
        ? {
            ...msg,
            tools: msg.tools?.map(t =>
              t.id === '1'
                ? {
                    ...t,
                    status: 'complete',
                    result: {
                      mean: 45000,
                      median: 42000,
                      mode: 38000,
                      stdDev: 12500,
                      min: 15000,
                      max: 98000
                    }
                  }
                : t
            )
          }
        : msg
    ));

    // Tool 2: Suggest Visualizations
    await new Promise(resolve => setTimeout(resolve, 500));

    const tool2: ToolExecution = {
      id: '2',
      name: 'suggestVisualizations',
      status: 'running',
      progress: 0
    };

    setMessages(prev => prev.map(msg =>
      msg.id === messageId ? { ...msg, tools: [...(msg.tools || []), tool2] } : msg
    ));

    for (let progress = 0; progress <= 100; progress += 25) {
      await new Promise(resolve => setTimeout(resolve, 250));
      setMessages(prev => prev.map(msg =>
        msg.id === messageId
          ? {
              ...msg,
              tools: msg.tools?.map(t =>
                t.id === '2' ? { ...t, progress } : t
              )
            }
          : msg
      ));
    }

    setMessages(prev => prev.map(msg =>
      msg.id === messageId
        ? {
            ...msg,
            tools: msg.tools?.map(t =>
              t.id === '2'
                ? {
                    ...t,
                    status: 'complete',
                    result: 'Recommended: Bar chart for category comparison, Line chart for time series trends'
                  }
                : t
            )
          }
        : msg
    ));

    // Add response and chart
    await new Promise(resolve => setTimeout(resolve, 500));

    const sampleChartData = {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      datasets: [
        {
          label: 'Sales ($)',
          data: [35000, 38000, 42000, 45000, 48000, 52000, 48000, 55000, 58000, 62000, 68000, 78000],
          backgroundColor: 'rgba(59, 130, 246, 0.8)',
          borderColor: 'rgba(59, 130, 246, 1)',
          borderWidth: 2
        }
      ]
    };

    const chart: ChartData = {
      id: '1',
      type: 'bar',
      title: 'Monthly Sales Trend - 2023',
      data: sampleChartData
    };

    setMessages(prev => prev.map(msg =>
      msg.id === messageId
        ? {
            ...msg,
            content: `I've analyzed your sales data. Here are the key insights:

📊 **Sales Statistics:**
- Average monthly sales: $45,000
- Median sales: $42,000
- Peak month: December ($78,000)
- Lowest month: January ($35,000)
- Standard deviation: $12,500

📈 **Trends Identified:**
- Strong upward trend throughout the year (+23% YoY)
- Seasonal peak in Q4 (holiday season)
- Consistent growth from Q2 onwards
- No significant outliers detected

💡 **Recommendations:**
1. Plan inventory for Q4 holiday rush
2. Investigate Q1 slowdown causes
3. Leverage Q2-Q3 momentum with targeted campaigns
4. Consider expanding successful product lines from peak months`,
            charts: [chart]
          }
        : msg
    ));

    setIsLoading(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50 dark:from-gray-950 dark:via-blue-950 dark:to-cyan-950">
      {/* Sidebar */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.aside
            initial={{ x: -320, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -320, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="w-80 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col shadow-xl"
          >
            <div className="p-6 border-b border-gray-200 dark:border-gray-800">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl">
                    <BarChart3 className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                      Data Viz Agent
                    </h1>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Powered by Claude
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsSidebarOpen(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors lg:hidden"
                >
                  <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </button>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                  <Sparkles className="w-4 h-4 text-yellow-500" />
                  <span>AI-powered insights</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                  <TrendingUp className="w-4 h-4 text-green-500" />
                  <span>Interactive visualizations</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                  <MessageCircle className="w-4 h-4 text-blue-500" />
                  <span>Natural language queries</span>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
                Upload Data
              </h2>
              <FileUploadZone
                onFileUpload={handleFileUpload}
                uploadedFile={uploadedFile || undefined}
                onRemoveFile={handleRemoveFile}
              />

              {uploadedFile && (
                <div className="mt-6">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                    Quick Actions
                  </h3>
                  <div className="space-y-2">
                    {[
                      'Show summary statistics',
                      'Visualize trends over time',
                      'Find correlations',
                      'Detect anomalies',
                      'Generate insights report'
                    ].map((action, idx) => (
                      <button
                        key={idx}
                        onClick={() => setInput(action)}
                        className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                      >
                        {action}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-gray-200 dark:border-gray-800">
              <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                Upload CSV, JSON, or Excel files to get started
              </p>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {!isSidebarOpen && (
                <button
                  onClick={() => setIsSidebarOpen(true)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <Menu className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </button>
              )}
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Chat with Your Data
              </h2>
            </div>
          </div>
        </header>

        {/* Messages */}
        <div
          ref={chatContainerRef}
          id="chat-container"
          className="flex-1 overflow-y-auto px-6 py-8 space-y-6"
        >
          {messages.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center h-full text-center"
            >
              <div className="p-4 bg-gradient-to-br from-blue-100 to-cyan-100 dark:from-blue-900/30 dark:to-cyan-900/30 rounded-2xl mb-6">
                <BarChart3 className="w-16 h-16 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                Welcome to Data Viz Agent
              </h3>
              <p className="text-gray-600 dark:text-gray-400 max-w-md mb-8">
                Upload your data and ask questions in natural language. I'll analyze it and create beautiful visualizations for you.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-2xl">
                {[
                  'What are the trends in my sales data?',
                  'Show me a comparison by region',
                  'Find outliers in the dataset',
                  'Create a report with key insights'
                ].map((example, idx) => (
                  <button
                    key={idx}
                    onClick={() => setInput(example)}
                    className="px-4 py-3 text-left text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-md transition-all"
                  >
                    {example}
                  </button>
                ))}
              </div>
            </motion.div>
          ) : (
            <div className="max-w-4xl mx-auto space-y-6">
              {messages.map((message) => (
                <div key={message.id}>
                  {message.role === 'user' ? (
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex justify-end"
                    >
                      <div className="max-w-2xl bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-2xl rounded-tr-sm px-6 py-3 shadow-lg">
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex justify-start"
                    >
                      <div className="max-w-3xl w-full">
                        {message.thinking && (
                          <ThinkingBlock
                            content={message.thinking}
                            isComplete={message.thinkingComplete}
                          />
                        )}

                        {message.tools && message.tools.map((tool) => (
                          <ToolExecutionBlock
                            key={tool.id}
                            toolName={tool.name}
                            status={tool.status}
                            progress={tool.progress}
                            result={tool.result}
                            error={tool.error}
                          />
                        ))}

                        {message.content && (
                          <div className="bg-white dark:bg-gray-800 rounded-2xl rounded-tl-sm px-6 py-4 shadow-lg border border-gray-200 dark:border-gray-700 mb-4">
                            <div className="prose prose-sm dark:prose-invert max-w-none">
                              <div className="text-sm text-gray-900 dark:text-gray-100 leading-relaxed whitespace-pre-wrap">
                                {message.content}
                              </div>
                            </div>
                          </div>
                        )}

                        {message.charts && message.charts.map((chart) => (
                          <ChartDisplay
                            key={chart.id}
                            type={chart.type}
                            data={chart.data}
                            title={chart.title}
                          />
                        ))}

                        {message.content && (
                          <ExportButtons
                            chatContainerId="chat-container"
                            data={uploadedFile?.preview}
                            fileName={uploadedFile?.name.split('.')[0] || 'report'}
                          />
                        )}
                      </div>
                    </motion.div>
                  )}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 px-6 py-4 shadow-lg">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-end gap-3">
              <div className="flex-1 relative">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder={uploadedFile ? "Ask me anything about your data..." : "Upload a file to get started..."}
                  disabled={!uploadedFile}
                  rows={1}
                  className="w-full px-4 py-3 pr-12 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                  style={{ minHeight: '48px', maxHeight: '120px' }}
                />
              </div>

              <button
                onClick={handleSendMessage}
                disabled={(!input.trim() && !uploadedFile) || isLoading}
                className="p-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl disabled:hover:shadow-lg"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
              Press Enter to send, Shift+Enter for new line
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
