import { Chat, Message, AnthropicModel } from './types';
import { v4 as uuidv4 } from 'uuid';
import { DEFAULT_MODEL } from './constants';

const GUEST_STORAGE_KEY = 'guest-chats';

// Valid model IDs
const VALID_MODELS: AnthropicModel[] = [
  'claude-sonnet-4-20250514',
  'claude-3-7-sonnet-20250219',
  'claude-opus-4-20250514',
  'claude-3-5-haiku-20241022',
  'claude-3-haiku-20240307'
];

// Migrate old chats to use valid model IDs
const migrateChats = (chats: Chat[]): Chat[] => {
  return chats.map(chat => {
    if (!VALID_MODELS.includes(chat.model as AnthropicModel)) {
      console.log(`Migrating guest chat "${chat.title}" from ${chat.model} to ${DEFAULT_MODEL}`);
      return { ...chat, model: DEFAULT_MODEL };
    }
    return chat;
  });
};

export const guestStorage = {
  getChats: (): Chat[] => {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem(GUEST_STORAGE_KEY);
    if (!data) return [];

    const chats: Chat[] = JSON.parse(data);
    const migratedChats = migrateChats(chats);

    // Save migrated chats if any changes were made
    if (JSON.stringify(chats) !== JSON.stringify(migratedChats)) {
      localStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify(migratedChats));
    }

    return migratedChats;
  },

  saveChats: (chats: Chat[]): void => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify(chats));
  },

  getChat: (id: string): Chat | null => {
    const chats = guestStorage.getChats();
    return chats.find((chat) => chat.id === id) || null;
  },

  createChat: (chat: Omit<Chat, 'id' | 'createdAt' | 'updatedAt'>): Chat => {
    const newChat: Chat = {
      ...chat,
      id: uuidv4(),
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    const chats = guestStorage.getChats();
    chats.unshift(newChat);
    guestStorage.saveChats(chats);
    return newChat;
  },

  updateChat: (id: string, updates: Partial<Chat>): Chat | null => {
    const chats = guestStorage.getChats();
    const index = chats.findIndex((chat) => chat.id === id);
    if (index === -1) return null;

    chats[index] = {
      ...chats[index],
      ...updates,
      updatedAt: Date.now(),
    };
    guestStorage.saveChats(chats);
    return chats[index];
  },

  deleteChat: (id: string): boolean => {
    const chats = guestStorage.getChats();
    const filtered = chats.filter((chat) => chat.id !== id);
    if (filtered.length === chats.length) return false;
    guestStorage.saveChats(filtered);
    return true;
  },

  addMessage: (chatId: string, message: Omit<Message, 'id' | 'timestamp'>): Message | null => {
    const chat = guestStorage.getChat(chatId);
    if (!chat) return null;

    const newMessage: Message = {
      ...message,
      id: uuidv4(),
      timestamp: Date.now(),
    };

    chat.messages.push(newMessage);

    // Update chat title based on first user message
    if (chat.messages.filter(m => m.role === 'user').length === 1 && message.role === 'user') {
      const title = message.content.slice(0, 50) + (message.content.length > 50 ? '...' : '');
      guestStorage.updateChat(chatId, { messages: chat.messages, title });
    } else {
      guestStorage.updateChat(chatId, { messages: chat.messages });
    }

    return newMessage;
  },

  clearAllChats: (): void => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(GUEST_STORAGE_KEY);
  },
};
