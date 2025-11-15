/**
 * Tool Metadata Configuration
 *
 * Centralized metadata definitions for all tools.
 * Each tool has optimized SEO metadata including:
 * - Title (50-60 chars)
 * - Description (120-160 chars)
 * - Keywords
 * - Schema markup data
 */

import { Metadata } from 'next';
import { generateToolMetadata } from './metadata-generator';

export interface ToolConfig {
  name: string;
  path: string;
  description: string;
  features: string[];
  category: string;
  keywords: string[];
  faqs?: Array<{ question: string; answer: string }>;
}

// Tool configurations with SEO-optimized content
export const TOOL_CONFIGS: Record<string, ToolConfig> = {
  paraphraser: {
    name: 'Free Paraphrasing Tool - Rewrite Text Instantly',
    path: '/paraphraser',
    description: 'Free AI paraphrasing tool to rewrite text, rephrase sentences, and reword paragraphs. Get unique content instantly with our advanced paraphraser.',
    features: [
      'paraphrasing tool',
      'paraphraser free',
      'rephrase sentences',
      'rewrite text',
      'text reworder',
      'sentence rephraser',
    ],
    category: 'Writing Tools',
    keywords: [
      'paraphrasing tool',
      'paraphraser',
      'rephrase',
      'rewrite',
      'text reworder',
      'AI paraphraser',
      'free paraphrasing',
      'sentence rephraser',
    ],
    faqs: [
      {
        question: 'Is this paraphrasing tool free?',
        answer: 'Yes, our AI-powered paraphrasing tool is completely free to use. You can rephrase up to 3000 characters at a time without any cost.',
      },
      {
        question: 'How does the paraphraser work?',
        answer: 'Our paraphraser uses advanced AI to understand your text and rewrite it while maintaining the original meaning. It rephrases sentences naturally and creates unique content.',
      },
    ],
  },
  'grammar-checker': {
    name: 'Free Grammar Checker - Fix Grammar & Spelling Errors',
    path: '/grammar-checker',
    description: 'Free online grammar checker to detect and fix grammar, spelling, and punctuation errors instantly. Improve your writing with AI-powered grammar checking.',
    features: [
      'grammar checker',
      'spell checker',
      'punctuation checker',
      'grammar check online',
      'free grammar tool',
    ],
    category: 'Writing Tools',
    keywords: [
      'grammar checker',
      'spell checker',
      'grammar check',
      'punctuation checker',
      'online grammar',
      'free grammar checker',
      'AI grammar check',
    ],
  },
  'ai-detector': {
    name: 'Free AI Content Detector - Detect AI-Generated Text',
    path: '/ai-detector',
    description: 'Free AI detector to identify AI-generated content. Detect text written by ChatGPT, GPT-4, Claude, and other AI tools with high accuracy.',
    features: [
      'AI detector',
      'AI content detector',
      'ChatGPT detector',
      'AI checker',
      'detect AI writing',
    ],
    category: 'AI Tools',
    keywords: [
      'AI detector',
      'AI content detector',
      'ChatGPT detector',
      'detect AI text',
      'AI checker',
      'AI writing detector',
      'GPT detector',
    ],
  },
  'plagiarism-checker': {
    name: 'Free Plagiarism Checker - Check for Duplicate Content',
    path: '/plagiarism-checker',
    description: 'Free plagiarism checker to detect copied content and ensure originality. Check for plagiarism instantly with our advanced plagiarism detection tool.',
    features: [
      'plagiarism checker',
      'plagiarism detector',
      'duplicate content checker',
      'originality checker',
      'free plagiarism check',
    ],
    category: 'Writing Tools',
    keywords: [
      'plagiarism checker',
      'plagiarism detector',
      'check plagiarism',
      'duplicate content',
      'originality check',
      'free plagiarism checker',
      'plagiarism scanner',
    ],
  },
  translator: {
    name: 'Free Filipino Translator - English to Tagalog Translation',
    path: '/translator',
    description: 'Free translator for English to Tagalog, Filipino to English, and 100+ languages. Fast, accurate AI translation for Filipino users.',
    features: [
      'translator',
      'English to Tagalog',
      'Tagalog translator',
      'Filipino translator',
      'language translator',
    ],
    category: 'Translation Tools',
    keywords: [
      'translator',
      'English to Tagalog',
      'Tagalog translator',
      'Filipino translator',
      'translate Tagalog',
      'language translation',
      'free translator',
    ],
  },
  'image-generator': {
    name: 'Free AI Image Generator - Create Images from Text',
    path: '/image-generator',
    description: 'Free AI image generator to create stunning images from text descriptions. Generate unique AI art, photos, and graphics instantly.',
    features: [
      'AI image generator',
      'image generator',
      'AI art generator',
      'text to image',
      'free image creator',
    ],
    category: 'AI Art Tools',
    keywords: [
      'AI image generator',
      'image generator',
      'AI art',
      'text to image',
      'image creator',
      'AI art generator',
      'free image generation',
    ],
  },
  summarizer: {
    name: 'Free Text Summarizer - Summarize Articles Instantly',
    path: '/summarizer',
    description: 'Free AI text summarizer to condense long articles and documents. Get key points and summaries instantly with our summarization tool.',
    features: [
      'text summarizer',
      'article summarizer',
      'summarize text',
      'summary generator',
      'free summarizer',
    ],
    category: 'Reading Tools',
    keywords: [
      'text summarizer',
      'summarizer',
      'article summarizer',
      'text summary',
      'summarize',
      'AI summarizer',
      'free summarizer',
    ],
  },
  chat: {
    name: 'Free ChatGPT Alternative - AI Chat Assistant',
    path: '/chat',
    description: 'Free ChatGPT alternative powered by Claude AI. Get instant answers, write content, and chat with an advanced AI assistant for free.',
    features: [
      'ChatGPT alternative',
      'AI chat',
      'free ChatGPT',
      'AI assistant',
      'chat bot',
    ],
    category: 'AI Chat',
    keywords: [
      'ChatGPT',
      'AI chat',
      'ChatGPT alternative',
      'free ChatGPT',
      'AI assistant',
      'chat bot',
      'Claude AI',
    ],
  },
};

/**
 * Generate metadata for a tool page
 */
export function getToolMetadata(toolKey: string): Metadata {
  const config = TOOL_CONFIGS[toolKey];

  if (!config) {
    console.warn(`Tool config not found for: ${toolKey}`);
    return {
      title: 'Tool Not Found',
      description: 'The requested tool could not be found.',
    };
  }

  return generateToolMetadata({
    toolName: config.name,
    toolDescription: config.description,
    toolPath: config.path,
    toolCategory: config.category,
    features: config.keywords,
  });
}

/**
 * Get FAQ schema data for a tool
 */
export function getToolFAQs(toolKey: string): Array<{ question: string; answer: string }> | undefined {
  return TOOL_CONFIGS[toolKey]?.faqs;
}

/**
 * Get all tool paths for sitemap generation
 */
export function getAllToolPaths(): string[] {
  return Object.values(TOOL_CONFIGS).map(config => config.path);
}

/**
 * Get tool config by path
 */
export function getToolConfigByPath(path: string): ToolConfig | undefined {
  return Object.values(TOOL_CONFIGS).find(config => config.path === path);
}
