import { ModelOption, PresetPrompt } from './types';

export const MODELS: ModelOption[] = [
  {
    id: 'claude-sonnet-4-20250514',
    name: 'Claude Sonnet 4',
    description: 'Most intelligent model',
  },
  {
    id: 'claude-3-7-sonnet-20250219',
    name: 'Claude 3.7 Sonnet',
    description: 'Balanced performance',
  },
  {
    id: 'claude-opus-4-20250514',
    name: 'Claude Opus 4',
    description: 'Powerful for complex tasks',
  },
  {
    id: 'claude-3-5-haiku-20241022',
    name: 'Claude 3.5 Haiku',
    description: 'Fast and efficient',
  },
  {
    id: 'claude-3-haiku-20240307',
    name: 'Claude 3 Haiku',
    description: 'Most affordable',
  },
];

export const PRESET_PROMPTS: PresetPrompt[] = [
  {
    id: 'write-code',
    title: 'Write Code',
    description: 'Generate clean, efficient code',
    icon: '💻',
    prompt: 'I need help writing code. Please provide clean, well-documented, and efficient code with explanations.',
  },
  {
    id: 'humanize-content',
    title: 'Humanize Content',
    description: 'Make AI text sound natural',
    icon: '✍️',
    prompt: 'Please humanize the following content to make it sound more natural, conversational, and engaging while maintaining the core message.',
  },
  {
    id: 'marketing-deck',
    title: 'Marketing Deck',
    description: 'Create compelling presentations',
    icon: '📊',
    prompt: 'Help me create a compelling marketing presentation deck. Please structure it with clear sections, persuasive copy, and actionable insights.',
  },
  {
    id: 'content-strategy',
    title: 'Content Strategy',
    description: 'Plan content marketing',
    icon: '📝',
    prompt: 'Help me develop a content strategy. Include content pillars, target audience analysis, and distribution channels.',
  },
  {
    id: 'seo-optimize',
    title: 'SEO Optimization',
    description: 'Optimize content for search',
    icon: '🔍',
    prompt: 'Help me optimize this content for SEO. Include keyword recommendations, meta descriptions, and structural improvements.',
  },
  {
    id: 'email-campaign',
    title: 'Email Campaign',
    description: 'Write engaging emails',
    icon: '📧',
    prompt: 'Help me create an email campaign. Include subject lines, body copy, and call-to-action that drives conversions.',
  },
  {
    id: 'social-media',
    title: 'Social Media',
    description: 'Create social content',
    icon: '📱',
    prompt: 'Help me create engaging social media content. Include post ideas, captions, and hashtag strategies for maximum reach.',
  },
  {
    id: 'business-plan',
    title: 'Business Plan',
    description: 'Draft business documents',
    icon: '📈',
    prompt: 'Help me create a comprehensive business plan. Include executive summary, market analysis, and financial projections.',
  },
];

export const DEFAULT_MODEL: ModelOption['id'] = 'claude-sonnet-4-20250514';
