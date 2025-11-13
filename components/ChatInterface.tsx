'use client';

import { useState, useEffect, useRef } from 'react';
import { useUser } from '@auth0/nextjs-auth0/client';
import { useRouter } from 'next/navigation';
import { Chat, AnthropicModel, Message as MessageType } from '@/lib/types';
import { storage } from '@/lib/storage';
import { guestStorage } from '@/lib/guestStorage';
import { DEFAULT_MODEL } from '@/lib/constants';
import { useGuestChatLimit } from '@/hooks/useGuestChatLimit';
import Sidebar from './Sidebar';
import Message from './Message';
import MessageInput from './MessageInput';
import PresetPrompts from './PresetPrompts';
import ModelSelector from './ModelSelector';
import UserMenu from './UserMenu';
import LoginPromptModal from './LoginPromptModal';

export default function ChatInterface() {
  const { user, isLoading: isUserLoading } = useUser();
  const router = useRouter();
  const [chats, setChats] = useState<Chat[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [currentChat, setCurrentChat] = useState<Chat | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedModel, setSelectedModel] = useState<AnthropicModel>(DEFAULT_MODEL);
  const [userId, setUserId] = useState<string | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Guest chat limit hook
  const {
    guestChatCount,
    hasReachedLimit,
    incrementChatCount,
    clearGuestChats,
    GUEST_CHAT_LIMIT,
  } = useGuestChatLimit();

  // Load guest chats on mount if not authenticated
  useEffect(() => {
    if (!isUserLoading && !user) {
      const guestChats = guestStorage.getChats();
      setChats(guestChats);
      if (guestChats.length > 0) {
        setCurrentChatId(guestChats[0].id);
      }
    }
  }, [user, isUserLoading]);

  // Sync user with Supabase and load chats
  useEffect(() => {
    if (user) {
      syncUser();
      // Clear guest chats when user logs in
      clearGuestChats();
    }
  }, [user]);

  const syncUser = async () => {
    try {
      const response = await fetch('/api/auth/sync-user', {
        method: 'POST',
      });
      const data = await response.json();
      if (data.user) {
        setUserId(data.user.id);
        loadUserChats(data.user.id);
      }
    } catch (error) {
      console.error('Error syncing user:', error);
    }
  };

  const loadUserChats = async (userIdToLoad: string) => {
    try {
      const response = await fetch(`/api/supabase/load-chats?userId=${userIdToLoad}`);
      const data = await response.json();
      setChats(data.chats || []);
      if (data.chats && data.chats.length > 0) {
        setCurrentChatId(data.chats[0].id);
      }
    } catch (error) {
      console.error('Error loading chats:', error);
    }
  };

  // Show loading state while checking authentication
  if (isUserLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mb-4 mx-auto animate-pulse">
            <span className="text-white font-bold text-2xl">PH</span>
          </div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Update current chat when ID changes
  useEffect(() => {
    if (currentChatId) {
      const chat = user ? storage.getChat(currentChatId) : guestStorage.getChat(currentChatId);
      setCurrentChat(chat);
      if (chat) {
        setSelectedModel(chat.model);
      }
    } else {
      setCurrentChat(null);
    }
  }, [currentChatId, user]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentChat?.messages]);

  const handleNewChat = () => {
    // Check guest limit before creating new chat
    if (!user && hasReachedLimit) {
      setShowLoginModal(true);
      return;
    }

    const storageToUse = user ? storage : guestStorage;
    const newChat = storageToUse.createChat({
      title: 'New Chat',
      messages: [],
      model: selectedModel,
    });
    setChats([newChat, ...chats]);
    setCurrentChatId(newChat.id);
    setIsSidebarOpen(false);

    // Increment guest chat count only when first message is sent
  };

  const handleSelectChat = (chatId: string) => {
    setCurrentChatId(chatId);
    setIsSidebarOpen(false);
  };

  const handleDeleteChat = (chatId: string) => {
    const storageToUse = user ? storage : guestStorage;
    storageToUse.deleteChat(chatId);
    const updatedChats = storageToUse.getChats();
    setChats(updatedChats);
    if (currentChatId === chatId) {
      setCurrentChatId(updatedChats[0]?.id || null);
    }
  };

  const handleSendMessage = async (content: string) => {
    // Check guest limit before sending message
    if (!user && hasReachedLimit) {
      setShowLoginModal(true);
      return;
    }

    const storageToUse = user ? storage : guestStorage;

    // Create new chat if none exists
    let chatId = currentChatId;
    let isNewChat = false;

    if (!chatId) {
      const newChat = storageToUse.createChat({
        title: content.slice(0, 50) + (content.length > 50 ? '...' : ''),
        messages: [],
        model: selectedModel,
      });
      setChats([newChat, ...chats]);
      setCurrentChatId(newChat.id);
      chatId = newChat.id;
      isNewChat = true;
    }

    // Check if this is the first message in the chat for guests
    const chat = storageToUse.getChat(chatId);
    const isFirstMessage = chat?.messages.length === 0;

    // For guests, increment count on first message of new chat
    if (!user && isNewChat && isFirstMessage) {
      const newCount = incrementChatCount();

      // Show modal after incrementing if limit reached
      if (newCount >= GUEST_CHAT_LIMIT) {
        setShowLoginModal(true);
      }
    }

    // Add user message
    const userMessage = storageToUse.addMessage(chatId, {
      role: 'user',
      content,
    });

    if (!userMessage) return;

    // Refresh current chat
    const updatedChat = storageToUse.getChat(chatId);
    setCurrentChat(updatedChat);

    // Update chats list
    const allChats = storageToUse.getChats();
    setChats(allChats);

    setIsLoading(true);

    try {
      // Prepare messages for API
      const messages = updatedChat?.messages.map((msg) => ({
        role: msg.role,
        content: msg.content,
      })) || [];

      // Call streaming API
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages,
          model: selectedModel,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let assistantContent = '';

      if (reader) {
        // Create temporary assistant message
        let tempMessageId: string | null = null;

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
                  assistantContent += parsed.text;

                  // Update or create assistant message
                  if (!tempMessageId) {
                    const assistantMessage = storageToUse.addMessage(chatId, {
                      role: 'assistant',
                      content: assistantContent,
                    });
                    tempMessageId = assistantMessage?.id || null;
                  } else {
                    const chat = storageToUse.getChat(chatId);
                    if (chat) {
                      const messageIndex = chat.messages.findIndex(
                        (m) => m.id === tempMessageId
                      );
                      if (messageIndex !== -1) {
                        chat.messages[messageIndex].content = assistantContent;
                        storageToUse.updateChat(chatId, { messages: chat.messages });
                      }
                    }
                  }

                  // Update UI
                  const latestChat = storageToUse.getChat(chatId);
                  setCurrentChat(latestChat);
                }
              } catch (e) {
                console.error('Error parsing chunk:', e);
              }
            }
          }
        }
      }

      // Final update
      const finalChat = storageToUse.getChat(chatId);
      setCurrentChat(finalChat);
      const finalChats = storageToUse.getChats();
      setChats(finalChats);
    } catch (error) {
      console.error('Error sending message:', error);
      // Add error message
      storageToUse.addMessage(chatId, {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
      });
      const errorChat = storageToUse.getChat(chatId);
      setCurrentChat(errorChat);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectPreset = (prompt: string) => {
    handleSendMessage(prompt);
  };

  const handleModelChange = (model: AnthropicModel) => {
    setSelectedModel(model);
    if (currentChatId) {
      const storageToUse = user ? storage : guestStorage;
      storageToUse.updateChat(currentChatId, { model });
    }
  };

  return (
    <>
      {/* Login Prompt Modal */}
      <LoginPromptModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        chatCount={GUEST_CHAT_LIMIT}
      />

      <div className="flex h-screen bg-gray-50">
        {/* Sidebar */}
        <Sidebar
        chats={chats}
        currentChatId={currentChatId}
        onSelectChat={handleSelectChat}
        onNewChat={handleNewChat}
        onDeleteChat={handleDeleteChat}
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Mobile menu button */}
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
              aria-label="Toggle sidebar"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-6 h-6"
              >
                <path
                  fillRule="evenodd"
                  d="M3 6.75A.75.75 0 013.75 6h16.5a.75.75 0 010 1.5H3.75A.75.75 0 013 6.75zM3 12a.75.75 0 01.75-.75h16.5a.75.75 0 010 1.5H3.75A.75.75 0 013 12zm0 5.25a.75.75 0 01.75-.75h16.5a.75.75 0 010 1.5H3.75a.75.75 0 01-.75-.75z"
                  clipRule="evenodd"
                />
              </svg>
            </button>

            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">PH</span>
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                ChatGPT Philippines
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Guest Chat Counter */}
            {!user && (
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-blue-50 rounded-lg border border-blue-200">
                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
                <span className="text-sm font-medium text-blue-900">
                  {guestChatCount} / {GUEST_CHAT_LIMIT} free chats
                </span>
              </div>
            )}

            {/* Model Selector */}
            <ModelSelector selectedModel={selectedModel} onSelectModel={handleModelChange} />

            {/* User Menu */}
            {user && <UserMenu />}

            {/* Guest Login Button */}
            {!user && (
              <a
                href="/api/auth/login"
                className="hidden sm:flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg hover:opacity-90 transition-opacity text-sm font-semibold"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
                Sign In
              </a>
            )}
          </div>
        </header>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto">
          {!currentChat || currentChat.messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full">
              <div className="mb-8 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl mb-4">
                  <span className="text-white font-bold text-2xl">PH</span>
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  What can I help with?
                </h2>
                <p className="text-gray-600">
                  Powered by Claude AI for Filipino Freelancers
                </p>
              </div>
              <PresetPrompts onSelectPrompt={handleSelectPreset} />
            </div>
          ) : (
            <div className="max-w-4xl mx-auto px-4 py-6">
              {currentChat.messages.map((message) => (
                <Message key={message.id} message={message} />
              ))}
              {isLoading && (
                <div className="flex items-center gap-2 text-gray-500 mb-4">
                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="border-t border-gray-200 bg-white px-4 py-4">
          <div className="max-w-4xl mx-auto">
            {/* Guest Warning Banner */}
            {!user && guestChatCount > 0 && (
              <div className="mb-3 p-3 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-blue-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-sm text-gray-700">
                      {guestChatCount >= GUEST_CHAT_LIMIT ? (
                        <span className="font-semibold text-red-600">You've used all {GUEST_CHAT_LIMIT} free chats.</span>
                      ) : (
                        <span>
                          You have <span className="font-semibold text-blue-700">{GUEST_CHAT_LIMIT - guestChatCount} free chat{GUEST_CHAT_LIMIT - guestChatCount !== 1 ? 's' : ''}</span> remaining.
                        </span>
                      )}
                      {guestChatCount < GUEST_CHAT_LIMIT && (
                        <span className="text-gray-600"> Sign in for unlimited chats and saved history.</span>
                      )}
                    </p>
                  </div>
                  <a
                    href="/api/auth/login"
                    className="flex-shrink-0 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-1.5 rounded-lg hover:opacity-90 transition-opacity text-sm font-semibold"
                  >
                    Sign In
                  </a>
                </div>
              </div>
            )}

            <MessageInput
              onSend={handleSendMessage}
              disabled={isLoading}
              placeholder="Ask anything..."
            />
            <p className="text-xs text-gray-500 text-center mt-2">
              ChatGPT Philippines can make mistakes. Please verify important information.
            </p>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}
