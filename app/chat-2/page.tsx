'use client';

import { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

// Types
interface Message {
  id: string;
  role: 'user' | 'assistant' | 'tool';
  content: string;
  timestamp: Date;
  toolName?: string;
  toolInput?: any;
}

// Suggested prompts showcasing agent capabilities
const SUGGESTED_PROMPTS = [
  "Search for the latest AI news and summarize it",
  "Analyze a codebase and suggest improvements",
  "Research quantum computing and create a report",
  "Help me debug and fix code issues",
  "Find files matching a pattern and analyze them",
  "Create a comprehensive project plan"
];

export default function AgentChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // Agent settings
  const [enableTools, setEnableTools] = useState(true);
  const [selectedTools, setSelectedTools] = useState<string[]>(['Read', 'Grep', 'WebSearch']);
  const [autoApprove, setAutoApprove] = useState(false);
  const [useCache, setUseCache] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const availableTools = [
    { name: 'Read', description: 'Read files', icon: '📄' },
    { name: 'Write', description: 'Write files', icon: '✍️' },
    { name: 'Bash', description: 'Execute commands', icon: '⚙️' },
    { name: 'Grep', description: 'Search code', icon: '🔍' },
    { name: 'Glob', description: 'Find files', icon: '📁' },
    { name: 'WebSearch', description: 'Search web', icon: '🌐' },
  ];

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [input]);

  // Send message
  const sendMessage = async (content: string) => {
    if (!content.trim() || isStreaming) return;

    // Create user message
    const userMessage: Message = {
      id: `msg_${Date.now()}`,
      role: 'user',
      content,
      timestamp: new Date()
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput('');

    // Stream AI response
    setIsStreaming(true);
    abortControllerRef.current = new AbortController();

    try {
      const response = await fetch('/api/agent/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updatedMessages.map(m => ({
            role: m.role === 'tool' ? 'assistant' : m.role,
            content: m.content
          })),
          enableTools,
          tools: selectedTools,
          autoApprove,
          useCache,
        }),
        signal: abortControllerRef.current.signal
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let assistantContent = '';
      let currentMessageId = `msg_${Date.now()}_assistant`;

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              if (data === '[DONE]') break;

              try {
                const parsed = JSON.parse(data);

                if (parsed.type === 'text' && parsed.text) {
                  assistantContent += parsed.text;

                  // Update assistant message in real-time
                  setMessages(prev => {
                    const existing = prev.find(m => m.id === currentMessageId);
                    if (existing) {
                      return prev.map(m =>
                        m.id === currentMessageId
                          ? { ...m, content: assistantContent }
                          : m
                      );
                    } else {
                      return [
                        ...prev,
                        {
                          id: currentMessageId,
                          role: 'assistant' as const,
                          content: assistantContent,
                          timestamp: new Date(),
                        },
                      ];
                    }
                  });
                } else if (parsed.type === 'tool_use') {
                  // Show tool usage
                  const toolMessage: Message = {
                    id: `tool_${Date.now()}_${Math.random()}`,
                    role: 'tool',
                    content: `Using tool: ${parsed.tool}`,
                    toolName: parsed.tool,
                    toolInput: parsed.input,
                    timestamp: new Date(),
                  };

                  setMessages(prev => [...prev, toolMessage]);
                } else if (parsed.type === 'tool_result' && parsed.output) {
                  // Show tool result
                  setMessages(prev => {
                    const lastTool = [...prev].reverse().find(m => m.role === 'tool');
                    if (lastTool) {
                      return prev.map(m =>
                        m.id === lastTool.id
                          ? {
                              ...m,
                              content: `${m.content}\n\nResult: ${
                                typeof parsed.output === 'string'
                                  ? parsed.output.substring(0, 200)
                                  : JSON.stringify(parsed.output).substring(0, 200)
                              }`,
                            }
                          : m
                      );
                    }
                    return prev;
                  });
                } else if (parsed.type === 'error') {
                  throw new Error(parsed.error);
                }
              } catch (e) {
                console.error('Error parsing chunk:', e);
              }
            }
          }
        }
      }
    } catch (error: any) {
      if (error.name !== 'AbortError') {
        console.error('Error:', error);

        const errorMessage: Message = {
          id: `msg_${Date.now()}_error`,
          role: 'assistant',
          content: `❌ Error: ${error.message}`,
          timestamp: new Date()
        };

        setMessages(prev => [...prev, errorMessage]);
      }
    } finally {
      setIsStreaming(false);
      abortControllerRef.current = null;
    }
  };

  // Stop generation
  const stopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsStreaming(false);
    }
  };

  // Copy message content
  const copyToClipboard = (content: string) => {
    navigator.clipboard.writeText(content);
  };

  // Toggle tool selection
  const toggleTool = (toolName: string) => {
    setSelectedTools(prev =>
      prev.includes(toolName)
        ? prev.filter(t => t !== toolName)
        : [...prev, toolName]
    );
  };

  return (
    <div className="flex h-screen bg-[#FAFAF9]">
      {/* Settings Panel */}
      {showSettings && (
        <aside className="w-80 bg-white border-r border-[#E7E5E4] p-6 overflow-y-auto">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-[#1C1917] mb-2">Agent Settings</h2>
            <p className="text-sm text-[#78716C]">Configure agent behavior and tools</p>
          </div>

          {/* Enable Tools Toggle */}
          <div className="mb-6">
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-sm font-medium text-[#44403C]">Enable Tools</span>
              <div className="relative">
                <input
                  type="checkbox"
                  checked={enableTools}
                  onChange={(e) => setEnableTools(e.target.checked)}
                  className="sr-only"
                />
                <div
                  className={`w-11 h-6 rounded-full transition-colors ${
                    enableTools ? 'bg-[#E8844A]' : 'bg-[#E7E5E4]'
                  }`}
                >
                  <div
                    className={`w-4 h-4 bg-white rounded-full mt-1 transition-transform ${
                      enableTools ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </div>
              </div>
            </label>
            <p className="text-xs text-[#A8A29E] mt-1">
              Allow agent to use tools for multi-step reasoning
            </p>
          </div>

          {/* Available Tools */}
          {enableTools && (
            <div className="mb-6">
              <h3 className="text-sm font-medium text-[#44403C] mb-3">Available Tools</h3>
              <div className="space-y-2">
                {availableTools.map((tool) => (
                  <label
                    key={tool.name}
                    className="flex items-center gap-3 p-3 bg-[#F5F5F4] rounded-lg cursor-pointer hover:bg-[#E7E5E4] transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={selectedTools.includes(tool.name)}
                      onChange={() => toggleTool(tool.name)}
                      className="w-4 h-4 text-[#E8844A] border-[#E7E5E4] rounded focus:ring-[#E8844A]"
                    />
                    <span className="text-lg">{tool.icon}</span>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-[#44403C]">{tool.name}</p>
                      <p className="text-xs text-[#78716C]">{tool.description}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Auto-approve */}
          <div className="mb-6">
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-sm font-medium text-[#44403C]">Auto-approve Actions</span>
              <div className="relative">
                <input
                  type="checkbox"
                  checked={autoApprove}
                  onChange={(e) => setAutoApprove(e.target.checked)}
                  className="sr-only"
                />
                <div
                  className={`w-11 h-6 rounded-full transition-colors ${
                    autoApprove ? 'bg-[#E8844A]' : 'bg-[#E7E5E4]'
                  }`}
                >
                  <div
                    className={`w-4 h-4 bg-white rounded-full mt-1 transition-transform ${
                      autoApprove ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </div>
              </div>
            </label>
            <p className="text-xs text-[#A8A29E] mt-1">
              Automatically approve file operations and commands
            </p>
          </div>

          {/* Use Cache */}
          <div className="mb-6">
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-sm font-medium text-[#44403C]">Enable Caching</span>
              <div className="relative">
                <input
                  type="checkbox"
                  checked={useCache}
                  onChange={(e) => setUseCache(e.target.checked)}
                  className="sr-only"
                />
                <div
                  className={`w-11 h-6 rounded-full transition-colors ${
                    useCache ? 'bg-[#E8844A]' : 'bg-[#E7E5E4]'
                  }`}
                >
                  <div
                    className={`w-4 h-4 bg-white rounded-full mt-1 transition-transform ${
                      useCache ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </div>
              </div>
            </label>
            <p className="text-xs text-[#A8A29E] mt-1">
              Cache responses for faster replies
            </p>
          </div>

          {/* Info */}
          <div className="p-4 bg-[#FFF4ED] border border-[#FFE6D5] rounded-lg">
            <div className="flex gap-2">
              <span className="text-lg">💡</span>
              <div>
                <p className="text-sm font-medium text-[#E8844A] mb-1">Agent Mode</p>
                <p className="text-xs text-[#78716C]">
                  This chat uses Claude Agent SDK with multi-step reasoning and tool use for complex tasks.
                </p>
              </div>
            </div>
          </div>
        </aside>
      )}

      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="bg-white border-b border-[#E7E5E4] px-4 lg:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-[#8B5CF6] to-[#6366F1] rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">🤖</span>
              </div>
              <div>
                <h1 className="text-lg font-bold text-[#1C1917]">Agent Chat</h1>
                <p className="text-xs text-[#78716C]">Powered by Claude Agent SDK</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className={`p-2 rounded-lg transition-colors ${
                showSettings
                  ? 'bg-[#E8844A] text-white'
                  : 'bg-[#F5F5F4] text-[#57534E] hover:bg-[#E7E5E4]'
              }`}
              aria-label="Toggle settings"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>

            <a
              href="/chat"
              className="text-sm text-[#E8844A] hover:underline font-medium"
            >
              ← Regular Chat
            </a>
          </div>
        </header>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto">
          {messages.length === 0 ? (
            /* Empty State */
            <div className="flex flex-col items-center justify-center h-full px-4 py-12">
              <div className="text-center mb-8 max-w-2xl">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-[#8B5CF6] to-[#6366F1] rounded-2xl mb-6">
                  <span className="text-4xl">🤖</span>
                </div>
                <h2 className="text-4xl font-bold text-[#1C1917] mb-3">
                  Agent Chat (Beta)
                </h2>
                <p className="text-lg text-[#78716C] mb-2">
                  Multi-step reasoning with tools and skills
                </p>
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#FFF4ED] border border-[#FFE6D5] rounded-lg text-sm text-[#E8844A]">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Powered by Claude Agent SDK
                </div>
              </div>

              {/* Suggested Prompts */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-w-4xl w-full">
                {SUGGESTED_PROMPTS.map((prompt, i) => (
                  <button
                    key={i}
                    onClick={() => sendMessage(prompt)}
                    className="p-4 bg-white border border-[#E7E5E4] rounded-xl hover:border-[#8B5CF6] hover:bg-[#F5F3FF] transition-all text-left group min-h-[4rem]"
                  >
                    <p className="text-sm font-medium text-[#44403C] group-hover:text-[#8B5CF6]">
                      {prompt}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            /* Messages List */
            <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-4 ${
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {(message.role === 'assistant' || message.role === 'tool') && (
                    <div
                      className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                        message.role === 'tool'
                          ? 'bg-gradient-to-br from-[#10B981] to-[#059669]'
                          : 'bg-gradient-to-br from-[#8B5CF6] to-[#6366F1]'
                      }`}
                    >
                      <span className="text-white font-bold text-xs">
                        {message.role === 'tool' ? '🔧' : 'AI'}
                      </span>
                    </div>
                  )}

                  <div className="flex flex-col gap-2 max-w-[85%] md:max-w-[75%]">
                    <div
                      className={`rounded-2xl px-4 py-3 ${
                        message.role === 'user'
                          ? 'bg-gradient-to-r from-[#8B5CF6] to-[#6366F1] text-white'
                          : message.role === 'tool'
                          ? 'bg-[#D1FAE5] border border-[#10B981] text-[#065F46]'
                          : 'bg-white border border-[#E7E5E4] text-[#44403C]'
                      }`}
                    >
                      {message.role === 'assistant' ? (
                        <div className="prose prose-sm max-w-none">
                          <ReactMarkdown
                            components={{
                              code({ node, className, children, ...props }: any) {
                                const match = /language-(\w+)/.exec(className || '');
                                const inline = !className;
                                return !inline && match ? (
                                  <SyntaxHighlighter
                                    style={oneDark}
                                    language={match[1]}
                                    PreTag="div"
                                    {...props}
                                  >
                                    {String(children).replace(/\n$/, '')}
                                  </SyntaxHighlighter>
                                ) : (
                                  <code className={className} {...props}>
                                    {children}
                                  </code>
                                );
                              },
                            }}
                          >
                            {message.content}
                          </ReactMarkdown>
                        </div>
                      ) : (
                        <p className="whitespace-pre-wrap text-sm">{message.content}</p>
                      )}
                    </div>

                    <div
                      className={`flex items-center gap-2 text-xs text-[#A8A29E] ${
                        message.role === 'user' ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      {message.role === 'assistant' && (
                        <button
                          onClick={() => copyToClipboard(message.content)}
                          className="p-1 hover:bg-[#F5F5F4] rounded transition-colors"
                          aria-label="Copy"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                            />
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {/* Typing Indicator */}
              {isStreaming && (
                <div className="flex gap-4">
                  <div className="w-8 h-8 bg-gradient-to-br from-[#8B5CF6] to-[#6366F1] rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-xs">AI</span>
                  </div>
                  <div className="flex items-center gap-1 p-3 bg-white border border-[#E7E5E4] rounded-2xl">
                    <div className="w-2 h-2 bg-[#8B5CF6] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-[#8B5CF6] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-[#8B5CF6] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="border-t border-[#E7E5E4] bg-white px-4 py-4">
          <div className="max-w-4xl mx-auto">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                sendMessage(input);
              }}
              className="relative"
            >
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage(input);
                  }
                }}
                placeholder="Ask the agent anything... (Shift + Enter for new line)"
                disabled={isStreaming}
                rows={1}
                className="w-full resize-none bg-[#F5F5F4] border-2 border-[#E7E5E4] rounded-2xl px-4 py-3 pr-16 focus:outline-none focus:ring-2 focus:ring-[#8B5CF6] focus:border-transparent max-h-40 overflow-y-auto"
                style={{ minHeight: '52px' }}
              />

              <div className="absolute right-2 bottom-2">
                {isStreaming ? (
                  <button
                    type="button"
                    onClick={stopGeneration}
                    className="p-2 bg-[#DC2626] text-white rounded-lg hover:bg-[#B91C1C] transition-colors"
                    aria-label="Stop"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <rect x="6" y="6" width="12" height="12" />
                    </svg>
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={!input.trim()}
                    className={`p-2 rounded-lg transition-all ${
                      !input.trim()
                        ? 'bg-[#E7E5E4] text-[#A8A29E] cursor-not-allowed'
                        : 'bg-gradient-to-r from-[#8B5CF6] to-[#6366F1] text-white hover:opacity-90'
                    }`}
                    aria-label="Send"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                  </button>
                )}
              </div>
            </form>

            {enableTools && selectedTools.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2 items-center">
                <span className="text-xs text-[#78716C]">Active tools:</span>
                {selectedTools.map((tool) => (
                  <span
                    key={tool}
                    className="px-2 py-1 bg-[#F5F3FF] text-[#8B5CF6] text-xs rounded-lg border border-[#E9D5FF]"
                  >
                    {tool}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
