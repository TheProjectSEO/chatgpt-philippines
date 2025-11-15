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
    if (!input.trim() || !uploadedFile) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Call the real API
    await streamAPIResponse(userMessage.content);
  };

  const streamAPIResponse = async (userInput: string) => {
    const messageId = Date.now().toString();

    // Create initial message
    const aiMessage: Message = {
      id: messageId,
      role: 'assistant',
      content: '',
      thinking: '',
      thinkingComplete: false,
      tools: [],
      charts: [],
      timestamp: new Date()
    };

    setMessages(prev => [...prev, aiMessage]);

    try {
      // Create form data with file and query
      const formData = new FormData();
      if (uploadedFile?.file) {
        formData.append('file', uploadedFile.file);
      }
      formData.append('query', userInput);

      // Call the real API endpoint
      const response = await fetch('/api/data-viz', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('No response body');
      }

      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (!line.trim() || !line.startsWith('data: ')) continue;

          const data = line.slice(6);
          if (data === '[DONE]') continue;

          try {
            const parsed = JSON.parse(data);

            setMessages(prev => prev.map(msg => {
              if (msg.id !== messageId) return msg;

              const updated = {
                ...msg,
                timestamp: msg.timestamp instanceof Date ? msg.timestamp : new Date(msg.timestamp)
              };

              // Handle thinking blocks
              if (parsed.type === 'thinking') {
                updated.thinking = (updated.thinking || '') + parsed.content;
              } else if (parsed.type === 'thinking_complete') {
                updated.thinkingComplete = true;
              }
              // Handle tool use
              else if (parsed.type === 'tool_use') {
                const existingTool = updated.tools?.find(t => t.id === parsed.toolUseId);
                if (existingTool) {
                  existingTool.status = 'running';
                } else {
                  updated.tools = [
                    ...(updated.tools || []),
                    {
                      id: parsed.toolUseId,
                      name: parsed.name,
                      status: 'running',
                      progress: 0,
                    }
                  ];
                }
              }
              // Handle tool result
              else if (parsed.type === 'tool_result') {
                updated.tools = updated.tools?.map(t =>
                  t.id === parsed.toolUseId
                    ? { ...t, status: 'complete', progress: 100, result: parsed.result }
                    : t
                );
              }
              // Handle text content
              else if (parsed.type === 'text') {
                updated.content += parsed.content;
              }
              // Handle chart data
              else if (parsed.type === 'chart') {
                updated.charts = [
                  ...(updated.charts || []),
                  {
                    id: parsed.chartId || Date.now().toString(),
                    type: parsed.chartType,
                    title: parsed.title,
                    data: parsed.data
                  }
                ];
              }

              return updated;
            }));
          } catch (e) {
            console.error('Failed to parse SSE data:', e);
          }
        }
      }

      setIsLoading(false);
    } catch (error) {
      console.error('API Error:', error);
      setMessages(prev => prev.map(msg =>
        msg.id === messageId
          ? {
              ...msg,
              content: 'Sorry, there was an error processing your request. Please try again.',
              thinkingComplete: true
            }
          : msg
      ));
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex h-screen bg-[#0D0D0D]">
      {/* Sidebar */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.aside
            initial={{ x: -320, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -320, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="w-80 bg-[#151515] border-r border-[#2A2A2A] flex flex-col"
          >
            <div className="p-6 border-b border-[#2A2A2A]">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-[#2A2A2A] rounded-lg">
                    <BarChart3 className="w-5 h-5 text-[#B4B4B4]" />
                  </div>
                  <div>
                    <h1 className="text-base font-medium text-[#E8E8E8]">
                      Data Viz Agent
                    </h1>
                    <p className="text-xs text-[#666666]">
                      Powered by Claude
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsSidebarOpen(false)}
                  className="p-2 hover:bg-[#2A2A2A] rounded-lg transition-colors lg:hidden"
                >
                  <X className="w-4 h-4 text-[#B4B4B4]" />
                </button>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm text-[#B4B4B4]">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>AI-powered insights</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-[#B4B4B4]">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>Interactive visualizations</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-[#B4B4B4]">
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>Natural language queries</span>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <h2 className="text-xs font-medium text-[#B4B4B4] mb-3 uppercase tracking-wide">
                Upload Data
              </h2>
              <FileUploadZone
                onFileUpload={handleFileUpload}
                uploadedFile={uploadedFile || undefined}
                onRemoveFile={handleRemoveFile}
              />

              {uploadedFile && (
                <div className="mt-6">
                  <h3 className="text-xs font-medium text-[#B4B4B4] mb-2 uppercase tracking-wide">
                    Quick Actions
                  </h3>
                  <div className="space-y-1">
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
                        className="w-full text-left px-3 py-2 text-sm text-[#E8E8E8] hover:bg-[#2A2A2A] rounded transition-colors"
                      >
                        {action}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-[#2A2A2A]">
              <p className="text-xs text-[#666666] text-center">
                Upload CSV, JSON, or Excel files to get started
              </p>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-[#151515] border-b border-[#2A2A2A] px-6 py-3.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {!isSidebarOpen && (
                <button
                  onClick={() => setIsSidebarOpen(true)}
                  className="p-2 hover:bg-[#2A2A2A] rounded transition-colors"
                >
                  <Menu className="w-4 h-4 text-[#B4B4B4]" />
                </button>
              )}
              <h2 className="text-sm font-medium text-[#E8E8E8]">
                Chat with Your Data
              </h2>
            </div>
          </div>
        </header>

        {/* Messages */}
        <div
          ref={chatContainerRef}
          id="chat-container"
          className="flex-1 overflow-y-auto px-6 py-6 bg-[#0D0D0D]"
        >
          {messages.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center h-full text-center"
            >
              <div className="p-4 bg-[#1A1A1A] rounded-lg mb-6">
                <BarChart3 className="w-12 h-12 text-[#B4B4B4]" />
              </div>
              <h3 className="text-xl font-medium text-[#E8E8E8] mb-3">
                Welcome to Data Viz Agent
              </h3>
              <p className="text-[#B4B4B4] max-w-md mb-8 text-sm">
                Upload your data and ask questions in natural language. I'll analyze it and create beautiful visualizations for you.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-w-2xl">
                {[
                  'What are the trends in my sales data?',
                  'Show me a comparison by region',
                  'Find outliers in the dataset',
                  'Create a report with key insights'
                ].map((example, idx) => (
                  <button
                    key={idx}
                    onClick={() => setInput(example)}
                    className="px-4 py-2.5 text-left text-sm bg-[#1A1A1A] border border-[#2A2A2A] text-[#E8E8E8] rounded hover:bg-[#252525] transition-colors"
                  >
                    {example}
                  </button>
                ))}
              </div>
            </motion.div>
          ) : (
            <div className="max-w-3xl mx-auto space-y-4">
              {messages.map((message) => (
                <div key={message.id}>
                  {message.role === 'user' ? (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex justify-end mb-4"
                    >
                      <div className="max-w-2xl bg-[#2A2A2A] text-[#E8E8E8] rounded-lg px-4 py-3">
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex gap-3 mb-4"
                    >
                      {/* AI Avatar */}
                      <div className="flex-shrink-0 w-7 h-7 rounded bg-[#CC785C] flex items-center justify-center text-white text-xs font-medium mt-1">
                        AI
                      </div>

                      <div className="flex-1 max-w-3xl space-y-3">
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
                          <div className="bg-transparent">
                            <div className="text-sm text-[#E8E8E8] leading-relaxed whitespace-pre-wrap">
                              {message.content}
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
        <div className="bg-[#151515] border-t border-[#2A2A2A] px-6 py-4">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-end gap-2">
              <div className="flex-1 relative">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder={uploadedFile ? "Ask me anything about your data..." : "Upload a file to get started..."}
                  disabled={!uploadedFile}
                  rows={1}
                  className="w-full px-4 py-3 bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg resize-none focus:outline-none focus:border-[#CC785C] disabled:opacity-50 disabled:cursor-not-allowed text-[#E8E8E8] placeholder-[#666666] text-sm"
                  style={{ minHeight: '44px', maxHeight: '120px' }}
                />
              </div>

              <button
                onClick={handleSendMessage}
                disabled={(!input.trim() && !uploadedFile) || isLoading}
                className="p-3 bg-[#CC785C] hover:bg-[#D68966] text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-[#666666] mt-2 text-center">
              Press Enter to send, Shift+Enter for new line
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
