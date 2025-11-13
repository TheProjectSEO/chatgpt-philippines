export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export interface Chat {
  id: string;
  title: string;
  messages: Message[];
  model: AnthropicModel;
  createdAt: number;
  updatedAt: number;
}

export type AnthropicModel =
  | 'claude-sonnet-4-20250514'
  | 'claude-3-7-sonnet-20250219'
  | 'claude-opus-4-20250514'
  | 'claude-3-5-haiku-20241022'
  | 'claude-3-haiku-20240307';

export interface ModelOption {
  id: AnthropicModel;
  name: string;
  description: string;
}

export interface PresetPrompt {
  id: string;
  title: string;
  description: string;
  prompt: string;
  icon: string;
}
