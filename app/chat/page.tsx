'use client';

import { useState, useEffect, useRef } from 'react';
import { useUser } from '@auth0/nextjs-auth0/client';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

// Types
interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface Chat {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
}

// Suggested prompts for empty state
const SUGGESTED_PROMPTS = [
  "Write an email in Filipino",
  "Explain quantum physics simply",
  "Create a marketing plan",
  "Help me debug this code",
  "Translate English to Tagalog",
  "Plan a trip to Palawan"
];

// Constants
const GUEST_CHAT_LIMIT = 10;
const STORAGE_KEY = 'heygpt_guest_chats';
const COUNT_KEY = 'heygpt_guest_count';

export default function ChatPage() {
  const { user, isLoading: isUserLoading } = useUser();
  const [chats, setChats] = useState<Chat[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginModalCanDismiss, setLoginModalCanDismiss] = useState(true);
  const [guestChatCount, setGuestChatCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Load guest data on mount
  useEffect(() => {
    if (!user) {
      loadGuestData();
    }
  }, [user]);

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

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Focus input on '/'
      if (e.key === '/' && !e.ctrlKey && !e.metaKey) {
        const target = e.target as HTMLElement;
        if (target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA') {
          e.preventDefault();
          textareaRef.current?.focus();
        }
      }
      // Close sidebar on Esc
      if (e.key === 'Escape' && isSidebarOpen) {
        setIsSidebarOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isSidebarOpen]);

  // Load guest data from localStorage
  const loadGuestData = () => {
    try {
      const storedChats = localStorage.getItem(STORAGE_KEY);
      const storedCount = localStorage.getItem(COUNT_KEY);

      if (storedChats) {
        const parsedChats = JSON.parse(storedChats);
        setChats(parsedChats);
        if (parsedChats.length > 0) {
          setCurrentChatId(parsedChats[0].id);
          setMessages(parsedChats[0].messages);
        }
      }

      if (storedCount) {
        setGuestChatCount(parseInt(storedCount, 10));
      }
    } catch (error) {
      console.error('Error loading guest data:', error);
    }
  };

  // Save guest data to localStorage
  const saveGuestData = (updatedChats: Chat[], count: number) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedChats));
      localStorage.setItem(COUNT_KEY, count.toString());
    } catch (error) {
      console.error('Error saving guest data:', error);
    }
  };

  // Check if guest has reached limit
  const hasReachedGuestLimit = () => {
    return !user && guestChatCount >= GUEST_CHAT_LIMIT;
  };

  // Create new chat
  const createNewChat = () => {
    if (hasReachedGuestLimit()) {
      setShowLoginModal(true);
      return;
    }

    const newChat: Chat = {
      id: `chat_${Date.now()}`,
      title: 'New Chat',
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const updatedChats = [newChat, ...chats];
    setChats(updatedChats);
    setCurrentChatId(newChat.id);
    setMessages([]);
    setIsSidebarOpen(false);

    if (!user) {
      saveGuestData(updatedChats, guestChatCount);
    }
  };

  // Select chat
  const selectChat = (chatId: string) => {
    const chat = chats.find(c => c.id === chatId);
    if (chat) {
      setCurrentChatId(chatId);
      setMessages(chat.messages);
      setIsSidebarOpen(false);
    }
  };

  // Delete chat
  const deleteChat = (chatId: string) => {
    const updatedChats = chats.filter(c => c.id !== chatId);
    setChats(updatedChats);

    if (currentChatId === chatId) {
      if (updatedChats.length > 0) {
        setCurrentChatId(updatedChats[0].id);
        setMessages(updatedChats[0].messages);
      } else {
        setCurrentChatId(null);
        setMessages([]);
      }
    }

    if (!user) {
      saveGuestData(updatedChats, guestChatCount);
    }
  };

  // Send message
  const sendMessage = async (content: string) => {
    if (!content.trim() || isStreaming) return;

    // Check guest limit
    if (hasReachedGuestLimit()) {
      setShowLoginModal(true);
      return;
    }

    // Create chat if none exists
    let chatId = currentChatId;
    let isNewChat = false;

    if (!chatId) {
      const newChat: Chat = {
        id: `chat_${Date.now()}`,
        title: content.slice(0, 50) + (content.length > 50 ? '...' : ''),
        messages: [],
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const updatedChats = [newChat, ...chats];
      setChats(updatedChats);
      setCurrentChatId(newChat.id);
      chatId = newChat.id;
      isNewChat = true;
    }

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

    // Increment guest count on first message
    if (!user && isNewChat) {
      const newCount = guestChatCount + 1;
      setGuestChatCount(newCount);

      // Show modal if limit reached after sending
      if (newCount >= GUEST_CHAT_LIMIT) {
        setTimeout(() => setShowLoginModal(true), 1000);
      }
    }

    // Update chat in state
    const chatIndex = chats.findIndex(c => c.id === chatId);
    if (chatIndex !== -1) {
      const updatedChats = [...chats];
      updatedChats[chatIndex].messages = updatedMessages;
      updatedChats[chatIndex].updatedAt = new Date();
      if (isNewChat) {
        updatedChats[chatIndex].title = content.slice(0, 50) + (content.length > 50 ? '...' : '');
      }
      setChats(updatedChats);

      if (!user) {
        saveGuestData(updatedChats, guestChatCount + (isNewChat ? 1 : 0));
      }
    }

    // Stream AI response
    setIsStreaming(true);
    abortControllerRef.current = new AbortController();

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updatedMessages.map(m => ({
            role: m.role,
            content: m.content
          })),
          model: 'claude-sonnet-4-20250514'
        }),
        signal: abortControllerRef.current.signal
      });

      // Handle rate limit exceeded
      if (response.status === 429) {
        const errorData = await response.json();
        console.log('Rate limit exceeded:', errorData);

        // Show un-dismissable login modal
        setLoginModalCanDismiss(false);
        setShowLoginModal(true);
        setIsStreaming(false);

        // Remove the user message that triggered the limit
        setMessages(messages);

        return;
      }

      if (!response.ok) throw new Error('Failed to get response');

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let assistantContent = '';

      // Create assistant message
      const assistantMessage: Message = {
        id: `msg_${Date.now()}_assistant`,
        role: 'assistant',
        content: '',
        timestamp: new Date()
      };

      const messagesWithAssistant = [...updatedMessages, assistantMessage];
      setMessages(messagesWithAssistant);

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
                if (parsed.text) {
                  assistantContent += parsed.text;

                  // Update message in real-time
                  setMessages(prev => {
                    const updated = [...prev];
                    updated[updated.length - 1].content = assistantContent;
                    return updated;
                  });
                }
              } catch (e) {
                console.error('Error parsing chunk:', e);
              }
            }
          }
        }
      }

      // Final update
      const finalMessages = [...updatedMessages, { ...assistantMessage, content: assistantContent }];
      setMessages(finalMessages);

      // Update chat with final messages
      const finalChatIndex = chats.findIndex(c => c.id === chatId);
      if (finalChatIndex !== -1) {
        const finalChats = [...chats];
        finalChats[finalChatIndex].messages = finalMessages;
        finalChats[finalChatIndex].updatedAt = new Date();
        setChats(finalChats);

        if (!user) {
          saveGuestData(finalChats, guestChatCount + (isNewChat ? 1 : 0));
        }
      }
    } catch (error: any) {
      if (error.name !== 'AbortError') {
        console.error('Error:', error);

        // Add error message
        const errorMessage: Message = {
          id: `msg_${Date.now()}_error`,
          role: 'assistant',
          content: 'Sorry, I encountered an error. Please try again.',
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

  // Regenerate response
  const regenerateResponse = () => {
    if (messages.length < 2) return;

    // Remove last assistant message
    const withoutLastAssistant = messages.slice(0, -1);
    setMessages(withoutLastAssistant);

    // Resend last user message
    const lastUserMessage = [...messages].reverse().find(m => m.role === 'user');
    if (lastUserMessage) {
      sendMessage(lastUserMessage.content);
    }
  };

  // Filter chats by search
  const filteredChats = chats.filter(chat =>
    chat.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Format timestamp
  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  if (isUserLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#FFF4ED]">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-[#FFB380] to-[#E8844A] rounded-2xl flex items-center justify-center mb-4 mx-auto animate-pulse">
            <span className="text-white font-bold text-2xl">HG</span>
          </div>
          <p className="text-[#78716C]">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Login Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => {
              if (loginModalCanDismiss) {
                setShowLoginModal(false);
              }
            }}
          />
          <div
            className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 animate-in fade-in zoom-in duration-200"
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
          >
            {loginModalCanDismiss && (
              <button
                onClick={() => setShowLoginModal(false)}
                className="absolute top-4 right-4 p-2 hover:bg-[#F5F5F4] rounded-lg transition-colors"
                aria-label="Close modal"
              >
                <svg className="w-5 h-5 text-[#78716C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}

            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-[#FFB380] to-[#E8844A] rounded-full flex items-center justify-center">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
            </div>

            <h2 id="modal-title" className="text-3xl font-bold text-center mb-2 text-[#1C1917]">
              {loginModalCanDismiss ? "You've used your free chats" : "You've reached your 10 free messages!"}
            </h2>
            <p className="text-[#78716C] text-center mb-6">
              {loginModalCanDismiss
                ? "Sign up for free to continue chatting and unlock:"
                : "Sign up now to continue chatting. It's completely free and takes just seconds!"}
            </p>

            <ul className="space-y-3 mb-6">
              {[
                'Unlimited AI conversations',
                'Save your chat history',
                'Filipino & English support',
                'Access from any device'
              ].map((benefit, i) => (
                <li key={i} className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-[#16A34A] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-[#44403C]">{benefit}</span>
                </li>
              ))}
            </ul>

            <div className="space-y-3">
              <a
                href="/api/auth/login"
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-[#FFB380] to-[#E8844A] text-white py-3 px-6 rounded-xl font-semibold hover:opacity-90 transition-opacity shadow-lg"
              >
                Sign Up Free
              </a>
              <a
                href="/api/auth/login"
                className="w-full flex items-center justify-center gap-2 border-2 border-[#E8844A] text-[#E8844A] py-3 px-6 rounded-xl font-semibold hover:bg-[#FFF4ED] transition-colors"
              >
                Login
              </a>
            </div>

            <p className="text-xs text-[#78716C] text-center mt-4">
              No credit card required • Free forever
            </p>
          </div>
        </div>
      )}

      <div className="flex h-screen bg-[#FAFAF9]">
        {/* Sidebar - Desktop */}
        <aside
          className={`
            fixed lg:static inset-y-0 left-0 z-40 w-80 bg-white border-r border-[#E7E5E4]
            transform transition-transform duration-300 ease-in-out
            ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          `}
          role="complementary"
          aria-label="Chat history sidebar"
        >
          <div className="flex flex-col h-full">
            {/* Sidebar Header */}
            <div className="p-4 border-b border-[#E7E5E4]">
              <button
                onClick={createNewChat}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-[#FFB380] to-[#E8844A] text-white py-3 px-4 rounded-xl font-semibold hover:opacity-90 transition-opacity shadow-sm"
                disabled={hasReachedGuestLimit()}
                aria-label="Create new chat"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                New Chat
              </button>

              {/* Search */}
              <div className="mt-3 relative">
                <input
                  type="text"
                  placeholder="Search chats..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-[#F5F5F4] border border-[#E7E5E4] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#E8844A] focus:border-transparent"
                  aria-label="Search chats"
                />
                <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#78716C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>

            {/* Chat History */}
            <div className="flex-1 overflow-y-auto p-2">
              {filteredChats.length === 0 ? (
                <div className="text-center py-8 text-[#78716C] text-sm" role="status">
                  {searchQuery ? 'No chats found' : 'No chats yet'}
                </div>
              ) : (
                <nav className="space-y-1" aria-label="Chat history">
                  {filteredChats.map(chat => (
                    <button
                      key={chat.id}
                      onClick={() => selectChat(chat.id)}
                      className={`
                        w-full text-left p-3 rounded-lg transition-colors group
                        ${currentChatId === chat.id
                          ? 'bg-[#FFE6D5] text-[#E8844A]'
                          : 'hover:bg-[#F5F5F4] text-[#57534E]'
                        }
                      `}
                      aria-current={currentChatId === chat.id ? 'page' : undefined}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{chat.title}</p>
                          <p className="text-xs opacity-70 mt-0.5">
                            {chat.messages.length} message{chat.messages.length !== 1 ? 's' : ''}
                          </p>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteChat(chat.id);
                          }}
                          className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-white rounded transition-opacity"
                          aria-label={`Delete chat: ${chat.title}`}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </button>
                  ))}
                </nav>
              )}
            </div>

            {/* Guest Progress Indicator */}
            {!user && (
              <div className="p-4 border-t border-[#E7E5E4]">
                <div className="bg-[#FFF4ED] rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-[#E8844A]">
                      Free Chats Used
                    </span>
                    <span className="text-sm font-bold text-[#E8844A]">
                      {guestChatCount}/{GUEST_CHAT_LIMIT}
                    </span>
                  </div>
                  <div className="w-full bg-[#FFE6D5] rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-[#FFB380] to-[#E8844A] h-full transition-all duration-300"
                      style={{ width: `${(guestChatCount / GUEST_CHAT_LIMIT) * 100}%` }}
                      role="progressbar"
                      aria-valuenow={guestChatCount}
                      aria-valuemin={0}
                      aria-valuemax={GUEST_CHAT_LIMIT}
                      aria-label="Free chats used"
                    />
                  </div>
                  {guestChatCount === GUEST_CHAT_LIMIT && (
                    <p className="text-xs text-[#DC2626] mt-2 font-medium" role="alert">
                      This is your last free chat!
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </aside>

        {/* Backdrop for mobile */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-30 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
            aria-hidden="true"
          />
        )}

        {/* Main Chat Area */}
        <main className="flex-1 flex flex-col min-w-0" role="main">
          {/* Header */}
          <header className="bg-white border-b border-[#E7E5E4] px-4 lg:px-6 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="lg:hidden p-2 hover:bg-[#F5F5F4] rounded-lg transition-colors"
                aria-label="Toggle sidebar"
                aria-expanded={isSidebarOpen}
              >
                <svg className="w-6 h-6 text-[#57534E]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>

              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-[#FFB380] to-[#E8844A] rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">HG</span>
                </div>
                <h1 className="text-lg font-bold text-[#1C1917] hidden sm:block">
                  HeyGPT.ph
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {!user && guestChatCount > 0 && (
                <span className="hidden md:inline text-sm text-[#78716C]" role="status">
                  {guestChatCount}/{GUEST_CHAT_LIMIT} free chats
                </span>
              )}

              {user ? (
                <div className="flex items-center gap-2">
                  <span className="hidden sm:inline text-sm text-[#57534E]">{user.name}</span>
                  <img
                    src={user.picture || '/default-avatar.png'}
                    alt={user.name || 'User avatar'}
                    className="w-8 h-8 rounded-full"
                  />
                </div>
              ) : (
                <a
                  href="/api/auth/login"
                  className="flex items-center gap-2 bg-gradient-to-r from-[#FFB380] to-[#E8844A] text-white px-4 py-2 rounded-lg hover:opacity-90 transition-opacity text-sm font-semibold"
                >
                  Sign In
                </a>
              )}
            </div>
          </header>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto" role="log" aria-live="polite" aria-atomic="false">
            {messages.length === 0 ? (
              /* Empty State */
              <div className="flex flex-col items-center justify-center h-full px-4 py-12">
                <div className="text-center mb-8 max-w-2xl">
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-[#FFB380] to-[#E8844A] rounded-2xl mb-6">
                    <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                    </svg>
                  </div>
                  <h2 className="text-4xl font-bold text-[#1C1917] mb-3">
                    What can I help you with today?
                  </h2>
                  <p className="text-lg text-[#78716C]">
                    Powered by Claude AI for Filipinos
                  </p>
                </div>

                {/* Suggested Prompts */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-w-4xl w-full">
                  {SUGGESTED_PROMPTS.map((prompt, i) => (
                    <button
                      key={i}
                      onClick={() => sendMessage(prompt)}
                      className="p-4 bg-white border border-[#E7E5E4] rounded-xl hover:border-[#E8844A] hover:bg-[#FFF4ED] transition-all text-left group min-h-[4rem] touch-manipulation"
                      disabled={hasReachedGuestLimit()}
                    >
                      <p className="text-sm font-medium text-[#44403C] group-hover:text-[#E8844A]">
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
                    className={`flex gap-4 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {message.role === 'assistant' && (
                      <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-[#FFB380] to-[#E8844A] rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-xs">AI</span>
                      </div>
                    )}

                    <div className={`flex flex-col gap-2 max-w-[85%] md:max-w-[75%]`}>
                      <div
                        className={`rounded-2xl px-4 py-3 ${
                          message.role === 'user'
                            ? 'bg-gradient-to-r from-[#FFB380] to-[#E8844A] text-white'
                            : 'bg-white border border-[#E7E5E4] text-[#44403C]'
                        }`}
                      >
                        {message.role === 'assistant' ? (
                          <div className="prose prose-sm max-w-none prose-headings:text-[#1C1917] prose-p:text-[#44403C] prose-a:text-[#E8844A] prose-code:text-[#E8844A] prose-code:bg-[#FFF4ED]">
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
                          <p className="whitespace-pre-wrap">{message.content}</p>
                        )}
                      </div>

                      <div className={`flex items-center gap-2 text-xs text-[#A8A29E] ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <time dateTime={message.timestamp.toISOString()}>
                          {formatTime(message.timestamp)}
                        </time>

                        {message.role === 'assistant' && (
                          <button
                            onClick={() => copyToClipboard(message.content)}
                            className="p-1 hover:bg-[#F5F5F4] rounded transition-colors"
                            aria-label="Copy message to clipboard"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                          </button>
                        )}
                      </div>
                    </div>

                    {message.role === 'user' && user && (
                      <div className="flex-shrink-0 w-8 h-8 rounded-full overflow-hidden">
                        <img
                          src={user.picture || '/default-avatar.png'}
                          alt={user.name || 'User avatar'}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                  </div>
                ))}

                {/* Typing Indicator */}
                {isStreaming && (
                  <div className="flex gap-4" aria-live="polite" aria-label="AI is typing">
                    <div className="w-8 h-8 bg-gradient-to-br from-[#FFB380] to-[#E8844A] rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-xs">AI</span>
                    </div>
                    <div className="flex items-center gap-1 p-3 bg-white border border-[#E7E5E4] rounded-2xl">
                      <div className="w-2 h-2 bg-[#E8844A] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-2 h-2 bg-[#E8844A] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-2 h-2 bg-[#E8844A] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                )}

                {/* Regenerate Button */}
                {messages.length > 0 && !isStreaming && messages[messages.length - 1].role === 'assistant' && (
                  <div className="flex justify-start">
                    <button
                      onClick={regenerateResponse}
                      className="flex items-center gap-2 px-4 py-2 bg-white border border-[#E7E5E4] rounded-lg hover:bg-[#F5F5F4] transition-colors text-sm text-[#57534E] min-h-[48px] touch-manipulation"
                      aria-label="Regenerate response"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      Regenerate
                    </button>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Input Area - Sticky Bottom */}
          <div className="border-t border-[#E7E5E4] bg-white px-4 py-4 sticky bottom-0">
            <div className="max-w-4xl mx-auto">
              <form onSubmit={(e) => { e.preventDefault(); sendMessage(input); }} className="relative">
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
                  placeholder={hasReachedGuestLimit() ? "Sign in to continue chatting..." : "Type your message... (Shift + Enter for new line)"}
                  disabled={isStreaming || hasReachedGuestLimit()}
                  rows={1}
                  className="w-full resize-none bg-[#F5F5F4] border-2 border-[#E7E5E4] rounded-2xl px-4 py-3 pr-24 focus:outline-none focus:ring-2 focus:ring-[#E8844A] focus:border-transparent max-h-40 overflow-y-auto text-[#44403C] placeholder-[#A8A29E] touch-manipulation"
                  style={{ minHeight: '52px' }}
                  aria-label="Message input"
                />

                <div className="absolute right-2 bottom-2 flex items-center gap-2">
                  {/* Character Counter */}
                  {input.length > 0 && (
                    <span className="text-xs text-[#A8A29E]" aria-label={`${input.length} characters`}>
                      {input.length}
                    </span>
                  )}

                  {/* Stop Button */}
                  {isStreaming ? (
                    <button
                      type="button"
                      onClick={stopGeneration}
                      className="p-2 bg-[#DC2626] text-white rounded-lg hover:bg-[#B91C1C] transition-colors min-h-[48px] min-w-[48px] touch-manipulation"
                      aria-label="Stop generation"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <rect x="6" y="6" width="12" height="12" />
                      </svg>
                    </button>
                  ) : (
                    /* Send Button */
                    <button
                      type="submit"
                      disabled={!input.trim() || hasReachedGuestLimit()}
                      className={`p-2 rounded-lg transition-all min-h-[48px] min-w-[48px] touch-manipulation ${
                        !input.trim() || hasReachedGuestLimit()
                          ? 'bg-[#E7E5E4] text-[#A8A29E] cursor-not-allowed'
                          : 'bg-gradient-to-r from-[#FFB380] to-[#E8844A] text-white hover:opacity-90 shadow-sm'
                      }`}
                      aria-label="Send message"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                    </button>
                  )}

                  {/* Mic Icon (future feature) */}
                  <button
                    type="button"
                    disabled
                    className="p-2 text-[#A8A29E] hover:text-[#E8844A] rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed min-h-[48px] min-w-[48px] touch-manipulation"
                    aria-label="Voice input (coming soon)"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                    </svg>
                  </button>
                </div>
              </form>

              <p className="text-xs text-[#A8A29E] text-center mt-2">
                Press <kbd className="px-1.5 py-0.5 bg-[#F5F5F4] border border-[#E7E5E4] rounded text-[#78716C] font-mono">/</kbd> to focus • <kbd className="px-1.5 py-0.5 bg-[#F5F5F4] border border-[#E7E5E4] rounded text-[#78716C] font-mono">Shift + Enter</kbd> for new line
              </p>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
