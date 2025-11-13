'use client';

import { useState, useEffect } from 'react';

const GUEST_CHAT_LIMIT = 3;
const GUEST_CHAT_COUNT_KEY = 'guest-chat-count';
const GUEST_CHATS_KEY = 'guest-chats';

export function useGuestChatLimit() {
  const [guestChatCount, setGuestChatCount] = useState(0);
  const [hasReachedLimit, setHasReachedLimit] = useState(false);

  // Initialize from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const count = parseInt(localStorage.getItem(GUEST_CHAT_COUNT_KEY) || '0', 10);
      setGuestChatCount(count);
      setHasReachedLimit(count >= GUEST_CHAT_LIMIT);
    }
  }, []);

  const incrementChatCount = () => {
    const newCount = guestChatCount + 1;
    setGuestChatCount(newCount);
    localStorage.setItem(GUEST_CHAT_COUNT_KEY, newCount.toString());

    if (newCount >= GUEST_CHAT_LIMIT) {
      setHasReachedLimit(true);
    }

    return newCount;
  };

  const resetChatCount = () => {
    setGuestChatCount(0);
    setHasReachedLimit(false);
    localStorage.removeItem(GUEST_CHAT_COUNT_KEY);
  };

  const getRemainingChats = () => {
    return Math.max(0, GUEST_CHAT_LIMIT - guestChatCount);
  };

  const clearGuestChats = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(GUEST_CHATS_KEY);
    }
  };

  return {
    guestChatCount,
    hasReachedLimit,
    incrementChatCount,
    resetChatCount,
    getRemainingChats,
    clearGuestChats,
    GUEST_CHAT_LIMIT,
  };
}
